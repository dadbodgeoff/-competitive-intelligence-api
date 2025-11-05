# BACKEND TEST CHECKLIST - COMPLETE

**Purpose:** Master checklist for backend test suite implementation  
**Date:** November 3, 2025  
**Status:** Ready for implementation

---

## MODULE 1: AUTHENTICATION & AUTHORIZATION (15 tests)

### Registration Flow
- [ ] TC-AUTH-001: Valid registration creates user + profile
- [ ] TC-AUTH-002: Duplicate email returns 400
- [ ] TC-AUTH-003: Invalid email format returns 422
- [ ] TC-AUTH-004: Weak password rejected
- [ ] TC-AUTH-005: Cookies set correctly (httpOnly, secure)

### Login Flow
- [ ] TC-AUTH-006: Valid login returns JWT + cookies
- [ ] TC-AUTH-007: Invalid credentials return 401
- [ ] TC-AUTH-008: Subscription tier fetched correctly
- [ ] TC-AUTH-009: Refresh token works before expiry

### Authorization
- [ ] TC-AUTH-010: Protected endpoints reject unauthenticated requests
- [ ] TC-AUTH-011: Expired tokens rejected
- [ ] TC-AUTH-012: Token refresh updates access token
- [ ] TC-AUTH-013: Logout clears cookies

### RLS Security
- [ ] TC-AUTH-014: Users cannot access other users' data
- [ ] TC-AUTH-015: Service client bypasses RLS for ownership checks

---

## MODULE 2: INVOICE PROCESSING (25 tests)

### Upload & Parsing
- [ ] TC-INV-001: Valid PDF uploads successfully
- [ ] TC-INV-002: File size limit enforced (10MB)
- [ ] TC-INV-003: Invalid file type rejected
- [ ] TC-INV-004: Streaming response sends chunks
- [ ] TC-INV-005: Parsing progress events sent
- [ ] TC-INV-006: Line items extracted correctly
- [ ] TC-INV-007: Vendor name detected
- [ ] TC-INV-008: Invoice totals calculated correctly

### Fuzzy Matching
- [ ] TC-INV-009: Fuzzy matching links items to inventory
- [ ] TC-INV-010: High similarity auto-matches
- [ ] TC-INV-011: Medium similarity requires review
- [ ] TC-INV-012: Low similarity creates new item

### Unit Conversion
- [ ] TC-INV-013: Pack sizes parsed correctly (6/5 LB)
- [ ] TC-INV-014: Unit conversions applied (oz → lb)
- [ ] TC-INV-015: Unit cost calculated from pack

### Storage
- [ ] TC-INV-016: Invoice saved atomically (header + items)
- [ ] TC-INV-017: Inventory items created from line items
- [ ] TC-INV-018: Price tracking data stored
- [ ] TC-INV-019: Duplicate detection works

### Retrieval & Management
- [ ] TC-INV-020: User can retrieve invoice history
- [ ] TC-INV-021: Pagination works correctly
- [ ] TC-INV-022: Filters work (vendor, status)
- [ ] TC-INV-023: Delete cascades to inventory
- [ ] TC-INV-024: RLS prevents cross-user access

### Validation
- [ ] TC-INV-025: Required fields enforced

---

## MODULE 3: MENU MANAGEMENT (20 tests)

### Upload & Parsing
- [ ] TC-MENU-001: Valid PDF uploads successfully
- [ ] TC-MENU-002: Streaming response sends chunks
- [ ] TC-MENU-003: Menu items extracted correctly
- [ ] TC-MENU-004: Prices extracted correctly
- [ ] TC-MENU-005: Categories detected

### Storage
- [ ] TC-MENU-006: Menu saved atomically (header + categories + items + prices)
- [ ] TC-MENU-007: Active menu flag set correctly
- [ ] TC-MENU-008: Previous menu archived

### Recipe Management
- [ ] TC-MENU-009: Ingredients can be linked to menu items
- [ ] TC-MENU-010: COGS calculated correctly
- [ ] TC-MENU-011: Unit conversions applied to recipes
- [ ] TC-MENU-012: Pack sizes used for cost calculation

### Retrieval & Management
- [ ] TC-MENU-013: User can retrieve active menu
- [ ] TC-MENU-014: User can list menu history
- [ ] TC-MENU-015: Pagination works correctly
- [ ] TC-MENU-016: Menu can be archived (soft delete)
- [ ] TC-MENU-017: RLS prevents cross-user access

### Validation
- [ ] TC-MENU-018: Required fields enforced
- [ ] TC-MENU-019: Price validation works
- [ ] TC-MENU-020: Category validation works

