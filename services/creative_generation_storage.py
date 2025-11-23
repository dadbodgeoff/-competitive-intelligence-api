"""
Creative generation storage service.

Handles persistence for Nano Banana creative jobs, events, and assets.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class CreativeGenerationStorage:
    """Supabase-backed persistence for creative generation workflows."""

    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    # ------------------------------------------------------------------ #
    # Job lifecycle
    # ------------------------------------------------------------------ #

    def create_job(
        self,
        *,
        account_id: str,
        user_id: str,
        template_id: str,
        theme_id: str,
        template_slug: str,
        template_version: str,
        desired_outputs: Dict[str, Any],
        prompt_sections: Dict[str, str],
        brand_profile_id: Optional[str],
        prompt_token_estimate: Optional[int],
        cost_estimate: Optional[float],
    ) -> Dict[str, Any]:
        """Insert a new creative job and return the persisted record."""
        now = datetime.now(timezone.utc).isoformat()
        payload = {
            "account_id": account_id,
            "user_id": user_id,
            "template_id": template_id,
            "theme_id": theme_id,
            "template_slug": template_slug,
            "template_version": template_version,
            "brand_profile_id": brand_profile_id,
            "status": "assembling_prompt",
            "desired_outputs": desired_outputs,
            "prompt_sections": prompt_sections,
            "prompt_token_estimate": prompt_token_estimate,
            "cost_estimate": cost_estimate,
            "progress": 5,
            "created_at": now,
            "updated_at": now,
        }
        result = self.client.table("creative_generation_jobs").insert(payload).execute()
        job = result.data[0]
        logger.info("🆕 Created creative job %s for user %s", job["id"], user_id)
        return job

    def update_job_status(
        self,
        job_id: str,
        *,
        status: str,
        progress: Optional[int] = None,
        error_message: Optional[str] = None,
        nano_job_id: Optional[str] = None,
        cost_estimate: Optional[float] = None,
    ) -> None:
        """Update status/progress fields for a job."""
        updates: Dict[str, Any] = {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if progress is not None:
            updates["progress"] = progress
        if error_message is not None:
            updates["error_message"] = error_message
        if nano_job_id is not None:
            updates["nano_job_id"] = nano_job_id
        if cost_estimate is not None:
            updates["cost_estimate"] = cost_estimate
        if status == "completed":
            updates["completed_at"] = datetime.now(timezone.utc).isoformat()

        self.client.table("creative_generation_jobs").update(updates).eq("id", job_id).execute()
        logger.info("📈 Updated job %s -> %s (progress=%s)", job_id, status, progress)

    def record_event(
        self,
        job_id: str,
        *,
        event_type: str,
        payload: Optional[Dict[str, Any]] = None,
        progress: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Append an event to the audit trail."""
        event_payload = {
            "job_id": job_id,
            "event_type": event_type,
            "payload": payload or {},
            "progress": progress,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = self.client.table("creative_job_events").insert(event_payload).execute()
        event = result.data[0]
        logger.debug("📝 Recorded job event %s (%s)", event["id"], event_type)
        return event

    def store_assets(self, job_id: str, assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Persist rendered asset metadata."""
        if not assets:
            return []
        records = []
        now = datetime.now(timezone.utc).isoformat()
        for asset in assets:
            records.append(
                {
                    "job_id": job_id,
                    "variant_label": asset.get("variant_label"),
                    "asset_url": asset["asset_url"],
                    "preview_url": asset.get("preview_url"),
                    "width": asset.get("width"),
                    "height": asset.get("height"),
                    "file_size_bytes": asset.get("file_size_bytes"),
                    "prompt_variation": asset.get("prompt_variation", {}),
                    "metadata": asset.get("metadata", {}),
                    "source_asset_url": asset.get("source_asset_url"),
                    "source_preview_url": asset.get("source_preview_url"),
                    "storage_path": asset.get("storage_path"),
                    "created_at": now,
                }
            )
        result = self.client.table("creative_generation_assets").insert(records).execute()
        logger.info("💾 Stored %s creative assets for job %s", len(records), job_id)
        return result.data

    # ------------------------------------------------------------------ #
    # Retrieval
    # ------------------------------------------------------------------ #

    def get_job(self, job_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Return job, assets, and events for the requesting user."""
        job_result = (
            self.client.table("creative_generation_jobs")
            .select("*")
            .eq("id", job_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if not job_result.data:
            return None
        job = job_result.data[0]

        assets = (
            self.client.table("creative_generation_assets")
            .select("*")
            .eq("job_id", job_id)
            .order("created_at", desc=True)
            .execute()
            .data
            or []
        )
        events = (
            self.client.table("creative_job_events")
            .select("*")
            .eq("job_id", job_id)
            .order("created_at", desc=False)
            .execute()
            .data
            or []
        )
        job["assets"] = assets
        job["events"] = events

        variation_result = (
            self.client.table("creative_variation_history")
            .select("variation_metadata")
            .eq("job_id", job_id)
            .limit(1)
            .execute()
        )
        if variation_result.data:
            job["variation_summary"] = variation_result.data[0]["variation_metadata"]

        return job

    def get_job_by_nano_id(self, nano_job_id: str) -> Optional[Dict[str, Any]]:
        """Resolve job by external Nano Banana job identifier."""
        result = (
            self.client.table("creative_generation_jobs")
            .select("*")
            .eq("nano_job_id", nano_job_id)
            .limit(1)
            .execute()
        )
        data = result.data or []
        return data[0] if data else None

    def get_recent_variations(
        self,
        *,
        account_id: str,
        theme_id: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Return the most recent variation summaries for the account/theme."""
        result = (
            self.client.table("creative_variation_history")
            .select("style_seed, style_notes, noise_level, texture, palette")
            .eq("account_id", account_id)
            .eq("theme_id", theme_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []

    def record_variation(
        self,
        *,
        job_id: str,
        account_id: str,
        theme_id: str,
        template_id: str,
        variation_summary: Dict[str, Any],
    ) -> None:
        """Persist variation metadata for future uniqueness checks."""
        payload = {
            "job_id": job_id,
            "account_id": account_id,
            "theme_id": theme_id,
            "template_id": template_id,
            "style_seed": variation_summary.get("style_seed"),
            "noise_level": variation_summary.get("noise_level"),
            "style_notes": variation_summary.get("style_notes", []),
            "texture": variation_summary.get("texture"),
            "palette": variation_summary.get("palette", {}),
            "variation_metadata": variation_summary,
        }
        self.client.table("creative_variation_history").insert(payload).execute()

    def list_jobs(
        self,
        *,
        account_id: str,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """Paginated job listing scoped to the user's account."""
        query = (
            self.client.table("creative_generation_jobs")
            .select("id, status, progress, template_slug, template_version, template_id, theme_id, created_at, completed_at, error_message, nano_job_id")
            .eq("account_id", account_id)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )
        data = query.execute().data or []

        count_query = (
            self.client.table("creative_generation_jobs")
            .select("id", count="exact", head=True)
            .eq("account_id", account_id)
            .eq("user_id", user_id)
        )
        count_result = count_query.execute()
        total_count = count_result.count or 0

        return {"data": data, "count": total_count}


