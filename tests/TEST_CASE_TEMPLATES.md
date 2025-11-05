# TEST CASE TEMPLATES - BACKEND TEST SUITE

**Purpose:** Reusable test case templates for all modules  
**Date:** November 3, 2025

---

## TEMPLATE 1: AUTHENTICATION TEST

```python
import pytest
from httpx import AsyncClient
from fastapi import status

@pytest.mark.asyncio
async def test_auth_registration_success(client: AsyncClient):
    """
    TC-AUTH-001: Valid registration creates user + profile
    
    Given: Valid user registration data
    When: POST /api/v1/auth/register
    Then: User created, profile created, JWT token returned, cookies set
    """
    # Arrange
    user_data = {
        "email": "test@example.com",
        "password": "SecurePass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    # Act
    response = await client.post("/api/v1/auth/register", json=user_data)
    
    # Assert
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify user data
    assert data["user"]["email"] == user_data["email"]
    assert data["user"]["subscription_tier"] == "free"
    assert "id" in data["user"]
    
    # Verify cookies
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies
    
    # Verify cookie security
    access_cookie = response.cookies["access_token"]
    assert access_cookie.httponly is True
    # In production: assert access_cookie.secure is True
    
    # Verify no tokens in response body
    assert "access_token" not in data
    assert "refresh_token" not in data
```

---

## TEMPLATE 2: RLS POLICY TEST

```python
import pytest
from database.supabase_client import get_supabase_client

@pytest.mark.asyncio
async def test_rls_prevents_cross_user_invoice_access():
    """
    TC-SEC-001: RLS prevents users from accessing other users' invoices
    
    Given: Two users with invoices
    When: User A tries to access User B's invoice
    Then: Access denied (empty result set)
    """
    # Arrange
    supabase = get_supabase_client()
    
    # Create User A and their invoice
    user_a_id = "user-a-uuid"
    invoice_a_id = await create_test_invoice(user_a_id)
    
    # Create User B
    user_b_id = "user-b-uuid"
    
    # Act - User B tries to access User A's invoice
    # (Simulate by setting auth context to User B)
    result = supabase.table("invoices").select("*").eq(
        "id", invoice_a_id
    ).execute()
    
    # Assert - RLS should return empty result
    assert len(result.data) == 0, "RLS failed: User B can see User A's invoice"
```

---

## TEMPLATE 3: STREAMING TEST

```python
import pytest
from httpx import AsyncClient
import json

@pytest.mark.asyncio
async def test_invoice_parse_streaming():
    """
    TC-INV-005: Streaming parse sends progress events
    
    Given: Valid invoice file uploaded
    When: GET /api/invoices/parse-stream
    Then: SSE events received in order
    """
    # Arrange
    file_url = "https://storage.supabase.co/test-invoice.pdf"
    
    # Act
    async with client.stream(
        "GET",
        f"/api/invoices/parse-stream?file_url={file_url}",
        headers={"Authorization": f"Bearer {test_token}"}
    ) as response:
        events = []
        async for line in response.aiter_lines():
            if line.startswith("event:"):
                event_type = line.split(":", 1)[1].strip()
            elif line.startswith("data:"):
                data = json.loads(line.split(":", 1)[1].strip())
                events.append({"type": event_type, "data": data})
    
    # Assert
    assert len(events) >= 3, "Should receive at least 3 events"
    
    # Verify event order
    assert events[0]["type"] == "parsing_started"
    assert events[-1]["type"] in ["parsed_data", "validation_complete"]
    
    # Verify progress updates
    progress_events = [e for e in events if e["type"] == "parsing_progress"]
    assert len(progress_events) > 0, "Should receive progress updates"
```

---

## TEMPLATE 4: RATE LIMITING TEST

```python
import pytest
from httpx import AsyncClient
import asyncio

@pytest.mark.asyncio
async def test_rate_limit_blocks_excess_requests():
    """
    TC-RATE-001: Rate limiting blocks excess requests
    
    Given: Free tier user (limit: 2 concurrent invoice parses)
    When: 3 concurrent parse requests
    Then: 3rd request returns 429 Too Many Requests
    """
    # Arrange
    free_tier_user_token = await get_test_user_token(tier="free")
    file_url = "https://storage.supabase.co/test-invoice.pdf"
    
    # Act - Send 3 concurrent requests
    tasks = [
        client.get(
            f"/api/invoices/parse-stream?file_url={file_url}",
            headers={"Authorization": f"Bearer {free_tier_user_token}"}
        )
        for _ in range(3)
    ]
    
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Assert
    status_codes = [r.status_code for r in responses if hasattr(r, 'status_code')]
    
    # At least one should be rate limited
    assert 429 in status_codes, "Rate limiting not enforced"
    
    # Verify error message
    rate_limited_response = next(r for r in responses if r.status_code == 429)
    error_data = rate_limited_response.json()
    assert "rate limit exceeded" in error_data["detail"]["error"].lower()
```

