# BACKEND TEST AGENT - MISSION BRIEFING

**Project:** Production Backend Test Suite Development  
**Agent Role:** Backend Test Engineer  
**Timeline:** 4 weeks  
**Parallel Work:** Frontend agent working simultaneously  
**Status:** Ready to begin

---

## 🎯 MISSION OBJECTIVE

Develop a **production-grade pytest test suite** covering all 5 backend modules with 80%+ code coverage. Tests must validate API endpoints, services, database operations, security policies, and performance benchmarks.

### Success Criteria
- ✅ All 140 test cases implemented and passing
- ✅ 80%+ code coverage (100% for critical flows)
- ✅ All security tests passing (RLS, IDOR, error sanitization)
- ✅ Performance benchmarks met
- ✅ Zero blocking issues for production deployment

---

## 📋 PRE-WORK: MANDATORY READING

### Phase 1: Understand the Mission (30 minutes)

**READ IN THIS ORDER:**

1. **`tests/BACKEND_AUDIT_SUMMARY.md`** (15 min)
   - Complete backend audit
   - All 5 modules analyzed
   - Critical flows identified
   - Security implementations documented

2. **`tests/production/COORDINATION_GUIDE.md`** (10 min)
   - How you coordinate with frontend agent
   - API contract requirements
   - Shared test data structure
   - Communication protocol

3. **`tests/BACKEND_TEST_CHECKLIST.md`** (5 min)
   - All 140 test cases listed
   - Priority levels assigned
   - Module breakdown

### Phase 2: Review Test Templates (30 minutes)

**STUDY THESE PATTERNS:**

`tests/TEST_CASE_TEMPLATES.md` contains:
- Authentication test template
- RLS policy test template
- Streaming test template
- Rate limiting test template
- Fuzzy matching test template
- Unit conversion test template
- Error sanitization test template
- Subscription enforcement test template
- Atomic operation test template
- Cascade delete test template


### Phase 3: Audit Backend Code (60 minutes)

**AUDIT BY MODULE:**

**Module 1 - Authentication (15 tests):**
```
api/routes/auth.py
api/middleware/auth.py
database/rls_policies_only.sql (94 policies)
```

**Module 2 - Invoice Processing (25 tests):**
```
api/routes/invoices/parsing.py
services/invoice_parser_streaming.py
services/invoice_storage_service.py
services/fuzzy_matching/fuzzy_item_matcher.py
services/unit_converter.py
services/invoice_duplicate_detector.py
```

**Module 3 - Menu Management (20 tests):**
```
api/routes/menu/parsing.py
api/routes/menu/management.py
services/menu_parser_streaming.py
services/menu_recipe_service.py
services/menu_storage_service.py
```

**Module 4 - Menu Comparison (18 tests):**
```
api/routes/menu_comparison.py
services/menu_comparison_orchestrator.py
services/competitor_discovery_service.py
services/menu_comparison_llm.py
```

**Module 5 - Review Analysis (22 tests):**
```
api/routes/tier_analysis.py
services/analysis_service_orchestrator.py
services/real_free_tier_llm_service.py
services/premium_tier_llm_service.py
services/outscraper_service.py
```

**Cross-Cutting (25 tests):**
```
api/middleware/rate_limiting.py
api/middleware/subscription.py
services/error_sanitizer.py
services/ownership_validator.py
```

**Document your findings:**
- API endpoint signatures
- Service dependencies
- Database tables used
- External API calls
- Error handling patterns
- Security implementations


---

## 📊 DELIVERABLES CHECKLIST

### Week 1: Foundation & Module 1 (15 tests)
- [ ] pytest configuration complete (`pytest.ini`)
- [ ] Test fixtures created (`conftest.py`)
- [ ] Shared test data created (`shared/test-data/users.json`)
- [ ] API contracts documented (`shared/api-contract-tests/`)
- [ ] Module 1: Auth tests complete (15/15 passing)
- [ ] Security: RLS tests complete (5/5 passing)
- [ ] **Deliverable:** Auth + Security tests passing

### Week 2: Core Modules (45 tests)
- [ ] Module 2: Invoice tests complete (25/25 passing)
- [ ] Module 3: Menu tests complete (20/20 passing)
- [ ] Sample files added to shared directory
- [ ] Integration tests for invoice workflow
- [ ] Integration tests for menu workflow
- [ ] **Deliverable:** Invoice + Menu tests passing

### Week 3: Advanced Features (40 tests)
- [ ] Module 4: Menu Comparison tests complete (18/18 passing)
- [ ] Module 5: Review Analysis tests complete (22/22 passing)
- [ ] E2E tests for complete workflows
- [ ] Cross-cutting: Rate limiting tests (6/6 passing)
- [ ] Cross-cutting: Subscription tests (5/5 passing)
- [ ] **Deliverable:** All module tests passing

