# PRODUCTION TEST SUITE

**Purpose:** Complete test suite for production deployment  
**Structure:** Separated backend and frontend tests for parallel development

---

## Directory Structure

```
tests/production/
├── README.md                          # This file
├── pytest.ini                         # Backend test configuration
├── jest.config.js                     # Frontend test configuration
├── run_all_tests.sh                   # Run both backend + frontend
├── run_backend_tests.sh               # Run backend only
├── run_frontend_tests.sh              # Run frontend only
│
├── backend/                           # Backend tests (Python/pytest)
│   ├── __init__.py
│   ├── conftest.py                    # Shared fixtures
│   ├── requirements.txt               # Test dependencies
│   │
│   ├── unit/                          # Unit tests
│   │   ├── __init__.py
│   │   ├── test_auth_service.py
│   │   ├── test_invoice_parser.py
│   │   ├── test_fuzzy_matching.py
│   │   ├── test_unit_converter.py
│   │   └── test_error_sanitizer.py
│   │
│   ├── integration/                   # Integration tests
│   │   ├── __init__.py
│   │   ├── test_invoice_workflow.py
│   │   ├── test_menu_workflow.py
│   │   ├── test_analysis_workflow.py
│   │   └── test_menu_comparison_workflow.py
│   │
│   ├── e2e/                          # End-to-end tests
│   │   ├── __init__.py
│   │   ├── test_invoice_e2e.py
│   │   ├── test_menu_e2e.py
│   │   ├── test_analysis_e2e.py
│   │   └── test_menu_comparison_e2e.py
│   │
│   ├── security/                     # Security tests
│   │   ├── __init__.py
│   │   ├── test_rls_policies.py
│   │   ├── test_auth_security.py
│   │   ├── test_idor_prevention.py
│   │   └── test_error_sanitization.py
│   │
│   ├── performance/                  # Performance tests
│   │   ├── __init__.py
│   │   ├── test_rate_limiting.py
│   │   ├── test_concurrent_operations.py
│   │   └── test_streaming_performance.py
│   │
│   └── fixtures/                     # Test data
│       ├── sample_invoice.pdf
│       ├── sample_menu.pdf
│       └── mock_responses.json
│
├── frontend/                          # Frontend tests (TypeScript/Jest/Playwright)
│   ├── package.json                   # Frontend test dependencies
│   ├── tsconfig.json                  # TypeScript config
│   │
│   ├── unit/                          # Component unit tests
│   │   ├── auth/
│   │   │   ├── LoginForm.test.tsx
│   │   │   └── RegisterForm.test.tsx
│   │   ├── invoice/
│   │   │   ├── InvoiceUpload.test.tsx
│   │   │   └── InvoiceReviewTable.test.tsx
│   │   └── analysis/
│   │       ├── ReviewAnalysisForm.test.tsx
│   │       └── InsightsGrid.test.tsx
│   │
│   ├── integration/                   # Integration tests
│   │   ├── invoice-workflow.test.tsx
│   │   ├── menu-workflow.test.tsx
│   │   └── analysis-workflow.test.tsx
│   │
│   ├── e2e/                          # End-to-end tests (Playwright)
│   │   ├── auth.spec.ts
│   │   ├── invoice.spec.ts
│   │   ├── menu.spec.ts
│   │   └── analysis.spec.ts
│   │
│   └── fixtures/                     # Test data
│       ├── mock-api-responses.ts
│       └── test-files/
│
├── shared/                            # Shared test utilities
│   ├── api-contract-tests/           # API contract validation
│   │   ├── auth-endpoints.test.ts
│   │   ├── invoice-endpoints.test.ts
│   │   └── analysis-endpoints.test.ts
│   │
│   └── test-data/                    # Shared test data
│       ├── users.json
│       └── sample-files/
│
└── reports/                          # Test reports (gitignored)
    ├── backend-coverage/
    ├── frontend-coverage/
    └── combined-report.html
```

---

## Running Tests

### All Tests (Backend + Frontend)
```bash
cd tests/production
./run_all_tests.sh
```

### Backend Only
```bash
cd tests/production
./run_backend_tests.sh

# Or directly with pytest
cd tests/production/backend
pytest
```

### Frontend Only
```bash
cd tests/production
./run_frontend_tests.sh

# Or directly with npm
cd tests/production/frontend
npm test
```

---

## Coordination Points

### 1. API Contract Tests (Shared)
Both teams should validate the same API contracts:
- Request/response schemas
- Status codes
- Error formats
- Authentication headers

**Location:** `tests/production/shared/api-contract-tests/`

### 2. Test Data (Shared)
Use consistent test data across both suites:
- User accounts (same IDs, emails)
- Sample files (same PDFs)
- Mock responses (same structure)

**Location:** `tests/production/shared/test-data/`

### 3. Environment Variables
Both suites need access to:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `API_BASE_URL`

**Solution:** Use `.env.test` file in `tests/production/`

---

## Dependencies

### Backend (Python)
```txt
pytest==8.0.0
pytest-asyncio==0.23.0
pytest-cov==4.1.0
pytest-mock==3.12.0
httpx==0.26.0
faker==22.0.0
freezegun==1.4.0
```

### Frontend (TypeScript)
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0",
    "msw": "^2.0.0"
  }
}
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Production Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: cd tests/production && ./run_backend_tests.sh

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd tests/production && ./run_frontend_tests.sh

  combined-report:
    needs: [backend-tests, frontend-tests]
    runs-on: ubuntu-latest
    steps:
      - run: echo "All tests passed!"
```

---

## Coverage Goals

- **Backend:** > 80% code coverage
- **Frontend:** > 75% code coverage
- **Critical Flows:** 100% coverage (both)
- **Security:** 100% coverage (both)

---

## Next Steps

1. ✅ Create directory structure
2. ⏳ Backend agent: Implement backend tests
3. ⏳ Frontend agent: Implement frontend tests
4. ⏳ Both: Coordinate on API contract tests
5. ⏳ Both: Share test data in `shared/`
6. ⏳ Integrate with CI/CD
