"""
Creative variation engine.

Generates per-job style modifiers to keep Nano Banana assets fresh.
"""
from __future__ import annotations

import random
import secrets
from typing import Any, Dict, List, Optional

_DEFAULT_STYLE_ADJECTIVES = [
    "vibrant lighting",
    "candid motion blur",
    "film grain",
    "handcrafted detail",
    "rich depth of field",
]

_DEFAULT_TEXTURES = ["subtle grain", "light leak", "chalk dust"]


class CreativeVariationEngine:
    """Generates variation metadata for creative image jobs."""

    def __init__(self) -> None:
        self._random = random.Random()

    def generate_variation(
        self,
        *,
        theme: Dict,
        template: Dict,
        brand_profile: Dict,
        style_preferences: Optional[Dict[str, Any]],
        recent_variations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        rules = theme.get("variation_rules") or {}

        style_adjectives = self._pick_style_adjectives(
            rules.get("style_adjectives"), recent_variations, style_preferences
        )
        texture = self._pick_texture(rules.get("texture_options"), style_preferences)
        palette = self._resolve_palette(
            rules.get("palette_swaps"),
            brand_profile.get("palette"),
            style_preferences,
        )
        camera_style = self._pick_camera_style(rules.get("camera_styles"))

        style_seed = self._generate_unique_seed(recent_variations)
        noise_level = round(self._random.uniform(0.25, 0.65), 2)

        style_notes = style_adjectives + ([camera_style] if camera_style else [])
        if texture:
            style_notes.append(texture)

        style_suffix = self._build_style_suffix(style_adjectives, texture, camera_style)

        return {
            "style_seed": style_seed,
            "noise_level": noise_level,
            "style_notes": style_notes,
            "texture": texture,
            "palette": palette,
            "style_suffix": style_suffix,
        }

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    def _pick_style_adjectives(
        self,
        options: Optional[List[str]],
        recent_variations: List[Dict[str, Any]],
        style_preferences: Optional[Dict[str, Any]],
    ) -> List[str]:
        candidates = list(options or _DEFAULT_STYLE_ADJECTIVES)
        self._random.shuffle(candidates)

        preferred = []
        if style_preferences:
            preferred = [
                pref
                for pref in style_preferences.get("emphasize", [])
                if isinstance(pref, str)
            ]

        recent_notes = {
            note
            for variation in recent_variations
            for note in variation.get("style_notes", [])
        }

        chosen: List[str] = []
        for adjective in preferred + candidates:
            if adjective in chosen:
                continue
            if adjective in recent_notes and len(chosen) < 2:
                # Skip recently used descriptors unless we need variety
                continue
            chosen.append(adjective)
            if len(chosen) >= 3:
                break

        if not chosen:
            chosen.append(self._random.choice(_DEFAULT_STYLE_ADJECTIVES))

        return chosen

    def _pick_texture(
        self,
        textures: Optional[List[str]],
        style_preferences: Optional[Dict[str, Any]],
    ) -> Optional[str]:
        candidates = list(textures or _DEFAULT_TEXTURES)
        if style_preferences:
            exclude = style_preferences.get("avoid_textures", [])
            candidates = [tex for tex in candidates if tex not in exclude]
        return self._random.choice(candidates) if candidates else None

    def _pick_camera_style(self, camera_styles: Optional[List[str]]) -> Optional[str]:
        if not camera_styles:
            return None
        return self._random.choice(camera_styles)

    def _resolve_palette(
        self,
        palette_swaps: Optional[List[List[str]]],
        brand_palette: Optional[Dict[str, Any]],
        style_preferences: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        palette = dict(brand_palette or {})
        if style_preferences and "palette_override" in style_preferences:
            palette.update(style_preferences["palette_override"])
            return palette

        if palette_swaps:
            chosen = self._random.choice(palette_swaps)
            if len(chosen) >= 2:
                palette.setdefault("primary", chosen[0])
                palette.setdefault("secondary", chosen[1])
            if len(chosen) >= 3:
                palette.setdefault("accent", chosen[2])

        return palette

    def _generate_unique_seed(
        self, recent_variations: List[Dict[str, Any]]
    ) -> str:
        recent_seeds = {entry.get("style_seed") for entry in recent_variations}
        for _ in range(5):
            seed = secrets.token_hex(4)
            if seed not in recent_seeds:
                return seed
        return secrets.token_hex(6)

    def _build_style_suffix(
        self,
        adjectives: List[str],
        texture: Optional[str],
        camera_style: Optional[str],
    ) -> str:
        segments = []
        if adjectives:
            segments.append(", ".join(adjectives))
        if texture:
            segments.append(texture)
        if camera_style:
            segments.append(camera_style)
        if not segments:
            return ""
        return "Emphasize atmosphere with " + ", ".join(segments) + "."

