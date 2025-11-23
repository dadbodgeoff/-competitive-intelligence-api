"""
Endpoint-level smoke test for the Nano Banana creative API.

Uses FastAPI TestClient, stubs external Nano Banana calls, and verifies:
    - /themes
    - /brands
    - /themes/{theme_id}/templates
    - /templates/preview
    - /generate
    - /jobs/{job_id}/stream
    - /jobs/{job_id}
    - /jobs
"""

import uuid
from typing import Any, Dict, Optional

from datetime import datetime, timedelta, timezone
import importlib

from fastapi.testclient import TestClient

import api.middleware.rate_limiting as rate_limiting_module
importlib.reload(rate_limiting_module)
from api.middleware import rate_limiting
import api.routes.nano_banana as nano_banana_module
importlib.reload(nano_banana_module)
from api.routes import nano_banana as nb
import api.main as api_main
importlib.reload(api_main)
from api.main import app
from api.middleware.auth import get_current_user
from services.creative_generation_storage import CreativeGenerationStorage

TEST_USER = "48da0b13-07de-476d-a108-6bd93ff195e4"


class StubNanoClient:
    def __init__(self) -> None:
        self.last_payload: Dict[str, Any] | None = None
        self.job_id = f"nano-endpoint-{uuid.uuid4()}"

    async def create_job(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        self.last_payload = payload
        return {"id": self.job_id, "status": "queued"}

    async def get_job(self, nano_job_id: str) -> Dict[str, Any]:
        return {
            "id": nano_job_id,
            "status": "completed",
            "progress": 100,
            "message": "Completed in smoke test",
        }

    async def list_assets(self, nano_job_id: str) -> Dict[str, Any]:
        return {
            "assets": [
                {
                    "asset_url": "https://assets.example.com/smoke.png",
                    "preview_url": "https://assets.example.com/smoke_preview.png",
                    "width": 1024,
                    "height": 1024,
                    "file_size": 512345,
                }
            ]
        }

    async def cancel_job(self, nano_job_id: str) -> Dict[str, Any]:
        return {"id": nano_job_id, "status": "cancelled"}


app.dependency_overrides[get_current_user] = lambda: TEST_USER
nb.orchestrator.client = StubNanoClient()


class StubAssetStorage:
    def cache_asset(self, **_: Any) -> Dict[str, Optional[str]]:
        return {
            "asset_url": f"https://storage.local/{uuid.uuid4().hex}.png",
            "storage_path": "local/path.png",
            "content_type": "image/png",
        }

    def cache_preview(self, **_: Any) -> Dict[str, Optional[str]]:
        return {
            "preview_url": f"https://storage.local/{uuid.uuid4().hex}_preview.png",
            "storage_path": "local/preview.png",
            "content_type": "image/png",
        }


nb.orchestrator.asset_storage = StubAssetStorage()

# Reset in-memory rate limiter state so tests start from a clean slate
rate_limiting.rate_limiter.requests.clear()
rate_limiting.rate_limiter.concurrent.clear()
rate_limiting.rate_limiter.tier_limits.setdefault("free", {}).setdefault("analysis", {})
rate_limiting.rate_limiter.tier_limits["free"]["analysis"]["max_per_hour"] = 100
rate_limiting.rate_limiter.tier_limits["free"]["analysis"]["max_per_week"] = 100

# Reset creative generation usage so the test user can generate once per run
reset_time = datetime.now(timezone.utc) - timedelta(seconds=5)
CreativeGenerationStorage().client.table("user_usage_limits").update(
    {
        "image_generation_28day_count": 0,
        "image_generation_28day_reset": reset_time.isoformat(),
    }
).eq("user_id", TEST_USER).execute()

client = TestClient(app)

themes_response = client.get("/api/v1/nano-banana/themes")
themes_response.raise_for_status()
themes = themes_response.json()
assert themes, "No themes returned from /themes endpoint"
selected_theme = themes[0]

brands_response = client.get("/api/v1/nano-banana/brands")
brands_response.raise_for_status()
brand_profiles = brands_response.json()

templates_response = client.get(
    f"/api/v1/nano-banana/themes/{selected_theme['id']}/templates"
)
templates_response.raise_for_status()
templates = templates_response.json()
assert templates, "No templates returned for selected theme"
selected_template = templates[0]

schema = selected_template.get("input_schema", {})
required_fields = schema.get("required", [])
field_types = schema.get("types", {})


def build_value(field: str) -> str:
    hint = field_types.get(field)
    if hint == "currency":
        return "19.99"
    if hint == "integer":
        return "5"
    return f"Sample {field.replace('_', ' ').title()}"


user_inputs = {field: build_value(field) for field in required_fields}

preview_payload = {
    "template_id": selected_template["id"],
    "user_inputs": user_inputs,
    "style_preferences": {},
}
preview_response = client.post(
    "/api/v1/nano-banana/templates/preview", json=preview_payload
)
preview_response.raise_for_status()
preview = preview_response.json()

generate_payload = {
    "theme_id": selected_theme["id"],
    "template_id": selected_template["id"],
    "user_inputs": user_inputs,
    "desired_outputs": {"variants": 1, "dimensions": "1024x1024"},
}

generate_response = client.post("/api/v1/nano-banana/generate", json=generate_payload)
generate_response.raise_for_status()
generate_data = generate_response.json()
job_id = generate_data["job_id"]

stream_response = client.stream(
    "GET", f"/api/v1/nano-banana/jobs/{job_id}/stream"
)
stream_events = []
with stream_response as stream:
    for line in stream.iter_lines():
        if line:
            stream_events.append(line)
        if "job_complete" in "".join(stream_events):
            break

job_detail_response = client.get(f"/api/v1/nano-banana/jobs/{job_id}")
job_detail_response.raise_for_status()
job_detail = job_detail_response.json()

job_list_response = client.get(
    "/api/v1/nano-banana/jobs", params={"page": 1, "per_page": 10}
)
job_list_response.raise_for_status()
job_list = job_list_response.json()

print("Themes:", len(themes))
print("Brands:", len(brand_profiles))
print(
    "Theme selection:",
    selected_theme["name"],
    "| category:",
    selected_theme.get("category"),
)
print(
    "Template selection:",
    selected_template["display_name"],
    "| required fields:",
    required_fields,
)
print("Preview sections:", list(preview.get("sections", {}).keys()))
print("Generation job:", job_id, "| status:", generate_data["status"])
print("Stream events:", stream_events[:3], "…")
print(
    "Job detail assets:",
    len(job_detail.get("assets", [])),
    "| events:",
    len(job_detail.get("events", [])),
)
print("Job list count:", job_list.get("total_count"))

# Reset usage counter for deterministic reruns
reset_time = datetime.now(timezone.utc) - timedelta(seconds=5)
CreativeGenerationStorage().client.table("user_usage_limits").update(
    {
        "image_generation_28day_count": 0,
        "image_generation_28day_reset": reset_time.isoformat(),
    }
).eq("user_id", TEST_USER).execute()

