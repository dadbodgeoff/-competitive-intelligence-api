"""
Invoice Management Routes
Handles save, list, get, delete operations
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
import logging
import time
import os

from services.invoice_storage_service import InvoiceStorageService
from services.invoice_validator_service import InvoiceValidatorService
from services.invoice_duplicate_detector import InvoiceDuplicateDetector
from services.invoice_processor import InvoiceProcessor
from services.invoice_batch_processor import InvoiceBatchProcessor
from services.invoice_monitoring_service import monitoring_service
from api.middleware.auth import get_current_membership, AuthenticatedUser

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/invoices", tags=["invoice-operations"])

# Feature flags
USE_BATCH_PROCESSING = os.getenv("INVOICE_BATCH_PROCESSING", "true").lower() == "true"
USE_ASYNC_PROCESSING = os.getenv("INVOICE_ASYNC_PROCESSING", "false").lower() == "true"

# Initialize services
storage_service = InvoiceStorageService()
validator_service = InvoiceValidatorService()
duplicate_detector = InvoiceDuplicateDetector()
invoice_processor = InvoiceProcessor()
batch_processor = InvoiceBatchProcessor()


# Pydantic models
class SaveInvoiceRequest(BaseModel):
    invoice_data: dict
    parse_metadata: dict
    file_url: str
    status: str = "reviewed"
    session_id: Optional[str] = None


@router.post("/save")
async def save_invoice(
    request: SaveInvoiceRequest,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Save parsed/reviewed invoice to database
    
    This is the ONLY write to database - happens after user confirmation
    Stores invoice header, line items, and parse metadata
    
    Free tier: 1 invoice upload per week + 2 bonus per month
    Premium: Unlimited
    """
    session_id = request.session_id
    save_start = time.time()
    current_user = auth.id
    account_id = auth.account_id
    
    try:
        # Check usage limits (free tier: 1 weekly + 2 monthly bonus)
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        
        allowed, limit_details = usage_service.check_limit(current_user, 'invoice_upload')
        
        if not allowed:
            logger.warning(f"Invoice upload blocked for user {current_user}: {limit_details['message']}")
            if session_id:
                monitoring_service.log_error(session_id, "save", f"Usage limit: {limit_details['message']}")
            raise HTTPException(
                status_code=429,
                detail={
                    'error': 'Usage limit exceeded',
                    'message': limit_details['message'],
                    'current_usage': limit_details['current_usage'],
                    'limit': limit_details['limit_value'],
                    'reset_date': limit_details['reset_date'],
                    'subscription_tier': limit_details['subscription_tier']
                }
            )
        
        if session_id:
            monitoring_service.log_save_start(session_id)
        
        # Validate before saving
        validation = validator_service.validate_invoice(request.invoice_data)
        
        if not validation['valid']:
            if session_id:
                monitoring_service.log_error(session_id, "save", f"Validation failed: {validation['errors']}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid invoice data: {validation['errors']}"
            )
        
        # Final duplicate check before save
        duplicate = await duplicate_detector.check_for_duplicate(
            user_id=current_user,
            account_id=account_id,
            invoice_number=request.invoice_data['invoice_number'],
            vendor_name=request.invoice_data['vendor_name'],
            invoice_date=request.invoice_data['invoice_date'],
            total=request.invoice_data['total']
        )
        
        if duplicate and duplicate.get('type') in ['exact', 'near']:
            if session_id:
                monitoring_service.log_error(session_id, "save", "Duplicate invoice detected")
            raise HTTPException(
                status_code=409,
                detail=f"Duplicate invoice: {duplicate['message']}"
            )
        
        # Save to database (single write)
        invoice_id = await storage_service.save_invoice(
            invoice_data=request.invoice_data,
            parse_metadata=request.parse_metadata,
            file_url=request.file_url,
            status=request.status,
            user_id=current_user,
            account_id=account_id
        )
        
        save_time = time.time() - save_start
        
        # Increment usage counter (only after successful save)
        usage_service.increment_usage(
            user_id=current_user,
            operation_type='invoice_upload',
            operation_id=invoice_id,
            metadata={
                'items_count': len(request.invoice_data['line_items']),
                'save_time_seconds': round(save_time, 2),
                'vendor': request.invoice_data.get('vendor_name')
            }
        )
        
        if session_id:
            monitoring_service.log_save_complete(
                session_id,
                invoice_id,
                save_time,
                len(request.invoice_data['line_items'])
            )
        
        # DISABLED: Inventory processing removed - invoices are source of truth only
        # Inventory system should read FROM invoices via separate endpoints
        logger.info(f"✅ Invoice {invoice_id} saved successfully (inventory processing disabled)")
        
        if session_id:
            monitoring_service.end_session(session_id)
        
        return JSONResponse({
            "success": True,
            "invoice_id": invoice_id,
            "items_saved": len(request.invoice_data['line_items']),
            "session_id": session_id,
            "metrics": monitoring_service.get_summary(session_id) if session_id else None,
            "usage_info": {
                'current_usage': limit_details['current_usage'] + 1,
                'limit': limit_details['limit_value'],
                'reset_date': limit_details['reset_date']
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        if session_id:
            monitoring_service.log_error(session_id, "save", str(e))
            monitoring_service.end_session(session_id)
        
        return JSONResponse({
            "success": False,
            "error": str(e),
            "session_id": session_id
        }, status_code=500)


@router.get("/")
async def list_invoices(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page (max 100)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    vendor: Optional[str] = Query(None, description="Filter by vendor name"),
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    List user's invoices with filtering and pagination
    
    Query params:
    - page: Page number (1-indexed, default 1)
    - per_page: Results per page (1-100, default 50)
    - status: Filter by status (parsed, reviewed, approved)
    - vendor: Filter by vendor name (partial match)
    
    Returns:
    - data: List of invoices
    - pagination: Metadata (page, per_page, total_count, total_pages, has_next, has_prev)
    """
    try:
        # Calculate offset from page
        offset = (page - 1) * per_page
        
        invoices = await storage_service.list_invoices(
            user_id=auth.id,
            account_id=auth.account_id,
            limit=per_page,
            offset=offset,
            status=status,
            vendor=vendor
        )
        
        # Calculate pagination metadata
        total_count = invoices['count']
        total_pages = (total_count + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return JSONResponse({
            "success": True,
            "data": invoices['data'],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev,
                "next_page": page + 1 if has_next else None,
                "prev_page": page - 1 if has_prev else None
            }
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Get full invoice details with line items
    
    Returns invoice header, all line items, and parse metadata
    """
    logger.info(f"📥 [GET_INVOICE] Request for invoice_id={invoice_id}, user={current_user}")
    
    try:
        logger.info(f"🔍 [GET_INVOICE] Calling storage_service.get_invoice...")
        invoice = await storage_service.get_invoice(
            invoice_id=invoice_id,
            user_id=auth.id,
            account_id=auth.account_id
        )
        
        logger.info(f"📦 [GET_INVOICE] Storage service returned: {invoice is not None}")
        
        if not invoice:
            logger.warning(f"❌ [GET_INVOICE] Invoice not found: {invoice_id}")
            raise HTTPException(
                status_code=404,
                detail="Invoice not found"
            )
        
        logger.info(f"✅ [GET_INVOICE] Invoice found: {invoice['header'].get('invoice_number')}, items={len(invoice['items'])}")
        
        return JSONResponse({
            "success": True,
            "invoice": invoice['header'],
            "items": invoice['items'],
            "metadata": invoice['metadata']
        })
        
    except HTTPException:
        logger.error(f"❌ [GET_INVOICE] HTTPException raised")
        raise
    except Exception as e:
        logger.error(f"💥 [GET_INVOICE] Exception: {str(e)}", exc_info=True)
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: str,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Delete invoice and all related line items
    
    This action cannot be undone
    """
    try:
        success = await storage_service.delete_invoice(
            invoice_id=invoice_id,
            user_id=auth.id,
            account_id=auth.account_id
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Invoice not found"
            )
        
        return JSONResponse({
            "success": True,
            "message": "Invoice deleted successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)
