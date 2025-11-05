"""
Invoice Processor Service
Orchestrates invoice processing into inventory system
Pattern: Follows services/analysis_service_orchestrator.py structure
"""
import os
from typing import Dict, List
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

from services.vendor_service import VendorService
from services.vendor_item_mapper import VendorItemMapper
from services.inventory_transaction_service import InventoryTransactionService
from services.price_tracking_service import PriceTrackingService
from services.invoice_storage_service import InvoiceStorageService

load_dotenv()
logger = logging.getLogger(__name__)


def _classify_error(error: Exception) -> str:
    """Classify error type for user-friendly messaging"""
    error_str = str(error).lower()
    
    if 'check_quantity_nonzero' in error_str:
        return "zero_quantity"
    elif 'unit conversion' in error_str or 'pack_size' in error_str:
        return "pack_size_conversion"
    elif 'constraint' in error_str:
        return "data_validation"
    else:
        return "unknown"


class InvoiceProcessor:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        
        # Service layer - each service owns its domain
        self.invoice_service = InvoiceStorageService()
        self.vendor_service = VendorService()
        self.mapper = VendorItemMapper()
        self.transaction_service = InventoryTransactionService()
        self.price_service = PriceTrackingService()
    
    def process_invoice(self, invoice_id: str) -> Dict:
        """
        Process invoice into inventory system
        
        Returns:
            Processing summary
        """
        logger.info(f"🔄 START: Processing invoice: {invoice_id}")
        
        # Check idempotency
        existing = self.client.table("processed_events").select("*").eq(
            "event_type", "invoice_saved"
        ).eq("event_id", invoice_id).execute()
        
        if existing.data:
            logger.info(f"⏭️  Invoice already processed: {invoice_id}")
            return {
                "status": "already_processed",
                "invoice_id": invoice_id,
                "processed_at": existing.data[0]['processed_at']
            }
        
        try:
            # Get invoice data through service layer (single source of truth)
            invoice_data = self.invoice_service.get_invoice_for_processing(invoice_id)
            invoice = invoice_data['invoice']
            line_items = invoice_data['line_items']
            user_id = invoice['user_id']
            
            logger.info(f"📋 Processing {len(line_items)} line items")
            
            # Get or create vendor
            vendor_id = self.vendor_service.create_or_get_vendor(
                user_id=user_id,
                vendor_name=invoice['vendor_name']
            )
            
            items_processed = 0
            items_created = 0
            items_updated = 0
            fuzzy_matches = 0
            exact_matches = 0
            price_alerts = []
            failed_items = []
            
            # Process each line item
            for idx, item in enumerate(line_items, 1):
                try:
                    # Find or create mapping
                    mapping = self.mapper.find_or_create_mapping(
                        user_id=user_id,
                        vendor_id=vendor_id,
                        vendor_item_number=item.get('item_number') or '',
                        vendor_description=item['description'],
                        pack_size=item.get('pack_size'),
                        category=item.get('category') or 'dry_goods'
                    )
                    
                    if mapping['is_new_item']:
                        items_created += 1
                    else:
                        items_updated += 1
                        
                    # Track match type
                    if mapping['match_method'] in ['fuzzy_auto', 'fuzzy_review']:
                        fuzzy_matches += 1
                    elif mapping['match_method'] == 'exact':
                        exact_matches += 1
                    
                    # Record inventory transaction (with unit conversion)
                    self.transaction_service.record_purchase(
                        user_id=user_id,
                        inventory_item_id=mapping['inventory_item_id'],
                        quantity=item['quantity'],
                        unit_cost=item['unit_price'],
                        invoice_id=invoice_id,
                        invoice_date=invoice['invoice_date'],  # Pass invoice date
                        pack_size=item.get('pack_size')  # Enable unit conversion
                    )
                    
                    # Track price
                    self.price_service.track_price(
                        user_id=user_id,
                        inventory_item_id=mapping['inventory_item_id'],
                        vendor_id=vendor_id,
                        invoice_id=invoice_id,
                        invoice_date=invoice['invoice_date'],
                        unit_price=item['unit_price'],
                        pack_size=item.get('pack_size')
                    )
                    
                    items_processed += 1
                    
                except Exception as item_error:
                    # Log the error but continue processing other items
                    logger.warning(f"⚠️  Failed to process item {idx}: {item['description'][:50]}")
                    logger.warning(f"   Error: {str(item_error)}")
                    
                    # Classify error type
                    error_str = str(item_error).lower()
                    if 'check_quantity_nonzero' in error_str:
                        error_type = "zero_quantity"
                    elif 'unit conversion' in error_str or 'pack_size' in error_str:
                        error_type = "pack_size_conversion"
                    elif 'constraint' in error_str:
                        error_type = "data_validation"
                    else:
                        error_type = "unknown"
                    
                    failed_items.append({
                        "line": idx,
                        "item_number": item.get('item_number', ''),
                        "description": item['description'],
                        "error": str(item_error),
                        "error_type": error_type,
                        "pack_size": item.get('pack_size', ''),
                        "quantity": item.get('quantity'),
                        "unit_price": item.get('unit_price')
                    })
                    
                    # Continue to next item
                    continue
            
            # Mark as processed
            self.client.table("processed_events").insert({
                "user_id": user_id,
                "event_type": "invoice_saved",
                "event_id": invoice_id,
                "processing_result": "success"
            }).execute()
            
            logger.info(f"✅ Invoice processed: {items_processed} items, {items_created} new, {items_updated} updated")
            
            # Determine overall status
            if failed_items:
                if items_processed == 0:
                    status = "failed"
                else:
                    status = "partial_success"
            else:
                status = "success"
            
            logger.info(f"✅ Invoice processed: {items_processed} items, {items_created} new, {items_updated} updated")
            if failed_items:
                logger.warning(f"⚠️  {len(failed_items)} items failed processing")
            
            return {
                "status": status,
                "invoice_id": invoice_id,
                "items_processed": items_processed,
                "items_failed": len(failed_items),
                "inventory_items_created": items_created,
                "inventory_items_updated": items_updated,
                "fuzzy_matches": fuzzy_matches,
                "exact_matches": exact_matches,
                "price_alerts": price_alerts,
                "failed_items": failed_items if failed_items else None
            }
            
        except Exception as e:
            logger.error(f"❌ Invoice processing failed: {e}", exc_info=True)
            
            # Log failure
            try:
                self.client.table("processed_events").insert({
                    "user_id": invoice.get('user_id') if 'invoice' in locals() else None,
                    "event_type": "invoice_saved",
                    "event_id": invoice_id,
                    "processing_result": "error",
                    "error_message": str(e)
                }).execute()
            except:
                pass
            
            return {
                "status": "error",
                "invoice_id": invoice_id,
                "error": str(e)
            }
