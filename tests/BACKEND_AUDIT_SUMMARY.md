# BACKEND AUDIT SUMMARY - QUICK REFERENCE

**Purpose:** Quick reference for backend test suite development  
**Date:** November 3, 2025

---

## CRITICAL FLOWS BY MODULE

### MODULE 1: AUTHENTICATION & AUTHORIZATION
**Files:** `api/routes/auth.py`, `api/middleware/auth.py`  
**Database:** `auth.users`, `public.users`, 94 RLS policies

**Critical Flows:**
1. **Registration** → `POST /auth/register` → Creates user + profile, sets cookies
2. **Login** → `POST /auth/login` → Validates credentials, fetches tier, sets cookies
3. **Token Refresh** → `POST /auth/refresh` → Refreshes access token from refresh token
4. **Logout** → `POST /auth/logout` → Clears cookies
5. **Get Profile** → `GET /auth/me` → Returns user profile with subscription tier

**Security:**
- JWT tokens (24h expiry)
- httpOnly cookies (XSS protection)
- Secure flag in production
- RLS policies on all user tables
- Error sanitization (no PII leakage)

**Test Priority:** HIGH (15 test cases)

---

### MODULE 2: INVOICE PROCESSING
**Files:** `api/routes/invoices/parsing.py`, `services/invoice_parser_streaming.py`  
**Database:** `invoices`, `invoice_items`, `inventory_items`

**Critical Flows:**
1. **Upload** → File upload to Supabase storage (10MB limit)
2. **Parse (Streaming)** → `GET /invoices/parse-stream` → SSE events, Gemini Flash
3. **Validate** → Post-processing, unit conversion, fuzzy matching
4. **Save** → `POST /invoices/save` → Atomic transaction (invoice + items + inventory)
5. **List** → `GET /invoices/list` → Paginated list with filters
6. **Delete (Cascade)** → `DELETE /invoices/{id}` → Deletes invoice + items + inventory

**Key Services:**
- `InvoiceParserService` → Gemini Flash parsing
- `InvoicePostProcessor` → Auto-corrections, unit conversion
- `FuzzyItemMatcher` → 3-stage matching (trigram → salient → advanced)
- `UnitConverter` → Pack size parsing, unit conversion
- `InvoiceDuplicateDetector` → Hash-based duplicate detection

**Test Priority:** HIGH (25 test cases)

---

### MODULE 3: MENU MANAGEMENT
**Files:** `api/routes/menu/parsing.py`, `services/menu_parser_streaming.py`  
**Database:** `restaurant_menus`, `menu_items`, `menu_item_prices`, `menu_item_ingredients`

**Critical Flows:**
1. **Upload** → File upload to Supabase storage
2. **Parse (Streaming)** → `GET /menu/parse-stream` → SSE events, Gemini Flash
3. **Save** → `POST /menu/save` → Atomic transaction (menu + categories + items + prices)
4. **Recipe Management** → Link ingredients, calculate COGS
5. **List** → `GET /menu/list` → Paginated list
6. **Delete** → `DELETE /menu/{id}` → Soft delete (archive)

**Key Services:**
- `MenuParserService` → Gemini Flash parsing
- `MenuRecipeService` → COGS calculation, ingredient linking
- `MenuStorageService` → Database operations

**Test Priority:** HIGH (20 test cases)

---

### MODULE 4: MENU COMPARISON
**Files:** `api/routes/menu_comparison.py`, `services/menu_comparison_orchestrator.py`  
**Database:** `competitor_menu_analyses`, `competitor_businesses`, `menu_comparison_insights`

**Critical Flows:**
1. **Discover** → `POST /menu-comparison/discover` → Google Places API, find 5 competitors
2. **Auto-Select** → Top 2 competitors by review count + rating
3. **Analyze (Streaming)** → `POST /menu-comparison/analyze/stream` → Parse competitor menus, LLM comparison
4. **Save** → `POST /menu-comparison/save` → Save comparison for later
5. **List Saved** → `GET /menu-comparison/saved` → Paginated list

