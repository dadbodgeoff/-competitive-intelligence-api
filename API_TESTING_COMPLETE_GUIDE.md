# Complete API Testing Guide

## Two Types of Tests

### 1. **Code Pattern Validation** (Static Analysis)
Checks your frontend code for correct API URL patterns.
- ✅ Runs WITHOUT backend
- ✅ Fast (< 1 second)
- ✅ Catches hardcoded URLs, missing prefixes, etc.

### 2. **Live Endpoint Testing** (Integration Test)
Tests actual API endpoints are accessible.
- ⚠️ Requires backend running
- ✅ Verifies endpoints exist
- ✅ Tests 12 critical endpoints across all modules

---

## Quick Commands

### Before Starting Docker (Code Patterns Only):
```bash
python verify_api_endpoints.py
```
**Use this to:** Check code is correct before starting containers

### After Starting Docker (Full Test):
```bash
python verify_api_endpoints_comprehensive.py
```
**Use this to:** Verify both code AND live endpoints

### Test While Docker is Running:
```bash
# Windows
docker-test-endpoints.bat

# Linux/Mac
chmod +x docker-test-endpoints.sh
./docker-test-endpoints.sh
```

---

## What Gets Tested

### Code Pattern Validation (38 checks):
- ✅ No hardcoded `localhost:8000`
- ✅ Correct `baseURL` patterns
- ✅ Proper `/api/` prefixes
- ✅ All 8 modules checked

### Live Endpoint Testing (12 endpoints):

**Health Checks:**
- GET `/health`
- GET `/api/v1/health`

**Authentication:**
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/register`

**Invoice Operations:**
- POST `/api/invoices/upload`
- GET `/api/invoices/`

**Menu Operations:**
- POST `/api/menu/upload`
- GET `/api/menu/current`

**Analytics:**
- GET `/api/analytics/items-list`
- GET `/api/v1/analytics/dashboard-summary`

**Usage Limits:**
- GET `/api/usage/summary`

**Analysis:**
- POST `/api/v1/analysis/run`

---

## Example Output

### ✅ All Tests Pass:
```
================================================================================
Comprehensive API Verification
Tests Code Patterns + Live Endpoints
================================================================================

PART 1: Code Pattern Validation
  ✓ Passed: 38
  ✗ Failed: 0

PART 2: Live Endpoint Testing
Testing against: http://localhost:8000

📦 Health Check
  ✓ Responds (200) GET /health
  ✓ Responds (200) GET /api/v1/health

📦 Authentication
  ✓ Responds (422) POST /api/v1/auth/login
  ✓ Responds (422) POST /api/v1/auth/register

... (all endpoints pass)

================================================================================
✅ ALL CHECKS PASSED - READY FOR PRODUCTION!
================================================================================
```

### ⚠️ Backend Not Running:
```
PART 2: Live Endpoint Testing
Testing against: http://localhost:8000

📦 Health Check
  ✗ Connection refused GET /health
  ✗ Connection refused GET /api/v1/health

================================================================================
⚠️  CODE PATTERNS OK - BACKEND NOT RUNNING (START DOCKER TO TEST ENDPOINTS)
================================================================================
```

### ❌ Code Issues Found:
```
Code Pattern Issues:
  frontend/src/hooks/useInvoiceParseStream.ts:92
    ❌ Hardcoded localhost URL: http://localhost:8000/api/invoices/parse

================================================================================
❌ CODE PATTERN ISSUES FOUND - FIX BEFORE DEPLOYING
================================================================================
```

---

## Understanding Status Codes

When testing live endpoints, you'll see various HTTP status codes:

- **200** - OK (endpoint works perfectly)
- **401** - Unauthorized (endpoint exists, needs auth) ✅ This is GOOD!
- **404** - Not Found (endpoint doesn't exist) ⚠️ Check route registration
- **422** - Validation Error (endpoint exists, needs valid data) ✅ This is GOOD!
- **500** - Server Error (endpoint broken) ❌ Fix backend code
- **Connection Refused** - Backend not running ⚠️ Start Docker first

**Note:** 401 and 422 are considered "passing" because they prove the endpoint exists and is registered correctly.

---

## Workflow

### Development Workflow:
```bash
# 1. Make code changes
# 2. Verify patterns
python verify_api_endpoints.py

# 3. Start Docker
docker-start.bat

# 4. Test live endpoints
docker-test-endpoints.bat

# 5. Develop with confidence!
```

### Pre-Deployment Checklist:
```bash
# 1. Code patterns
python verify_api_endpoints.py
# Must pass: 0 failures

# 2. Start containers
docker-compose up -d

# 3. Live endpoints
python verify_api_endpoints_comprehensive.py
# Must pass: All endpoints accessible

# 4. Deploy!
```

---

## CI/CD Integration

### GitHub Actions:
```yaml
name: API Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Verify Code Patterns
        run: python verify_api_endpoints.py
      
      - name: Start Docker
        run: docker-compose up -d
      
      - name: Wait for Backend
        run: sleep 10
      
      - name: Test Live Endpoints
        run: python verify_api_endpoints_comprehensive.py
```

---

## Troubleshooting

### "requests module not found"
```bash
pip install requests
```

### "All endpoints show 401"
This is normal! 401 means the endpoint exists but requires authentication. That's a passing test.

### "Some endpoints show 404"
Check your backend route registration in `api/main.py`. The endpoint might not be registered.

### "Connection refused"
Backend isn't running. Start Docker first:
```bash
docker-compose -f docker-compose.dev.yml up
```

---

## Files Reference

- `verify_api_endpoints.py` - Code pattern validation only (fast)
- `verify_api_endpoints_comprehensive.py` - Full test (code + live endpoints)
- `docker-test-endpoints.bat` - Windows test script
- `docker-test-endpoints.sh` - Linux/Mac test script
- `docker-start.bat` - Start Docker with verification

---

## Summary

**Before Docker:** Use `verify_api_endpoints.py` (fast, code only)
**After Docker:** Use `verify_api_endpoints_comprehensive.py` (full test)
**Automated:** Use `docker-start.bat` (verifies then starts)

This ensures your API endpoints are correct in code AND working in practice!
