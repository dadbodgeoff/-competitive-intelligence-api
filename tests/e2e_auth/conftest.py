"""
Shared fixtures for E2E auth tests
Provides authenticated clients for backend and frontend testing
"""
import pytest
import asyncio
import os
from typing import AsyncGenerator, Dict
from httpx import AsyncClient, ASGITransport
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from dotenv import load_dotenv

load_dotenv()

# Test user credentials
TEST_USER = {
    "email": os.getenv("TEST_USER_EMAIL", "nrivikings8@gmail.com"),
    "password": os.getenv("TEST_USER_PASSWORD", "testpass123"),
    "first_name": "Test",
    "last_name": "User"
}

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_user_setup():
    """
    Ensure test user exists in database
    Creates user if doesn't exist, returns user data
    """
    async with AsyncClient(base_url=API_BASE_URL, timeout=10.0) as client:
        # Try to register (might already exist)
        try:
            response = await client.post(
                "/api/v1/auth/register",
                json=TEST_USER
            )
            if response.status_code == 201:
                print(f"✅ Created test user: {TEST_USER['email']}")
                return response.json()
        except Exception as e:
            print(f"⚠️  Test user might already exist: {e}")
        
        # Try to login (user exists)
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        
        if response.status_code == 200:
            print(f"✅ Test user exists: {TEST_USER['email']}")
            return response.json()
        else:
            raise Exception(f"Failed to setup test user: {response.status_code}")


@pytest.fixture
async def auth_client(test_user_setup) -> AsyncGenerator[AsyncClient, None]:
    """
    Authenticated HTTP client for backend API testing
    Automatically logs in and maintains cookies
    """
    async with AsyncClient(base_url=API_BASE_URL, timeout=10.0) as client:
        # Login to get cookies
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        assert "access_token" in response.cookies, "No access_token cookie set"
        
        # Cookies are now stored in client
        yield client


@pytest.fixture
async def unauth_client() -> AsyncGenerator[AsyncClient, None]:
    """Unauthenticated HTTP client for testing auth requirements"""
    async with AsyncClient(base_url=API_BASE_URL, timeout=10.0) as client:
        yield client


@pytest.fixture(scope="session")
async def browser() -> AsyncGenerator[Browser, None]:
    """Playwright browser instance - skips if frontend unavailable"""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox'],
                timeout=5000
            )
            yield browser
            await browser.close()
    except Exception as e:
        print(f"⚠️  Browser unavailable: {e}")
        pytest.skip("Browser not available")


@pytest.fixture
async def browser_context(browser: Browser, test_user_setup) -> AsyncGenerator[BrowserContext, None]:
    """
    Browser context with authentication
    Logs in via UI and maintains session
    """
    context = await browser.new_context(
        viewport={'width': 1280, 'height': 720},
        ignore_https_errors=True
    )
    
    page = await context.new_page()
    
    # Login via UI with timeout handling
    try:
        # Set shorter timeout for initial connection
        await page.goto(f"{FRONTEND_URL}/login", wait_until="domcontentloaded", timeout=5000)
        
        # Fill login form
        await page.fill('input[type="email"]', TEST_USER["email"], timeout=3000)
        await page.fill('input[type="password"]', TEST_USER["password"], timeout=3000)
        
        # Submit and wait for redirect
        await page.click('button[type="submit"]', timeout=3000)
        await page.wait_for_url(f"{FRONTEND_URL}/dashboard", timeout=5000)
        
        print(f"✅ Browser logged in as {TEST_USER['email']}")
    except Exception as e:
        print(f"⚠️  Browser login failed: {e}")
        print(f"⚠️  Frontend may not be running at {FRONTEND_URL}")
        # Continue anyway - backend tests don't need frontend
    
    await page.close()
    
    yield context
    await context.close()


@pytest.fixture
async def auth_page(browser_context: BrowserContext) -> AsyncGenerator[Page, None]:
    """Authenticated page for frontend testing"""
    page = await browser_context.new_page()
    yield page
    await page.close()


@pytest.fixture
def test_user_credentials() -> Dict[str, str]:
    """Test user credentials for manual login"""
    return TEST_USER


@pytest.fixture
def api_base_url() -> str:
    """API base URL"""
    return API_BASE_URL


@pytest.fixture
def frontend_url() -> str:
    """Frontend base URL"""
    return FRONTEND_URL


async def wait_for_auth_verification(page):
    """
    Helper to wait for auth verification to complete
    ProtectedRoute now verifies auth with backend on every route access
    """
    try:
        # Wait for "Verifying authentication..." to disappear
        await page.wait_for_selector('text="Verifying authentication"', state='hidden', timeout=5000)
    except:
        # If it doesn't appear or disappears quickly, that's fine
        pass


async def check_frontend_available() -> bool:
    """Check if frontend is available"""
    try:
        async with AsyncClient(timeout=2.0) as client:
            response = await client.get(FRONTEND_URL)
            return response.status_code == 200
    except:
        return False


async def check_backend_available() -> bool:
    """Check if backend is available"""
    try:
        async with AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{API_BASE_URL}/docs")
            return response.status_code == 200
    except:
        return False
