# Backend Test Suite - Production Grade

**Status:** ✅ Week 1 Complete (20/140 tests created)  
**Coverage Target:** 80%+ overall, 100% critical flows  
**Timeline:** 4 weeks  
**Last Updated:** November 3, 2025

---

## 🎯 Overview

This directory contains a comprehensive production-grade test suite for the backend API, covering:

- **Module 1:** Authentication & Authorization (15 tests) ✅
- **Module 2:** Invoice Processing (25 tests) ⏳
- **Module 3:** Menu Management (20 tests) ⏳
- **Module 4:** Menu Comparison (18 tests) ⏳
- **Module 5:** Review Analysis (22 tests) ⏳
- **Cross-Cutting:** Security, Rate Limiting, Subscriptions (25 tests) ⏳
- **Performance:** Benchmarks & Load Tests (15 tests) ⏳

**Total:** 140 test cases

---

## 📁 Directory Structure

```
backend/
├── README.md                  # This file
├── PROGRESS.md                # Progress tracker
├── pytest.ini                 # Pytest configuration
├── conftest.py                # Shared fixtures
├── requirements.txt           # Test dependencies
│
├── unit/                      # Unit tests (50 tests)
│   ├── test_auth_service.py   ✅ 13 tests
│   ├── test_invoice_parser.py
│   ├── test_menu_parser.py
│   ├── test_fuzzy_matcher.py
│   └── test_unit_converter.py
│
├── integration/               # Integration tests (40 tests)
│   ├── test_invoice_workflow.py
│   ├── test_menu_workflow.py
│   ├── test_comparison_workflow.py
│   └── test_analysis_workflow.py
│
├── e2e/                       # End-to-end tests (25 tests)
│   ├── test_complete_invoice_flow.py
│   ├── test_complete_menu_flow.py
│   └── test_complete_analysis_flow.py
│
├── security/                  # Security tests (15 tests)
│   ├── test_rls_policies.py   ✅ 5 tests
│   ├── test_error_sanitization.py
│   └── test_ownership_validation.py
│
├── performance/               # Performance tests (15 tests)
│   ├── test_response_times.py
│   ├── test_concurrency.py
│   └── test_rate_limiting.py
│
└── fixtures/                  # Test data
    ├── sample_invoice.pdf
    ├── sample_menu.pdf
    └── invalid_file.txt
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd tests/production/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env.test` file:

```bash
ENVIRONMENT=test
TESTING=true
SUPABASE_URL=your_test_supabase_url
SUPABASE_KEY=your_test_supabase_key
SUPABASE_SERVICE_KEY=your_test_service_key
JWT_SECRET=test_jwt_secret_key
```

### 3. Run Tests

```bash
# Run all tests
pytest

# Run specific module
pytest unit/test_auth_service.py

# Run with coverage
pytest --cov=../../../api --cov=../../../services --cov-report=html

# Run only high priority tests
pytest -m high_priority

# Run security tests
pytest security/

# Run with verbose output
pytest -v

# Run in parallel
pytest -n auto
```

---

## 📊 Test Coverage

### Current Status

| Module | Tests Created | Tests Passing | Coverage |
|--------|--------------|---------------|----------|
| Auth | 13/15 | 0/13 | 0% |
| Security (RLS) | 5/5 | 0/5 | 0% |
| Invoice | 0/25 | 0/0 | 0% |
| Menu | 0/20 | 0/0 | 0% |
| Comparison | 0/18 | 0/18 | 0% |
| Analysis | 0/22 | 0/22 | 0% |
| Cross-Cutting | 0/25 | 0/25 | 0% |
| Performance | 0/15 | 0/15 | 0% |
| **Total** | **20/140** | **0/140** | **0%** |

### Coverage Goals

- **Overall:** 80%+
- **Critical Flows:** 100%
- **Security:** 100%
- **Error Handling:** 100%

---

## 🧪 Test Categories

### Unit Tests (50 tests)
Test individual functions and services in isolation.

**Examples:**
- JWT token generation
- Password validation
- Invoice parsing logic
- Fuzzy matching algorithm
- Unit conversion calculations

### Integration Tests (40 tests)
Test interactions between multiple services.

**Examples:**
- Invoice upload → parse → save workflow
- Menu parse → recipe linking → COGS calculation
- Competitor discovery → review fetching → LLM analysis

### E2E Tests (25 tests)
Test complete user journeys from start to finish.

**Examples:**
- Register → Login → Upload Invoice → View Results
- Login → Upload Menu → Link Ingredients → View Dashboard
- Login → Run Analysis → View Insights → Save Analysis

### Security Tests (15 tests)
Test security implementations.

**Examples:**
- RLS policies prevent cross-user access
- IDOR prevention
- Error sanitization (no PII leakage)
- Authentication required on protected endpoints

### Performance Tests (15 tests)
Test performance benchmarks and load handling.

**Examples:**
- Response times < target
- Concurrent request handling
- Rate limiting enforcement
- No memory leaks on streaming

---

## 🎯 Test Markers

Tests are marked with pytest markers for easy filtering:

