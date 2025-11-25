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
                "id, slug, name, display_name, description, use_case, best_for, variation_tags, input_schema, prompt_section, prompt_version, is_active, thumbnail_url, preview_image_url, example_output_url, usage_count, last_used_at"
            )
            .eq("theme_id", theme_id)
            .eq("is_active", True)
            .order("usage_count.desc.nullslast, display_name")
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

        # Process required fields with enhancement
        for field in required:
            if field not in user_inputs or not user_inputs[field]:
                raise ValueError(f"Missing required field '{field}' for template {template['id']}")
            raw_value = user_inputs[field]
            coerced_value = self._coerce_value(field, raw_value, field_types.get(field))
            # Enhance minimal input
            enhanced_value = self._enhance_user_input(field, coerced_value, template, theme)
            cleaned[field] = enhanced_value
            if enhanced_value != coerced_value:
                logger.info(f"✨ Enhanced '{field}': '{coerced_value}' → '{enhanced_value}'")

        # Infer context from user inputs for smart default selection
        context_hints = self._infer_context_hints(user_inputs, template)

        # Process optional fields with smart defaults
        for field in optional:
            if field in user_inputs and user_inputs[field]:
                # User provided value - enhance it
                raw_value = user_inputs[field]
                coerced_value = self._coerce_value(field, raw_value, field_types.get(field))
                enhanced_value = self._enhance_user_input(field, coerced_value, template, theme)
                cleaned[field] = enhanced_value
                if enhanced_value != coerced_value:
                    logger.info(f"✨ Enhanced '{field}': '{coerced_value}' → '{enhanced_value}'")
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
                coerced_value = self._coerce_value(field, value, field_types.get(field))
                enhanced_value = self._enhance_user_input(field, coerced_value, template, theme)
                cleaned[field] = enhanced_value

        return cleaned

    def assemble_prompt(
        self,
        *,
        sections: List[Dict],
        variables: Dict[str, str],
        template: Optional[Dict] = None,
        theme: Optional[Dict] = None,
        style_suffix: Optional[str] = None,
        style_notes: Optional[List[str]] = None,
        compliance_directive: Optional[str] = None,
        brand_profile: Optional[Dict] = None,
    ) -> Dict[str, str]:
        """Render prompt sections with provided variables and quality enforcement."""
        rendered: Dict[str, str] = {}

        for section in sections:
            body = section.get("prompt_body") or ""
            normalized = _PLACEHOLDER_PATTERN.sub(r"{\1}", body)
            rendered_body = _safe_format(normalized, variables)

            extras = []
            
            # Add quality baseline to ensure professional output
            if template and theme:
                quality_baseline = self._build_quality_baseline(template, theme, variables)
                if quality_baseline:
                    extras.append(quality_baseline)
            
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
    
    def _build_quality_baseline(
        self,
        template: Dict,
        theme: Dict,
        user_inputs: Dict[str, str]
    ) -> str:
        """
        Build quality baseline that ensures professional output even with minimal user input.
        Adds photography/lighting/composition details that maintain high standards.
        """
        baseline_parts = []
        
        # Check if user provided detailed style notes
        has_detailed_style = any(
            len(str(user_inputs.get(field, ""))) > 30 
            for field in ["scene_description", "lighting_mood", "style_notes"]
        )
        
        # If user already provided details, don't override
        if has_detailed_style:
            return ""
        
        # 1. Lighting Quality (if not specified by user)
        if not any(key in user_inputs for key in ["lighting", "lighting_mood", "scene_time"]):
            lighting_options = [
                "natural window light with soft shadows",
                "golden hour warmth",
                "professional studio lighting with controlled highlights",
                "dramatic side lighting with depth",
                "soft diffused overhead lighting"
            ]
            baseline_parts.append(random.choice(lighting_options))
        
        # 2. Composition Quality (always add for professional framing)
        composition_options = [
            "professional composition with hero shot framing",
            "magazine-quality layout with balanced elements",
            "commercial photography standards with sharp focus",
            "editorial-style composition with visual hierarchy"
        ]
        baseline_parts.append(random.choice(composition_options))
        
        # 3. Detail Level (always enforce high quality)
        detail_options = [
            "rich texture detail and crisp clarity",
            "high-resolution detail with sharp focus on key elements",
            "photorealistic texture with professional finish",
            "crisp product clarity with fine detail"
        ]
        baseline_parts.append(random.choice(detail_options))
        
        if baseline_parts:
            return "Quality standards: " + ", ".join(baseline_parts) + "."
        
        return ""
    
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

    def _enhance_user_input(
        self,
        field: str,
        value: str,
        template: Dict,
        theme: Optional[Dict]
    ) -> str:
        """
        Enhance ONLY scene/atmosphere elements, NEVER user business content.
        
        CRITICAL: User-provided menu items, specials, pricing, and business text
        must NEVER be modified. The creative director can enhance the scene,
        lighting, and atmosphere, but must preserve exact user wording for:
        - Menu item names and descriptions
        - Special offers and promotions
        - Pricing information
        - Headlines and marketing copy
        - Dates and times
        - Call-to-action text
        """
        if not value or len(value.strip()) == 0:
            return value
        
        value = value.strip()
        
        # NEVER enhance user business content - these are sacred
        business_content_fields = [
            # Marketing copy (user's exact words)
            "headline", "subheadline", "tagline", "cta_line", "cta_text",
            # Menu items (user's exact descriptions)
            "dish_name", "item_name", "item1_name", "item2_name", "item3_name",
            "item1_description", "item2_description", "item3_description",
            # Specials and promotions (user's exact offers)
            "special_name", "special_description", "promo_text", "offer_text",
            # Pricing (exact amounts)
            "price", "item1_price", "item2_price", "item3_price", "special_price",
            # Dates and times (exact values)
            "date", "time", "event_date", "valid_until",
            # Brand identity (exact names)
            "brand_name", "restaurant_name", "location_name",
        ]
        
        # Check if this field contains user business content
        if field in business_content_fields:
            return value
        
        # Also check for any field containing these keywords (catch-all)
        business_keywords = ["name", "price", "headline", "cta", "date", "time", "special", "promo", "offer"]
        if any(keyword in field.lower() for keyword in business_keywords):
            return value
        
        # Don't enhance if already detailed (>50 chars or has multiple descriptive words)
        if len(value) > 50 or len(value.split()) > 8:
            return value
        
        # ONLY enhance scene/atmosphere elements (very limited scope)
        # These are technical/atmospheric details, not user business content
        enhancement_rules = {
            # Scene atmosphere (only if user provides minimal technical detail)
            "scene_atmosphere": {
                "descriptors": ["warm", "inviting", "vibrant", "cozy"],
                "pattern": "{descriptor} {value}"
            },
            # Background setting (only if user provides minimal detail)
            "background_setting": {
                "descriptors": ["rustic", "modern", "elegant", "casual"],
                "pattern": "{descriptor} {value}"
            },
        }
        
        rule = enhancement_rules.get(field, {})
        
        # If no rule exists, don't enhance (default to preserving user input)
        if not rule:
            return value
        
        # Check if value already has quality descriptors
        descriptors = rule.get("descriptors", [])
        if any(desc in value.lower() for desc in descriptors):
            return value
        
        # Add descriptor if rule exists
        if descriptors and "pattern" in rule:
            descriptor = random.choice(descriptors)
            pattern = rule["pattern"]
            enhanced = pattern.format(descriptor=descriptor, value=value)
            return enhanced
        
        return value
    
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


