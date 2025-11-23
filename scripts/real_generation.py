import asyncio
from datetime import datetime, timedelta, timezone

import httpx

from services.nano_banana_orchestrator import NanoBananaImageOrchestrator
from services.creative_theme_service import CreativeThemeService
from services.creative_template_service import CreativeTemplateService
from services.creative_generation_storage import CreativeGenerationStorage

USER_ID = "48da0b13-07de-476d-a108-6bd93ff195e4"
NANO_BASE_URL = "https://api.nanobanana.ai"


async def main() -> None:
    reset_time = datetime.now(timezone.utc) - timedelta(seconds=5)
    CreativeGenerationStorage().client.table("user_usage_limits").update(
        {
            "image_generation_28day_count": 0,
            "image_generation_28day_reset": reset_time.isoformat(),
        }
    ).eq("user_id", USER_ID).execute()

    theme_service = CreativeThemeService()
    template_service = CreativeTemplateService()

    hiring_theme = next(
        theme for theme in theme_service.list_themes() if theme.get("category") == "hiring"
    )
    templates = template_service.list_templates_by_theme(hiring_theme["id"])
    selected_template = templates[0]

    schema = selected_template.get("input_schema", {})
    required_fields = schema.get("required", [])
    field_types = schema.get("types", {})

    def sample_value(field: str) -> str:
        hint = field_types.get(field)
        if hint == "currency":
            return "19.99"
        if hint == "integer":
            return "5"
        return "Sample " + field.replace("_", " ").title()

    user_inputs = {field: sample_value(field) for field in required_fields}

    request_payload = {
        "theme_id": hiring_theme["id"],
        "template_id": selected_template["id"],
        "user_inputs": user_inputs,
        "brand_profile_id": None,
        "brand_overrides": {},
        "style_preferences": {},
        "desired_outputs": {"variants": 1, "dimensions": "1024x1024"},
        "generation_metadata": {"triggered_by": "real_generation_script"},
    }

    orchestrator = NanoBananaImageOrchestrator()
    client = orchestrator.client
    client.base_url = NANO_BASE_URL

    async def request_with_host(method, path, *, json_body=None, expected_status=None):
        url = f"{client.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {client.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        last_error = None
        for attempt in range(1, client.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=client.timeout, verify=False) as http_client:
                    response = await http_client.request(
                        method,
                        url,
                        headers=headers,
                        json=json_body,
                    )
                if expected_status and response.status_code != expected_status:
                    response.raise_for_status()
                response.raise_for_status()
                if not response.content:
                    return {}
                return response.json()
            except Exception as exc:
                last_error = exc
                await client._backoff(attempt)
        raise last_error

    client._request = request_with_host  # type: ignore[attr-defined]

    job = await orchestrator.start_generation(user_id=USER_ID, request=request_payload)
    print("Started job", job["id"], "nano", job.get("nano_job_id"))
    async for event in orchestrator.stream_job_progress(job_id=job["id"], user_id=USER_ID):
        print("event:", event)
        if event.get("type") == "job_complete":
            break


if __name__ == "__main__":
    asyncio.run(main())

