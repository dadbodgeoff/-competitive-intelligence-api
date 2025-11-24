"""
Nano Banana Demo Routes - Public endpoints for landing page demo
IP-based rate limiting, no authentication required
"""
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import uuid
import time
from datetime import datetime

from services.creative_template_service import CreativeTemplateService
from services.guest_session_store import store_guest_session, get_guest_session
from services.nano_banana_orchestrator import NanoBananaImageOrchestrator
from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/nano-banana/demo", tags=["nano-banana-demo"])

# In-memory IP rate limiter for demo
demo_rate_limiter = {}
DEMO_RATE_LIMIT_WINDOW = 3600  # 1 hour
DEMO_MAX_REQUESTS_PER_IP = 3  # 3 generations per hour per IP


def check_demo_rate_limit(ip_address: str) -> Optional[int]:
    """
    Check if IP has exceeded rate limit
    Returns None if allowed, or seconds until retry if rate limited
    """
    current_time = time.time()
    
    if ip_address not in demo_rate_limiter:
        demo_rate_limiter[ip_address] = []
    
    # Clean old requests
    demo_rate_limiter[ip_address] = [
        req_time for req_time in demo_rate_limiter[ip_address]
        if current_time - req_time < DEMO_RATE_LIMIT_WINDOW
    ]
    
    # Check limit
    if len(demo_rate_limiter[ip_address]) >= DEMO_MAX_REQUESTS_PER_IP:
        oldest_request = min(demo_rate_limiter[ip_address])
        retry_after = int(DEMO_RATE_LIMIT_WINDOW - (current_time - oldest_request))
        return retry_after
    
    return None


def record_demo_request(ip_address: str):
    """Record a demo request for rate limiting"""
    current_time = time.time()
    if ip_address not in demo_rate_limiter:
        demo_rate_limiter[ip_address] = []
    demo_rate_limiter[ip_address].append(current_time)


class DemoGenerationRequest(BaseModel):
    template_id: str = Field(..., description="Template ID to use")
    inputs: dict = Field(..., description="Template input fields (headline, body, etc.)")
    policies_acknowledged: bool = Field(..., description="User acknowledged policies")
    terms_version: str = Field(..., description="Terms version accepted")
    privacy_version: str = Field(..., description="Privacy version accepted")
    consent_timestamp: Optional[str] = Field(None, description="Consent timestamp")


class DemoGenerationResponse(BaseModel):
    success: bool
    session_id: str
    message: Optional[str] = None


class TemplateSummary(BaseModel):
    id: str
    name: str
    display_name: Optional[str] = None
    preview_url: Optional[str] = None
    input_schema: Optional[dict] = None


@router.get("/templates", response_model=List[TemplateSummary])
async def list_demo_templates():
    """
    Get available templates for demo (public endpoint)
    Returns a curated list of templates suitable for demo with input schemas
    """
    try:
        # Get featured templates with input schemas
        supabase = get_supabase_service_client()
        result = supabase.table("creative_prompt_templates").select(
            "id, name, display_name, slug, input_schema"
        ).eq("is_active", True).limit(8).execute()
        
        templates = []
        for row in result.data:
            # Parse input_schema if it's a string
            input_schema = row.get("input_schema")
            if isinstance(input_schema, str):
                try:
                    import json
                    input_schema = json.loads(input_schema)
                except:
                    input_schema = None
            
            templates.append(TemplateSummary(
                id=row["id"],
                name=row["name"],
                display_name=row.get("display_name") or row["name"],
                preview_url=None,  # No preview_url in schema yet
                input_schema=input_schema
            ))
        
        return templates
        
    except Exception as e:
        logger.error(f"Failed to fetch demo templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load templates"
        )