### Week 4: Performance & Production Ready (15 tests)
- [ ] Performance tests complete (15/15 passing)
- [ ] Cross-cutting: Error sanitization tests (5/5 passing)
- [ ] Cross-cutting: Ownership validation tests (4/4 passing)
- [ ] 80%+ code coverage achieved
- [ ] All flaky tests fixed
- [ ] Documentation complete
- [ ] **Deliverable:** Production-ready test suite


---

## 🎯 QUALITY STANDARDS

### Code Quality
- **Test Naming:** `test_<module>_<action>_<expected_result>`
- **DRY Principle:** Reuse fixtures, no duplicate code
- **Type Hints:** All functions properly typed
- **Docstrings:** Complex tests documented
- **Assertions:** Descriptive messages for debugging

### Test Reliability
- **No Flakiness:** 98%+ pass rate required
- **Proper Async:** Use `pytest-asyncio` correctly
- **Database Isolation:** Each test independent
- **Cleanup:** Always cleanup test data
- **Deterministic:** No random failures

### Performance
- **Fast Tests:** Unit tests < 1s, integration < 5s
- **Parallel Safe:** Tests support parallel execution
- **Efficient Queries:** No N+1 queries in tests
- **Mock External APIs:** Don't hit real APIs in tests

### Security
- **RLS Validation:** Every user table tested
- **IDOR Prevention:** Cross-user access blocked
- **Error Sanitization:** No PII in error messages
- **Auth Required:** Protected endpoints tested

### Coverage
- **Overall:** 80%+ code coverage
- **Critical Flows:** 100% coverage
- **Security:** 100% coverage
- **Error Handling:** 100% coverage


---

## 🚨 CRITICAL REQUIREMENTS

### MUST DO
1. **Document API Contracts:** Every endpoint in `shared/api-contract-tests/`
2. **Create Shared Test Data:** Test users in `shared/test-data/users.json`
3. **Test RLS Policies:** All 94 policies validated
4. **Test Security:** IDOR, error sanitization, auth
5. **Test Atomicity:** Race conditions prevented
6. **Test Streaming:** SSE events properly tested
7. **Mock External APIs:** Gemini, Google Places, Outscraper

### MUST NOT DO
1. **No Real API Calls:** Mock all external services
2. **No Hardcoded IDs:** Use fixtures and generators
3. **No Skipped Tests:** Fix or remove, never skip
4. **No Print Statements:** Use proper logging
5. **No Commented Code:** Delete unused code
6. **No Database Pollution:** Always cleanup
7. **No Flaky Tests:** Fix immediately

---

## 📞 COORDINATION PROTOCOL

### Daily Sync (5 minutes)
**At end of each day, document:**

```markdown
## Day X - [Date]
### Completed
- Module 1: Auth tests (15/15 passing)
- Created API contracts for auth endpoints

### Blocked
- None

### API Contracts Added
- shared/api-contract-tests/auth-endpoints.ts

### Test Data Added
- shared/test-data/users.json (2 test users)
```

### API Contract Documentation
**For each endpoint, document:**

```typescript
// shared/api-contract-tests/auth-endpoints.ts
export const AUTH_CONTRACTS = {
  register: {
    method: 'POST',
    path: '/api/v1/auth/register',
    request: {
      email: 'string',
      password: 'string',
      first_name: 'string?',
      last_name: 'string?'
    },
    response: {
      user: {
        id: 'uuid',
        email: 'string',
        subscription_tier: 'free|premium|enterprise'
      }
    },
    cookies: ['access_token', 'refresh_token'],
    status_codes: {
      success: 200,
      validation_error: 422,
      duplicate: 400
    }
  }
}
```

### Test Data Coordination
**Create in `shared/test-data/users.json`:**

```json
{
  "free_tier_user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "free@test.com",
    "password": "TestPass123!",
    "subscription_tier": "free"
  },
  "premium_tier_user": {
    "id": "00000000-0000-0000-0000-000000000002",
    "email": "premium@test.com",
    "password": "TestPass123!",
    "subscription_tier": "premium"
  }
}
```


---

## 🛠️ DEVELOPMENT WORKFLOW

### Daily Workflow
```bash
# 1. Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 2. Run tests in watch mode (during development)
pytest --watch

# 3. Run specific module
pytest unit/test_auth_service.py

# 4. Run with coverage
pytest --cov=../../api --cov=../../services --cov-report=html

# 5. Run specific test
pytest unit/test_auth_service.py::test_jwt_token_generation -v

# 6. Run all tests before commit
pytest

# 7. Check coverage report
open ../reports/backend-coverage/index.html
```

