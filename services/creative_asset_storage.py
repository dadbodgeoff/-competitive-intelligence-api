"""
Creative Asset Storage Service.

Downloads Nano Banana asset URLs and caches them in Supabase storage so
the CDN response is persisted locally for future access.
"""
from __future__ import annotations

import logging
import mimetypes
import os
import uuid
from typing import Dict, Optional
from urllib.parse import urlparse

import httpx
from supabase import Client, create_client

logger = logging.getLogger(__name__)


class CreativeAssetStorage:
    """Handles caching generated assets to Supabase storage."""

    def __init__(self) -> None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials missing for creative asset storage")

        self.client: Client = create_client(supabase_url, supabase_key)
        self.bucket = os.getenv("CREATIVE_ASSETS_BUCKET", "creative-assets")
        self.session = httpx.Client(timeout=60.0)

    def cache_asset(
        self,
        *,
        account_id: str,
        job_id: str,
        source_url: Optional[str],
        variant_label: Optional[str] = None,
    ) -> Dict[str, Optional[str]]:
        """
        Download the asset and upload it to Supabase storage.

        Returns dict with keys: asset_url, storage_path, content_type.
        """
        if not source_url:
            return {"asset_url": None, "storage_path": None, "content_type": None}

        try:
            logger.info("📥 Downloading creative asset from %s", source_url)
            response = self.session.get(source_url)
            response.raise_for_status()
            content = response.content
            content_type = response.headers.get("content-type")
            if not content_type:
                guessed_type, _ = mimetypes.guess_type(source_url)
                content_type = guessed_type or "application/octet-stream"

            extension = mimetypes.guess_extension(content_type) or ".bin"
            url_path = urlparse(source_url).path
            original_name = os.path.basename(url_path) or "asset"
            safe_variant = (variant_label or "asset").lower().replace(" ", "_")
            file_name = f"{safe_variant}_{uuid.uuid4().hex[:8]}{extension}"
            storage_path = f"{account_id}/{job_id}/{file_name}"

            self.client.storage.from_(self.bucket).upload(
                storage_path,
                content,
                {
                    "content-type": content_type,
                    "upsert": "true",
                },
            )
            public_url = self.client.storage.from_(self.bucket).get_public_url(storage_path)
            logger.info("📦 Cached creative asset to %s", public_url)
            return {
                "asset_url": public_url,
                "storage_path": storage_path,
                "content_type": content_type,
            }
        except Exception as exc:  # noqa: BLE001
            logger.warning("⚠️ Failed to cache creative asset: %s", exc, exc_info=True)
            return {"asset_url": source_url, "storage_path": None, "content_type": None}

    def cache_preview(
        self,
        *,
        account_id: str,
        job_id: str,
        source_url: Optional[str],
        variant_label: Optional[str] = None,
    ) -> Dict[str, Optional[str]]:
        """Cache preview image if provided."""
        if not source_url:
            return {"preview_url": None, "storage_path": None, "content_type": None}

        result = self.cache_asset(
            account_id=account_id,
            job_id=job_id,
            source_url=source_url,
            variant_label=(variant_label or "preview"),
        )
        return {
            "preview_url": result["asset_url"],
            "storage_path": result["storage_path"],
            "content_type": result["content_type"],
        }


