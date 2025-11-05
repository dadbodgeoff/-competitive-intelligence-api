"""
Shared fixtures for module tests
Simple, clean setup for testing each module
"""
import pytest
import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_BASE = os.getenv("FRONTEND_URL", "http://localhost:5173")
TEST_EMAIL = os.getenv("TEST_USER_EMAIL", "nrivikings8@gmail.com")
TEST_PASSWORD = os.getenv("TEST_USER_PASSWORD", "testpass123")


@pytest.fixture(scope="session")
def api_base():
    """API base URL"""
    return API_BASE


@pytest.fixture(scope="session")
def frontend_base():
    """Frontend base URL"""
    return FRONTEND_BASE


@pytest.fixture(scope="session")
def auth_session():
    """
    Authenticated requests session with cookies
    Logs in once and reuses session for all tests
    """
    session = requests.Session()
    
    # Login to get auth cookies
    response = session.post(
        f"{API_BASE}/api/v1/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    assert response.status_code == 200, f"Login failed: {response.text}"
    assert "access_token" in response.cookies, "No access_token cookie"
    
    print(f"\n✅ Logged in as {TEST_EMAIL}")
    
    return session


@pytest.fixture
def unauth_session():
    """Unauthenticated session for testing auth requirements"""
    return requests.Session()


def check_backend_available():
    """Check if backend is running"""
    try:
        # Try health endpoint first
        response = requests.get(f"{API_BASE}/api/v1/health", timeout=2)
        if response.status_code == 200:
            return True
    except:
        pass
    
    # Fallback: try root endpoint
    try:
        response = requests.get(f"{API_BASE}/", timeout=2)
        return response.status_code == 200
    except:
        return False


def check_frontend_available():
    """Check if frontend is running"""
    try:
        response = requests.get(FRONTEND_BASE, timeout=2)
        return response.status_code == 200
    except:
        return False


@pytest.fixture(scope="session", autouse=True)
def check_services():
    """Check that services are running before tests"""
    backend_ok = check_backend_available()
    frontend_ok = check_frontend_available()
    
    if not backend_ok:
        pytest.exit(f"❌ Backend not available at {API_BASE}")
    
    if not frontend_ok:
        print(f"⚠️  Frontend not available at {FRONTEND_BASE} - frontend tests will be skipped")
    
    print(f"\n✅ Backend: {API_BASE}")
    print(f"{'✅' if frontend_ok else '⚠️ '} Frontend: {FRONTEND_BASE}")