### Git Workflow
```bash
# After completing each module
git add tests/production/backend/unit/test_module_*.py
git commit -m "feat(tests): Complete Module X tests (Y/Y passing)"

# After completing each week
git add tests/production/backend/
git add tests/production/shared/
git commit -m "feat(tests): Week X complete - [Summary]"
git push
```

---

## 📈 PROGRESS TRACKING

### Week 1 Progress (15 tests)
```
Day 1: [ ] Setup + Audit (2 hours)
Day 2: [ ] pytest config + fixtures (4 hours)
Day 3: [ ] Auth: Registration tests (3 hours)
Day 4: [ ] Auth: Login + Token tests (3 hours)
Day 5: [ ] Security: RLS tests (4 hours)
```

### Week 2 Progress (45 tests)
```
Day 6:  [ ] Invoice: Upload + Parse tests (4 hours)
Day 7:  [ ] Invoice: Fuzzy matching tests (4 hours)
Day 8:  [ ] Invoice: Unit conversion tests (3 hours)
Day 9:  [ ] Invoice: Storage + Retrieval tests (4 hours)
Day 10: [ ] Menu: Upload + Parse tests (4 hours)
Day 11: [ ] Menu: Storage + Recipe tests (4 hours)
```

### Week 3 Progress (40 tests)
```
Day 12: [ ] Menu Comparison: Discovery tests (4 hours)
Day 13: [ ] Menu Comparison: LLM tests (4 hours)
Day 14: [ ] Analysis: Tier routing tests (4 hours)
Day 15: [ ] Analysis: LLM tests (4 hours)
Day 16: [ ] Analysis: Storage tests (3 hours)
Day 17: [ ] Rate limiting tests (4 hours)
```

### Week 4 Progress (15 tests)
```
Day 18: [ ] Performance: Concurrency tests (4 hours)
Day 19: [ ] Error sanitization tests (3 hours)
Day 20: [ ] Ownership validation tests (3 hours)
Day 21: [ ] Coverage optimization (4 hours)
Day 22: [ ] Documentation + polish (4 hours)
```


---

## 🎓 BEST PRACTICES

### Test Structure (AAA Pattern)
```python
@pytest.mark.asyncio
async def test_user_registration_creates_profile():
    """Test that registration creates both user and profile records."""
    # ARRANGE: Set up test data
    user_data = {
        "email": f"test{uuid.uuid4()}@example.com",
        "password": "SecurePass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    # ACT: Perform the action
    response = await client.post("/api/v1/auth/register", json=user_data)
    
    # ASSERT: Verify expected outcomes
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == user_data["email"]
    assert data["user"]["subscription_tier"] == "free"
    assert "access_token" in response.cookies
    
    # CLEANUP: Remove test data
    await cleanup_test_user(data["user"]["id"])
```

### Fixture Pattern
```python
# conftest.py
@pytest.fixture
async def test_user_free():
    """Create a free tier test user."""
    user_id = await create_test_user(tier="free")
    yield user_id
    await cleanup_test_user(user_id)

@pytest.fixture
async def authenticated_client(test_user_free):
    """HTTP client with authentication."""
    token = await get_auth_token(test_user_free)
    client = AsyncClient(
        app=app,
        base_url="http://test",
        headers={"Authorization": f"Bearer {token}"}
    )
    yield client
    await client.aclose()
```

### Mocking External APIs
```python
@pytest.mark.asyncio
async def test_invoice_parse_calls_gemini(mocker):
    """Test that invoice parsing calls Gemini API."""
    # Mock Gemini API
    mock_gemini = mocker.patch('services.invoice_parser_service.genai.GenerativeModel')
    mock_gemini.return_value.generate_content.return_value.text = json.dumps({
        "vendor_name": "Sysco",
        "line_items": [...]
    })
    
    # Call service
    result = await parser_service.parse_invoice(file_url="test.pdf")
    
    # Verify mock was called
    assert mock_gemini.called
    assert result['invoice_data']['vendor_name'] == "Sysco"
```

### RLS Testing Pattern
```python
@pytest.mark.asyncio
async def test_rls_prevents_cross_user_invoice_access():
    """Test that RLS prevents users from accessing other users' invoices."""
    # Create User A and their invoice
    user_a_id = await create_test_user()
    invoice_a_id = await create_test_invoice(user_a_id)
    
    # Create User B
    user_b_id = await create_test_user()
    
    # User B tries to access User A's invoice
    supabase = get_supabase_client()
    # Set auth context to User B
    result = supabase.table("invoices").select("*").eq(
        "id", invoice_a_id
    ).execute()
    
    # RLS should return empty result
    assert len(result.data) == 0, "RLS failed: User B can see User A's invoice"
```


