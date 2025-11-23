"""
Creative compliance service.

Provides guardrails for creative prompt generation:
- Sanitizes user-provided text to remove obvious profanity
- Appends universal safety directives to image prompts
"""
from __future__ import annotations

import re
from typing import Dict, Tuple

_PROFANITY_PATTERN = re.compile(
    r"\b("
    r"fuck|shit|bitch|asshole|cunt|prick|damn|hell|motherfucker|fucking|dick|piss"
    r")\b",
    re.IGNORECASE,
)


class CreativeComplianceService:
    """Enforces prompt safety and language guidelines."""

    def sanitize_variables(self, variables: Dict[str, str]) -> Tuple[Dict[str, str], Dict[str, int]]:
        """
        Replace offensive language with friendly alternatives.

        Returns:
            (sanitized_variables, replacements_count_by_field)
        """
        sanitized: Dict[str, str] = {}
        replacements: Dict[str, int] = {}

        for key, value in variables.items():
            if not isinstance(value, str):
                sanitized[key] = value
                continue

            def _replacement(match: re.Match) -> str:
                replacements[key] = replacements.get(key, 0) + 1
                return "***"

            sanitized_value = _PROFANITY_PATTERN.sub(_replacement, value)
            sanitized[key] = sanitized_value

        return sanitized, replacements

    def get_compliance_directive(self) -> str:
        """
        Directive appended to every prompt sent to Nano Banana or Gemini.
        """
        return (
            "Compliance requirements: render all lettering left-to-right and horizontally aligned; "
            "do not create offensive gestures, hand signs, or vulgar symbols; avoid profanity or explicit content; "
            "portray friendly neutral body language only."
        )