---

## MODULE 4: MENU COMPARISON (18 tests)

### Competitor Discovery
- [ ] TC-COMP-001: Google Places API finds competitors
- [ ] TC-COMP-002: Top 5 competitors returned
- [ ] TC-COMP-003: User's restaurant excluded from results
- [ ] TC-COMP-004: Distance calculated correctly
- [ ] TC-COMP-005: Auto-selection picks top 2 by reviews + rating

### Menu Parsing
- [ ] TC-COMP-006: Competitor menus parsed
- [ ] TC-COMP-007: Menu items extracted
- [ ] TC-COMP-008: Prices extracted

### LLM Comparison
- [ ] TC-COMP-009: LLM generates pricing insights
- [ ] TC-COMP-010: Price differences calculated
- [ ] TC-COMP-011: Missing items identified
- [ ] TC-COMP-012: Opportunities identified

### Storage & Retrieval
- [ ] TC-COMP-013: Comparison can be saved
- [ ] TC-COMP-014: User can retrieve saved comparisons
- [ ] TC-COMP-015: Pagination works correctly
- [ ] TC-COMP-016: Comparison can be archived
- [ ] TC-COMP-017: Delete cascades correctly
- [ ] TC-COMP-018: RLS prevents cross-user access

---

## MODULE 5: REVIEW ANALYSIS (22 tests)

### Tier Routing
- [ ] TC-ANAL-001: Free tier routes to free service
- [ ] TC-ANAL-002: Premium tier routes to premium service
- [ ] TC-ANAL-003: Free tier blocked from premium features
- [ ] TC-ANAL-004: Tier limits enforced (3 vs 5 competitors)

### Competitor Discovery
- [ ] TC-ANAL-005: Competitors discovered via Outscraper
- [ ] TC-ANAL-006: Reviews collected (50 free, 150 premium)
- [ ] TC-ANAL-007: Reviews cached in Redis
- [ ] TC-ANAL-008: Cache invalidation works

### LLM Analysis
- [ ] TC-ANAL-009: Free tier generates 4 insights
- [ ] TC-ANAL-010: Premium tier generates 25 insights (5 per competitor)
- [ ] TC-ANAL-011: Insights have confidence scores
- [ ] TC-ANAL-012: Evidence reviews stored (premium only)

### Storage & Retrieval
- [ ] TC-ANAL-013: Analysis saved atomically
- [ ] TC-ANAL-014: Competitors stored
- [ ] TC-ANAL-015: Reviews stored
- [ ] TC-ANAL-016: Insights stored
- [ ] TC-ANAL-017: User can retrieve analysis results
- [ ] TC-ANAL-018: User can list analysis history
- [ ] TC-ANAL-019: RLS prevents cross-user access

### Streaming
- [ ] TC-ANAL-020: Streaming analysis sends progress events
- [ ] TC-ANAL-021: Events received in correct order
- [ ] TC-ANAL-022: Error events handled

---

## CROSS-CUTTING CONCERNS (25 tests)

### Rate Limiting
- [ ] TC-RATE-001: Rate limit blocks excess requests
- [ ] TC-RATE-002: Free tier limits enforced (2 concurrent invoice)
- [ ] TC-RATE-003: Premium tier limits enforced (5 concurrent invoice)
- [ ] TC-RATE-004: Hourly limits reset correctly
- [ ] TC-RATE-005: Daily limits reset correctly
- [ ] TC-RATE-006: Weekly limits reset correctly

### Subscription Enforcement
- [ ] TC-SUB-001: Free tier blocked from premium features
- [ ] TC-SUB-002: Usage limits enforced atomically
- [ ] TC-SUB-003: No race conditions on concurrent requests
- [ ] TC-SUB-004: Monthly reset works correctly
- [ ] TC-SUB-005: Usage count accurate

### Error Sanitization
- [ ] TC-SEC-001: Production errors sanitized
- [ ] TC-SEC-002: No PII in error messages
- [ ] TC-SEC-003: No database details leaked
- [ ] TC-SEC-004: Stack traces hidden in production
- [ ] TC-SEC-005: Sensitive patterns blocked (password, secret, etc.)

### Ownership Validation
- [ ] TC-SEC-006: Users cannot access other users' invoices
- [ ] TC-SEC-007: Users cannot access other users' menus
- [ ] TC-SEC-008: Users cannot access other users' analyses
- [ ] TC-SEC-009: Unauthorized attempts logged
- [ ] TC-SEC-010: 403 returned (not 404) for unauthorized access

