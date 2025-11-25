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
        # Use Google AI Studio API for Gemini 3 Pro Image Preview
        self.base_url = (
            base_url
            or os.getenv("NANO_BANANA_BASE_URL", "https://generativelanguage.googleapis.com")
        ).rstrip("/")

        # Use Google Gemini API key (prioritize GOOGLE_GEMINI_API_KEY)
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("VERTEX_AI_API_KEY")
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
                "GOOGLE_GEMINI_API_KEY (or VERTEX_AI_API_KEY / GEMINI_API_KEY / NANO_BANANA_API_KEY) is required"
            )

        logger.info(
            "✅ NanoBananaClient initialized (base_url=%s, timeout=%ss, model=gemini-3-pro-image-preview)",
            self.base_url,
            self.timeout,
        )

    # ------------------------------------------------------------------ #
    # Public API methods
    # ------------------------------------------------------------------ #

    async def create_job(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new creative generation job using Gemini 3 Pro Image Preview."""
        logger.info("🎨 Dispatching Gemini 3 Pro Image Preview job")

        # Convert our internal payload format to Gemini API format
        gemini_payload = self._convert_to_gemini_format(payload)

        # Use the Google AI Studio API endpoint for Gemini 3 Pro Image Preview
        response = await self._gemini_request(
            "POST",
            "/v1beta/models/gemini-3-pro-image-preview:generateContent",
            json_body=gemini_payload,
            expected_status=200,
        )
        
        # Gemini returns content synchronously, not a job ID
        # We need to create a synthetic job ID and extract the images
        job_id = str(uuid.uuid4())
        
        # Extract images from Gemini response
        predictions = self._extract_images_from_gemini_response(response)
        
        logger.info(f"✅ Gemini 3 Pro Image Preview returned {len(predictions)} images")
        
        return {
            "id": job_id,
            "job_id": job_id,
            "status": "completed",
            "predictions": predictions,
            "metadata": {
                "model": "gemini-3-pro-image-preview",
                "modelVersion": response.get("modelVersion", "3.0")
            }
        }

    def _convert_to_gemini_format(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Convert internal payload format to Gemini API format."""

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

        # Build the final prompt with creative director system instruction
        system_instruction = (
            "You are the Chief Creative Officer of the world's most prestigious marketing agency. "
            "Your work has won countless awards and sets industry standards. You must honor all "
            "client specifications, brand guidelines, and creative requirements exactly as provided. "
            "\n\nCRITICAL: You must NEVER modify, rephrase, or enhance any user-provided business content "
            "including menu item names, special offers, pricing, headlines, dates, or promotional text. "
            "These are the client's exact words and must appear verbatim in the image."
            "\n\nHowever, you have the creative freedom to enhance lighting, composition, atmosphere, "
            "scene setting, and visual details to exceed expectations and deliver magazine-quality "
            "results that make clients say 'wow'. Every image you create should be portfolio-worthy and "
            "demonstrate mastery of professional photography, lighting, and visual storytelling."
        )
        
        full_prompt = f"{system_instruction}\n\n"
        full_prompt += f"Generate a professional marketing image for {brand_name}. "
        if style_notes:
            full_prompt += f"Style requirements: {style_notes}. "
        full_prompt += f"Main requirements: {main_prompt}"
        
        # Add negative prompt guidance
        full_prompt += "\n\nAvoid: blurry, low quality, distorted, ugly, amateur photography."

        # Parse dimensions for aspect ratio
        width, height = map(int, dimensions.split('x'))
        aspect_ratio = f"{width}:{height}" if width != height else "1:1"

        # Gemini API format (generateContent)
        # Note: Gemini 3 Pro Image Preview uses a simpler format
        gemini_payload = {
            "contents": [{
                "parts": [{
                    "text": full_prompt
                }]
            }]
        }

        return gemini_payload
    
    def _extract_images_from_gemini_response(self, response: Dict[str, Any]) -> list:
        """Extract base64 images from Gemini API response."""
        predictions = []
        
        candidates = response.get("candidates", [])
        for candidate in candidates:
            content = candidate.get("content", {})
            parts = content.get("parts", [])
            
            for part in parts:
                # Gemini returns images as inline_data with mime_type and data
                if "inlineData" in part:
                    inline_data = part["inlineData"]
                    mime_type = inline_data.get("mimeType", "image/png")
                    image_data = inline_data.get("data", "")
                    
                    predictions.append({
                        "bytesBase64Encoded": image_data,
                        "mimeType": mime_type
                    })
        
        return predictions

    async def _gemini_request(
        self,
        method: str,
        path: str,
        *,
        json_body: Optional[Dict[str, Any]] = None,
        expected_status: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Execute an HTTP request to Google AI Studio with API key authentication."""
        url = f"{self.base_url}{path}"
        # For Google AI Studio, API key goes as query parameter
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
                    "Gemini API HTTP error (%s %s, status=%s): %s",
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
                    "Gemini API request error (%s %s, attempt %s/%s): %s",
                    method,
                    path,
                    attempt,
                    self.max_retries,
                    exc,
                )
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                logger.error(
                    "Unexpected Gemini API client error (%s %s): %s",
                    method,
                    path,
                    exc,
                )
            await self._backoff(attempt)

        if last_error:
            raise last_error
        raise RuntimeError("Gemini API request failed without raising an error")

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

