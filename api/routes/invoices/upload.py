"""
Invoice Upload Routes
Handles file upload to storage
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request, BackgroundTasks, Form
from typing import Optional
from fastapi.responses import JSONResponse
import logging
import time
import uuid
from datetime import datetime

from services.invoice_storage_service import InvoiceStorageService
from services.file_validator import FileValidator
from services.invoice_monitoring_service import monitoring_service
from services.invoice_duplicate_detector import InvoiceDuplicateDetector
from api.middleware.auth import get_current_membership, AuthenticatedUser
from api.middleware.rate_limiting import rate_limit
from services.guest_session_store import reserve_guest_upload_slot, store_guest_session
from services.background_tasks import run_post_invoice_upload_tasks
from services.demo_seed_service import demo_seed_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/invoices", tags=["invoice-operations"])

# Initialize services
storage_service = InvoiceStorageService()
file_validator = FileValidator()
duplicate_detector = InvoiceDuplicateDetector()


@router.post("/upload")
@rate_limit("invoice_parse")
async def upload_invoice(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    auth: AuthenticatedUser = Depends(get_current_membership),
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
    current_user = auth.id
    
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
            account_id=auth.account_id,
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
        if await duplicate_detector.is_processing(current_user, auth.account_id, file_hash):
            logger.warning(f"⚠️ File is currently being processed")
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "processing",
                    "message": "This file is currently being processed. Please wait a moment."
                }
            )
        
        # Mark as processing
        await duplicate_detector.mark_processing(current_user, auth.account_id, file_hash, ttl=300)
        
        try:
            # Upload to storage
            file_url = await storage_service.upload_file(
                file=file,
                user_id=current_user
            )
        except Exception as e:
            # Clear processing marker on upload failure
            await duplicate_detector.clear_processing(current_user, auth.account_id, file_hash)
            raise
        
        upload_time = time.time() - upload_start
        monitoring_service.log_upload(session_id, file_url, upload_time)
        
        response = JSONResponse({
            "success": True,
            "file_url": file_url,
            "filename": file.filename,
            "session_id": session_id,
            "file_hash": file_hash  # Return hash for tracking
        })
        background_tasks.add_task(
            run_post_invoice_upload_tasks,
            current_user,
            session_id,
            is_guest=False,
        )
        background_tasks.add_task(
            demo_seed_service.mark_seed_consumed,
            current_user,
        )
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        monitoring_service.log_error(session_id, "upload", str(e))
        return JSONResponse({
            "success": False,
            "error": str(e),
            "session_id": session_id
        }, status_code=500)


@router.post("/guest-upload")
async def guest_upload_invoice(
    background_tasks: BackgroundTasks,
    request: Request,
    file: UploadFile = File(...),
    policies_acknowledged: bool = Form(...),
    terms_version: str = Form(...),
    privacy_version: str = Form(...),
    consent_timestamp: Optional[str] = Form(None),
):
    """
    Upload invoice file for landing page demo (unauthenticated guest mode)
    """
    if not policies_acknowledged:
        raise HTTPException(
            status_code=400,
            detail="Policy acknowledgement is required before uploading an invoice.",
        )

    if not terms_version or not privacy_version:
        raise HTTPException(
            status_code=400,
            detail="Policy acknowledgement is incomplete. Please review the Terms of Service and Privacy Policy.",
        )

    consent_recorded_at = consent_timestamp
    if consent_timestamp:
        try:
            consent_recorded_at = datetime.fromisoformat(
                consent_timestamp.replace("Z", "+00:00")
            ).isoformat()
        except ValueError:
            consent_recorded_at = datetime.utcnow().isoformat()
    else:
        consent_recorded_at = datetime.utcnow().isoformat()

    client_ip = request.client.host if request.client else "unknown"
    wait_seconds = reserve_guest_upload_slot(client_ip or "unknown")

    if wait_seconds is not None:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "guest_upload_limit",
                "message": "You already ran your free invoice demo. Please try again later or create a free account.",
                "retry_after_seconds": wait_seconds,
            }
        )

    guest_session_id = str(uuid.uuid4())
    guest_user_id = f"guest_{guest_session_id}"
    monitoring_session_id = monitoring_service.start_session(guest_user_id, file.filename)
    upload_start = time.time()

    try:
        validation = await file_validator.validate_file(file)
        if not validation["valid"]:
            monitoring_service.log_error(monitoring_session_id, "guest_upload", validation["error"])
            raise HTTPException(status_code=400, detail=validation["error"])

        file.file.seek(0)
        file_content = await file.read()
        file_hash = duplicate_detector.calculate_file_hash(file_content)
        file.file.seek(0)

        if await duplicate_detector.is_processing(guest_user_id, file_hash):
            monitoring_service.log_error(
                monitoring_session_id,
                "guest_upload",
                "File is currently being processed. Please wait.",
            )
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "processing",
                    "message": "This file is currently being processed. Please wait a moment.",
                },
            )

        await duplicate_detector.mark_processing(guest_user_id, file_hash)
        try:
            file_url = await storage_service.upload_file(
                file=file,
                user_id=guest_user_id,
            )
        finally:
            await duplicate_detector.clear_processing(guest_user_id, file_hash)

        upload_time = time.time() - upload_start
        monitoring_service.log_upload(monitoring_session_id, file_url, upload_time)

        session_payload = {
            "session_id": guest_session_id,
            "file_url": file_url,
            "filename": file.filename,
            "guest_user_id": guest_user_id,
            "monitoring_session_id": monitoring_session_id,
            "uploaded_at": datetime.utcnow().isoformat(),
            "policies": {
                "acknowledged": bool(policies_acknowledged),
                "terms_version": terms_version,
                "privacy_version": privacy_version,
                "acknowledged_at": consent_recorded_at,
            },
        }
        store_guest_session(guest_session_id, session_payload)

        response = JSONResponse({
            "success": True,
            "session_id": guest_session_id,
            "filename": file.filename,
        })
        background_tasks.add_task(
            run_post_invoice_upload_tasks,
            guest_user_id,
            guest_session_id,
            is_guest=True,
        )
        return response

    except HTTPException:
        monitoring_service.log_error(monitoring_session_id, "guest_upload", "HTTP error during guest upload")
        raise
    except Exception as e:
        monitoring_service.log_error(monitoring_session_id, "guest_upload", str(e))
        logger.exception("Guest upload failed")
        raise HTTPException(status_code=500, detail="Failed to upload invoice. Please try again.") from e
