"""
Creative prompt template service.

Handles creative template discovery, validation, and prompt assembly.
"""
from __future__ import annotations

import json
import logging
import random
import re
from typing import Any, Dict, List, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)

_PLACEHOLDER_PATTERN = re.compile(r"\{\{(\w+)\}\}")


class CreativeTemplateService:
    """Loads and renders creative prompt templates from Supabase."""

    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    # ------------------------------------------------------------------ #
    # Template discovery
    # ------------------------------------------------------------------ #

    def list_templates_by_theme(self, theme_id: str) -> List[Dict]:
        """Return templates associated with a specific theme."""
        result = (
            self.client.table("creative_prompt_templates")
            .select(
                "id, slug, name, display_name, variation_tags, input_schema, prompt_section, prompt_version, is_active"
            )
            .eq("theme_id", theme_id)
            .eq("is_active", True)
            .order("display_name")
            .execute()
        )
        templates = result.data or []
        for template in templates:
            if isinstance(template.get("variation_tags"), str):
                try:
                    template["variation_tags"] = json.loads(template["variation_tags"])
                except json.JSONDecodeError:
                    template["variation_tags"] = []
            if isinstance(template.get("input_schema"), str):
                try:
                    template["input_schema"] = json.loads(template["input_schema"])
                except json.JSONDecodeError:
                    template["input_schema"] = {}
        logger.info("🗂️ Loaded %s templates for theme %s", len(templates), theme_id)
        return templates

    def get_template(self, template_id: str) -> Dict:
        """Fetch a single template row including metadata."""
        result = (
            self.client.table("creative_prompt_templates")
            .select("*")
            .eq("id", template_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            raise ValueError(f"Creative template {template_id} not found")
        template = result.data[0]
        if isinstance(template.get("input_schema"), str):
            try:
                template["input_schema"] = json.loads(template["input_schema"])
            except json.JSONDecodeError:
                template["input_schema"] = {}
        if isinstance(template.get("variation_tags"), str):
            try:
                template["variation_tags"] = json.loads(template["variation_tags"])
            except json.JSONDecodeError:
                template["variation_tags"] = []
        return template

    def get_template_sections(self, template_id: str) -> List[Dict]:
        """Return prompt sections for the template (usually a single base section)."""
        result = (
            self.client.table("creative_prompt_templates")
            .select("prompt_section, prompt_body, metadata")
            .eq("id", template_id)
            .execute()
        )
        sections = result.data or []
        if not sections:
            raise ValueError(f"No prompt sections found for template {template_id}")
        return sections

    # ------------------------------------------------------------------ #
    # Validation & rendering
    # ------------------------------------------------------------------ #

    def validate_inputs(
        self, 
        template: Dict, 
        user_inputs: Dict[str, Any],
        theme: Optional[Dict] = None
    ) -> Dict[str, str]:
        """Validate user inputs and apply smart defaults for blank optional fields."""
        schema = template.get("input_schema") or {}
        if isinstance(schema, str):
            schema = json.loads(schema)

        required = schema.get("required", [])
        optional = schema.get("optional", [])
        field_types = schema.get("types", {})
        defaults = schema.get("defaults", {})

        cleaned: Dict[str, str] = {}

        # Process required fields
        for field in required:
            if field not in user_inputs or not user_inputs[field]:
                raise ValueError(f"Missing required field '{field}' for template {template['id']}")
            cleaned[field] = self._coerce_value(field, user_inputs[field], field_types.get(field))

        # Infer context from user inputs for smart default selection
        context_hints = self._infer_context_hints(user_inputs, template)

        # Process optional fields with smart defaults
        for field in optional:
            if field in user_inputs and user_inputs[field]:
                # User provided value
                cleaned[field] = self._coerce_value(field, user_inputs[field], field_types.get(field))
            elif field in defaults:
                # Apply smart default for blank optional field
                default_value = self._select_smart_default(
                    field=field,
                    defaults=defaults[field],
                    theme=theme,
                    context_hints=context_hints,
                    user_inputs=cleaned
                )
                cleaned[field] = default_value
                logger.info(f"✨ Applied smart default for '{field}': {default_value}")

        # Allow additional fields (custom sections)
        for field, value in user_inputs.items():
            if field in cleaned:
                continue
            if value:  # Only add if not empty
                cleaned[field] = self._coerce_value(field, value, field_types.get(field))

        return cleaned

    def assemble_prompt(
        self,
        *,
        sections: List[Dict],
        variables: Dict[str, str],
        style_suffix: Optional[str] = None,
        style_notes: Optional[List[str]] = None,
        compliance_directive: Optional[str] = None,
        brand_profile: Optional[Dict] = None,
    ) -> Dict[str, str]:
        """Render prompt sections with provided variables."""
        rendered: Dict[str, str] = {}

        for section in sections:
            body = section.get("prompt_body") or ""
            normalized = _PLACEHOLDER_PATTERN.sub(r"{\1}", body)
            rendered_body = _safe_format(normalized, variables)

            extras = []
            
            # Add brand profile context (Phase 1)
            if brand_profile:
                brand_context = self._build_brand_context(brand_profile)
                if brand_context:
                    extras.append(brand_context)
            
            if style_notes:
                extras.append("Visual cues: " + ", ".join(style_notes) + ".")
            if style_suffix:
                extras.append(style_suffix)
            if compliance_directive:
                extras.append(compliance_directive)
            if extras:
                rendered_body = rendered_body.rstrip() + "\n\n" + " ".join(extras)

            rendered[section.get("prompt_section", "base")] = rendered_body

        return rendered
    
    def _build_brand_context(self, brand_profile: Dict) -> str:
        """Build brand context string from Phase 1 & 2 profile fields."""
        context_parts = []
        
        # Brand voice and tone
        voice = brand_profile.get("brand_voice")
        voice_desc = brand_profile.get("voice_description")
        if voice or voice_desc:
            voice_text = f"{voice} tone" if voice else ""
            if voice_desc:
                voice_text = f"{voice_text}, {voice_desc}" if voice_text else voice_desc
            if voice_text:
                context_parts.append(f"Brand voice: {voice_text}")
        
        # Visual styles
        visual_styles = brand_profile.get("visual_styles")
        if visual_styles and len(visual_styles) > 0:
            styles_text = ", ".join(visual_styles)
            context_parts.append(f"Visual style: {styles_text}")
        
        # Cuisine and specialties
        cuisine = brand_profile.get("cuisine_type")
        specialties = brand_profile.get("cuisine_specialties")
        if cuisine:
            cuisine_text = f"{cuisine} cuisine"
            if specialties and len(specialties) > 0:
                cuisine_text += f" featuring {', '.join(specialties)}"
            context_parts.append(cuisine_text.capitalize())
        
        # Atmosphere
        atmosphere = brand_profile.get("atmosphere_tags")
        if atmosphere and len(atmosphere) > 0:
            atmos_text = ", ".join(atmosphere)
            context_parts.append(f"Atmosphere: {atmos_text}")
        
        # Target demographic
        demographic = brand_profile.get("target_demographic")
        if demographic:
            demo_text = demographic.replace("_", " ")
            context_parts.append(f"Target audience: {demo_text}")
        
        # Phase 2: Prohibited elements
        prohibited = brand_profile.get("prohibited_elements")
        if prohibited and len(prohibited) > 0:
            prohibited_text = ", ".join(prohibited)
            context_parts.append(f"Avoid showing: {prohibited_text}")
        
        # Phase 2: Allergen warnings
        allergens = brand_profile.get("allergen_warnings")
        if allergens and len(allergens) > 0:
            allergen_text = ", ".join(allergens)
            context_parts.append(f"Allergen awareness: {allergen_text}")
        
        # Phase 2: Social media optimization
        platforms = brand_profile.get("primary_social_platforms")
        aspect_ratios = brand_profile.get("preferred_aspect_ratios")
        if platforms and len(platforms) > 0:
            platform_text = ", ".join(platforms)
            context_parts.append(f"Optimized for: {platform_text}")
        if aspect_ratios and len(aspect_ratios) > 0:
            ratio_text = ", ".join(aspect_ratios)
            context_parts.append(f"Format: {ratio_text}")
        
        # Phase 3: Location context
        city = brand_profile.get("city")
        state = brand_profile.get("state")
        location_type = brand_profile.get("location_type")
        regional_style = brand_profile.get("regional_style")
        local_landmarks = brand_profile.get("local_landmarks")
        
        location_parts = []
        if city and state:
            location_parts.append(f"{city}, {state}")
        elif city:
            location_parts.append(city)
        if location_type:
            location_parts.append(f"{location_type} setting")
        if regional_style:
            location_parts.append(f"{regional_style} style")
        if local_landmarks:
            location_parts.append(local_landmarks)
        
        if location_parts:
            context_parts.append(f"Location: {', '.join(location_parts)}")
        
        # Phase 3: Price positioning
        price_range = brand_profile.get("price_range")
        value_prop = brand_profile.get("value_proposition")
        positioning = brand_profile.get("positioning_statement")
        
        if price_range:
            context_parts.append(f"Price point: {price_range}")
        if value_prop:
            value_text = value_prop.replace("_", " ")
            context_parts.append(f"Value: {value_text}")
        if positioning:
            context_parts.append(positioning)
        
        # Phase 3: Seasonal context
        seasons = brand_profile.get("active_seasons")
        holidays = brand_profile.get("holiday_participation")
        if seasons and len(seasons) > 0:
            season_text = ", ".join(seasons)
            context_parts.append(f"Active seasons: {season_text}")
        if holidays and len(holidays) > 0:
            holiday_text = ", ".join(holidays[:3])  # Limit to 3 for brevity
            context_parts.append(f"Celebrates: {holiday_text}")
        
        return ". ".join(context_parts) + "." if context_parts else ""

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    def _coerce_value(self, field: str, value: Any, field_type: Optional[str]) -> str:
        if value is None:
            return ""

        if field_type == "currency":
            try:
                numeric = float(str(value).replace("$", "").strip())
            except ValueError:
                return str(value)
            return f"{numeric:.2f}"

        if field_type == "integer":
            try:
                return str(int(value))
            except (ValueError, TypeError):
                return str(value)

        return str(value)

    def _infer_context_hints(self, user_inputs: Dict[str, Any], template: Dict) -> Dict[str, str]:
        """Infer context from user inputs to guide smart default selection."""
        hints = {}
        
        # Analyze headline for vibe
        headline = str(user_inputs.get("headline", "")).lower()
        if any(word in headline for word in ["date", "romantic", "valentine", "anniversary", "love"]):
            hints["vibe"] = "romantic"
        elif any(word in headline for word in ["party", "game", "weekend", "friday", "saturday", "celebration"]):
            hints["vibe"] = "high_energy"
        elif any(word in headline for word in ["lunch", "brunch", "casual", "everyday", "daily"]):
            hints["vibe"] = "casual"
        else:
            hints["vibe"] = "default"
        
        # Analyze template tags for setting
        tags = template.get("variation_tags", [])
        if isinstance(tags, list):
            if any(tag in ["nightlife", "bar", "neon"] for tag in tags):
                hints["setting"] = "nightlife"
            elif any(tag in ["fine_dining", "elegant", "upscale"] for tag in tags):
                hints["setting"] = "upscale"
            elif any(tag in ["casual", "diner", "everyday"] for tag in tags):
                hints["setting"] = "casual"
        
        return hints

    def _select_smart_default(
        self,
        field: str,
        defaults: Any,
        theme: Optional[Dict],
        context_hints: Dict[str, str],
        user_inputs: Dict[str, str]
    ) -> str:
        """Intelligently select a default value based on context."""
        
        # If defaults is a list, pick contextually or randomly
        if isinstance(defaults, list):
            if not defaults:
                return ""
            
            # Try to use theme contextual defaults
            if theme:
                variation_rules = theme.get("variation_rules", {})
                if isinstance(variation_rules, dict):
                    contextual = variation_rules.get("contextual_defaults", {}).get(field, {})
                    
                    # Try to match context hints
                    vibe = context_hints.get("vibe", "default")
                    if vibe in contextual:
                        pool = contextual[vibe]
                        if isinstance(pool, list) and pool:
                            return random.choice(pool)
                    
                    # Use default pool from theme
                    if "default" in contextual:
                        pool = contextual["default"]
                        if isinstance(pool, list) and pool:
                            return random.choice(pool)
            
            # Fallback to schema defaults
            return random.choice(defaults)
        
        # If defaults is a string, use it directly
        return str(defaults)


def _safe_format(template: str, variables: Dict[str, str]) -> str:
    """Safely format template strings without raising on missing keys."""

    class SafeDict(dict):
        def __missing__(self, key: str) -> str:
            return "{" + key + "}"

    return template.format_map(SafeDict(**variables))


