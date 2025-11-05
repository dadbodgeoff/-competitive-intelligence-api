"""
Menu Upload Routes
Handles file upload to storage
Pattern: Follows api/routes/invoices/upload.py
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
import logging
import time

from services.menu_storage_service import MenuStorageService
from services.file_validator import FileValidator
from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import rate_limit

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/menu", tags=["menu-operations"])

# Initialize services
storage_service = MenuStorageService()
file_validator = FileValidator()


@router.post("/upload")
@rate_limit("menu_parse")
async def upload_menu(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """
    Upload menu file to Supabase storage
    
    Accepts: PDF, JPEG, PNG files up to 10MB
    Returns: File URL for parsing
    
    IMPORTANT: Checks usage limits BEFORE upload to prevent wasted processing
    """
    # Check usage limits FIRST (before any processing)
    from services.usage_limit_service import get_usage_limit_service
    usage_service = get_usage_limit_service()
    
    allowed, limit_details = usage_service.check_limit(current_user, 'menu_upload')
    
    if not allowed:
        logger.warning(f"Menu upload blocked for user {current_user}: {limit_details['message']}")
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
    
    upload_start = time.time()
    
    try:
        # Validate file BEFORE uploading
        logger.info(f"📤 Menu upload request: {file.filename} ({file.content_type})")
        validation = await file_validator.validate_file(file)
        
        if not validation['valid']:
            logger.warning(f"❌ Validation failed: {validation['error']}")
            if 'validation_details' in validation:
                logger.debug(f"   Details: {validation['validation_details']}")
            raise HTTPException(
                status_code=400,
                detail=validation['error']
            )
        
        logger.info(f"✅ Validation passed for {file.filename}")
        if 'validation_details' in validation and 'malware_scan' in validation['validation_details']:
            scan_info = validation['validation_details']['malware_scan']
            logger.info(f"   Malware scan: {scan_info.get('scan_time_ms', 0):.2f}ms")
        
        # Upload to storage
        file_url = await storage_service.upload_file(
            file=file,
            user_id=current_user
        )
        
        upload_time = time.time() - upload_start
        logger.info(f"✅ Menu uploaded in {upload_time:.2f}s")
        
        return JSONResponse({
            "success": True,
            "file_url": file_url,
            "filename": file.filename
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)
