"""
Invoice Upload Routes
Handles file upload to storage
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
import logging
import time

from services.invoice_storage_service import InvoiceStorageService
from services.file_validator import FileValidator
from services.invoice_monitoring_service import monitoring_service
from services.invoice_duplicate_detector import InvoiceDuplicateDetector
from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import rate_limit

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/invoices", tags=["invoice-operations"])

# Initialize services
storage_service = InvoiceStorageService()
file_validator = FileValidator()
duplicate_detector = InvoiceDuplicateDetector()


@router.post("/upload")
@rate_limit("invoice_parse")
async def upload_invoice(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """
    Upload invoice file to Supabase storage
    
    Accepts: PDF, JPEG, PNG files up to 10MB
    Returns: File URL for parsing + monitoring session_id
    
    IMPORTANT: Checks usage limits BEFORE upload to prevent wasted processing
    """
    # Check usage limits FIRST (before any processing)
    from services.usage_limit_service import get_usage_limit_service
    usage_service = get_usage_limit_service()
    
    allowed, limit_details = usage_service.check_limit(current_user, 'invoice_upload')
    
    if not allowed:
        logger.warning(f"Invoice upload blocked for user {current_user}: {limit_details['message']}")
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
    
    # Start monitoring session
    session_id = monitoring_service.start_session(current_user, file.filename)
    upload_start = time.time()
    
    try:
        # Validate file BEFORE uploading
        logger.info(f"📤 Upload request: {file.filename} ({file.content_type})")
        validation = await file_validator.validate_file(file)
        
        if not validation['valid']:
            logger.warning(f"❌ Validation failed: {validation['error']}")
            if 'validation_details' in validation:
                logger.debug(f"   Details: {validation['validation_details']}")
            monitoring_service.log_error(session_id, "upload", validation['error'])
            raise HTTPException(
                status_code=400,
                detail=validation['error']
            )
        
        logger.info(f"✅ Validation passed for {file.filename}")
        if 'validation_details' in validation and 'malware_scan' in validation['validation_details']:
            scan_info = validation['validation_details']['malware_scan']
            logger.info(f"   Malware scan: {scan_info.get('scan_time_ms', 0):.2f}ms")
        
        # Calculate file hash for duplicate detection
        file.file.seek(0)  # Reset file pointer
        file_content = await file.read()
        file_hash = duplicate_detector.calculate_file_hash(file_content)
        file.file.seek(0)  # Reset again for upload
        
        logger.info(f"📝 File hash: {file_hash[:16]}...")
        
        # Check for duplicate by file hash (fast check before expensive upload)
        hash_duplicate = await duplicate_detector.check_for_duplicate_by_hash(
            user_id=current_user,
            file_hash=file_hash
        )
        
        if hash_duplicate:
            logger.warning(f"❌ Duplicate file detected: {hash_duplicate['message']}")
            monitoring_service.log_error(session_id, "upload", "Duplicate file")
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "duplicate",
                    "message": hash_duplicate['message'],
                    "duplicate_info": hash_duplicate
                }
            )
        
        # Check if file is currently being processed (race condition protection)
        if await duplicate_detector.is_processing(current_user, file_hash):
            logger.warning(f"⚠️ File is currently being processed")
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "processing",
                    "message": "This file is currently being processed. Please wait a moment."
                }
            )
        
        # Mark as processing
        await duplicate_detector.mark_processing(current_user, file_hash, ttl=300)
        
        try:
            # Upload to storage
            file_url = await storage_service.upload_file(
                file=file,
                user_id=current_user
            )
        except Exception as e:
            # Clear processing marker on upload failure
            await duplicate_detector.clear_processing(current_user, file_hash)
            raise
        
        upload_time = time.time() - upload_start
        monitoring_service.log_upload(session_id, file_url, upload_time)
        
        return JSONResponse({
            "success": True,
            "file_url": file_url,
            "filename": file.filename,
            "session_id": session_id,
            "file_hash": file_hash  # Return hash for tracking
        })
        
    except HTTPException:
        raise
    except Exception as e:
        monitoring_service.log_error(session_id, "upload", str(e))
        return JSONResponse({
            "success": False,
            "error": str(e),
            "session_id": session_id
        }, status_code=500)
