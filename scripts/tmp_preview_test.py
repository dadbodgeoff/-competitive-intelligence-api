from fastapi.testclient import TestClient

from api.main import app
from api.middleware.auth import get_current_user


app.dependency_overrides[get_current_user] = lambda: "48da0b13-07de-476d-a108-6bd93ff195e4"

client = TestClient(app)

payload = {
    "template_id": "test-template",
    "user_inputs": {},
    "style_preferences": {},
}

resp = client.post("/api/v1/nano-banana/templates/preview", json=payload)
print("direct json:", resp.status_code, resp.json())

resp = client.post("/api/v1/nano-banana/templates/preview", json={"payload": payload})
print("embedded json:", resp.status_code, resp.json())

