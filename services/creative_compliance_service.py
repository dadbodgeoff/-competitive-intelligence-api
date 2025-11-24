"""
Creative compliance service.

Provides guardrails for creative prompt generation:
- Sanitizes user-provided text to remove obvious profanity
- Detects and blocks prompt injection attempts
- Appends universal safety directives to image prompts
"""
from __future__ import annotations

import logging
import re
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

_PROFANITY_PATTERN = re.compile(
    r"\b("
    r"fuck|shit|bitch|asshole|cunt|prick|damn|hell|motherfucker|fucking|dick|piss"
    r")\b",
    re.IGNORECASE,
)

# Prompt injection detection patterns
_PROMPT_INJECTION_PATTERNS = [
    # Direct instruction manipulation
    re.compile(r"ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|directives?)", re.IGNORECASE),
    re.compile(r"disregard\s+(previous|all|above|prior|the)\s+(instructions?|prompts?|rules?)", re.IGNORECASE),
    re.compile(r"disregard\s+all\s+\w+\s+rules", re.IGNORECASE),  # "disregard all above rules"
    re.compile(r"forget\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)", re.IGNORECASE),
    re.compile(r"override\s+(previous|all|above|prior|the)\s+(instructions?|prompts?|rules?)", re.IGNORECASE),
    re.compile(r"override\s+all\s+\w+\s+prompts?", re.IGNORECASE),  # "override all previous prompts"
    
    # System prompt manipulation
    re.compile(r"system\s*:\s*you\s+(are|must|should|will)", re.IGNORECASE),
    re.compile(r"new\s+instructions?\s*:\s*", re.IGNORECASE),
    re.compile(r"updated\s+instructions?\s*:\s*", re.IGNORECASE),
    re.compile(r"act\s+as\s+(if|though)\s+you", re.IGNORECASE),
    re.compile(r"pretend\s+(you|to\s+be)", re.IGNORECASE),
    
    # Role manipulation
    re.compile(r"you\s+are\s+now\s+(a|an|the)", re.IGNORECASE),
    re.compile(r"from\s+now\s+on,?\s+you", re.IGNORECASE),
    re.compile(r"your\s+new\s+role\s+is", re.IGNORECASE),
    
    # Jailbreak attempts
    re.compile(r"DAN\s+mode", re.IGNORECASE),
    re.compile(r"developer\s+mode", re.IGNORECASE),
    re.compile(r"sudo\s+mode", re.IGNORECASE),
    re.compile(r"admin\s+mode", re.IGNORECASE),
    
    # Code injection attempts
    re.compile(r"<\s*script[^>]*>", re.IGNORECASE),
    re.compile(r"javascript\s*:", re.IGNORECASE),
    re.compile(r"on(load|error|click)\s*=", re.IGNORECASE),
    
    # Prompt leaking attempts
    re.compile(r"show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?)", re.IGNORECASE),
    re.compile(r"what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions?)", re.IGNORECASE),
    re.compile(r"reveal\s+your\s+(system\s+)?(prompt|instructions?)", re.IGNORECASE),
]


class CreativeComplianceService:
    """Enforces prompt safety and language guidelines."""

    def detect_prompt_injection(self, text: str) -> Tuple[bool, List[str]]:
        """
        Detect potential prompt injection attempts.
        
        Args:
            text: User input text to check
            
        Returns:
            (is_suspicious, matched_patterns)
        """
        if not isinstance(text, str):
            return False, []
        
        matched_patterns = []
        
        for pattern in _PROMPT_INJECTION_PATTERNS:
            if pattern.search(text):
                matched_patterns.append(pattern.pattern)
        
        if matched_patterns:
            logger.warning(
                "Potential prompt injection detected",
                extra={
                    "text_preview": text[:100],
                    "matched_patterns": len(matched_patterns),
                }
            )
        
        return len(matched_patterns) > 0, matched_patterns

    def sanitize_variables(self, variables: Dict[str, str]) -> Tuple[Dict[str, str], Dict[str, int]]:
        """
        Replace offensive language with friendly alternatives and detect injection attempts.

        Returns:
            (sanitized_variables, replacements_count_by_field)
            
        Raises:
            ValueError: If prompt injection is detected
        """
        sanitized: Dict[str, str] = {}
        replacements: Dict[str, int] = {}

        for key, value in variables.items():
            if not isinstance(value, str):
                sanitized[key] = value
                continue

            # Check for prompt injection
            is_suspicious, patterns = self.detect_prompt_injection(value)
            if is_suspicious:
                logger.error(
                    f"Prompt injection detected in field '{key}'",
                    extra={
                        "field": key,
                        "value_preview": value[:100],
                        "patterns_matched": len(patterns),
                    }
                )
                raise ValueError(
                    f"Input contains suspicious content that violates our usage policy. "
                    f"Please rephrase your input without attempting to manipulate the system."
                )

            # Replace profanity
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