**Key Services:**
- `CompetitorDiscoveryService` → Google Places API integration
- `CompetitorMenuParser` → Parse competitor menus
- `MenuComparisonLLM` → Gemini 2.0 Flash pricing analysis
- `MenuComparisonStorage` → Database operations

**Test Priority:** MEDIUM (18 test cases)

---

### MODULE 5: REVIEW ANALYSIS
**Files:** `api/routes/tier_analysis.py`, `services/analysis_service_orchestrator.py`  
**Database:** `analyses`, `competitors`, `reviews`, `insights`

**Critical Flows:**
1. **Run Analysis** → `POST /run` → Discover competitors, fetch reviews, LLM analysis
2. **Tier Routing** → Free (3 competitors, 4 insights) vs Premium (5 competitors, 25 insights)
3. **Streaming Analysis** → `POST /run/stream` → SSE events for progress
4. **Get Results** → `GET /{analysis_id}` → Fetch complete analysis
5. **List Analyses** → `GET /analyses` → User's analysis history

**Key Services:**
- `AnalysisServiceOrchestrator` → Routes to free/premium services
- `RealFreeTierLLMService` → Cost-optimized analysis ($0.11 target)
- `PremiumTierLLMService` → Strategic analysis ($0.35 target)
- `OutscraperService` → Review collection with caching
- `EnhancedAnalysisStorage` → Store insights + evidence

**Test Priority:** HIGH (22 test cases)

---

## CROSS-CUTTING CONCERNS

### Rate Limiting
**File:** `api/middleware/rate_limiting.py`

**Tier-Based Limits:**
```python
Free Tier:
- Invoice parse: 2 concurrent, 10/hour, 20/day
- Menu parse: 1 concurrent, 2/hour, 3/day
- Analysis: 1 concurrent, 2/hour, 2/week

Premium Tier:
- Invoice parse: 5 concurrent, 50/hour, 200/day
- Menu parse: 3 concurrent, 20/hour, 50/day
- Analysis: 3 concurrent, 20/hour, unlimited

Enterprise Tier:
- All unlimited
```

**Test Cases:**
- [ ] Rate limit blocks excess requests
- [ ] Tier limits enforced correctly
- [ ] Concurrent limits prevent overload
- [ ] Limits reset correctly (hourly/daily/weekly)

---

### Subscription Enforcement
**File:** `api/middleware/subscription.py`

**Usage Limits (Atomic):**
- Database function `check_operation_limit()` prevents race conditions
- Limits checked before operation
- Usage incremented atomically
- Monthly reset

**Test Cases:**
- [ ] Free tier blocked from premium features
- [ ] Usage limits enforced atomically
- [ ] No race conditions on concurrent requests
- [ ] Monthly reset works correctly

---

### Error Sanitization
**File:** `services/error_sanitizer.py`

**Security Rules:**
- Production: Generic messages only
- Development: Full error details
- Never expose: Passwords, secrets, database URLs, stack traces
- Always log: Full error server-side

**Test Cases:**
- [ ] Production errors sanitized
- [ ] No PII in error messages
- [ ] No database details leaked
- [ ] Stack traces hidden in production

---

### Ownership Validation
**File:** `services/ownership_validator.py`

**IDOR Prevention:**
- All resource access validates ownership
- Uses service client (bypasses RLS) for checks
- Logs unauthorized access attempts
- Returns 403 Forbidden (not 404)

**Test Cases:**
- [ ] Users cannot access other users' invoices
- [ ] Users cannot access other users' menus
- [ ] Users cannot access other users' analyses
- [ ] Unauthorized attempts logged

---

## DATABASE SECURITY

### RLS Policies
**File:** `database/rls_policies_only.sql`  
**Total Policies:** 94

