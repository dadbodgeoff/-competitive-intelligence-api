"""
Nano Banana creative generation API routes.
"""
from __future__ import annotations

import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import ValidationError

from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import rate_limit
from api.schemas.image_generation_schemas import (
    BrandProfileSummary,
    CreativeJobDetail,
    JobListResponse,
    StartGenerationRequest,
    StartGenerationResponse,
    TemplatePreviewRequest,
    TemplatePreviewResponse,
    TemplateSummary,
    ThemeSummary,
    VariationSummary,
)
from services.account_service import AccountService
from services.creative_brand_service import CreativeBrandService
from services.creative_template_service import CreativeTemplateService
from services.creative_theme_service import CreativeThemeService
from services.error_sanitizer import ErrorSanitizer
from services.nano_banana_orchestrator import (
    NanoBananaImageOrchestrator,
    UsageLimitExceededError,
)

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/nano-banana", tags=["nano-banana"])
theme_service = CreativeThemeService()
template_service = CreativeTemplateService()
brand_service = CreativeBrandService()
account_service = AccountService()

_cached_orchestrator: Optional[NanoBananaImageOrchestrator] = None


def get_orchestrator() -> NanoBananaImageOrchestrator:
    """
    Lazily create the orchestrator so env vars are resolved at runtime.

    Instantiating the orchestrator pulls in external credentials via
    NanoBananaClient; delaying creation means we respect environment variables
    injected during process startup (e.g. Docker secrets) instead of requiring
    them at import time.
    """
    global _cached_orchestrator
    if _cached_orchestrator is None:
        _cached_orchestrator = NanoBananaImageOrchestrator()
    return _cached_orchestrator


class _OrchestratorProxy:
    """Proxy that preserves legacy module-level access patterns."""

    __slots__ = ()

    def __getattr__(self, item: str) -> Any:
        return getattr(get_orchestrator(), item)

    def __setattr__(self, key: str, value: Any) -> None:
        setattr(get_orchestrator(), key, value)


orchestrator = _OrchestratorProxy()


def set_orchestrator_override(
    instance: Optional[NanoBananaImageOrchestrator],
) -> None:
    """Allow tests to inject a bespoke orchestrator instance."""
    global _cached_orchestrator
    _cached_orchestrator = instance


def reset_orchestrator_cache() -> None:
    """Reset the cached orchestrator (primarily for integration tests)."""
    set_orchestrator_override(None)

@router.get("/brands", response_model=List[BrandProfileSummary])
@rate_limit("analysis")
async def list_brand_profiles(
    request: Request,
    current_user: str = Depends(get_current_user),
) -> List[BrandProfileSummary]:
    """Return brand profiles available to the current account."""
    account_id = account_service.get_primary_account_id(current_user)
    profiles = brand_service.list_profiles(account_id=account_id)
    return [BrandProfileSummary(**profile) for profile in profiles]


@router.post("/brands", response_model=BrandProfileSummary)
@rate_limit("analysis")
async def create_brand_profile(
    request: Request,
    current_user: str = Depends(get_current_user),
) -> BrandProfileSummary:
    """Create a new brand profile."""
    account_id = account_service.get_primary_account_id(current_user)
    raw_body = await request.json()
    
    try:
        profile = brand_service.create_profile(
            account_id=account_id,
            user_id=current_user,
            profile_data=raw_body
        )
        return BrandProfileSummary(**profile)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error(f"Failed to create brand profile: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create brand profile") from exc


@router.put("/brands/{profile_id}", response_model=BrandProfileSummary)
@rate_limit("analysis")
async def update_brand_profile(
    profile_id: str,
    request: Request,
    current_user: str = Depends(get_current_user),
) -> BrandProfileSummary:
    """Update an existing brand profile."""
    account_id = account_service.get_primary_account_id(current_user)
    raw_body = await request.json()
    
    try:
        profile = brand_service.update_profile(
            account_id=account_id,
            profile_id=profile_id,
            profile_data=raw_body
        )
        return BrandProfileSummary(**profile)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.error(f"Failed to update brand profile: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update brand profile") from exc



