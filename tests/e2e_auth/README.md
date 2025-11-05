# 🔒 E2E Auth Test Suite

Complete end-to-end authentication testing for all modules.

## What It Tests

✅ **Cookie-based authentication** - No Bearer tokens  
✅ **All 5 modules** - Auth, Invoices, Menu, Price Analytics, Menu Comparison, Review Analysis  
✅ **Backend APIs** - All protected endpoints require auth  
✅ **Frontend UI** - All protected pages redirect when not authenticated  
✅ **Data ownership** - Users can only access their own data  

## Quick Start

### Run All Tests
```bash
# From project root
python tests/e2e_auth/test_runner.py

# Or with pytest directly
pytest tests/e2e_auth/ -v
```

### Run Specific Module
```bash
# Test just invoices
python tests/e2e_auth/test_runner.py invoices

# Or with pytest
pytest tests/e2e_auth/invoices/ -v
```

### Run Backend Tests Only
```bash
pytest tests/e2e_auth/ -m backend -v
```

### Run Frontend Tests Only
```bash
pytest tests/e2e_auth/ -m frontend -v
```

## Setup

### 1. Install Dependencies
```bash
# Python dependencies
pip install pytest pytest-asyncio httpx playwright pytest-html pytest-json-report

# Install Playwright browsers
playwright install
```

### 2. Configure Test User
Create or update `.env`:
```bash
TEST_USER_EMAIL=e2e_test@restaurantiq.com
TEST_USER_PASSWORD=E2ETest123!@#
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### 3. Start Servers
```bash
# Terminal 1: Backend
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 4. Run Tests
```bash
python tests/e2e_auth/test_runner.py
```

## Test Structure

```
tests/e2e_auth/
├── conftest.py                    # Shared fixtures
├── test_runner.py                 # Main orchestrator
├── auth/
│   ├── test_auth_backend.py      # Login, cookies, /me
│   └── test_auth_frontend.py     # Login UI, logout
├── invoices/
│   ├── test_invoices_backend.py  # Invoice API endpoints
│   └── test_invoices_frontend.py # Invoice pages
├── menu/
│   ├── test_menu_backend.py      # Menu API endpoints
│   └── test_menu_frontend.py     # Menu pages
├── price_analytics/
│   ├── test_analytics_backend.py # Analytics API endpoints
│   └── test_analytics_frontend.py# Analytics dashboard
├── menu_comparison/
│   ├── test_comparison_backend.py# Comparison API endpoints
│   └── test_comparison_frontend.py# Comparison pages
└── review_analysis/
    ├── test_analysis_backend.py  # Analysis API endpoints
    └── test_analysis_frontend.py # Analysis pages
```

## What Each Test Verifies

### Backend Tests
- ✅ Endpoint requires authentication (401 without cookies)
- ✅ Endpoint works with cookie authentication (200 with cookies)
- ✅ No Bearer tokens in responses
- ✅ Users can only access their own data

### Frontend Tests
- ✅ Protected pages load when authenticated
- ✅ Protected pages redirect to /login when not authenticated
- ✅ User info displays correctly
- ✅ Navigation works

## Integration with Startup

### Automatic Testing on Startup
```bash
# Run tests before starting server
python startup_with_tests.py
```

### Skip Tests
```bash
# Set environment variable
export RUN_AUTH_TESTS_ON_STARTUP=false
python startup_with_tests.py
```

## Reports

After running tests, check:
- `tests/e2e_auth/reports/report.html` - HTML report
- `tests/e2e_auth/reports/results.json` - JSON results

## Troubleshooting

### Tests Fail with "Connection Refused"
- Make sure backend is running on port 8000
- Make sure frontend is running on port 5173

### Browser Tests Fail
- Run `playwright install` to install browsers
- Check that frontend URL is correct in `.env`

### "Test user doesn't exist"
- Tests will create the user automatically
- Or create manually via /register endpoint

### Slow Tests
- Frontend tests are slower (browser automation)
- Run backend tests only for faster feedback: `pytest tests/e2e_auth/ -m backend`

## CI/CD Integration

### GitHub Actions
```yaml
name: E2E Auth Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: playwright install --with-deps
      - run: python tests/e2e_auth/test_runner.py
```

## Adding New Tests

### 1. Create Test File
```python
# tests/e2e_auth/my_module/test_my_module_backend.py
import pytest
from httpx import AsyncClient

@pytest.mark.e2e
@pytest.mark.backend
class TestMyModuleBackend:
    async def test_endpoint_requires_auth(self, unauth_client: AsyncClient):
        response = await unauth_client.get("/api/my-endpoint")
        assert response.status_code == 401
```

### 2. Run Your Test
```bash
pytest tests/e2e_auth/my_module/ -v
```

## Best Practices

1. **Test the happy path** - Focus on auth working correctly
2. **Test the sad path** - Verify 401 when not authenticated
3. **Keep tests fast** - Mock external services
4. **Use fixtures** - Reuse auth_client and auth_page
5. **Clear assertions** - Make failures obvious

## Support

Questions? Check:
- `conftest.py` for available fixtures
- Existing test files for examples
- `test_runner.py` for orchestration logic
