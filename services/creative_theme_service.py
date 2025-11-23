"""
Creative theme service.

Provides read-only access to creative prompt themes for configuration endpoints.
"""
from __future__ import annotations

import logging
import json
from typing import Dict, List, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class CreativeThemeService:
    """Loads creative prompt themes and associated metadata."""

    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    def list_themes(self, restaurant_vertical: Optional[str] = None) -> List[Dict]:
        """Return all active themes (optionally filtered by vertical)."""
        query = self.client.table("creative_prompt_themes").select("*")
        if restaurant_vertical:
            query = query.eq("restaurant_vertical", restaurant_vertical)
        query = query.order("name")
        result = query.execute()
        themes = result.data or []
        for theme in themes:
            self._coerce_json(theme)
        logger.info("🎨 Loaded %s creative themes", len(themes))
        return themes

    def get_theme(self, theme_id: str) -> Dict:
        """Fetch a single theme by UUID."""
        result = (
            self.client.table("creative_prompt_themes")
            .select("*")
            .eq("id", theme_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            raise ValueError(f"Creative theme {theme_id} not found")
        theme = result.data[0]
        self._coerce_json(theme)
        return theme

    def _coerce_json(self, theme: Dict) -> None:
        for key in ("default_palette", "default_fonts", "variation_rules"):
            value = theme.get(key)
            if isinstance(value, str):
                try:
                    theme[key] = json.loads(value)
                except json.JSONDecodeError:
                    theme[key] = {}
        for key in ("default_hashtags", "mood_board_urls"):
            value = theme.get(key)
            if isinstance(value, str):
                try:
                    theme[key] = json.loads(value)
                except json.JSONDecodeError:
                    theme[key] = []

