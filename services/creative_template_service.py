"""
Creative prompt template service.

Handles creative template discovery, validation, and prompt assembly.
"""
from __future__ import annotations

import json
import logging
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

    def validate_inputs(self, template: Dict, user_inputs: Dict[str, Any]) -> Dict[str, str]:
        """Validate user inputs against the stored input schema."""
        schema = template.get("input_schema") or {}
        if isinstance(schema, str):
            schema = json.loads(schema)

        required = schema.get("required", [])
        optional = schema.get("optional", [])
        field_types = schema.get("types", {})

        cleaned: Dict[str, str] = {}

        for field in required:
            if field not in user_inputs:
                raise ValueError(f"Missing required field '{field}' for template {template['id']}")
            cleaned[field] = self._coerce_value(field, user_inputs[field], field_types.get(field))

        for field in optional:
            if field in user_inputs:
                cleaned[field] = self._coerce_value(field, user_inputs[field], field_types.get(field))

        # allow additional fields (custom sections)
        for field, value in user_inputs.items():
            if field in cleaned:
                continue
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
    ) -> Dict[str, str]:
        """Render prompt sections with provided variables."""
        rendered: Dict[str, str] = {}

        for section in sections:
            body = section.get("prompt_body") or ""
            normalized = _PLACEHOLDER_PATTERN.sub(r"{\1}", body)
            rendered_body = _safe_format(normalized, variables)

            extras = []
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


def _safe_format(template: str, variables: Dict[str, str]) -> str:
    """Safely format template strings without raising on missing keys."""

    class SafeDict(dict):
        def __missing__(self, key: str) -> str:
            return "{" + key + "}"

    return template.format_map(SafeDict(**variables))


