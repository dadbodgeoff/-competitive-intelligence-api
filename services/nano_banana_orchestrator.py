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
from services.creative_quality_validator import CreativeQualityValidator
from services.feature_flag_service import get_feature_flag_service
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
        # Phase 1: Quality validation
        self.quality_validator = CreativeQualityValidator()
        self.feature_flags = get_feature_flag_service()

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
        
        # Handle custom prompts (no template)
        if template_id == "custom":
            return await self._start_custom_generation(
                user_id=user_id,
                account_id=account_id,
                request=request,
            )
        
        template = self.template_service.get_template(template_id)
        if not template.get("theme_id") and not request.get("theme_id"):
            raise ValueError("Template is not associated with a theme")

        theme_id = request.get("theme_id") or template.get("theme_id")
        if request.get("theme_id") and template.get("theme_id") and request["theme_id"] != template["theme_id"]:
            raise ValueError("Template does not belong to the requested theme")

        theme = self.theme_service.get_theme(theme_id)

        sections = self.template_service.get_template_sections(template_id)

        user_inputs = request.get("user_inputs") or {}
        
        # Check if this is the demo user
        is_demo_user = user_id == "00000000-0000-0000-0000-000000000002"
        
        # For demo users, use a minimal brand profile
        if is_demo_user:
            brand_profile = {"brand_name": "Demo Restaurant"}
        else:
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

        variables = self.template_service.validate_inputs(template, user_inputs, theme=theme)
        variables, replacements = self.compliance_service.sanitize_variables(variables)
        variables.setdefault("brand_name", brand_profile.get("brand_name", ""))
        variables.setdefault("restaurant_name", brand_profile.get("brand_name", ""))

        # Check if this is the demo user
        is_demo_user = user_id == "00000000-0000-0000-0000-000000000002"
        
        # For demo users, skip recent variations (no history)
        if is_demo_user:
            recent_variations = []
        else:
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
            brand_profile=brand_profile,
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
            recent_variations=recent_variations,
        )

        logger.debug(
            "Nano Banana request payload: %s",
            sanitize_payload_for_logging(api_payload),
        )

        response = await self.client.create_job(api_payload)
        nano_job_id = response.get("id") or response.get("job_id")
        if not nano_job_id:
            raise RuntimeError("Nano Banana did not return a job identifier")

        # Check if Vertex AI returned predictions synchronously (completed immediately)
        predictions = response.get("predictions", [])
        is_completed = response.get("status") == "completed" and predictions
        
        if is_completed:
            logger.info(f"✅ Vertex AI completed synchronously with {len(predictions)} predictions")
            
            # Update job to completed status
            self.storage.update_job_status(
                job_record["id"],
                status="completed",
                progress=100,
                nano_job_id=nano_job_id,
            )
            
            # Process and store assets immediately
            assets = self._process_vertex_predictions(
                job=job_record,
                job_id=job_record["id"],
                predictions=predictions,
                template=template,
                user_inputs=user_inputs,
                rendered_sections=rendered_sections,
            )
            stored_assets = self.storage.store_assets(job_record["id"], assets)
            
            self.storage.record_event(
                job_id=job_record["id"],
                event_type="assets_ready",
                payload={"count": len(stored_assets)},
                progress=100,
            )
        else:
            # Async job flow (original behavior)
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
        if is_completed:
            job_record["status"] = "completed"
            job_record["progress"] = 100
        else:
            job_record["status"] = "dispatching"
            job_record["progress"] = 20
        job_record["variation_summary"] = variation_summary
        return job_record

    # ------------------------------------------------------------------ #
    # Custom Prompt Generation
    # ------------------------------------------------------------------ #

    async def _start_custom_generation(
        self,
        *,
        user_id: str,
        account_id: str,
        request: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Handle custom prompt generation (no template).
        
        Uses the same quality enhancement pipeline but with user-provided prompt.
        """
        user_inputs = request.get("user_inputs") or {}
        style_preferences = request.get("style_preferences") or {}
        
        # Get brand profile
        brand_profile = self.brand_service.get_brand_profile(
            account_id=account_id,
            user_id=user_id,
            brand_profile_id=request.get("brand_profile_id"),
        )
        
        # Build the custom prompt with quality enhancements
        custom_prompt = self._build_custom_prompt(
            user_inputs=user_inputs,
            style_preferences=style_preferences,
            brand_profile=brand_profile,
        )
        
        # Create rendered sections (same format as templates)
        rendered_sections = {"base": custom_prompt}
        
        # Generate variation summary for uniqueness
        variation_summary = {
            "style_seed": self.variation_engine._generate_unique_seed([]),
            "noise_level": 0.4,
            "style_notes": self._extract_style_notes(style_preferences),
            "texture": style_preferences.get("texture"),
            "palette": brand_profile.get("palette", {}),
            "style_suffix": "",
        }
        
        prompt_token_estimate = self._estimate_prompt_tokens(rendered_sections)
        desired_outputs = request.get("desired_outputs") or {"variants": 1, "dimensions": "1024x1024"}
        
        # Create job record
        job_record = self.storage.create_job(
            account_id=account_id,
            user_id=user_id,
            template_id=None,  # No template for custom
            theme_id=None,     # No theme for custom
            template_slug="custom_prompt",
            template_version="v1",
            desired_outputs=desired_outputs,
            prompt_sections=rendered_sections,
            brand_profile_id=brand_profile.get("id"),
            prompt_token_estimate=prompt_token_estimate,
            cost_estimate=request.get("cost_estimate"),
        )
        
        self.storage.record_event(
            job_id=job_record["id"],
            event_type="custom_prompt_assembled",
            payload={
                "sections": list(rendered_sections.keys()),
                "prompt_token_estimate": prompt_token_estimate,
                "style_preferences": style_preferences,
            },
            progress=10,
        )
        
        # Build API payload
        api_payload = self._build_nano_payload(
            rendered_sections=rendered_sections,
            brand_profile=brand_profile,
            desired_outputs=desired_outputs,
            metadata=request.get("generation_metadata"),
            variation_summary=variation_summary,
            recent_variations=[],
        )
        
        logger.debug(
            "Custom prompt request payload: %s",
            sanitize_payload_for_logging(api_payload),
        )
        
        # Dispatch to Vertex AI
        response = await self.client.create_job(api_payload)
        nano_job_id = response.get("id") or response.get("job_id")
        if not nano_job_id:
            raise RuntimeError("Nano Banana did not return a job identifier")
        
        # Handle synchronous completion
        predictions = response.get("predictions", [])
        is_completed = response.get("status") == "completed" and predictions
        
        if is_completed:
            logger.info(f"✅ Custom prompt completed synchronously with {len(predictions)} predictions")
            
            self.storage.update_job_status(
                job_record["id"],
                status="completed",
                progress=100,
                nano_job_id=nano_job_id,
            )
            
            assets = self._process_vertex_predictions(
                job=job_record,
                job_id=job_record["id"],
                predictions=predictions,
                template={},
                user_inputs=user_inputs,
                rendered_sections=rendered_sections,
            )
            self.storage.store_assets(job_record["id"], assets)
            
            self.storage.record_event(
                job_id=job_record["id"],
                event_type="assets_ready",
                payload={"count": len(assets)},
                progress=100,
            )
        else:
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
        
        # Track usage
        self.usage_service.increment_usage(
            user_id=user_id,
            operation_type="image_generation",
            operation_id=job_record["id"],
            metadata={"nano_job_id": nano_job_id, "is_custom": True},
        )
        
        job_record["nano_job_id"] = nano_job_id
        job_record["status"] = "completed" if is_completed else "dispatching"
        job_record["progress"] = 100 if is_completed else 20
        job_record["variation_summary"] = variation_summary
        return job_record

    def _build_custom_prompt(
        self,
        *,
        user_inputs: Dict[str, str],
        style_preferences: Dict[str, Any],
        brand_profile: Dict[str, Any],
    ) -> str:
        """
        Build a high-quality prompt from user's custom description.
        
        This is where the magic happens - we take their simple input and
        enhance it with professional photography techniques.
        """
        parts = []
        
        # Start with their main subject
        main_subject = user_inputs.get("main_subject", "restaurant marketing image")
        parts.append(f"Photorealistic {main_subject}")
        
        # Add composition style
        composition = style_preferences.get("composition", "hero")
        composition_map = {
            "hero": "hero shot composition with dramatic angle",
            "flat_lay": "overhead flat lay composition",
            "action": "dynamic action shot with motion",
            "lifestyle": "lifestyle scene with context",
            "close_up": "macro close-up with extreme detail",
        }
        if composition in composition_map:
            parts.append(composition_map[composition])
        
        # Add atmosphere
        atmosphere = style_preferences.get("atmosphere", "cozy")
        atmosphere_map = {
            "cozy": "warm, inviting, comfortable atmosphere",
            "upscale": "refined, sophisticated, premium atmosphere",
            "rustic": "handcrafted, authentic, artisan atmosphere",
            "modern": "minimalist, contemporary, sleek atmosphere",
            "vibrant": "bold colors, high energy, fun atmosphere",
            "casual": "approachable, everyday, relaxed atmosphere",
        }
        if atmosphere in atmosphere_map:
            parts.append(atmosphere_map[atmosphere])
        
        # Add lighting
        lighting = style_preferences.get("lighting", "golden_hour")
        lighting_map = {
            "golden_hour": "golden hour warmth with soft shadows",
            "studio": "professional studio lighting with controlled highlights",
            "moody": "dramatic side lighting with dark background",
            "natural": "soft diffused natural window light",
            "neon": "colorful neon reflections and bar ambiance",
        }
        if lighting in lighting_map:
            parts.append(lighting_map[lighting])
        
        # Add text overlay if requested
        if style_preferences.get("include_text"):
            headline = user_inputs.get("headline", "")
            sub_text = user_inputs.get("sub_text", "")
            if headline:
                parts.append(f'elegant text overlay reading "{headline}"')
                if sub_text:
                    parts.append(f'with subtitle "{sub_text}"')
        
        # Add texture effects
        texture = style_preferences.get("texture", "none")
        texture_map = {
            "film_grain": "subtle film grain texture",
            "bokeh": "soft bokeh light orbs in background",
            "steam": "rising steam for hot dishes",
            "flour_dust": "flour dust particles in the air",
            "condensation": "cold drink condensation droplets",
        }
        if texture in texture_map:
            parts.append(texture_map[texture])
        
        # Add additional details
        additional = user_inputs.get("additional_details", "")
        if additional:
            parts.append(additional)
        
        # Add brand context
        brand_context = self.template_service._build_brand_context(brand_profile)
        if brand_context:
            parts.append(brand_context)
        
        # Add quality baseline (always)
        parts.append("Professional food photography, magazine-quality, 8K detail, award-winning composition")
        
        # Join with periods
        prompt = ". ".join(parts)
        
        logger.info(f"🎨 Built custom prompt: {prompt[:200]}...")
        return prompt

    def _extract_style_notes(self, style_preferences: Dict[str, Any]) -> List[str]:
        """Extract style notes from preferences for variation tracking."""
        notes = []
        if style_preferences.get("lighting"):
            notes.append(style_preferences["lighting"])
        if style_preferences.get("composition"):
            notes.append(style_preferences["composition"])
        if style_preferences.get("atmosphere"):
            notes.append(style_preferences["atmosphere"])
        if style_preferences.get("texture") and style_preferences["texture"] != "none":
            notes.append(style_preferences["texture"])
        return notes

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
        
        # For preview, use example values from schema if user_inputs not provided
        schema = template.get("input_schema") or {}
        if isinstance(schema, str):
            import json
            schema = json.loads(schema)
        
        examples = schema.get("examples", {})
        defaults = schema.get("defaults", {})
        required = schema.get("required", [])
        optional = schema.get("optional", [])
        
        # Build preview inputs with examples/defaults
        preview_inputs = {}
        for field in required + optional:
            if user_inputs and field in user_inputs:
                preview_inputs[field] = user_inputs[field]
            elif field in examples:
                preview_inputs[field] = examples[field]
            elif field in defaults:
                # Use first default if it's a list
                default_val = defaults[field]
                preview_inputs[field] = default_val[0] if isinstance(default_val, list) else default_val
            elif field in required:
                # Fallback for required fields without examples
                preview_inputs[field] = f"[{field}]"
        
        variables = preview_inputs
        variables.setdefault("brand_name", brand_profile.get("brand_name", "Your Restaurant"))
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
            brand_profile=brand_profile,
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
        recent_variations: Optional[List[Dict[str, Any]]] = None,
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
                "recent_variations": recent_variations or [],  # Pass to Gemini for avoidance
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

    def _process_vertex_predictions(
        self,
        *,
        job: Dict[str, Any],
        job_id: str,
        predictions: List[Dict[str, Any]],
        template: Optional[Dict[str, Any]] = None,
        user_inputs: Optional[Dict[str, str]] = None,
        rendered_sections: Optional[Dict[str, str]] = None,
    ) -> List[Dict[str, Any]]:
        """Process Vertex AI Imagen predictions into asset format."""
        account_id = job.get("account_id") or job.get("accountId")
        assets: List[Dict[str, Any]] = []
        
        for idx, prediction in enumerate(predictions):
            # Vertex AI Imagen returns base64 encoded images in bytesBase64Encoded
            image_data = prediction.get("bytesBase64Encoded")
            if not image_data:
                logger.warning(f"Prediction {idx} missing image data")
                continue
            
            variant_label = f"variant_{idx + 1}"
            
            # Upload base64 image to Supabase Storage for proper CDN-backed access
            cached = self.asset_storage.cache_base64_asset(
                account_id=account_id,
                job_id=job_id,
                base64_data=image_data,
                variant_label=variant_label,
                content_type="image/png",
            )
            
            # Use the public CDN URL instead of data URL
            asset_url = cached.get("asset_url")
            if not asset_url:
                logger.warning(f"Failed to upload variant {idx}, falling back to data URL")
                asset_url = f"data:image/png;base64,{image_data}"
            
            assets.append({
                "asset_url": asset_url,
                "preview_url": asset_url,  # Same URL for preview
                "variant_label": variant_label,
                "width": 1024,  # Vertex AI Imagen default
                "height": 1024,
                "file_size_bytes": cached.get("file_size_bytes", len(image_data) if image_data else 0),
                "prompt_variation": {},
                "metadata": prediction,
                "source_asset_url": None,
                "source_preview_url": None,
                "storage_path": cached.get("storage_path"),
            })
        
        logger.info(f"✅ Processed and uploaded {len(assets)} assets from Vertex AI predictions")
        
        # Phase 1: Quality validation (if enabled)
        if self.feature_flags.is_enabled("quality_validator_enabled"):
            assets = self._validate_asset_quality(
                assets=assets,
                job=job,
                job_id=job_id,
                template=template or {},
                user_inputs=user_inputs or {},
                rendered_sections=rendered_sections or {},
            )
        
        return assets

    def _validate_asset_quality(
        self,
        *,
        assets: List[Dict[str, Any]],
        job: Dict[str, Any],
        job_id: str,
        template: Dict[str, Any],
        user_inputs: Dict[str, str],
        rendered_sections: Dict[str, str],
    ) -> List[Dict[str, Any]]:
        """
        Validate quality of generated assets (Phase 1).
        
        Returns assets with quality scores and issues added.
        Handles feature flag configuration for different modes.
        """
        try:
            # Get validation config
            config = self.feature_flags.get_config("quality_validator_enabled")
            mode = config.get("mode", "log_only")
            min_threshold = config.get("min_score_threshold", 60.0)
            block_low_quality = config.get("block_low_quality", False)
            
            # Get prompt for validation
            prompt = rendered_sections.get("base", "")
            
            validated_assets = []
            
            for asset in assets:
                asset_id = asset.get("id", "pending")  # May not have ID yet if not stored
                
                # Run validation
                validation_result = self.quality_validator.validate_asset(
                    asset_url=asset["asset_url"],
                    job_id=job_id,
                    asset_id=asset_id,
                    prompt=prompt,
                    user_inputs=user_inputs,
                    template=template,
                )
                
                # Add validation results to asset
                asset["quality_score"] = validation_result["quality_score"]
                asset["quality_issues"] = validation_result["issues"]
                asset["is_acceptable"] = validation_result["is_acceptable"]
                asset["validation_metadata"] = validation_result["metadata"]
                
                # Handle based on mode
                if mode == "log_only":
                    # Just log, don't block
                    if not validation_result["is_acceptable"]:
                        logger.warning(
                            f"⚠️  Asset quality below threshold: "
                            f"score={validation_result['quality_score']:.1f}, "
                            f"issues={validation_result['issues']}"
                        )
                    else:
                        logger.info(
                            f"✅ Asset quality acceptable: "
                            f"score={validation_result['quality_score']:.1f}"
                        )
                    validated_assets.append(asset)
                
                elif mode == "warn":
                    # Add warning flag but don't block
                    if not validation_result["is_acceptable"]:
                        asset["quality_warning"] = True
                        logger.warning(
                            f"⚠️  Asset flagged with quality warning: "
                            f"score={validation_result['quality_score']:.1f}"
                        )
                    validated_assets.append(asset)
                
                elif mode == "block":
                    # Only include assets that pass validation
                    if validation_result["is_acceptable"]:
                        validated_assets.append(asset)
                        logger.info(
                            f"✅ Asset passed quality check: "
                            f"score={validation_result['quality_score']:.1f}"
                        )
                    else:
                        logger.error(
                            f"❌ Blocking low-quality asset: "
                            f"score={validation_result['quality_score']:.1f}, "
                            f"issues={validation_result['issues']}"
                        )
                        # Could trigger auto-regeneration here in future
                else:
                    # Unknown mode, default to log_only behavior
                    validated_assets.append(asset)
            
            logger.info(
                f"🔍 Quality validation complete: {len(validated_assets)}/{len(assets)} assets passed"
            )
            
            return validated_assets
            
        except Exception as e:
            logger.error(f"Quality validation failed: {e}", exc_info=True)
            # On error, return original assets (graceful degradation)
            logger.warning("⚠️  Returning unvalidated assets due to validation error")
            return assets

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


