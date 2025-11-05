"""
Vendor Service
Manages vendor records and normalization
Pattern: Follows services/invoice_storage_service.py structure
"""
import os
import re
from typing import Dict, List, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class VendorService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def normalize_vendor_name(self, vendor_name: str) -> str:
        """
        Normalize vendor name for matching
        
        - Lowercase
        - Remove extra spaces
        - Remove common suffixes (LLC, Inc, etc.)
        """
        if not vendor_name:
            return ""
        
        normalized = vendor_name.lower().strip()
        
        # Remove common business suffixes
        suffixes = [
            r'\s+llc$', r'\s+inc\.?$', r'\s+incorporated$',
            r'\s+corp\.?$', r'\s+corporation$', r'\s+ltd\.?$',
            r'\s+limited$', r'\s+co\.?$', r'\s+company$'
        ]
        
        for suffix in suffixes:
            normalized = re.sub(suffix, '', normalized, flags=re.IGNORECASE)
        
        # Remove trailing commas and periods
        normalized = normalized.rstrip(',.').strip()
        
        # Remove extra whitespace
        normalized = ' '.join(normalized.split())
        
        return normalized
    
    def create_or_get_vendor(self, user_id: str, vendor_name: str) -> str:
        """
        Get existing vendor or create new one
        
        Returns:
            vendor_id (UUID)
        """
        normalized_name = self.normalize_vendor_name(vendor_name)
        
        logger.info(f"🏢 Looking up vendor: {vendor_name} (normalized: {normalized_name})")
        
        # Check if vendor exists
        result = self.client.table("vendors").select("id").eq(
            "user_id", user_id
        ).eq("normalized_name", normalized_name).execute()
        
        if result.data:
            vendor_id = result.data[0]['id']
            logger.info(f"✅ Found existing vendor: {vendor_id}")
            return vendor_id
        
        # Create new vendor
        vendor_record = {
            "user_id": user_id,
            "name": vendor_name,
            "normalized_name": normalized_name,
            "active": True
        }
        
        insert_result = self.client.table("vendors").insert(vendor_record).execute()
        vendor_id = insert_result.data[0]['id']
        
        logger.info(f"✨ Created new vendor: {vendor_id} ({vendor_name})")
        
        return vendor_id
    
    def get_vendors(self, user_id: str, active_only: bool = True) -> List[Dict]:
        """
        Get all vendors for user
        
        Returns:
            List of vendor records
        """
        query = self.client.table("vendors").select("*").eq("user_id", user_id)
        
        if active_only:
            query = query.eq("active", True)
        
        query = query.order("name")
        
        result = query.execute()
        return result.data
    
    def update_vendor(self, vendor_id: str, user_id: str, updates: Dict) -> bool:
        """
        Update vendor details
        
        Returns:
            True if successful
        """
        # If name is being updated, update normalized_name too
        if 'name' in updates:
            updates['normalized_name'] = self.normalize_vendor_name(updates['name'])
        
        result = self.client.table("vendors").update(updates).eq(
            "id", vendor_id
        ).eq("user_id", user_id).execute()
        
        return len(result.data) > 0
    
    def get_vendor_stats(self, vendor_id: str, user_id: str) -> Dict:
        """
        Get vendor statistics (invoice count, total spend, etc.)
        
        Returns:
            Dict with vendor stats
        """
        # Get invoice count and total spend
        invoices = self.client.table("invoices").select(
            "id, total"
        ).eq("user_id", user_id).eq("vendor_name", vendor_id).execute()
        
        total_spend = sum(inv['total'] for inv in invoices.data)
        invoice_count = len(invoices.data)
        
        # Get last order date
        last_invoice = self.client.table("invoices").select(
            "invoice_date"
        ).eq("user_id", user_id).eq("vendor_name", vendor_id).order(
            "invoice_date", desc=True
        ).limit(1).execute()
        
        last_order_date = last_invoice.data[0]['invoice_date'] if last_invoice.data else None
        
        return {
            "vendor_id": vendor_id,
            "invoice_count": invoice_count,
            "total_spend": total_spend,
            "average_invoice": total_spend / invoice_count if invoice_count > 0 else 0,
            "last_order_date": last_order_date
        }