### RLS Policies
- [ ] TC-SEC-011: RLS enabled on all user tables
- [ ] TC-SEC-012: RLS prevents cross-user data access
- [ ] TC-SEC-013: Service client can bypass RLS
- [ ] TC-SEC-014: Regular client respects RLS
- [ ] TC-SEC-015: All 94 policies tested

---

## PERFORMANCE TESTS (15 tests)

### Response Times
- [ ] TC-PERF-001: Authentication < 500ms
- [ ] TC-PERF-002: Invoice parse 30-60s
- [ ] TC-PERF-003: Menu parse 20-40s
- [ ] TC-PERF-004: Free analysis 45-90s
- [ ] TC-PERF-005: Premium analysis 60-120s

### Throughput
- [ ] TC-PERF-006: 100+ concurrent users supported
- [ ] TC-PERF-007: Database queries < 100ms
- [ ] TC-PERF-008: LLM calls 10-30s

### Streaming
- [ ] TC-PERF-009: SSE events sent within 1s
- [ ] TC-PERF-010: Progress updates every 10s
- [ ] TC-PERF-011: No memory leaks on long streams

### Concurrency
- [ ] TC-PERF-012: Concurrent invoice parses work
- [ ] TC-PERF-013: Concurrent analyses work
- [ ] TC-PERF-014: No database deadlocks
- [ ] TC-PERF-015: Atomic operations prevent race conditions

---

## SUMMARY

**Total Test Cases:** 140

### By Priority
- **HIGH:** 85 tests (Modules 1, 2, 3, 5 + Security)
- **MEDIUM:** 35 tests (Module 4 + Performance)
- **LOW:** 20 tests (Edge cases)

### By Type
- **Unit Tests:** 50 tests
- **Integration Tests:** 40 tests
- **E2E Tests:** 25 tests
- **Security Tests:** 15 tests
- **Performance Tests:** 10 tests

### Estimated Effort
- **Unit Tests:** 25 hours
- **Integration Tests:** 30 hours
- **E2E Tests:** 20 hours
- **Security Tests:** 15 hours
- **Performance Tests:** 10 hours

**Total:** ~100 hours (~2.5 weeks for 1 developer)

---

## IMPLEMENTATION ORDER

### Phase 1: Foundation (Week 1)
1. Set up test infrastructure (pytest, fixtures, mocks)
2. Implement authentication tests (TC-AUTH-001 to TC-AUTH-015)
3. Implement RLS security tests (TC-SEC-011 to TC-SEC-015)
4. Implement error sanitization tests (TC-SEC-001 to TC-SEC-005)

### Phase 2: Core Modules (Week 2)
1. Implement invoice processing tests (TC-INV-001 to TC-INV-025)
2. Implement menu management tests (TC-MENU-001 to TC-MENU-020)
3. Implement ownership validation tests (TC-SEC-006 to TC-SEC-010)

### Phase 3: Advanced Features (Week 3)
1. Implement review analysis tests (TC-ANAL-001 to TC-ANAL-022)
2. Implement menu comparison tests (TC-COMP-001 to TC-COMP-018)
3. Implement rate limiting tests (TC-RATE-001 to TC-RATE-006)
4. Implement subscription tests (TC-SUB-001 to TC-SUB-005)

### Phase 4: Performance & Polish (Week 4)
1. Implement performance tests (TC-PERF-001 to TC-PERF-015)
2. Achieve 80%+ code coverage
3. Document all test cases
4. Create CI/CD pipeline integration

---

## SUCCESS CRITERIA

- [ ] All 140 test cases implemented
- [ ] 80%+ code coverage achieved
- [ ] All critical flows tested (100% coverage)
- [ ] All security tests passing
- [ ] All performance benchmarks met
- [ ] CI/CD pipeline integrated
- [ ] Test documentation complete

---

## TOOLS & SETUP

```bash
# Install dependencies
pip install pytest pytest-asyncio httpx faker freezegun pytest-mock pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=api --cov=services --cov-report=html

# Run specific module
pytest tests/unit/test_auth_service.py

# Run by priority
pytest -m high_priority
```

---

## NEXT STEPS

1. ✅ Review this checklist
2. ⏳ Set up test infrastructure
3. ⏳ Implement Phase 1 tests
4. ⏳ Implement Phase 2 tests
5. ⏳ Implement Phase 3 tests
6. ⏳ Implement Phase 4 tests
7. ⏳ Achieve coverage goals
8. ⏳ Integrate with CI/CD
