"""
Invoice Duplicate Detection Service
Prevents duplicate invoice processing with race condition protection
"""
import os
import hashlib
from typing import Dict, Optional
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import logging
import asyncio

load_dotenv()
logger = logging.getLogger(__name__)


class InvoiceDuplicateDetector:
    """Detect duplicate invoices before processing with Redis locking"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        
        # Import Redis client
        try:
            from services.redis_client import cache
            self.redis = cache
            self.redis_enabled = cache.enabled
        except Exception as e:
            logger.warning(f"Redis not available for duplicate detection: {e}")
            self.redis = None
            self.redis_enabled = False
    
    def calculate_file_hash(self, file_content: bytes) -> str:
        """Calculate SHA256 hash of file content"""
        return hashlib.sha256(file_content).hexdigest()
    
    @asynccontextmanager
    async def redis_lock(self, lock_key: str, timeout: int = 10):
        """
        Distributed lock using Redis
        
        Args:
            lock_key: Unique key for the lock
            timeout: Lock timeout in seconds
        """
        acquired = False
        lock_value = f"{os.getpid()}:{asyncio.current_task().get_name()}"
        
        try:
            if self.redis_enabled:
                # Try to acquire lock
                for attempt in range(timeout * 10):  # Check every 100ms
                    if self.redis.client.set(lock_key, lock_value, nx=True, ex=timeout):
                        acquired = True
                        logger.debug(f"🔒 Lock acquired: {lock_key}")
                        break
                    await asyncio.sleep(0.1)
                
                if not acquired:
                    raise TimeoutError(f"Could not acquire lock: {lock_key}")
            
            yield acquired
            
        finally:
            if acquired and self.redis_enabled:
                # Release lock only if we own it
                try:
                    current_value = self.redis.client.get(lock_key)
                    if current_value == lock_value:
                        self.redis.client.delete(lock_key)
                        logger.debug(f"🔓 Lock released: {lock_key}")
                except Exception as e:
                    logger.error(f"Error releasing lock {lock_key}: {e}")
    
    async def check_for_duplicate_by_hash(
        self,
        user_id: str,
        file_hash: str
    ) -> Optional[Dict]:
        """
        Check for duplicate by file hash (fastest check)
        
        Args:
            user_id: User ID
            file_hash: SHA256 hash of file content
            
        Returns:
            Duplicate info if found, None otherwise
        """
        try:
            # Check if file hash already exists for this user
            result = self.client.table("invoices").select(
                "id, invoice_number, vendor_name, invoice_date, total, created_at, file_hash"
            ).eq("user_id", user_id).eq("file_hash", file_hash).execute()
            
            if result.data:
                duplicate = result.data[0]
                return {
                    "type": "file_hash",
                    "invoice_id": duplicate["id"],
                    "invoice_number": duplicate.get("invoice_number"),
                    "vendor_name": duplicate.get("vendor_name"),
                    "invoice_date": duplicate.get("invoice_date"),
                    "total": duplicate.get("total"),
                    "uploaded_at": duplicate["created_at"],
                    "message": "Exact duplicate file detected (same file uploaded before)"
                }
            
            return None
            
        except Exception as e:
            logger.error(f"File hash duplicate check failed: {e}")
            return None
    
    async def check_for_duplicate(
        self,
        user_id: str,
        invoice_number: str,
        vendor_name: str,
        invoice_date: str,
        total: float,
        tolerance: float = 0.01,
        file_hash: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Check if invoice already exists (with race condition protection)
        
        Args:
            user_id: User ID
            invoice_number: Invoice number
            vendor_name: Vendor name
            invoice_date: Invoice date (YYYY-MM-DD)
            total: Invoice total
            tolerance: Price tolerance for matching (default $0.01)
            file_hash: Optional SHA256 hash of file content
            
        Returns:
            Duplicate info dict if found, None if no duplicate
        """
        try:
            # First check by file hash if provided (fastest)
            if file_hash:
                hash_duplicate = await self.check_for_duplicate_by_hash(user_id, file_hash)
                if hash_duplicate:
                    return hash_duplicate
            # Use Redis lock to prevent race conditions
            lock_key = f"invoice_check:{user_id}:{invoice_number}:{vendor_name}"
            
            async with self.redis_lock(lock_key, timeout=5):
                # Parse date for range check (±1 day tolerance)
                invoice_dt = datetime.strptime(invoice_date, "%Y-%m-%d").date()
                date_start = (invoice_dt - timedelta(days=1)).isoformat()
                date_end = (invoice_dt + timedelta(days=1)).isoformat()
                
                # Check for exact match first
                exact_match = self.client.table("invoices").select(
                    "id, invoice_number, vendor_name, invoice_date, total, created_at"
                ).eq("user_id", user_id).eq(
                    "invoice_number", invoice_number
                ).eq("vendor_name", vendor_name).eq(
                    "invoice_date", invoice_date
                ).execute()
                
                if exact_match.data:
                    duplicate = exact_match.data[0]
                    return {
                        "type": "exact",
                        "invoice_id": duplicate["id"],
                        "invoice_number": duplicate["invoice_number"],
                        "vendor_name": duplicate["vendor_name"],
                        "invoice_date": duplicate["invoice_date"],
                        "total": duplicate["total"],
                        "uploaded_at": duplicate["created_at"],
                        "message": "Exact duplicate found (same invoice number, vendor, and date)"
                    }
                
                # Check for near-duplicate (same vendor, similar date, similar total)
                near_matches = self.client.table("invoices").select(
                    "id, invoice_number, vendor_name, invoice_date, total, created_at"
                ).eq("user_id", user_id).eq(
                    "vendor_name", vendor_name
                ).gte("invoice_date", date_start).lte(
                    "invoice_date", date_end
                ).execute()
                
                for match in near_matches.data:
                    total_diff = abs(float(match["total"]) - total)
                    if total_diff <= tolerance:
                        return {
                            "type": "near",
                            "invoice_id": match["id"],
                            "invoice_number": match["invoice_number"],
                            "vendor_name": match["vendor_name"],
                            "invoice_date": match["invoice_date"],
                            "total": match["total"],
                            "uploaded_at": match["created_at"],
                            "total_difference": total_diff,
                            "message": f"Similar invoice found (same vendor, date ±1 day, total within ${tolerance})"
                        }
                
                return None
            
        except TimeoutError as e:
            logger.error(f"Duplicate check timeout (possible concurrent upload): {e}")
            # Return a special error to indicate concurrent processing
            return {
                "type": "concurrent",
                "message": "Another upload is being processed. Please wait a moment and try again."
            }
        except Exception as e:
            logger.error(f"Duplicate check failed: {e}")
            # Don't block processing on duplicate check failure
            return None
    
    async def mark_processing(self, user_id: str, file_hash: str, ttl: int = 300):
        """
        Mark file as being processed (prevents concurrent processing)
        
        Args:
            user_id: User ID
            file_hash: File hash
            ttl: Time to live in seconds (default 5 minutes)
        """
        if self.redis_enabled:
            key = f"processing:{user_id}:{file_hash}"
            self.redis.client.setex(key, ttl, "1")
            logger.debug(f"📝 Marked as processing: {file_hash[:8]}...")
    
    async def is_processing(self, user_id: str, file_hash: str) -> bool:
        """Check if file is currently being processed"""
        if self.redis_enabled:
            key = f"processing:{user_id}:{file_hash}"
            return self.redis.client.exists(key) > 0
        return False
    
    async def clear_processing(self, user_id: str, file_hash: str):
        """Clear processing marker"""
        if self.redis_enabled:
            key = f"processing:{user_id}:{file_hash}"
            self.redis.client.delete(key)
            logger.debug(f"✅ Cleared processing: {file_hash[:8]}...")
    
    def is_likely_duplicate(
        self,
        invoice_data: Dict,
        existing_invoices: list,
        similarity_threshold: float = 0.9
    ) -> bool:
        """
        Advanced duplicate detection using invoice content similarity
        
        Args:
            invoice_data: Parsed invoice data
            existing_invoices: List of existing invoices to compare against
            similarity_threshold: Similarity threshold (0.0 to 1.0)
            
        Returns:
            True if likely duplicate
        """
        try:
            current_items = set()
            for item in invoice_data.get("line_items", []):
                # Create signature from item description and price
                signature = f"{item.get('description', '').lower().strip()}:{item.get('unit_price', 0)}"
                current_items.add(signature)
            
            if not current_items:
                return False
            
            for existing in existing_invoices:
                existing_items = set()
                for item in existing.get("line_items", []):
                    signature = f"{item.get('description', '').lower().strip()}:{item.get('unit_price', 0)}"
                    existing_items.add(signature)
                
                if not existing_items:
                    continue
                
                # Calculate Jaccard similarity
                intersection = len(current_items.intersection(existing_items))
                union = len(current_items.union(existing_items))
                
                if union > 0:
                    similarity = intersection / union
                    if similarity >= similarity_threshold:
                        logger.warning(f"High content similarity ({similarity:.2f}) with existing invoice")
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"Content similarity check failed: {e}")
            return False