---

## 🚀 GETTING STARTED

### Step 1: Complete Pre-Work (2 hours)
- [ ] Read all mandatory documents
- [ ] Review test templates
- [ ] Audit backend code
- [ ] Document findings

### Step 2: Environment Setup (30 minutes)
```bash
cd tests/production/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Create requirements.txt
cat > requirements.txt << EOF
pytest==8.0.0
pytest-asyncio==0.23.0
pytest-cov==4.1.0
pytest-mock==3.12.0
httpx==0.26.0
faker==22.0.0
freezegun==1.4.0
EOF

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Create pytest Configuration (30 minutes)
```bash
# Create pytest.ini
cat > pytest.ini << EOF
[pytest]
testpaths = .
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
markers =
    high_priority: High priority test cases
    security: Security-focused tests
    performance: Performance benchmark tests
EOF
```

### Step 4: Create Test Fixtures (1 hour)
```bash
# Create conftest.py with shared fixtures
touch conftest.py

# Add fixtures for:
# - Test users (free, premium, enterprise)
# - Authenticated clients
# - Database cleanup
# - Mock external APIs
```

### Step 5: Create Shared Test Data (30 minutes)
```bash
cd ../shared/test-data

# Create users.json
cat > users.json << EOF
{
  "free_tier_user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "free@test.com",
    "password": "TestPass123!",
    "subscription_tier": "free"
  },
  "premium_tier_user": {
    "id": "00000000-0000-0000-0000-000000000002",
    "email": "premium@test.com",
    "password": "TestPass123!",
    "subscription_tier": "premium"
  }
}
EOF
```

### Step 6: Start Module 1 (Day 3-5)
```bash
cd ../../backend/unit

# Create test file
touch test_auth_service.py

