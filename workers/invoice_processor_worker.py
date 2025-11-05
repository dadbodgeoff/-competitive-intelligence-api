"""
Invoice Processor Worker
Listens for "invoice.saved" events and processes them into inventory

This decouples invoice save (fast) from inventory processing (slow)
"""
import logging
from typing import Dict
from services.event_bus import on
from services.invoice_processor import InvoiceProcessor

logger = logging.getLogger(__name__)

# Initialize processor
processor = InvoiceProcessor()


@on("invoice.saved")
async def process_invoice_async(data: Dict):
    """
    Background handler for invoice.saved events
    
    Args:
        data: {"invoice_id": str, "user_id": str}
    """
    invoice_id = data.get("invoice_id")
    user_id = data.get("user_id")
    
    if not invoice_id:
        logger.error("❌ invoice.saved event missing invoice_id")
        return
    
    logger.info(f"🔄 Background worker processing invoice: {invoice_id}")
    
    try:
        # Process invoice into inventory system
        result = processor.process_invoice(invoice_id)
        
        if result['status'] == 'success':
            logger.info(f"✅ Background processing complete: {invoice_id}")
            logger.info(f"   Items processed: {result['items_processed']}")
            logger.info(f"   Items created: {result['inventory_items_created']}")
            logger.info(f"   Items updated: {result['inventory_items_updated']}")
        elif result['status'] == 'partial_success':
            logger.warning(f"⚠️  Partial success for {invoice_id}")
            logger.warning(f"   Items processed: {result['items_processed']}")
            logger.warning(f"   Items failed: {result['items_failed']}")
        else:
            logger.error(f"❌ Background processing failed: {invoice_id}")
            logger.error(f"   Error: {result.get('error', 'Unknown error')}")
    
    except Exception as e:
        logger.error(f"❌ Worker exception processing {invoice_id}: {e}", exc_info=True)


# Initialize worker on import
logger.info("🚀 Invoice processor worker initialized")
