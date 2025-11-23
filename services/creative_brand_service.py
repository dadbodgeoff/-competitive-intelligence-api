"""
Creative brand profile service.

Handles retrieval and lightweight management of brand styling data that feeds
into image generation prompts.
"""
from __future__ import annotations

import logging
import json
from typing import Dict, List, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class CreativeBrandService:
    """Fetches brand styling details for creative generation."""

    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    def list_profiles(self, account_id: str) -> List[Dict]:
        """Return brand profiles for an account ordered by recency."""
        result = (
            self.client.table("creative_brand_profiles")
            .select("*")
            .eq("account_id", account_id)
            .order("updated_at", desc=True)
            .execute()
        )
        profiles = result.data or []
        for profile in profiles:
            self._coerce_json(profile)
        return profiles

    def get_brand_profile(
        self,
        *,
        account_id: str,
        user_id: str,
        brand_profile_id: Optional[str] = None,
    ) -> Dict:
        """
        Return the brand profile dict used when assembling prompts.

        Resolution order:
            1. Explicit brand_profile_id
            2. Account-level default (`is_default = true`)
            3. Ephemeral fallback derived from account metadata
        """
        if brand_profile_id:
            profile = self._fetch_profile_by_id(account_id, brand_profile_id)
            if profile:
                return profile
            raise ValueError("Brand profile not found or access denied")

        default_profile = self._fetch_default_profile(account_id)
        if default_profile:
            return default_profile

        fallback = self._build_fallback_profile(account_id, user_id)
        logger.info("⚠️ Using generated fallback brand profile for account %s", account_id)
        return fallback

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #

    def _coerce_json(self, profile: Dict) -> None:
        for key in ("palette", "typography", "voice_profile", "asset_descriptors", "metadata"):
            value = profile.get(key)
            if isinstance(value, str):
                try:
                    profile[key] = json.loads(value)
                except json.JSONDecodeError:
                    profile[key] = {}

    def _fetch_profile_by_id(self, account_id: str, profile_id: str) -> Optional[Dict]:
        result = (
            self.client.table("creative_brand_profiles")
            .select("*")
            .eq("account_id", account_id)
            .eq("id", profile_id)
            .limit(1)
            .execute()
        )
        data = result.data or []
        return data[0] if data else None

    def _fetch_default_profile(self, account_id: str) -> Optional[Dict]:
        result = (
            self.client.table("creative_brand_profiles")
            .select("*")
            .eq("account_id", account_id)
            .eq("is_default", True)
            .order("updated_at", desc=True)
            .limit(1)
            .execute()
        )
        data = result.data or []
        return data[0] if data else None

    def _build_fallback_profile(self, account_id: str, user_id: str) -> Dict:
        """Construct lightweight brand info from account and user tables."""
        account_name = self._lookup_account_name(account_id)
        user_name = self._lookup_user_name(user_id)
        brand_name = account_name or user_name or "Restaurant Brand"

        return {
            "id": None,
            "account_id": account_id,
            "brand_name": brand_name,
            "palette": {"primary": "#F0544F", "secondary": "#3B3A30"},
            "typography": {"headline": "Montserrat Bold", "body": "Open Sans"},
            "voice_profile": {
                "tone": "Friendly and energetic",
                "keywords": ["local favorite", "fresh ingredients"],
            },
            "asset_descriptors": {
                "logo": f"{brand_name} logo mark",
                "photography_style": "Warm lighting, focus on hero dish",
            },
            "metadata": {"generated": True},
            "is_default": True,
        }

    def _lookup_account_name(self, account_id: str) -> Optional[str]:
        result = (
            self.client.table("accounts")
            .select("name")
            .eq("id", account_id)
            .limit(1)
            .execute()
        )
        data = result.data or []
        if not data:
            return None
        row = data[0]
        return row.get("name")

    def _lookup_user_name(self, user_id: str) -> Optional[str]:
        result = (
            self.client.table("users")
            .select("first_name, last_name")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )
        data = result.data or []
        if not data:
            return None
        row = data[0]
        first = (row.get("first_name") or "").strip()
        last = (row.get("last_name") or "").strip()
        full_name = f"{first} {last}".strip()
        return full_name or None


