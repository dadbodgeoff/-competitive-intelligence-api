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

    def create_profile(self, account_id: str, user_id: str, profile_data: Dict) -> Dict:
        """Create a new brand profile."""
        # If this profile is being set as default, unset other defaults
        if profile_data.get("is_default"):
            self._unset_other_defaults(account_id)
        
        # Add account_id and user_id to the data
        profile_data["account_id"] = account_id
        profile_data["user_id"] = user_id
        
        result = (
            self.client.table("creative_brand_profiles")
            .insert(profile_data)
            .execute()
        )
        
        if not result.data:
            raise ValueError("Failed to create brand profile")
        
        profile = result.data[0]
        self._coerce_json(profile)
        return profile

    def update_profile(self, account_id: str, profile_id: str, profile_data: Dict) -> Dict:
        """Update an existing brand profile."""
        # If this profile is being set as default, unset other defaults
        if profile_data.get("is_default"):
            self._unset_other_defaults(account_id, exclude_id=profile_id)
        
        result = (
            self.client.table("creative_brand_profiles")
            .update(profile_data)
            .eq("account_id", account_id)
            .eq("id", profile_id)
            .execute()
        )
        
        if not result.data:
            raise ValueError("Failed to update brand profile or profile not found")
        
        profile = result.data[0]
        self._coerce_json(profile)
        return profile

    def _unset_other_defaults(self, account_id: str, exclude_id: Optional[str] = None) -> None:
        """Unset is_default for all other profiles in the account."""
        query = (
            self.client.table("creative_brand_profiles")
            .update({"is_default": False})
            .eq("account_id", account_id)
            .eq("is_default", True)
        )
        
        if exclude_id:
            query = query.neq("id", exclude_id)
        
        query.execute()

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

    def delete_profile(self, account_id: str, profile_id: str) -> None:
        """Delete a brand profile."""
        # Check if profile exists and belongs to account
        profile = self._fetch_profile_by_id(account_id, profile_id)
        if not profile:
            raise ValueError("Brand profile not found or access denied")
        
        # If deleting the default profile, set another profile as default
        if profile.get("is_default"):
            other_profiles = [
                p for p in self.list_profiles(account_id) 
                if p["id"] != profile_id
            ]
            if len(other_profiles) > 0:
                # Set the most recently updated profile as the new default
                self.client.table("creative_brand_profiles").update(
                    {"is_default": True}
                ).eq("id", other_profiles[0]["id"]).execute()
                logger.info(f"✅ Set profile {other_profiles[0]['id']} as new default after deleting {profile_id}")
        
        # Delete the profile
        result = (
            self.client.table("creative_brand_profiles")
            .delete()
            .eq("account_id", account_id)
            .eq("id", profile_id)
            .execute()
        )
        
        if not result.data:
            raise ValueError("Failed to delete brand profile")
        
        logger.info(f"✅ Deleted brand profile {profile_id} for account {account_id}")

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