---

## TEMPLATE 5: FUZZY MATCHING TEST

```python
import pytest
from services.fuzzy_matching.fuzzy_item_matcher import FuzzyItemMatcher

@pytest.mark.asyncio
async def test_fuzzy_matching_finds_similar_items():
    """
    TC-INV-010: Fuzzy matching links invoice items to inventory
    
    Given: Inventory item "Mozzarella Cheese, Shredded"
    When: Invoice item "MOZZ CHEESE SHRD"
    Then: Match found with high similarity score
    """
    # Arrange
    matcher = FuzzyItemMatcher()
    user_id = "test-user-uuid"
    
    # Create inventory item
    await create_test_inventory_item(
        user_id=user_id,
        name="Mozzarella Cheese, Shredded",
        category="Dairy"
    )
    
    # Act
    target_item = {
        "name": "MOZZ CHEESE SHRD",
        "category": "Dairy"
    }
    
    matches = matcher.find_similar_items(
        target_name=target_item["name"],
        user_id=user_id,
        category=target_item["category"],
        limit=5
    )
    
    # Assert
    assert len(matches) > 0, "No matches found"
    
    best_match = matches[0]
    assert best_match["similarity_score"] >= 0.85, "Similarity too low"
    assert "Mozzarella" in best_match["name"]
```

---

## TEMPLATE 6: UNIT CONVERSION TEST

```python
import pytest
from services.unit_converter import UnitConverter
from decimal import Decimal

def test_unit_converter_parses_pack_size():
    """
    TC-INV-012: Unit converter parses pack sizes correctly
    
    Given: Pack size "6/5 LB"
    When: Parse pack size
    Then: Returns 6 pieces, 5 LB each, 30 LB total
    """
    # Arrange
    converter = UnitConverter()
    pack_size = "6/5 LB"
    
    # Act
    result = converter.parse_pack_size(pack_size)
    
    # Assert
    assert result is not None, "Failed to parse pack size"
    assert result["pieces"] == 6
    assert result["weight_per_piece"] == Decimal("5")
    assert result["weight_unit"] == "lb"
    assert result["total_weight"] == Decimal("30")
```

---

## TEMPLATE 7: ERROR SANITIZATION TEST

```python
import pytest
from services.error_sanitizer import ErrorSanitizer
import os

def test_error_sanitizer_hides_sensitive_info():
    """
    TC-SEC-005: Error sanitizer prevents PII leakage
    
    Given: Exception with database connection string
    When: Sanitize error in production
    Then: Generic message returned, sensitive info hidden
    """
    # Arrange
    os.environ["ENVIRONMENT"] = "production"
    sensitive_error = Exception(
        "Connection failed: postgresql://user:password@localhost:5432/db"
    )
    
    # Act
    sanitized = ErrorSanitizer.sanitize_error(
        sensitive_error,
        user_message="Database operation failed"
    )
    
    # Assert
    assert "postgresql://" not in sanitized
    assert "password" not in sanitized
    assert "localhost" not in sanitized
    assert sanitized == "Database operation failed"
```

---

## TEMPLATE 8: SUBSCRIPTION ENFORCEMENT TEST

```python
import pytest
from httpx import AsyncClient
from fastapi import status

@pytest.mark.asyncio
async def test_premium_feature_blocked_for_free_tier():
    """
    TC-SUB-001: Premium analysis blocked for free tier users
    
    Given: Free tier user
    When: Request premium analysis
    Then: 402 Payment Required
    """
    # Arrange
    free_tier_token = await get_test_user_token(tier="free")
    
    analysis_request = {
        "restaurant_name": "Test Restaurant",
        "location": "Woonsocket, RI",
        "tier": "premium"  # Requesting premium
    }
    
    # Act
    response = await client.post(
        "/api/run",
        json=analysis_request,
        headers={"Authorization": f"Bearer {free_tier_token}"}
    )
    
    # Assert
    assert response.status_code == status.HTTP_402_PAYMENT_REQUIRED
    error_data = response.json()
    assert "premium subscription" in error_data["detail"].lower()
```

