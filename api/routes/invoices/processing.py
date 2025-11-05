"""
Invoice Processing Routes
Handles reprocessing and monitoring
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
import logging

from services.invoice_processor import InvoiceProcessor
from services.invoice_monitoring_service import monitoring_service
from api.middleware.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/invoices", tags=["invoice-operations"])

# Initialize services
invoice_processor = InvoiceProcessor()


@router.post("/{invoice_id}/reprocess")
async def reprocess_invoice(
    invoice_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Manually trigger invoice processing into inventory
    
    Useful if initial processing failed
    """
    try:
        processing_result = invoice_processor.process_invoice(invoice_id)
        
        return JSONResponse({
            "success": True,
            "processing": processing_result
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/monitoring/{session_id}")
async def get_monitoring_metrics(
    session_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get monitoring metrics for a session
    
    Returns performance data, costs, and processing details
    """
    try:
        summary = monitoring_service.get_summary(session_id)
        
        if not summary:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        
        return JSONResponse({
            "success": True,
            "metrics": summary
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)