@router.post("/generate", response_model=DemoGenerationResponse)
async def generate_demo_creative(
    request: Request,
    payload: DemoGenerationRequest,
):
    """
    Start creative generation for demo (public endpoint with IP rate limiting)
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    retry_after = check_demo_rate_limit(client_ip)
    if retry_after is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "demo_rate_limit",
                "message": f"You've used your free demo generations. Create an account for unlimited access.",
                "retry_after_seconds": retry_after,
            }
        )
    
    # Validate policy consent
    if not payload.policies_acknowledged:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Policy acknowledgement is required"
        )
    
    if not payload.terms_version or not payload.privacy_version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Policy versions are required"
        )
    
    # Record the request
    record_demo_request(client_ip)
    
    # Create guest session
    session_id = str(uuid.uuid4())
    # Use fixed demo user UUID (seeded in database)
    demo_user_id = "00000000-0000-0000-0000-000000000002"
    
    try:
        # Start generation using orchestrator
        orchestrator = NanoBananaImageOrchestrator()
        
        # Create a minimal generation request with user inputs
        generation_request = {
            "template_id": payload.template_id,
            "user_inputs": payload.inputs,
            "desired_outputs": {"variants": 1, "dimensions": "1024x1024"},
        }
        
        job = await orchestrator.start_generation(
            user_id=demo_user_id,
            request=generation_request,
        )
        job_id = job["id"]
        
        # Store session data
        session_data = {
            "session_id": session_id,
            "job_id": job_id,
            "demo_user_id": demo_user_id,
            "template_id": payload.template_id,
            "inputs": payload.inputs,
            "ip_address": client_ip,
            "created_at": datetime.utcnow().isoformat(),
            "policies": {
                "acknowledged": payload.policies_acknowledged,
                "terms_version": payload.terms_version,
                "privacy_version": payload.privacy_version,
                "acknowledged_at": payload.consent_timestamp or datetime.utcnow().isoformat(),
            }
        }
        store_guest_session(session_id, session_data)
        
        logger.info(f"Demo generation started: session={session_id}, job={job_id}, ip={client_ip}")
        
        return DemoGenerationResponse(
            success=True,
            session_id=session_id,
            message="Generation started"
        )
        
    except Exception as e:
        logger.error(f"Demo generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/jobs/{session_id}/stream")
async def stream_demo_job(session_id: str):
    """
    Stream job progress for demo (public endpoint)
    """
    # Get session data
    session_data = get_guest_session(session_id)
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    job_id = session_data.get("job_id")
    if not job_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    async def event_generator():
        """Generate SSE events for job progress"""
        orchestrator = NanoBananaImageOrchestrator()
        demo_user_id = session_data.get("demo_user_id")
        
        try:
            async for event in orchestrator.stream_job_progress(
                job_id=job_id,
                user_id=demo_user_id,
            ):
                event_type = event.get("type", "message")
                data = event.get("data", {})
                
                # Transform to simpler format for demo
                if event_type == "complete":
                    yield f"data: {json.dumps({'status': 'completed', 'preview_url': data.get('image_url'), 'progress': 100})}\n\n"
                elif event_type == "error":
                    yield f"data: {json.dumps({'status': 'failed', 'error': data.get('error', 'Generation failed')})}\n\n"
                elif event_type == "progress":
                    yield f"data: {json.dumps({'status': 'processing', 'progress': data.get('progress', 0)})}\n\n"
                else:
                    yield f"data: {json.dumps(data)}\n\n"
                    
        except Exception as e:
            logger.error(f"Error streaming demo job: {e}")
            yield f"data: {json.dumps({'status': 'failed', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/jobs/{session_id}")
async def get_demo_job_status(session_id: str):
    """
    Get job status for demo (public endpoint)
    """
    # Get session data
    session_data = get_guest_session(session_id)
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    job_id = session_data.get("job_id")
    if not job_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    try:
        orchestrator = NanoBananaImageOrchestrator()
        demo_user_id = session_data.get("demo_user_id")
        
        job = orchestrator.get_job(job_id=job_id, user_id=demo_user_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        return {
            "job_id": job_id,
            "status": job["status"],
            "progress": job.get("progress", 0),
            "preview_url": job.get("image_url") if job["status"] == "completed" else None,
            "error": job.get("error"),
            "requires_auth_for_download": True,  # Always require auth for download
        }
        
    except Exception as e:
        logger.error(f"Failed to get demo job status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


import asyncio
import json
