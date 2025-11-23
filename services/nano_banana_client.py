"""
Nano Banana API client.

This module wraps the external Nano Banana creative generation API with the same
patterns used elsewhere in the backend: thin, well-tested client focused on
transport concerns (authentication, retries, validation).
"""
from __future__ import annotations

import asyncio
import base64
import hmac
import json
import logging
import os
import uuid
from hashlib import sha256
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger(__name__)


class NanoBananaClient:
    """Async HTTP client for Nano Banana image generation."""

    DEFAULT_TIMEOUT = 30.0
    DEFAULT_MAX_RETRIES = 3

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        webhook_secret: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
    ) -> None:
        # Use Vertex AI API for image generation
        self.base_url = (
            base_url
            or os.getenv("NANO_BANANA_BASE_URL", "https://us-central1-aiplatform.googleapis.com")
        ).rstrip("/")

        # Use Vertex AI API key (prioritize Vertex AI over Google AI Studio)
        self.api_key = api_key or os.getenv("VERTEX_AI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            # Fallback to other possible key names
            self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("NANO_BANANA_API_KEY")

        self.webhook_secret = webhook_secret or os.getenv("NANO_BANANA_WEBHOOK_SECRET")
        self.timeout = timeout
        self.max_retries = max_retries
        verify_env = os.getenv("NANO_BANANA_VERIFY_SSL", "true").lower()
        self.verify_ssl = verify_env not in {"0", "false", "no"}
        self.override_host = os.getenv("NANO_BANANA_OVERRIDE_HOST")

        if not self.base_url:
            raise ValueError("NANO_BANANA_BASE_URL environment variable is required")
        if not self.api_key:
            raise ValueError(
                "VERTEX_AI_API_KEY (or GOOGLE_GEMINI_API_KEY / GEMINI_API_KEY / NANO_BANANA_API_KEY) is required"
            )

        logger.info(
            "✅ NanoBananaClient initialized (base_url=%s, timeout=%ss, model=imagen-3.0-generate-001)",
            self.base_url,
            self.timeout,
        )

    # ------------------------------------------------------------------ #
    # Public API methods
    # ------------------------------------------------------------------ #

    async def create_job(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new creative generation job using Vertex AI Imagen."""
        logger.info("🎨 Dispatching Vertex AI Imagen job")

        # Convert our internal payload format to Vertex AI format
        vertex_payload = self._convert_to_vertex_format(payload)

        # Extract project ID from service account (vertex-express@gothic-album-474117-a7.iam.gserviceaccount.com)
        project_id = "gothic-album-474117-a7"

        return await self._vertex_request(
            "POST",
            f"/v1/projects/{project_id}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict",
            json_body=vertex_payload,
            expected_status=200,
        )

    def _convert_to_vertex_format(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Convert internal payload format to Vertex AI Imagen API format."""

        # Extract the main prompt from rendered sections
        prompt_sections = payload.get("prompt", {})
        main_prompt = ""

        # Combine all prompt sections into a single text prompt
        for section_name, section_content in prompt_sections.items():
            if section_content:
                main_prompt += f"{section_name.upper()}: {section_content}\n\n"

        # Get brand information
        brand = payload.get("brand", {})
        brand_name = brand.get("name", "")

        # Get style information
        style = payload.get("style", {})
        style_notes = style.get("notes", "")

        # Get output specifications
        outputs = payload.get("outputs", {})
        dimensions = outputs.get("dimensions", "1024x1024")
        variants = outputs.get("variants", 1)

        # Build the final prompt
        full_prompt = f"Generate a professional marketing image for {brand_name}. "
        if style_notes:
            full_prompt += f"Style requirements: {style_notes}. "
        full_prompt += f"Main requirements: {main_prompt}"

        # Parse dimensions to determine aspect ratio
        width, height = map(int, dimensions.split('x'))
        aspect_ratio = f"{width}:{height}" if width != height else "1:1"

        # Vertex AI Imagen API format
        vertex_payload = {
            "instances": [
                {
                    "prompt": full_prompt
                }
            ],
            "parameters": {
                "sampleCount": variants,
                "aspectRatio": aspect_ratio,
                "negativePrompt": "blurry, low quality, distorted, ugly",
                "personGeneration": "allow_adult"
            }
        }

        return vertex_payload

    async def _vertex_request(
        self,
        method: str,
        path: str,
        *,
        json_body: Optional[Dict[str, Any]] = None,
        expected_status: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Execute an HTTP request to Vertex AI with API key authentication."""
        url = f"{self.base_url}{path}"
        # For Vertex AI, API key goes as query parameter
        if "?" in url:
            url += f"&key={self.api_key}"
        else:
            url += f"?key={self.api_key}"

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.override_host:
            headers["Host"] = self.override_host

        last_error: Optional[Exception] = None
        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify_ssl) as client:
                    response = await client.request(
                        method,
                        url,
                        headers=headers,
                        json=json_body,
                    )
                if expected_status and response.status_code != expected_status:
                    raise httpx.HTTPStatusError(
                        f"Unexpected status {response.status_code} for {method} {path}",
                        request=response.request,
                        response=response,
                    )
                response.raise_for_status()
                if not response.content:
                    return {}
                return response.json()
            except httpx.HTTPStatusError as exc:
                last_error = exc
                status = exc.response.status_code
                body = exc.response.text
                logger.error(
                    "Vertex AI HTTP error (%s %s, status=%s): %s",
                    method,
                    path,
                    status,
                    body,
                )
                if status < 500:
                    break
            except httpx.RequestError as exc:
                last_error = exc
                logger.warning(
                    "Vertex AI request error (%s %s, attempt %s/%s): %s",
                    method,
                    path,
                    attempt,
                    self.max_retries,
                    exc,
                )
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                logger.error(
                    "Unexpected Vertex AI client error (%s %s): %s",
                    method,
                    path,
                    exc,
                )
            await self._backoff(attempt)

        if last_error:
            raise last_error
        raise RuntimeError("Vertex AI request failed without raising an error")

    async def get_job(self, job_id: str) -> Dict[str, Any]:
        """Retrieve job status metadata."""
        return await self._request("GET", f"/v1/jobs/{job_id}")

    async def list_assets(self, job_id: str) -> Dict[str, Any]:
        """Fetch rendered asset metadata."""
        return await self._request("GET", f"/v1/jobs/{job_id}/assets")

    async def cancel_job(self, job_id: str) -> Dict[str, Any]:
        """Cancel a running job."""
        return await self._request("POST", f"/v1/jobs/{job_id}/cancel")

    # ------------------------------------------------------------------ #
    # Webhook helpers
    # ------------------------------------------------------------------ #

    def validate_webhook(self, payload: bytes, signature_header: str) -> bool:
        """
        Validate webhook signature.

        Nano Banana posts a base64 encoded HMAC-SHA256 signature in the
        `x-nano-signature` header. We recompute it with the shared secret and
        compare using `hmac.compare_digest`.
        """
        if not self.webhook_secret:
            logger.warning("Webhook secret not configured; rejecting Nano Banana webhook")
            return False
        try:
            expected = hmac.new(
                key=self.webhook_secret.encode("utf-8"),
                msg=payload,
                digestmod=sha256,
            ).digest()
            provided = base64.b64decode(signature_header)
            if hmac.compare_digest(expected, provided):
                return True
            logger.warning("Nano Banana webhook signature mismatch")
            return False
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to validate Nano Banana webhook signature: %s", exc)
            return False

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: Optional[Dict[str, Any]] = None,
        expected_status: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Execute an HTTP request with retries and structured error reporting."""
        url = f"{self.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.override_host:
            headers["Host"] = self.override_host

        last_error: Optional[Exception] = None
        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify_ssl) as client:
                    response = await client.request(
                        method,
                        url,
                        headers=headers,
                        json=json_body,
                    )
                if expected_status and response.status_code != expected_status:
                    raise httpx.HTTPStatusError(
                        f"Unexpected status {response.status_code} for {method} {path}",
                        request=response.request,
                        response=response,
                    )
                response.raise_for_status()
                if not response.content:
                    return {}
                return response.json()
            except httpx.HTTPStatusError as exc:
                last_error = exc
                status = exc.response.status_code
                body = exc.response.text
                logger.error(
                    "Nano Banana HTTP error (%s %s, status=%s): %s",
                    method,
                    path,
                    status,
                    body,
                )
                if status < 500:
                    break
            except httpx.RequestError as exc:
                last_error = exc
                logger.warning(
                    "Nano Banana request error (%s %s, attempt %s/%s): %s",
                    method,
                    path,
                    attempt,
                    self.max_retries,
                    exc,
                )
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                logger.error(
                    "Unexpected Nano Banana client error (%s %s): %s",
                    method,
                    path,
                    exc,
                )
            await self._backoff(attempt)

        if last_error:
            raise last_error
        raise RuntimeError("Nano Banana request failed without raising an error")

    async def _backoff(self, attempt: int) -> None:
        """Linear backoff with jitter."""
        if attempt >= self.max_retries:
            return
        delay = min(2 ** (attempt - 1), 8)
        await asyncio.sleep(delay)


def sanitize_payload_for_logging(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove any sensitive values before logging payloads.

    Currently Nano Banana payloads do not contain credentials, but we strip any
    obvious binary data or long arrays to keep logs tidy.
    """
    redacted = json.loads(json.dumps(payload))  # Deep copy via JSON roundtrip
    if "assets" in redacted and isinstance(redacted["assets"], list):
        redacted["assets"] = f"{len(redacted['assets'])} asset descriptors"
    return redacted