---

## TEMPLATE 9: ATOMIC OPERATION TEST

```python
import pytest
from database.supabase_client import get_supabase_service_client
import asyncio

@pytest.mark.asyncio
async def test_usage_limit_atomic_no_race_condition():
    """
    TC-SUB-003: Usage limits prevent race conditions
    
    Given: User at usage limit (4/5 analyses)
    When: 3 concurrent analysis requests
    Then: Only 1 succeeds, 2 blocked atomically
    """
    # Arrange
    user_id = "test-user-uuid"
    await set_user_usage(user_id, operation="analysis", count=4, limit=5)
    
    # Act - Send 3 concurrent requests
    async def attempt_analysis():
        from api.middleware.subscription import check_usage_limits
        try:
            return await check_usage_limits(user_id, "analysis")
        except Exception as e:
            return False
    
    results = await asyncio.gather(*[attempt_analysis() for _ in range(3)])
    
    # Assert
    successful = sum(1 for r in results if r is True)
    assert successful == 1, f"Expected 1 success, got {successful}"
    
    # Verify final count
    final_count = await get_user_usage(user_id, "analysis")
    assert final_count == 5, "Usage count incorrect"
```

---

## TEMPLATE 10: CASCADE DELETE TEST

```python
import pytest
from services.invoice_storage_service import InvoiceStorageService

@pytest.mark.asyncio
async def test_invoice_delete_cascades_to_inventory():
    """
    TC-INV-020: Invoice delete cascades to inventory items
    
    Given: Invoice with 5 line items creating 5 inventory items
    When: Delete invoice
    Then: Invoice + line items + inventory items all deleted
    """
    # Arrange
    storage = InvoiceStorageService()
    user_id = "test-user-uuid"
    
    # Create invoice with items
    invoice_id = await create_test_invoice_with_items(
        user_id=user_id,
        item_count=5
    )
    
    # Verify inventory items created
    inventory_before = await get_inventory_items(user_id)
    assert len(inventory_before) == 5
    
    # Act
    success = await storage.delete_invoice(invoice_id, user_id)
    
    # Assert
    assert success is True
    
    # Verify cascade delete
    invoice_after = await get_invoice(invoice_id)
    assert invoice_after is None, "Invoice not deleted"
    
    inventory_after = await get_inventory_items(user_id)
    assert len(inventory_after) == 0, "Inventory items not deleted"
```

---

## PYTEST FIXTURES

```python
# conftest.py

import pytest
from httpx import AsyncClient
from fastapi import FastAPI
from database.supabase_client import get_supabase_service_client

@pytest.fixture
async def client(app: FastAPI):
    """HTTP client for API tests"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def supabase():
    """Supabase service client"""
    return get_supabase_service_client()

@pytest.fixture
async def test_user_free():
    """Create test user with free tier"""
    user_id = await create_test_user(tier="free")
    yield user_id
    await cleanup_test_user(user_id)

@pytest.fixture
async def test_user_premium():
    """Create test user with premium tier"""
    user_id = await create_test_user(tier="premium")
    yield user_id
    await cleanup_test_user(user_id)

@pytest.fixture
async def test_invoice_pdf():
    """Sample invoice PDF for testing"""
    return "tests/fixtures/sample_invoice.pdf"

@pytest.fixture
async def test_menu_pdf():
    """Sample menu PDF for testing"""
    return "tests/fixtures/sample_menu.pdf"
```

---

## RUNNING TESTS

```bash
# Run all tests
pytest

# Run specific module
pytest tests/unit/test_auth_service.py

# Run with coverage
pytest --cov=api --cov=services --cov-report=html

# Run only high priority tests
pytest -m high_priority

# Run security tests
pytest tests/security/

# Run with verbose output
pytest -v

# Run in parallel
pytest -n auto
```

---

## TEST MARKERS

```python
# pytest.ini

[pytest]
markers =
    high_priority: High priority test cases
    medium_priority: Medium priority test cases
    low_priority: Low priority test cases
    security: Security-focused tests
    performance: Performance benchmark tests
    integration: Integration tests
    e2e: End-to-end tests
    slow: Slow-running tests (> 5s)
```

---

## COVERAGE GOALS

- **Overall:** > 80%
- **Critical Flows:** 100%
- **Security:** 100%
- **Error Handling:** 100%
- **Business Logic:** > 90%