**Key Tables with RLS:**
- `invoices`, `invoice_items` → user_id check
- `restaurant_menus`, `menu_items` → user_id check
- `analyses`, `insights` → user_id check
- `competitor_menu_analyses` → user_id check
- `inventory_items` → user_id check

**Test Cases:**
- [ ] RLS prevents cross-user data access
- [ ] Service client can bypass RLS (for ownership checks)
- [ ] Regular client respects RLS
- [ ] All user tables have RLS enabled

---

## STREAMING IMPLEMENTATIONS

### Server-Sent Events (SSE)
**Pattern:** All long-running operations use SSE

**Implementations:**
1. **Invoice Parsing** → `InvoiceParserStreaming`
   - Events: parsing_started, parsing_progress, parsed_data, validation_complete, error
   
2. **Menu Parsing** → `MenuParserStreaming`
   - Events: parsing_started, parsing_progress, parsed_data, validation_complete, error
   
3. **Review Analysis** → `StreamingOrchestrator`
   - Events: analysis_started, competitors_found, competitor_reviews, llm_analysis_started, insights_generated, analysis_complete, error
   
4. **Menu Comparison** → `MenuComparisonOrchestrator`
   - Events: competitors_selected, user_menu_loaded, parsing_competitor_menu, competitor_menu_parsed, llm_analysis_started, analysis_complete, error

**Test Cases:**
- [ ] SSE connection established
- [ ] Events received in correct order
- [ ] Progress updates sent
- [ ] Error events handled
- [ ] Connection closed on completion

---

## PERFORMANCE BENCHMARKS

### Expected Response Times
- **Authentication:** < 500ms
- **Invoice Parse:** 30-60s (streaming)
- **Menu Parse:** 20-40s (streaming)
- **Review Analysis:** 45-90s (free), 60-120s (premium)
- **Menu Comparison:** 40-80s (streaming)

### Throughput Targets
- **Concurrent Users:** 100+ (with rate limiting)
- **Database Queries:** < 100ms (indexed)
- **LLM Calls:** 10-30s (Gemini Flash)

---

## TEST DATA REQUIREMENTS

### User Accounts
- Free tier user (subscription_tier='free')
- Premium tier user (subscription_tier='premium')
- Enterprise tier user (subscription_tier='enterprise')

### Sample Data
- Valid invoice PDF (Sysco format)
- Valid menu PDF (restaurant menu)
- Test location (Woonsocket, RI)
- Test restaurant name (Park Ave Pizza)

### Mock Services
- Mock Gemini API responses
- Mock Google Places API responses
- Mock Outscraper API responses

---

## NEXT STEPS

1. **Review this audit** → Validate flows and test cases
2. **Prioritize test cases** → Start with HIGH priority
3. **Set up test fixtures** → Create test data and mocks
4. **Implement unit tests** → Test individual services
5. **Implement integration tests** → Test service interactions
6. **Implement E2E tests** → Test complete user journeys
7. **Implement security tests** → Test RLS, IDOR, error sanitization
8. **Implement performance tests** → Test rate limiting, concurrency

---

## ESTIMATED EFFORT

- **Unit Tests:** 40 hours (80 test cases)
- **Integration Tests:** 30 hours (40 test cases)
- **E2E Tests:** 20 hours (20 test cases)
- **Security Tests:** 15 hours (25 test cases)
- **Performance Tests:** 10 hours (15 test cases)

**Total:** ~115 hours (~3 weeks for 1 developer)

---

## TOOLS & FRAMEWORKS

- **pytest** → Test runner
- **pytest-asyncio** → Async test support
- **httpx** → HTTP client for API tests
- **faker** → Test data generation
- **freezegun** → Time mocking
- **pytest-mock** → Mocking support
- **pytest-cov** → Coverage reporting

---

## SUCCESS CRITERIA

- **Coverage:** > 80% code coverage
- **Security:** All RLS policies tested
- **Performance:** All benchmarks met
- **Reliability:** All critical flows tested
- **Documentation:** All test cases documented
