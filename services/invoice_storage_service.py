"""
Invoice Storage Service
Handles Supabase storage and database operations for invoices
Pattern: Follows services/enhanced_analysis_storage.py structure
"""
import os
from typing import Dict, List, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()


class InvoiceStorageService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.storage_bucket = "invoices"
    
    async def upload_file(self, file, user_id: str) -> str:
        """
        Upload invoice file to Supabase storage
        
        Args:
            file: UploadFile object
            user_id: User ID for folder organization
            
        Returns:
            Public URL of uploaded file
        """
        import logging
        import uuid
        logger = logging.getLogger(__name__)
        
        # File size limit: 10MB
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
        
        # Check file size
        if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
            raise Exception(f"File too large: {file.size} bytes. Maximum allowed: {MAX_FILE_SIZE} bytes (10MB)")
        
        # Read content and check size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise Exception(f"File too large: {len(content)} bytes. Maximum allowed: {MAX_FILE_SIZE} bytes (10MB)")
        
        # Reset file pointer for later operations
        await file.seek(0)
        
        # Generate unique file path to avoid conflicts
        now = datetime.now()
        unique_id = str(uuid.uuid4())[:8]
        filename_parts = file.filename.rsplit('.', 1)
        if len(filename_parts) == 2:
            base_name, extension = filename_parts
            unique_filename = f"{base_name}_{unique_id}.{extension}"
        else:
            unique_filename = f"{file.filename}_{unique_id}"
        
        file_path = f"{user_id}/{now.year}/{now.month:02d}/{unique_filename}"
        
        logger.info(f"📤 Uploading invoice file")
        logger.debug(f"File size: {file.size if hasattr(file, 'size') else 'unknown'} bytes")
        logger.debug(f"Content type: {file.content_type}")
        
        logger.info(f"✅ File content read: {len(content)} bytes")
        
        try:
            # Upload to Supabase storage (upsert=true to overwrite if exists)
            result = self.client.storage.from_(self.storage_bucket).upload(
                file_path,
                content,
                {
                    "content-type": file.content_type,
                    "upsert": "true"
                }
            )
            
            logger.info(f"✅ File uploaded successfully to Supabase")
            
            # Create a signed URL (valid for 1 hour) - works for both public and private buckets
            signed_url_response = self.client.storage.from_(self.storage_bucket).create_signed_url(
                file_path,
                3600  # 1 hour expiry
            )
            
            if 'signedURL' in signed_url_response:
                file_url = signed_url_response['signedURL']
            elif 'signedUrl' in signed_url_response:
                file_url = signed_url_response['signedUrl']
            else:
                # Fallback to public URL
                file_url = self.client.storage.from_(self.storage_bucket).get_public_url(file_path)
            
            logger.debug(f"File uploaded successfully")
            
            return file_url
            
        except Exception as e:
            logger.error(f"❌ Upload failed: {type(e).__name__}: {str(e)}")
            logger.error(f"📍 Error details:", exc_info=True)
            raise Exception(f"Failed to upload file to storage: {str(e)}")
    
    async def save_invoice(
        self,
        invoice_data: Dict,
        parse_metadata: Dict,
        file_url: str,
        status: str,
        user_id: str,
        account_id: str
    ) -> str:
        """
        Save parsed invoice to database
        
        Returns:
            Invoice ID (UUID)
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Normalize model name to match database constraint
        model_used = parse_metadata['model_used']
        if 'flash' in model_used.lower():
            parse_method = 'gemini_flash'
        elif 'pro' in model_used.lower():
            parse_method = 'gemini_pro'
        else:
            parse_method = 'manual'
        
        # Insert invoice header
        invoice_record = {
            "user_id": user_id,
            "invoice_number": invoice_data['invoice_number'],
            "invoice_date": invoice_data['invoice_date'],
            "vendor_name": invoice_data['vendor_name'],
            "subtotal": float(invoice_data['subtotal']),
            "tax": float(invoice_data['tax']),
            "total": float(invoice_data['total']),
            "parse_method": parse_method,
            "parse_cost": parse_metadata.get('cost'),
            "parse_time_seconds": parse_metadata.get('parse_time_seconds'),
            "parse_tokens_used": parse_metadata.get('tokens_used'),
            "status": status,
            "raw_file_url": file_url,
            "parsed_json": invoice_data,
            "account_id": account_id
        }
        
        logger.info(f"💾 Attempting to save invoice to database")
        logger.debug(f"Invoice record prepared")
        
        try:
            result = self.client.table("invoices").insert(invoice_record).execute()
            logger.info(f"✅ Invoice insert successful: {result}")
            invoice_id = result.data[0]['id']
        except Exception as e:
            logger.error(f"❌ Invoice insert failed: {type(e).__name__}: {str(e)}")
            logger.error(f"📍 Error details:", exc_info=True)
            # Try to extract Supabase error details
            if hasattr(e, 'message'):
                logger.error(f"🔍 Supabase error message: {e.message}")
            if hasattr(e, 'details'):
                logger.error(f"🔍 Supabase error details: {e.details}")
            if hasattr(e, 'hint'):
                logger.error(f"🔍 Supabase error hint: {e.hint}")
            raise Exception(f"Failed to save invoice to database: {str(e)}")
        
        # Insert line items
        line_items = []
        for item in invoice_data['line_items']:
            from decimal import Decimal, ROUND_HALF_UP
            
            quantity = Decimal(str(item['quantity']))
            unit_price = Decimal(str(item['unit_price']))
            extended_price = Decimal(str(item['extended_price']))
            
            # Recalculate extended price if it doesn't match (due to auto-corrections)
            calculated_extended = (quantity * unit_price).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            if abs(extended_price - calculated_extended) >= Decimal('0.02'):
                logger.warning(f"Extended price mismatch for {item['description']}: "
                             f"stored={extended_price}, calculated={calculated_extended}. Using calculated.")
                extended_price = calculated_extended
            
            line_item = {
                "invoice_id": invoice_id,
                "item_number": item.get('item_number') or '',  # Ensure not None
                "description": item['description'],
                "quantity": float(quantity),  # Convert back to float for DB
                "pack_size": item.get('pack_size') or '',  # Ensure not None
                "unit_price": float(unit_price),  # Convert back to float for DB
                "extended_price": float(extended_price),  # Convert back to float for DB
                "category": item.get('category'),
                "user_corrected": False,
                "account_id": account_id
            }
            line_items.append(line_item)
        
        if line_items:
            try:
                self.client.table("invoice_items").insert(line_items).execute()
                logger.info(f"✅ Inserted {len(line_items)} line items")
            except Exception as e:
                logger.error(f"❌ Line items insert failed: {type(e).__name__}: {str(e)}")
                logger.error(f"📋 Line items data: {line_items}")
                if hasattr(e, 'message'):
                    logger.error(f"🔍 Supabase error message: {e.message}")
                raise Exception(f"Failed to save invoice line items: {str(e)}")
        
        # Log parse attempt
        log_record = {
            "invoice_id": invoice_id,
            "user_id": user_id,
            "account_id": account_id,
            "model_used": parse_metadata['model_used'],
            "tokens_used": parse_metadata.get('tokens_used'),
            "cost": parse_metadata.get('cost'),
            "parse_time_seconds": parse_metadata.get('parse_time_seconds'),
            "success": True,
            "error_message": None
        }
        self.client.table("invoice_parse_logs").insert(log_record).execute()
        
        return invoice_id
    
    async def list_invoices(
        self,
        user_id: str,
        account_id: str,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None,
        vendor: Optional[str] = None
    ) -> Dict:
        """
        List user's invoices with filtering
        
        Returns:
            Dict with invoices list, count, and pagination info
        """
        query = self.client.table("invoices").select(
            "id, invoice_number, vendor_name, invoice_date, total, status, created_at, user_id"
        ).eq("account_id", account_id)
        
        # Apply filters
        if status:
            query = query.eq("status", status)
        if vendor:
            query = query.ilike("vendor_name", f"%{vendor}%")
        
        # Get total count using count parameter
        count_query = self.client.table("invoices").select("id", count="exact").eq("account_id", account_id)
        if status:
            count_query = count_query.eq("status", status)
        if vendor:
            count_query = count_query.ilike("vendor_name", f"%{vendor}%")
        
        count_result = count_query.execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
        
        # Apply pagination and ordering
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        
        # Return invoices without item counts to avoid N+1 queries
        # Item counts can be fetched on-demand when viewing individual invoices
        return {
            "data": result.data,
            "count": total_count,
            "has_more": (offset + limit) < total_count
        }
    
    async def get_invoice(self, invoice_id: str, user_id: str, account_id: str) -> Optional[Dict]:
        """
        Get full invoice details with line items
        
        Returns:
            Dict with invoice header, items, and metadata
        """
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"🔍 [STORAGE] get_invoice called: invoice_id={invoice_id}, user_id={user_id}, account_id={account_id}")
        
        # Get invoice header
        logger.info(f"📥 [STORAGE] Querying invoices table...")
        invoice_result = self.client.table("invoices").select("*").eq(
            "id", invoice_id
        ).eq("account_id", account_id).execute()
        
        logger.info(f"📦 [STORAGE] Invoice query result: found={len(invoice_result.data)} records")
        
        if not invoice_result.data:
            logger.warning(f"❌ [STORAGE] Invoice not found: {invoice_id}")
            return None
        
        invoice = invoice_result.data[0]
        logger.info(f"✅ [STORAGE] Invoice found: {invoice.get('invoice_number')}")
        
        # Get line items
        logger.info(f"📥 [STORAGE] Querying invoice_items table...")
        items_result = self.client.table("invoice_items").select("*").eq(
            "invoice_id", invoice_id
        ).eq("account_id", account_id).order("created_at").execute()
        
        logger.info(f"📦 [STORAGE] Items query result: found={len(items_result.data)} items")
        
        # Get parse metadata
        logger.info(f"📥 [STORAGE] Querying invoice_parse_logs table...")
        log_result = self.client.table("invoice_parse_logs").select("*").eq(
            "invoice_id", invoice_id
        ).eq("account_id", account_id).order("created_at", desc=True).limit(1).execute()
        
        logger.info(f"📦 [STORAGE] Parse logs query result: found={len(log_result.data)} logs")
        
        result = {
            "header": invoice,
            "items": items_result.data,
            "metadata": log_result.data[0] if log_result.data else None
        }
        
        logger.info(f"✅ [STORAGE] Returning complete invoice data")
        return result
    
    async def update_invoice(
        self,
        invoice_id: str,
        user_id: str,
        account_id: str,
        updates: Dict
    ) -> bool:
        """Update invoice header fields"""
        result = self.client.table("invoices").update(updates).eq(
            "id", invoice_id
        ).eq("account_id", account_id).execute()
        
        return len(result.data) > 0
    
    async def update_line_item(
        self,
        item_id: str,
        user_id: str,
        account_id: str,
        updates: Dict
    ) -> bool:
        """Update a line item (marks as user_corrected)"""
        updates['user_corrected'] = True
        
        # Verify user owns this item's invoice
        item_result = self.client.table("invoice_items").select(
            "invoice_id"
        ).eq("id", item_id).execute()
        
        if not item_result.data:
            return False
        
        invoice_id = item_result.data[0]['invoice_id']
        
        # Check ownership
        invoice_result = self.client.table("invoices").select("id").eq(
            "id", invoice_id
        ).eq("account_id", account_id).execute()
        
        if not invoice_result.data:
            return False
        
        # Update item
        result = self.client.table("invoice_items").update(updates).eq(
            "id", item_id
        ).execute()
        
        return len(result.data) > 0
    
    async def delete_invoice(self, invoice_id: str, user_id: str, account_id: str) -> bool:
        """
        Delete invoice and CASCADE delete related data:
        1. invoice_items (line items from this invoice)
        2. inventory_items (items created from this invoice)
        
        This prevents orphaned inventory items with stale pricing data.
        Uses database transaction for consistency.
        """
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🗑️  Deleting invoice {invoice_id} with cascade")
        
        try:
            # Get invoice_items descriptions before deleting
            invoice_items_result = self.client.table("invoice_items").select(
                "description"
            ).eq("invoice_id", invoice_id).execute()
            
            item_descriptions = [item["description"] for item in (invoice_items_result.data or [])]
            logger.info(f"   Found {len(item_descriptions)} invoice items to cascade")
            
            # Use RPC function for transactional delete
            result = self.client.rpc('delete_invoice_with_cascade', {
                'target_invoice_id': invoice_id,
                'target_user_id': user_id,
                'item_descriptions': item_descriptions
            }).execute()
            
            if result.data and result.data[0].get('success'):
                deleted_count = result.data[0].get('inventory_items_deleted', 0)
                logger.info(f"   ✅ Cascade deleted {deleted_count} inventory items")
                logger.info(f"✅ Invoice {invoice_id} deleted with cascade")
                return True
            else:
                logger.error(f"❌ Invoice delete failed: {result.data}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Invoice delete failed: {e}")
            return False
    
    def get_invoice_for_processing(self, invoice_id: str) -> Dict:
        """
        Get invoice with line items for processing into inventory
        
        This is the ONLY way other services should access invoice data.
        Returns clean DTO without exposing database structure.
        
        Returns:
            Dict with 'invoice' and 'line_items' keys
        """
        # Get invoice header
        invoice_result = self.client.table("invoices").select("*").eq(
            "id", invoice_id
        ).eq("user_id", user_id).execute()
        
        if not invoice_result.data:
            raise ValueError(f"Invoice {invoice_id} not found")
        
        invoice = invoice_result.data[0]
        
        # Get line items
        items_result = self.client.table("invoice_items").select("*").eq(
            "invoice_id", invoice_id
        ).execute()
        
        return {
            "invoice": invoice,
            "line_items": items_result.data
        }
