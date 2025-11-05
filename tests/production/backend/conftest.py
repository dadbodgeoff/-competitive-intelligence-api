"""
Shared pytest fixtures for backend test suite.

This module provides reusable fixtures for:
- Test users (free, premium, enterprise tiers)
- Authenticated HTTP clients
- Database connections
- Mock external APIs (Gemini, Google Places, Outscraper)
- Test data cleanup
"""

import pytest
import asyncio
import json
import uuid
from pathlib import Path
from typing import Dict, Any, Optional
from httpx import AsyncClient
from datetime import datetime, timedelta
import os
import sys

# Add project root to path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

# Import application
from api.main import app
from database.supabase_client import get_supabase_service_client, get_supabase_client


# ============================================================================
# CONFIGURATION
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_data_dir():
    """Path to shared test data directory."""
    return Path(__file__).parent.parent / "shared" / "test-data"


@pytest.fixture(scope="session")
def sample_files_dir(test_data_dir):
    """Path to sample files directory."""
    return test_data_dir / "sample-files"


# ============================================================================
# HTTP CLIENTS
# ============================================================================

@pytest.fixture
async def client():
    """Unauthenticated HTTP client for API tests."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
async def authenticated_client_free(test_user_free):
    """HTTP client authenticated as free tier user."""
    token = await get_auth_token(test_user_free["id"])
    async with AsyncClient(
        app=app,
        base_url="http://test",
        headers={"Authorization": f"Bearer {token}"}
    ) as client:
        yield client


@pytest.fixture
async def authenticated_client_premium(test_user_premium):
    """HTTP client authenticated as premium tier user."""
    token = await get_auth_token(test_user_premium["id"])
    async with AsyncClient(
        app=app,
        base_url="http://test",
        headers={"Authorization": f"Bearer {token}"}
    ) as client:
        yield client


# ============================================================================
# DATABASE CLIENTS
# ============================================================================

@pytest.fixture
def supabase_service():
    """Supabase service client (bypasses RLS)."""
    return get_supabase_service_client()


@pytest.fixture
def supabase_user(test_user_free):
    """Supabase client with user context (respects RLS)."""
    client = get_supabase_client()
    # Set auth context for RLS testing
    # Note: This would need to be implemented in your supabase_client module
    return client


# ============================================================================
# TEST USERS
# ============================================================================

@pytest.fixture
async def test_user_free(supabase_service):
    """Create a free tier test user."""
    user_data = {
        "id": str(uuid.uuid4()),
        "email": f"free-{uuid.uuid4()}@test.com",
        "subscription_tier": "free",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Create user in database
    result = supabase_service.table("users").insert(user_data).execute()
    user_id = result.data[0]["id"]
    
    yield {"id": user_id, **user_data}
    
    # Cleanup
    await cleanup_test_user(user_id, supabase_service)


@pytest.fixture
async def test_user_premium(supabase_service):
    """Create a premium tier test user."""
    user_data = {
        "id": str(uuid.uuid4()),
        "email": f"premium-{uuid.uuid4()}@test.com",
        "subscription_tier": "premium",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Create user in database
    result = supabase_service.table("users").insert(user_data).execute()
    user_id = result.data[0]["id"]
    
    yield {"id": user_id, **user_data}
    
    # Cleanup
    await cleanup_test_user(user_id, supabase_service)


@pytest.fixture
async def test_user_enterprise(supabase_service):
    """Create an enterprise tier test user."""
    user_data = {
        "id": str(uuid.uuid4()),
        "email": f"enterprise-{uuid.uuid4()}@test.com",
        "subscription_tier": "enterprise",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Create user in database
    result = supabase_service.table("users").insert(user_data).execute()
    user_id = result.data[0]["id"]
    
    yield {"id": user_id, **user_data}
    
    # Cleanup
    await cleanup_test_user(user_id, supabase_service)


# ============================================================================
# TEST DATA
# ============================================================================

@pytest.fixture
def sample_invoice_pdf(sample_files_dir):
    """Path to sample invoice PDF."""
    return sample_files_dir / "sample_invoice.pdf"


@pytest.fixture
def sample_menu_pdf(sample_files_dir):
    """Path to sample menu PDF."""
    return sample_files_dir / "sample_menu.pdf"


@pytest.fixture
def invalid_file(sample_files_dir):
    """Path to invalid file for error testing."""
    return sample_files_dir / "invalid_file.txt"


@pytest.fixture
def sample_invoice_data():
    """Sample parsed invoice data."""
    return {
        "vendor_name": "Sysco",
        "invoice_number": "INV-12345",
        "invoice_date": "2025-11-01",
        "total_amount": 1250.50,
        "line_items": [
            {
                "item_name": "Mozzarella Cheese, Shredded",
                "quantity": 6,
                "unit": "lb",
                "unit_price": 4.50,
                "extended_price": 27.00,
                "pack_size": "6/5 LB"
            },
            {
                "item_name": "Tomato Sauce",
                "quantity": 12,
                "unit": "can",
                "unit_price": 2.25,
                "extended_price": 27.00,
                "pack_size": "12/28 OZ"
            }
        ]
    }


@pytest.fixture
def sample_menu_data():
    """Sample parsed menu data."""
    return {
        "restaurant_name": "Test Restaurant",
        "categories": [
            {
                "name": "Pizza",
                "items": [
                    {
                        "name": "Margherita Pizza",
                        "description": "Fresh mozzarella, tomato sauce, basil",
                        "price": 12.99,
                        "sizes": ["Small", "Large"]
                    },
                    {
                        "name": "Pepperoni Pizza",
                        "description": "Pepperoni, mozzarella, tomato sauce",
                        "price": 14.99,
                        "sizes": ["Small", "Large"]
                    }
                ]
            }
        ]
    }


# ============================================================================
# MOCK EXTERNAL APIS
# ============================================================================

@pytest.fixture
def mock_gemini_api(mocker):
    """Mock Gemini API responses."""
    mock = mocker.patch('google.generativeai.GenerativeModel')
    
    def generate_content_side_effect(prompt):
        """Return mock response based on prompt content."""
        mock_response = mocker.Mock()
        
        if "invoice" in prompt.lower():
            mock_response.text = json.dumps({
                "vendor_name": "Sysco",
                "invoice_number": "INV-12345",
                "line_items": []
            })
        elif "menu" in prompt.lower():
            mock_response.text = json.dumps({
                "restaurant_name": "Test Restaurant",
                "categories": []
            })
        else:
            mock_response.text = json.dumps({"data": "mock response"})
        
        return mock_response
    
    mock.return_value.generate_content.side_effect = generate_content_side_effect
    return mock


@pytest.fixture
def mock_google_places_api(mocker):
    """Mock Google Places API responses."""
    mock = mocker.patch('googlemaps.Client')
    
    mock.return_value.places_nearby.return_value = {
        "results": [
            {
                "name": "Competitor Restaurant 1",
                "place_id": "place_1",
                "rating": 4.5,
                "user_ratings_total": 250,
                "geometry": {"location": {"lat": 42.0, "lng": -71.5}}
            },
            {
                "name": "Competitor Restaurant 2",
                "place_id": "place_2",
                "rating": 4.3,
                "user_ratings_total": 180,
                "geometry": {"location": {"lat": 42.1, "lng": -71.6}}
            }
        ]
    }
    
    return mock


@pytest.fixture
def mock_outscraper_api(mocker):
    """Mock Outscraper API responses."""
    mock = mocker.patch('outscraper.ApiClient')
    
    mock.return_value.google_maps_reviews.return_value = [
        {
            "name": "Test Restaurant",
            "reviews": [
                {
                    "author_title": "John Doe",
                    "review_text": "Great food and service!",
                    "review_rating": 5,
                    "review_datetime_utc": "2025-10-15"
                }
            ]
        }
    ]
    
    return mock


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def get_auth_token(user_id: str) -> str:
    """Generate JWT token for test user."""
    from api.middleware.auth import create_access_token
    
    token_data = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    
    return create_access_token(token_data)


async def cleanup_test_user(user_id: str, supabase_service):
    """Clean up test user and all related data."""
    try:
        # Delete user's data (cascades should handle related records)
        supabase_service.table("invoices").delete().eq("user_id", user_id).execute()
        supabase_service.table("restaurant_menus").delete().eq("user_id", user_id).execute()
        supabase_service.table("analyses").delete().eq("user_id", user_id).execute()
        supabase_service.table("users").delete().eq("id", user_id).execute()
    except Exception as e:
        print(f"Warning: Cleanup failed for user {user_id}: {e}")


async def create_test_invoice(user_id: str, supabase_service, invoice_data: Optional[Dict] = None):
    """Create a test invoice for a user."""
    if invoice_data is None:
        invoice_data = {
            "user_id": user_id,
            "vendor_name": "Test Vendor",
            "invoice_number": f"INV-{uuid.uuid4().hex[:8]}",
            "invoice_date": datetime.utcnow().date().isoformat(),
            "total_amount": 100.00,
            "status": "processed"
        }
    
    result = supabase_service.table("invoices").insert(invoice_data).execute()
    return result.data[0]["id"]


async def create_test_menu(user_id: str, supabase_service, menu_data: Optional[Dict] = None):
    """Create a test menu for a user."""
    if menu_data is None:
        menu_data = {
            "user_id": user_id,
            "restaurant_name": "Test Restaurant",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
    
    result = supabase_service.table("restaurant_menus").insert(menu_data).execute()
    return result.data[0]["id"]


# ============================================================================
# PYTEST HOOKS
# ============================================================================

def pytest_configure(config):
    """Configure pytest with custom settings."""
    # Set test environment
    os.environ["ENVIRONMENT"] = "test"
    os.environ["TESTING"] = "true"


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers automatically."""
    for item in items:
        # Add markers based on test file location
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        elif "e2e" in str(item.fspath):
            item.add_marker(pytest.mark.e2e)
        elif "security" in str(item.fspath):
            item.add_marker(pytest.mark.security)
        elif "performance" in str(item.fspath):
            item.add_marker(pytest.mark.performance)
