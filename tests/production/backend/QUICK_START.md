# Backend Tests - Quick Start Guide

**For:** Developers who want to run the backend test suite  
**Time:** 5 minutes to get started  
**Status:** Week 1 Complete (20 tests ready)

---

## 🚀 Quick Start (3 Commands)

```bash
# 1. Install dependencies
cd tests/production/backend
pip install -r requirements.txt

# 2. Configure environment (create .env.test - see below)

# 3. Run tests
pytest -v
```

---

## 📋 Environment Setup

Create `.env.test` in the project root:

```bash
# Test Environment Configuration
ENVIRONMENT=test
TESTING=true

# Supabase Test Instance
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_KEY=your-test-anon-key
SUPABASE_SERVICE_KEY=your-test-service-key

# JWT Configuration
JWT_SECRET=test-jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# External API Keys (for integration tests)
GEMINI_API_KEY=your-test-gemini-key
GOOGLE_PLACES_API_KEY=your-test-places-key
OUTSCRAPER_API_KEY=your-test-outscraper-key
```

---

## 🧪 Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Module
```bash
# Auth tests only
pytest unit/test_auth_service.py

# Security tests only
pytest security/

# All unit tests
pytest unit/
```

### Run by Priority
```bash
# High priority tests only
pytest -m high_priority

# Security tests only
pytest -m security

# Auth module tests
pytest -m auth
```

### Run with Coverage
```bash
# Generate coverage report
pytest --cov=../../../api --cov=../../../services --cov-report=html

# View report
# Open: htmlcov/index.html
```

### Run Specific Test
```bash
pytest unit/test_auth_service.py::test_auth_001_valid_registration_creates_user_and_profile -v
```

### Run in Parallel (faster)
```bash
pytest -n auto
```

---

## 📊 Current Test Status

### Available Tests (Week 1)
- ✅ **Authentication (13 tests)** - `unit/test_auth_service.py`
  - Registration (5 tests)
  - Login (4 tests)
  - Authorization (4 tests)

- ✅ **RLS Security (7 tests)** - `security/test_rls_policies.py`
  - Cross-user access prevention
  - Service client bypass
  - Policy validation

### Coming Soon (Week 2+)
- ⏳ Invoice Processing (25 tests)
- ⏳ Menu Management (20 tests)
- ⏳ Menu Comparison (18 tests)
- ⏳ Review Analysis (22 tests)
- ⏳ Performance (15 tests)

---

## 🔍 Understanding Test Output

### Successful Test
```
tests/production/backend/unit/test_auth_service.py::test_auth_001_valid_registration_creates_user_and_profile PASSED [100%]
```

### Failed Test
```
tests/production/backend/unit/test_auth_service.py::test_auth_002_duplicate_email_returns_400 FAILED [100%]

FAILED unit/test_auth_service.py::test_auth_002_duplicate_email_returns_400 - AssertionError: Expected 400, got 409
```

### Skipped Test
```
tests/production/backend/unit/test_auth_service.py::test_auth_003_invalid_email_format_returns_422 SKIPPED [100%]
```

---

## 🐛 Troubleshooting

### Import Errors
```
ModuleNotFoundError: No module named 'api'
```

**Solution:** Add project root to Python path
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)/../../.."  # Linux/Mac
set PYTHONPATH=%PYTHONPATH%;%cd%\..\..\..         # Windows
```

Or run from project root:
```bash
cd ../../../
pytest tests/production/backend/
```

### Database Connection Errors
```
Error: Could not connect to Supabase
```

**Solution:** Check `.env.test` configuration
- Verify SUPABASE_URL is correct
- Verify SUPABASE_KEY is valid
- Ensure test database is accessible

### Fixture Errors
```
fixture 'test_user_free' not found
```

**Solution:** Ensure `conftest.py` is in the correct location
- Should be in `tests/production/backend/conftest.py`
- Check that pytest can find it

### Async Errors
```
RuntimeError: Event loop is closed
```

**Solution:** Ensure pytest-asyncio is installed
```bash
pip install pytest-asyncio
```

---

## 📈 Coverage Reports

### Generate Coverage
```bash
pytest --cov=../../../api --cov=../../../services --cov-report=html
```

### View Coverage
Open `htmlcov/index.html` in browser

### Coverage Goals
- **Overall:** 80%+
- **Critical Flows:** 100%
- **Security:** 100%

---

## 🎯 Test Markers Reference

| Marker | Description | Usage |
|--------|-------------|-------|
| `high_priority` | Critical flows | `pytest -m high_priority` |
| `medium_priority` | Important features | `pytest -m medium_priority` |
| `low_priority` | Edge cases | `pytest -m low_priority` |
| `security` | Security tests | `pytest -m security` |
| `performance` | Performance tests | `pytest -m performance` |
| `integration` | Integration tests | `pytest -m integration` |
| `e2e` | End-to-end tests | `pytest -m e2e` |
| `slow` | Slow tests (>5s) | `pytest -m "not slow"` |
| `auth` | Auth module | `pytest -m auth` |
| `invoice` | Invoice module | `pytest -m invoice` |
| `menu` | Menu module | `pytest -m menu` |

---

## 📚 Additional Resources

### Documentation
- **Full README:** `README.md`
- **Progress Tracker:** `PROGRESS.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Verification Checklist:** `VERIFICATION_CHECKLIST.md`

### Test References
- **Test Checklist:** `../../BACKEND_TEST_CHECKLIST.md`
- **Test Templates:** `../../TEST_CASE_TEMPLATES.md`
- **Backend Audit:** `../../BACKEND_AUDIT_SUMMARY.md`

### Coordination
- **API Contracts:** `../shared/api-contract-tests/`
- **Test Data:** `../shared/test-data/`
- **Coordination Guide:** `../COORDINATION_GUIDE.md`

---

## 💡 Tips

### Speed Up Tests
```bash
# Run in parallel
pytest -n auto

# Run only fast tests
pytest -m "not slow"

# Run specific module
pytest unit/
```

### Debug Failing Tests
```bash
# Verbose output
pytest -v

# Show print statements
pytest -s

# Stop on first failure
pytest -x

# Show local variables on failure
pytest -l
```

### Watch Mode (during development)
```bash
# Install pytest-watch
pip install pytest-watch

# Run in watch mode
ptw
```

---

## 🎉 You're Ready!

Run your first test:
```bash
pytest unit/test_auth_service.py::test_auth_001_valid_registration_creates_user_and_profile -v
```

Expected output:
```
tests/production/backend/unit/test_auth_service.py::test_auth_001_valid_registration_creates_user_and_profile PASSED [100%]
```

---

**Need help?** Check `README.md` for comprehensive documentation.
