"""
Invoice Parsing Routes
Handles invoice parsing with Gemini
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
from pydantic import BaseModel
import logging
import time

from services.invoice_parser_service import InvoiceParserService
from services.invoice_parser_streaming import InvoiceParserStreaming
from services.invoice_validator_service import InvoiceValidatorService
from services.invoice_duplicate_detector import InvoiceDuplicateDetector
from services.invoice_monitoring_service import monitoring_service
from services.error_sanitizer import sanitize_parsing_error
from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import check_invoice_parse_limit, release_rate_limit, rate_limit
from api.middleware.subscription import check_usage_limits

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/invoices", tags=["invoice-operations"])

# Initialize services
parser_service = InvoiceParserService()
streaming_parser = InvoiceParserStreaming()
validator_service = InvoiceValidatorService()
duplicate_detector = InvoiceDuplicateDetector()


# Pydantic models
class ParseRequest(BaseModel):
    file_url: str
    vendor_hint: Optional[str] = None
    session_id: Optional[str] = None


@router.get("/parse-stream")
@rate_limit("invoice_parse")
async def parse_invoice_stream(
    file_url: str,
    vendor_hint: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """
    Stream invoice parsing progress and results (SSE)
    
    Real-time events:
    - parsing_started
    - parsing_progress (every 10s)
    - parsed_data
    - validation_complete
    - error
    
    Frontend holds data in memory until user confirms save
    """
    return StreamingResponse(
        streaming_parser.parse_invoice_streaming(
            file_url=file_url,
            user_id=current_user,
            vendor_hint=vendor_hint
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Content-Encoding": "none",  # Prevent compression buffering
        }
    )


@router.post("/parse")
async def parse_invoice(
    request: ParseRequest,
    current_user: str = Depends(get_current_user),
    _rate_limit: None = Depends(check_invoice_parse_limit)
):
    """
    Parse uploaded invoice using Gemini Flash (non-streaming)
    
    Takes 30-60 seconds depending on invoice complexity
    Returns: Parsed invoice data with validation results
    
    NOTE: Use /parse-stream for better UX with real-time progress
    """
    session_id = request.session_id if hasattr(request, 'session_id') else None
    parse_start = time.time()
    
    # Check usage limits for user's tier (free tier: 1/week + 2 bonus/month)
    await check_usage_limits(current_user, "invoice_upload")
    
    try:
        if session_id:
            monitoring_service.log_parse_start(session_id, "gemini-2.5-flash")
        
        # Parse with Gemini
        result = await parser_service.parse_invoice(
            file_url=request.file_url,
            vendor_hint=request.vendor_hint,
            user_id=current_user
        )
        
        parse_time = time.time() - parse_start
        
        # Increment usage counter after successful parse
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        usage_service.increment_usage(
            user_id=current_user,
            operation_type='invoice_upload',
            operation_id=None,  # Will be set when invoice is saved
            metadata={'vendor': result['invoice_data'].get('vendor_name')}
        )
        
        # Log parse completion
        if session_id:
            invoice_data = result['invoice_data']
            monitoring_service.log_parse_complete(
                session_id,
                parse_time,
                result['metadata'].get('tokens_used', 0),
                result['metadata'].get('cost', 0),
                invoice_data.get('vendor_name', ''),
                invoice_data.get('invoice_number', ''),
                invoice_data.get('total', 0),
                len(invoice_data.get('line_items', []))
            )
        
        # Validate parsed data
        validation = validator_service.validate_invoice(result['invoice_data'])
        
        if session_id:
            monitoring_service.log_validation(
                session_id,
                validation['valid'],
                validation.get('errors', []),
                validation.get('warnings', [])
            )
        
        return JSONResponse({
            "success": True,
            "invoice_data": result['invoice_data'],
            "metadata": result['metadata'],
            "validation": validation,
            "session_id": session_id
        })
        
    except Exception as e:
        if session_id:
            monitoring_service.log_error(session_id, "parse", str(e))
        
        return JSONResponse({
            "success": False,
            "error": sanitize_parsing_error(e),
            "metadata": {
                "model_used": None,
                "parse_time_seconds": 0,
                "success": False
            },
            "session_id": session_id
        }, status_code=500)


@router.post("/check-duplicate")
async def check_duplicate(
    invoice_number: str,
    vendor_name: str,
    invoice_date: str,
    total: float,
    current_user: str = Depends(get_current_user)
):
    """
    Check if invoice already exists
    
    Returns duplicate warning before parsing
    """
    try:
        duplicate = await duplicate_detector.check_for_duplicate(
            user_id=current_user,
            invoice_number=invoice_number,
            vendor_name=vendor_name,
            invoice_date=invoice_date,
            total=total
        )
        
        if duplicate:
            return JSONResponse({
                "is_duplicate": True,
                "duplicate_info": duplicate
            })
        
        return JSONResponse({
            "is_duplicate": False
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": sanitize_parsing_error(e)
        }, status_code=500)
