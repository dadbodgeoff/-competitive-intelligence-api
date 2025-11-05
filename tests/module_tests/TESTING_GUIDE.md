# Module Testing Guide

Simple, focused tests that verify each module works end-to-end.

## Quick Start

```bash
# Make sure backend and frontend are running
# Backend: python -m uvicorn api.main:app --reload --port 8000
# Frontend: cd frontend && npm run dev

# Run all module tests
python tests/module_tests/run_tests.py

# Or use pytest directly
python -m pytest tests/module_tests/ -v
```

## Run Specific Module

```bash
# Test invoices module
python tests/module_tests/run_tests.py invoices

# Test menus module
python tests/module_tests/run_tests.py menus

# Test menu comparison
python tests/module_tests/run_tests.py menu_comparison

# Test price analytics
python tests/module_tests/run_tests.py price_analytics

# Test review analysis
python tests/module_tests/run_tests.py review_analysis
```

## What Gets Tested

### For Each Module:

1. **Backend API Endpoints**
   - List/Get endpoints return 200
   - Create/Update endpoints exist
   - Auth is required (401 without login)

2. **Frontend Pages**
   - Main pages load (return 200)
   - Routes are accessible

3. **Core Workflows**
   - Main user flow works
   - Data is returned correctly

## Test Account

- Email: `nrivikings8@gmail.com`
- Password: `testpass123`

## Configuration

Tests use environment variables (or defaults):
- `API_BASE_URL` - Backend URL (default: http://localhost:8000)
- `FRONTEND_URL` - Frontend URL (default: http://localhost:5173)
- `TEST_USER_EMAIL` - Test user email
- `TEST_USER_PASSWORD` - Test user password

## Modules Tested

- ✅ **Invoices** - Upload, parse, list, view
- ✅ **Menus** - Upload, parse, list, view, recipes
- ✅ **Menu Comparison** - Discover, parse, compare, insights
- ✅ **Price Analytics** - Trends, vendor comparison, alerts
- ✅ **Review Analysis** - Start analysis, view results, insights

## Example Output

```
tests/module_tests/test_invoices.py::TestInvoiceModule::test_backend_list_invoices PASSED
✅ List invoices: 200

tests/module_tests/test_invoices.py::TestInvoiceModule::test_backend_list_requires_auth PASSED
✅ Auth required: 401

tests/module_tests/test_invoices.py::TestInvoiceModule::test_frontend_invoice_list_page PASSED
✅ Frontend /invoices page: 200
```

## Troubleshooting

**Backend not available:**
- Make sure backend is running on port 8000
- Check: `curl http://localhost:8000/api/v1/health`

**Frontend tests skipped:**
- Frontend tests are optional
- They'll be skipped if frontend isn't running
- Backend tests will still run

**Login fails:**
- Make sure test user exists in database
- Check credentials in conftest.py
- User is created automatically on first run

## Adding New Tests

1. Create `test_your_module.py` in `tests/module_tests/`
2. Follow the pattern from existing tests
3. Test backend endpoints, frontend pages, and core workflow
4. Run: `python -m pytest tests/module_tests/test_your_module.py -v`