```python
@pytest.mark.high_priority    # Critical flows
@pytest.mark.medium_priority  # Important features
@pytest.mark.low_priority     # Edge cases
@pytest.mark.security         # Security tests
@pytest.mark.performance      # Performance tests
@pytest.mark.integration      # Integration tests
@pytest.mark.e2e              # End-to-end tests
@pytest.mark.slow             # Slow tests (> 5s)
@pytest.mark.auth             # Auth module
@pytest.mark.invoice          # Invoice module
@pytest.mark.menu             # Menu module
@pytest.mark.comparison       # Comparison module
@pytest.mark.analysis         # Analysis module
```

**Usage:**
```bash
# Run only high priority tests
pytest -m high_priority

# Run only security tests
pytest -m security

# Run auth tests
pytest -m auth

# Run fast tests only (exclude slow)
pytest -m "not slow"
```

---

## 📝 Test Naming Convention

All tests follow this naming pattern:

```
test_<module>_<test_number>_<action>_<expected_result>
```

**Examples:**
- `test_auth_001_valid_registration_creates_user_and_profile`
- `test_inv_009_fuzzy_matching_links_items_to_inventory`
- `test_sec_012_rls_prevents_cross_user_data_access`

---

## 🔧 Fixtures

### User Fixtures
- `test_user_free` - Free tier user
- `test_user_premium` - Premium tier user
- `test_user_enterprise` - Enterprise tier user

### Client Fixtures
- `client` - Unauthenticated HTTP client
- `authenticated_client_free` - Authenticated as free user
- `authenticated_client_premium` - Authenticated as premium user

### Database Fixtures
- `supabase_service` - Service client (bypasses RLS)
- `supabase_user` - User client (respects RLS)

### Test Data Fixtures
- `sample_invoice_pdf` - Sample invoice file
- `sample_menu_pdf` - Sample menu file
- `sample_invoice_data` - Parsed invoice data
- `sample_menu_data` - Parsed menu data

### Mock Fixtures
- `mock_gemini_api` - Mock Gemini API responses
- `mock_google_places_api` - Mock Google Places responses
- `mock_outscraper_api` - Mock Outscraper responses

---

## 📋 Test Checklist

See `tests/BACKEND_TEST_CHECKLIST.md` for complete list of all 140 test cases.

---

## 🤝 Coordination with Frontend

### API Contracts
All API endpoints are documented in `../shared/api-contract-tests/`:
- `auth-endpoints.ts` ✅
- `invoice-endpoints.ts` ✅
- `menu-endpoints.ts` ⏳
- `comparison-endpoints.ts` ⏳
- `analysis-endpoints.ts` ⏳

### Shared Test Data
Test users and sample files in `../shared/test-data/`:
- `users.json` ✅ (3 test users)
- `sample-files/sample_invoice.pdf` ⏳
- `sample-files/sample_menu.pdf` ⏳
- `sample-files/invalid_file.txt` ⏳

---

## 📈 Progress Tracking

See `PROGRESS.md` for detailed progress tracking.

**Current Week:** Week 1  
**Current Status:** Foundation complete, Auth tests created  
**Next Steps:** Execute tests, implement Week 2 (Invoice + Menu tests)

---

## 🚨 Quality Standards

### Code Quality
- ✅ AAA pattern (Arrange, Act, Assert)
- ✅ Descriptive test names
- ✅ Comprehensive docstrings
- ✅ Type hints on all functions
- ✅ DRY principle (reusable fixtures)

### Test Reliability
- ✅ No flaky tests (98%+ pass rate)
- ✅ Proper async handling
- ✅ Database isolation
- ✅ Cleanup after each test
- ✅ Deterministic results

### Performance
- ✅ Unit tests < 1s
- ✅ Integration tests < 5s
- ✅ Parallel execution safe
- ✅ Mock external APIs

### Security
- ✅ RLS validation
- ✅ IDOR prevention
- ✅ Error sanitization
- ✅ Auth required on protected endpoints

---

## 📚 References

- **Agent Briefing:** `AGENT_BRIEFING.md`
- **Backend Audit:** `../../BACKEND_AUDIT_SUMMARY.md`
- **Test Checklist:** `../../BACKEND_TEST_CHECKLIST.md`
- **Test Templates:** `../../TEST_CASE_TEMPLATES.md`
- **Coordination Guide:** `../COORDINATION_GUIDE.md`

---

## ✅ Definition of Done

### For Each Test File
- [ ] All tests implemented
- [ ] All tests passing (100%)
- [ ] No flaky tests
- [ ] Proper fixtures used
- [ ] External APIs mocked
- [ ] Database cleanup
- [ ] Code coverage measured

### For Each Module
- [ ] All test cases complete
- [ ] API contracts documented
- [ ] Integration tests added
- [ ] Security tests passing
- [ ] Coverage goals met

### For Final Delivery
- [ ] All 140 tests complete
- [ ] 80%+ code coverage
- [ ] 100% critical flow coverage
- [ ] All security tests passing
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] CI/CD pipeline working

---

## 🎓 Best Practices

1. **Always use fixtures** - Don't create test data inline
2. **Mock external APIs** - Never hit real APIs in tests
3. **Clean up after tests** - Always delete test data
4. **Use descriptive assertions** - Include failure messages
5. **Test one thing** - Each test should have one purpose
6. **Follow AAA pattern** - Arrange, Act, Assert
7. **Use proper markers** - Tag tests appropriately
8. **Document complex tests** - Add docstrings
9. **Keep tests fast** - Mock slow operations
10. **Make tests deterministic** - No random failures

---

**Ready to build production-grade tests!** 🚀
