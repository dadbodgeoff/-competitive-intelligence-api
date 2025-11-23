"""
Nano Banana image generation orchestrator.

Coordinates template assembly, brand enrichment, API dispatch, progress polling,
and persistence so API routes can remain thin controllers.
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

from services.account_service import AccountService
from services.creative_brand_service import CreativeBrandService
from services.creative_generation_storage import CreativeGenerationStorage
from services.creative_asset_storage import CreativeAssetStorage
from services.creative_compliance_service import CreativeComplianceService
from services.creative_theme_service import CreativeThemeService
from services.creative_template_service import CreativeTemplateService
from services.creative_variation_engine import CreativeVariationEngine
from services.nano_banana_client import NanoBananaClient, sanitize_payload_for_logging
from services.usage_limit_service import get_usage_limit_service

logger = logging.getLogger(__name__)


TERMINAL_STATUSES = {"completed", "failed", "cancelled"}


class UsageLimitExceededError(Exception):
    """Raised when a user exceeds their image generation allocation."""

    def __init__(self, details: Dict[str, Any]) -> None:
        super().__init__(details.get("message", "Usage limit exceeded"))
        self.details = details


class NanoBananaImageOrchestrator:
    """High-level coordinator for creative image generation."""

    POLL_INTERVAL_SECONDS = 5

    def __init__(self) -> None:
        self.account_service = AccountService()
        self.theme_service = CreativeThemeService()
        self.template_service = CreativeTemplateService()
        self.variation_engine = CreativeVariationEngine()
        self.compliance_service = CreativeComplianceService()
        self.brand_service = CreativeBrandService()
        self.storage = CreativeGenerationStorage()
        self.asset_storage = CreativeAssetStorage()
        self.client = NanoBananaClient()
        self.usage_service = get_usage_limit_service()

    # ------------------------------------------------------------------ #
    # Job creation
    # ------------------------------------------------------------------ #

    async def start_generation(self, *, user_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        """Bootstrap a creative generation job."""
        account_id = self.account_service.get_primary_account_id(user_id)

        allowed, limit_details = self.usage_service.check_limit(user_id, "image_generation")
        if not allowed:
            raise UsageLimitExceededError(limit_details)

        template_id = request["template_id"]
        template = self.template_service.get_template(template_id)
        if not template.get("theme_id") and not request.get("theme_id"):
            raise ValueError("Template is not associated with a theme")

        theme_id = request.get("theme_id") or template.get("theme_id")
        if request.get("theme_id") and template.get("theme_id") and request["theme_id"] != template["theme_id"]:
            raise ValueError("Template does not belong to the requested theme")

        theme = self.theme_service.get_theme(theme_id)

        sections = self.template_service.get_template_sections(template_id)

        user_inputs = request.get("user_inputs") or {}
        brand_profile = self.brand_service.get_brand_profile(
            account_id=account_id,
            user_id=user_id,
            brand_profile_id=request.get("brand_profile_id"),
        )

        brand_overrides = request.get("brand_overrides") or {}
        if brand_overrides:
            if "brand_name" in brand_overrides:
                brand_profile["brand_name"] = brand_overrides["brand_name"]
            if "palette" in brand_overrides:
                palette = dict(brand_profile.get("palette", {}))
                palette.update(brand_overrides["palette"])
                brand_profile["palette"] = palette

        variables = self.template_service.validate_inputs(template, user_inputs)
        variables, replacements = self.compliance_service.sanitize_variables(variables)
        variables.setdefault("brand_name", brand_profile.get("brand_name", ""))
        variables.setdefault("restaurant_name", brand_profile.get("brand_name", ""))

        recent_variations = self.storage.get_recent_variations(
            account_id=account_id,
            theme_id=theme_id,
        )
        variation_summary = self.variation_engine.generate_variation(
            theme=theme,
            template=template,
            brand_profile=brand_profile,
            style_preferences=request.get("style_preferences"),
            recent_variations=recent_variations,
        )

        compliance_directive = self.compliance_service.get_compliance_directive()

        rendered_sections = self.template_service.assemble_prompt(
            sections=sections,
            variables=variables,
            style_suffix=variation_summary.get("style_suffix"),
            style_notes=variation_summary.get("style_notes"),
            compliance_directive=compliance_directive,
        )

        prompt_token_estimate = self._estimate_prompt_tokens(rendered_sections)
        desired_outputs = request.get("desired_outputs") or {"variants": 1, "dimensions": "1024x1024"}

        job_record = self.storage.create_job(
            account_id=account_id,
            user_id=user_id,
            template_id=template_id,
            theme_id=theme_id,
            template_slug=template["slug"],
            template_version=template.get("prompt_version", "v1"),
            desired_outputs=desired_outputs,
            prompt_sections=rendered_sections,
            brand_profile_id=brand_profile.get("id"),
            prompt_token_estimate=prompt_token_estimate,
            cost_estimate=request.get("cost_estimate"),
        )

        self.storage.record_event(
            job_id=job_record["id"],
            event_type="prompt_assembled",
            payload={
                "sections": list(rendered_sections.keys()),
                "prompt_token_estimate": prompt_token_estimate,
                "variation_summary": variation_summary,
                "sanitization": replacements,
            },
            progress=10,
        )

        api_payload = self._build_nano_payload(
            rendered_sections=rendered_sections,
            brand_profile=brand_profile,
            desired_outputs=desired_outputs,
            metadata=request.get("generation_metadata"),
            variation_summary=variation_summary,
        )

        logger.debug(
            "Nano Banana request payload: %s",
            sanitize_payload_for_logging(api_payload),
        )

        response = await self.client.create_job(api_payload)
        nano_job_id = response.get("id") or response.get("job_id")
        if not nano_job_id:
            raise RuntimeError("Nano Banana did not return a job identifier")

        self.storage.update_job_status(
            job_record["id"],
            status="dispatching",
            progress=20,
            nano_job_id=nano_job_id,
        )

        self.storage.record_event(
            job_id=job_record["id"],
            event_type="nano_job_dispatched",
            payload={"nano_job_id": nano_job_id},
            progress=20,
        )

        self.usage_service.increment_usage(
            user_id=user_id,
            operation_type="image_generation",
            operation_id=job_record["id"],
            metadata={"nano_job_id": nano_job_id},
        )

        self.storage.record_variation(
            job_id=job_record["id"],
            account_id=account_id,
            theme_id=theme_id,
            template_id=template_id,
            variation_summary=variation_summary,
        )

        job_record["nano_job_id"] = nano_job_id
        job_record["status"] = "dispatching"
        job_record["progress"] = 20
        job_record["variation_summary"] = variation_summary
        return job_record

    # ------------------------------------------------------------------ #
    # Streaming / polling
    # ------------------------------------------------------------------ #

    async def stream_job_progress(
        self,
        *,
        job_id: str,
        user_id: str,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Yield progress updates suitable for Server-Sent Events."""
        job = self.storage.get_job(job_id, user_id)
        if not job:
            raise ValueError("Job not found")
        if not job.get("nano_job_id"):
            yield {"type": "queued", "data": {"message": "Job is queued for dispatch"}}
            return

        current_status = job.get("status", "dispatching")
        if current_status in TERMINAL_STATUSES:
            yield {"type": "job_complete", "data": _serialize_job(job)}
            return

        while True:
            response = await self.client.get_job(job["nano_job_id"])
            status = response.get("status") or response.get("state")
            progress = response.get("progress")

            if status:
                self.storage.update_job_status(
                    job_id,
                    status=status,
                    progress=progress,
                    error_message=response.get("error"),
                    cost_estimate=response.get("cost"),
                )
                self.storage.record_event(
                    job_id=job_id,
                    event_type=f"status_{status}",
                    payload=response,
                    progress=progress,
                )

            payload = {
                "status": status,
                "progress": progress,
                "message": response.get("message"),
            }
            yield {"type": "status", "data": payload}

            if status in TERMINAL_STATUSES:
                if status == "completed":
                    assets_response = await self.client.list_assets(job["nano_job_id"])
                    assets = self._normalize_assets(
                        job=job,
                        job_id=job_id,
                        assets_response=assets_response,
                    )
                    stored_assets = self.storage.store_assets(job_id, assets)
                    self.storage.record_event(
                        job_id=job_id,
                        event_type="assets_ready",
                        payload={"count": len(stored_assets)},
                        progress=95,
                    )
                    final_job = self.storage.get_job(job_id, user_id)
                    yield {"type": "job_complete", "data": _serialize_job(final_job)}
                elif status == "failed":
                    yield {
                        "type": "job_failed",
                        "data": {
                            "error": response.get("error") or "Nano Banana reported failure",
                            "nano_job_id": job["nano_job_id"],
                        },
                    }
                break

            await asyncio.sleep(self.POLL_INTERVAL_SECONDS)

    # ------------------------------------------------------------------ #
    # Retrieval helpers
    # ------------------------------------------------------------------ #

    def get_job(self, *, job_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Return a single job with assets/events."""
        return self.storage.get_job(job_id, user_id)

    def list_jobs(
        self,
        *,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """Return paginated jobs for the user's primary account."""
        account_id = self.account_service.get_primary_account_id(user_id)
        return self.storage.list_jobs(
            account_id=account_id,
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

    def preview_template(
        self,
        *,
        user_id: str,
        template_id: str,
        user_inputs: Optional[Dict[str, Any]] = None,
        style_preferences: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Assemble prompt sections with variation preview."""
        account_id = self.account_service.get_primary_account_id(user_id)
        template = self.template_service.get_template(template_id)
        if not template.get("theme_id"):
            raise ValueError("Template is not linked to a theme")
        theme = self.theme_service.get_theme(template["theme_id"])
        sections = self.template_service.get_template_sections(template_id)
        brand_profile = self.brand_service.get_brand_profile(
            account_id=account_id,
            user_id=user_id,
            brand_profile_id=None,
        )
        variables = self.template_service.validate_inputs(template, user_inputs or {})
        variables.setdefault("brand_name", brand_profile.get("brand_name", ""))
        variation_summary = self.variation_engine.generate_variation(
            theme=theme,
            template=template,
            brand_profile=brand_profile,
            style_preferences=style_preferences,
            recent_variations=[],
        )
        rendered = self.template_service.assemble_prompt(
            sections=sections,
            variables=variables,
            style_suffix=variation_summary.get("style_suffix"),
            style_notes=variation_summary.get("style_notes"),
        )
        return {"sections": rendered, "variation_summary": variation_summary}

    # ------------------------------------------------------------------ #
    # Webhook integration
    # ------------------------------------------------------------------ #

    def process_webhook(
        self,
        *,
        raw_body: bytes,
        signature: str,
    ) -> Dict[str, Any]:
        """
        Process Nano Banana webhook callback.

        Webhook payload should include keys:
            - nano_job_id
            - status
            - progress
            - assets (optional)
        """
        if not self.client.validate_webhook(raw_body, signature):
            raise ValueError("Invalid Nano Banana webhook signature")

        payload = json.loads(raw_body.decode("utf-8"))
        nano_job_id = payload.get("nano_job_id")
        if not nano_job_id:
            raise ValueError("Webhook payload missing nano_job_id")

        job = self.storage.get_job_by_nano_id(nano_job_id)
        if not job:
            logger.warning("Received webhook for unknown Nano Banana job %s", nano_job_id)
            return {"status": "ignored"}

        status = payload.get("status")
        progress = payload.get("progress")

        self.storage.update_job_status(
            job["id"],
            status=status or job.get("status"),
            progress=progress,
            error_message=payload.get("error"),
            cost_estimate=payload.get("cost"),
        )
        self.storage.record_event(
            job_id=job["id"],
            event_type="webhook_event",
            payload=payload,
            progress=progress,
        )

        if status == "completed" and payload.get("assets"):
            assets = self._normalize_assets(payload)
            self.storage.store_assets(job["id"], assets)

        return {"status": "processed", "job_id": job["id"]}

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #

    def _build_nano_payload(
        self,
        *,
        rendered_sections: Dict[str, str],
        brand_profile: Dict[str, Any],
        desired_outputs: Dict[str, Any],
        metadata: Optional[Dict[str, Any]],
        variation_summary: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Shape the payload expected by Nano Banana."""
        payload = {
            "prompt": rendered_sections,
            "brand": {
                "name": brand_profile.get("brand_name"),
                "palette": brand_profile.get("palette"),
                "typography": brand_profile.get("typography"),
                "voice_profile": brand_profile.get("voice_profile"),
                "asset_descriptors": brand_profile.get("asset_descriptors"),
            },
            "outputs": desired_outputs,
            "style": {
                "seed": variation_summary.get("style_seed"),
                "noise_level": variation_summary.get("noise_level"),
                "notes": variation_summary.get("style_notes"),
                "texture": variation_summary.get("texture"),
                "palette": variation_summary.get("palette"),
            },
        }
        merged_metadata = dict(metadata or {})
        merged_metadata.setdefault("variation_summary", variation_summary)
        if merged_metadata:
            payload["metadata"] = merged_metadata
        return payload

    def _estimate_prompt_tokens(self, sections: Dict[str, str]) -> int:
        """Rough heuristic to help the UI surface prompt size."""
        total_chars = sum(len(text) for text in sections.values())
        return max(1, total_chars // 4)  # ~4 chars per token heuristic

    def _normalize_assets(
        self,
        *,
        job: Dict[str, Any],
        job_id: str,
        assets_response: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Ensure assets use consistent keys and cache them locally."""
        account_id = job.get("account_id") or job.get("accountId")
        assets: List[Dict[str, Any]] = []
        raw_assets = assets_response.get("assets") or assets_response.get("data") or []
        for asset in raw_assets:
            source_asset_url = asset.get("url") or asset.get("asset_url")
            source_preview_url = asset.get("preview_url")
            variant_label = asset.get("variant") or asset.get("label")

            cached = self.asset_storage.cache_asset(
                account_id=account_id,
                job_id=job_id,
                source_url=source_asset_url,
                variant_label=variant_label,
            )
            cached_preview = self.asset_storage.cache_preview(
                account_id=account_id,
                job_id=job_id,
                source_url=source_preview_url,
                variant_label=variant_label,
            )

            assets.append(
                {
                    "asset_url": cached.get("asset_url") or source_asset_url,
                    "preview_url": cached_preview.get("preview_url") or source_preview_url,
                    "variant_label": variant_label,
                    "width": asset.get("width"),
                    "height": asset.get("height"),
                    "file_size_bytes": asset.get("file_size"),
                    "prompt_variation": asset.get("prompt_variation") or {},
                    "metadata": asset,
                    "source_asset_url": source_asset_url,
                    "source_preview_url": source_preview_url,
                    "storage_path": cached.get("storage_path"),
                }
            )
        return [asset for asset in assets if asset["asset_url"]]


def _serialize_job(job: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Prepare job dict for public responses."""
    if not job:
        return {}
    return {
        "id": job["id"],
        "status": job.get("status"),
        "progress": job.get("progress"),
        "template_slug": job.get("template_slug"),
        "template_version": job.get("template_version"),
        "nano_job_id": job.get("nano_job_id"),
        "desired_outputs": job.get("desired_outputs"),
        "prompt_sections": job.get("prompt_sections"),
        "variation_summary": job.get("variation_summary"),
        "created_at": job.get("created_at"),
        "completed_at": job.get("completed_at"),
        "error_message": job.get("error_message"),
        "assets": job.get("assets", []),
        "events": job.get("events", []),
    }