# Start implementing tests
# (Use templates from TEST_CASE_TEMPLATES.md)
```


---

## 📚 REFERENCE DOCUMENTS

### Primary References
- **Audit Summary:** `tests/BACKEND_AUDIT_SUMMARY.md`
- **Test Checklist:** `tests/BACKEND_TEST_CHECKLIST.md`
- **Test Templates:** `tests/TEST_CASE_TEMPLATES.md`
- **Coordination:** `tests/production/COORDINATION_GUIDE.md`

### Module-Specific References
- **Module 1 (Auth):** RLS policies in `database/rls_policies_only.sql`
- **Module 2 (Invoice):** Fuzzy matching in `services/fuzzy_matching/`
- **Module 3 (Menu):** Recipe service in `services/menu_recipe_service.py`
- **Module 4 (Comparison):** Orchestrator in `services/menu_comparison_orchestrator.py`
- **Module 5 (Analysis):** Tier services in `services/*_tier_llm_service.py`

### Frontend Coordination
- **Frontend Plan:** `tests/FRONTEND_TEST_OUTLINE_COMPLETE.md` (for API understanding)
- **API Contracts:** `tests/production/shared/api-contract-tests/` (you create these)

---

## ✅ DEFINITION OF DONE

### For Each Test File
- [ ] All tests passing (100%)
- [ ] No flaky tests (98%+ pass rate over 10 runs)
- [ ] Proper fixtures used
- [ ] External APIs mocked
- [ ] Database cleanup implemented
- [ ] Code coverage measured
- [ ] Committed to git

### For Each Module
- [ ] All test cases complete
- [ ] API contracts documented
- [ ] Integration tests added
- [ ] Security tests passing
- [ ] Coverage goals met

### For Each Week
- [ ] All deliverables complete
- [ ] Daily sync notes documented
- [ ] Progress tracker updated
- [ ] Blockers resolved or escalated
- [ ] Code quality standards met

### For Final Delivery
- [ ] All 140 tests complete
- [ ] 80%+ code coverage achieved
- [ ] 100% critical flow coverage
- [ ] All security tests passing
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] CI/CD pipeline working
- [ ] Coordination with frontend complete
- [ ] Production ready


---

## 🎯 TEST CASE BREAKDOWN

### Module 1: Authentication & Authorization (15 tests)
```
TC-AUTH-001: Valid registration creates user + profile
TC-AUTH-002: Duplicate email returns 400
TC-AUTH-003: Invalid email format returns 422
TC-AUTH-004: Weak password rejected
TC-AUTH-005: Cookies set correctly (httpOnly, secure)
TC-AUTH-006: Valid login returns JWT + cookies
TC-AUTH-007: Invalid credentials return 401
TC-AUTH-008: Subscription tier fetched correctly
TC-AUTH-009: Refresh token works before expiry
TC-AUTH-010: Protected endpoints reject unauthenticated requests
TC-AUTH-011: Expired tokens rejected
TC-AUTH-012: Token refresh updates access token
TC-AUTH-013: Logout clears cookies
TC-AUTH-014: Users cannot access other users' data (RLS)
TC-AUTH-015: Service client bypasses RLS for ownership checks
```

### Module 2: Invoice Processing (25 tests)
```
TC-INV-001: Valid PDF uploads successfully
TC-INV-002: File size limit enforced (10MB)
TC-INV-003: Invalid file type rejected
TC-INV-004: Streaming response sends chunks
TC-INV-005: Parsing progress events sent
TC-INV-006: Line items extracted correctly
TC-INV-007: Vendor name detected
TC-INV-008: Invoice totals calculated correctly
TC-INV-009: Fuzzy matching links items to inventory
TC-INV-010: High similarity auto-matches
TC-INV-011: Medium similarity requires review
TC-INV-012: Low similarity creates new item
TC-INV-013: Pack sizes parsed correctly (6/5 LB)
TC-INV-014: Unit conversions applied (oz → lb)
TC-INV-015: Unit cost calculated from pack
TC-INV-016: Invoice saved atomically (header + items)
TC-INV-017: Inventory items created from line items
TC-INV-018: Price tracking data stored
TC-INV-019: Duplicate detection works
TC-INV-020: User can retrieve invoice history
TC-INV-021: Pagination works correctly
TC-INV-022: Filters work (vendor, status)
TC-INV-023: Delete cascades to inventory
TC-INV-024: RLS prevents cross-user access
TC-INV-025: Required fields enforced
```

### Module 3: Menu Management (20 tests)
```
TC-MENU-001 to TC-MENU-020
(See BACKEND_TEST_CHECKLIST.md for complete list)
```

### Module 4: Menu Comparison (18 tests)
```
TC-COMP-001 to TC-COMP-018
(See BACKEND_TEST_CHECKLIST.md for complete list)
```

### Module 5: Review Analysis (22 tests)
```
TC-ANAL-001 to TC-ANAL-022
(See BACKEND_TEST_CHECKLIST.md for complete list)
```

### Cross-Cutting Concerns (25 tests)
```
TC-RATE-001 to TC-RATE-006: Rate limiting
TC-SUB-001 to TC-SUB-005: Subscription enforcement
TC-SEC-001 to TC-SEC-015: Security (RLS, IDOR, errors)
```

### Performance Tests (15 tests)
```
TC-PERF-001 to TC-PERF-015
(See BACKEND_TEST_CHECKLIST.md for complete list)
```


---

## 🎯 YOUR MISSION STARTS NOW

You have everything you need:
- ✅ Complete audit of all 5 modules
- ✅ 140 test cases defined
- ✅ Code templates for every pattern
- ✅ Clear quality standards
- ✅ Coordination protocol
- ✅ Progress tracking system

**Expected Outcome:** Production-grade backend test suite in 4 weeks

**Your First Task:** Complete pre-work (2 hours), then begin Week 1 Day 1

**Remember:** 
- High standards (80%+ coverage, 100% critical flows)
- Clear communication (daily sync with frontend agent)
- Reliable tests (98%+ pass rate, no flakiness)
- Security first (RLS, IDOR, error sanitization)

---

## 📞 QUESTIONS?

- **Implementation questions:** Check `BACKEND_AUDIT_SUMMARY.md`
- **Test patterns:** Check `TEST_CASE_TEMPLATES.md`
- **Test list:** Check `BACKEND_TEST_CHECKLIST.md`
- **Coordination questions:** Check `COORDINATION_GUIDE.md`
- **Stuck on something:** Document in daily sync

---

## 🔥 CRITICAL SUCCESS FACTORS

### Week 1: Foundation is Everything
- Proper pytest configuration
- Reusable fixtures
- Shared test data created
- API contracts documented
- First module (Auth) 100% passing

### Week 2: Momentum Matters
- Two major modules complete
- Integration tests working
- No flaky tests
- Coverage tracking active

### Week 3: Advanced Features
- Complex modules complete
- E2E tests working
- Cross-cutting concerns tested
- Performance baseline established

### Week 4: Production Ready
- All tests passing
- Coverage goals met
- Documentation complete
- CI/CD integrated
- Zero blockers

---

**Good luck! Build something production-worthy.** 🚀
