import asyncio

import uuid
from datetime import datetime, timedelta, timezone

from services.nano_banana_orchestrator import NanoBananaImageOrchestrator
from services.creative_theme_service import CreativeThemeService
from services.creative_template_service import CreativeTemplateService
from services.creative_brand_service import CreativeBrandService

TEST_USER = "48da0b13-07de-476d-a108-6bd93ff195e4"

orchestrator = NanoBananaImageOrchestrator()
theme_service = CreativeThemeService()
template_service = CreativeTemplateService()
brand_service = CreativeBrandService()


async def fake_create_job(payload):
    fake_create_job.payload = payload
    return {"id": f"nano-smoke-{uuid.uuid4()}", "status": "queued"}


async def fake_get_job(nano_job_id):
    fake_get_job.calls += 1
    return {
        "status": "completed",
        "progress": 100,
        "assets": [
            {
                "asset_url": "https://assets.example.com/creative.png",
                "preview_url": "https://assets.example.com/creative_preview.png",
                "width": 1024,
                "height": 1024,
                "file_size_bytes": 512345,
            }
        ],
    }


fake_get_job.calls = 0


async def fake_list_assets(nano_job_id):
    return {
        "assets": [
            {
                "asset_url": "https://assets.example.com/creative.png",
                "preview_url": "https://assets.example.com/creative_preview.png",
                "width": 1024,
                "height": 1024,
                "file_size": 512345,
            }
        ]
    }


orchestrator.client.create_job = fake_create_job
orchestrator.client.get_job = fake_get_job
orchestrator.client.list_assets = fake_list_assets
orchestrator.brand_service.get_brand_profile = (
    lambda account_id, user_id, brand_profile_id=None: {
        "brand_name": "Smoke Test Brand",
        "palette": {},
        "metadata": {},
    }
)

themes = theme_service.list_themes()
assert themes, "Expected at least one creative theme"
selected_theme = themes[0]

try:
    brand_profiles = brand_service.list_profiles(
        account_id="08789c2d-f7a9-4c1a-8710-d2aafb3b3c17"
    )
except Exception:
    brand_profiles = []

templates = template_service.list_templates_by_theme(selected_theme["id"])
assert templates, "Expected at least one template"
selected_template = templates[0]

schema = selected_template.get("input_schema", {})
required_fields = schema.get("required", [])
field_types = schema.get("types", {})


def build_value(field: str) -> str:
    hint = field_types.get(field)
    if hint == "currency":
        return "12.50"
    if hint == "integer":
        return "3"
    return f"Sample {field.replace('_', ' ').title()}"


user_inputs = {field: build_value(field) for field in required_fields}

payload = {
    "theme_id": selected_theme["id"],
    "template_id": selected_template["id"],
    "user_inputs": user_inputs,
    "desired_outputs": {"variants": 1, "dimensions": "1024x1024", "format": "png"},
}

job_info = asyncio.run(
    orchestrator.start_generation(
        user_id=TEST_USER,
        request=payload,
    )
)
job_id = job_info["id"]

orchestrator.storage.update_job_status(
    job_id,
    status="completed",
    progress=100,
    nano_job_id=job_info.get("nano_job_id"),
)
orchestrator.storage.store_assets(
    job_id,
    [
        {
            "asset_url": "https://assets.example.com/creative.png",
            "preview_url": "https://assets.example.com/creative_preview.png",
            "width": 1024,
            "height": 1024,
            "file_size_bytes": 512345,
        }
    ],
)
orchestrator.storage.record_event(
    job_id=job_id,
    event_type="smoke_test_complete",
    payload={"note": "Simulated completion during smoke test"},
    progress=100,
)

job_resp = (
    orchestrator.storage.client.table("creative_generation_jobs")
    .select("*")
    .eq("id", job_id)
    .execute()
)
job_detail = job_resp.data[0]
assets_resp = (
    orchestrator.storage.client.table("creative_generation_assets")
    .select("*")
    .eq("job_id", job_id)
    .execute()
)
events_resp = (
    orchestrator.storage.client.table("creative_job_events")
    .select("*")
    .eq("job_id", job_id)
    .execute()
)
job_detail["assets"] = assets_resp.data
job_detail["events"] = events_resp.data
job_list = orchestrator.list_jobs(user_id=TEST_USER, limit=10, offset=0)

print("THEMES:", len(themes))
print("BRANDS:", len(brand_profiles))
print("SELECTED THEME:", selected_theme.get("name"), selected_theme.get("category"))
print(
    "SELECTED TEMPLATE:",
    selected_template.get("display_name"),
    "Required:",
    required_fields,
)
print("JOB STATUS:", job_detail["status"], "Assets:", len(job_detail.get("assets", [])))
print("TOTAL JOBS:", job_list.get("count"))

# Reset usage counter so the script can be re-run without 28-day wait
reset_time = datetime.now(timezone.utc) - timedelta(seconds=5)
orchestrator.storage.client.table("user_usage_limits").update(
    {
        "image_generation_28day_count": 0,
        "image_generation_28day_reset": reset_time.isoformat(),
    }
).eq("user_id", TEST_USER).execute()