@router.post("/generate", response_model=StartGenerationResponse)
@rate_limit("analysis")
async def generate_creatives(
    request: Request,
    orchestrator: NanoBananaImageOrchestrator = Depends(get_orchestrator),
    current_user: str = Depends(get_current_user),
) -> StartGenerationResponse:
    """Kick off a creative generation job."""
    try:
        raw_body = await request.json()
        try:
            payload = StartGenerationRequest(**raw_body)
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=exc.errors()) from exc

        job = await orchestrator.start_generation(
            user_id=current_user,
            request=payload.dict(),
        )
        return StartGenerationResponse(
            job_id=job["id"],
            nano_job_id=job["nano_job_id"],
            status=job["status"],
            progress=job.get("progress", 0),
            created_at=job["created_at"],
            variation_summary=VariationSummary(**job.get("variation_summary", {})),
        )
    except UsageLimitExceededError as exc:
        raise HTTPException(status_code=429, detail=exc.details) from exc
    except Exception as exc:  # noqa: BLE001
        logger.error("Nano Banana generation failed: %s", exc, exc_info=True)
        raise ErrorSanitizer.create_http_exception(
            exc, status_code=500, user_message="Failed to start generation"
        ) from exc


@router.get("/jobs/{job_id}/stream")
@rate_limit("analysis")
async def stream_job(
    job_id: str,
    request: Request,
    orchestrator: NanoBananaImageOrchestrator = Depends(get_orchestrator),
    current_user: str = Depends(get_current_user),
):
    """Stream job progress updates via Server-Sent Events."""

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            async for event in orchestrator.stream_job_progress(
                job_id=job_id,
                user_id=current_user,
            ):
                event_type = event.get("type", "message")
                data: Dict = event.get("data", {})
                yield f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        except Exception as exc:  # noqa: BLE001
            logger.error("Nano Banana progress stream failed: %s", exc, exc_info=True)
            safe_error = ErrorSanitizer.sanitize_error(exc, "Progress stream failed")
            yield f"event: error\ndata: {json.dumps({'error': safe_error})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/jobs/{job_id}", response_model=CreativeJobDetail)
@rate_limit("analysis")
async def get_job(
    job_id: str,
    request: Request,
    orchestrator: NanoBananaImageOrchestrator = Depends(get_orchestrator),
    current_user: str = Depends(get_current_user),
) -> CreativeJobDetail:
    """Fetch a single job with asset metadata."""
    job = orchestrator.get_job(job_id=job_id, user_id=current_user)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return CreativeJobDetail(**job)


@router.get("/jobs", response_model=JobListResponse)
@rate_limit("analysis")
async def list_jobs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    orchestrator: NanoBananaImageOrchestrator = Depends(get_orchestrator),
    current_user: str = Depends(get_current_user),
) -> JobListResponse:
    """List jobs for the authenticated user."""
    offset = (page - 1) * per_page
    result = orchestrator.list_jobs(user_id=current_user, limit=per_page, offset=offset)
    return JobListResponse(data=result["data"], count=result["count"])


@router.get("/themes", response_model=List[ThemeSummary])
@rate_limit("analysis")
async def list_themes(
    request: Request,
    restaurant_vertical: Optional[str] = Query(None, description="Filter by vertical"),
    current_user: str = Depends(get_current_user),
) -> List[ThemeSummary]:
    """List creative themes available to the authenticated user."""
    themes = theme_service.list_themes(restaurant_vertical)
    return themes


@router.get("/themes/{theme_id}/templates", response_model=List[TemplateSummary])
@rate_limit("analysis")
async def list_templates_for_theme(
    theme_id: str,
    request: Request,
    current_user: str = Depends(get_current_user),
) -> List[TemplateSummary]:
    """List templates for a given theme."""
    return template_service.list_templates_by_theme(theme_id)


@router.post("/templates/preview", response_model=TemplatePreviewResponse)
@rate_limit("analysis")
async def preview_template(
    request: Request,
    orchestrator: NanoBananaImageOrchestrator = Depends(get_orchestrator),
    current_user: str = Depends(get_current_user),
) -> TemplatePreviewResponse:
    """Render template sections without dispatching a job."""
    raw_body = await request.json()
    try:
        payload = TemplatePreviewRequest(**raw_body)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc

    preview = orchestrator.preview_template(
        user_id=current_user,
        template_id=payload.template_id,
        user_inputs=payload.user_inputs,
        style_preferences=payload.style_preferences,
    )
    variation = preview.get("variation_summary") or {}
    return TemplatePreviewResponse(
        sections=preview.get("sections", {}),
        variation_summary=VariationSummary(**variation) if variation else None,
    )


@router.post("/webhook")
async def nano_banana_webhook(request: Request) -> JSONResponse:
    """Webhook for Nano Banana status callbacks."""
    signature = request.headers.get("x-nano-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing x-nano-signature header")

    body = await request.body()
    try:
        result = get_orchestrator().process_webhook(raw_body=body, signature=signature)
        return JSONResponse({"success": True, **result})
    except Exception as exc:  # noqa: BLE001
        logger.error("Nano Banana webhook processing failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc


