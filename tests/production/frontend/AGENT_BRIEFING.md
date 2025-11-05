# FRONTEND TEST AGENT - MISSION BRIEFING

**Project:** Production E2E Test Suite Development  
**Agent Role:** Frontend Test Engineer  
**Timeline:** 4 weeks  
**Parallel Work:** Backend agent working simultaneously  
**Status:** Ready to begin

---

## 🎯 MISSION OBJECTIVE

Develop a **production-grade Playwright E2E test suite** covering all 5 critical user journeys with 95%+ coverage of user-facing functionality. Tests must be reliable, maintainable, and execute in under 21 minutes.

### Success Criteria
- ✅ All 5 user journeys fully tested
- ✅ 95%+ coverage of critical user flows
- ✅ < 2% flakiness rate
- ✅ < 21 minutes total execution time
- ✅ Zero blocking issues for production deployment

---

## 📋 PRE-WORK: MANDATORY READING

### Phase 1: Understand the Mission (30 minutes)

**READ IN THIS ORDER:**

1. **`tests/FRONTEND_TEST_OUTLINE_COMPLETE.md`** (15 min)
   - Your complete implementation plan
   - All 5 user journeys mapped out
   - Code examples for every test
   - Success criteria defined

2. **`tests/production/COORDINATION_GUIDE.md`** (10 min)
   - How you coordinate with backend agent
   - API contract requirements
   - Shared test data structure
   - Communication protocol

3. **`tests/FRONTEND_TEST_QUICK_REFERENCE.md`** (5 min)
   - Quick command reference
   - Copy-paste test patterns
   - Debugging help

### Phase 2: Audit Existing Tests (30 minutes)

**AUDIT THESE FILES:**

```
frontend/src/test/e2e/analysis-workflow.test.ts
frontend/src/components/auth/__tests__/LoginForm.test.tsx
```

**Questions to answer:**
- What testing patterns are already in use?
- What test utilities exist?
- What's the current test coverage?
- What gaps need to be filled?

### Phase 3: Audit Frontend Components (60 minutes)

**AUDIT BY JOURNEY:**

**Journey 1 - Authentication:**
```
frontend/src/pages/LandingPage.tsx
frontend/src/components/auth/RegisterForm.tsx
frontend/src/components/auth/LoginForm.tsx
frontend/src/stores/authStore.ts
```

**Journey 2 - Invoice:**
```
frontend/src/components/invoice/InvoiceUpload.tsx
frontend/src/components/invoice/InvoiceReviewTable.tsx
frontend/src/hooks/useInvoiceParseStream.ts
frontend/src/pages/InvoiceListPage.tsx
frontend/src/pages/InvoiceDetailPage.tsx
```

**Journey 3 - Menu:**
```
frontend/src/components/menu/MenuUpload.tsx
frontend/src/components/menu/MenuReviewTable.tsx
frontend/src/hooks/useMenuParseStream.ts
frontend/src/pages/MenuDashboard.tsx
```

**Journey 4 - Menu Comparison:**
```
frontend/src/pages/MenuComparisonPage.tsx
frontend/src/pages/CompetitorSelectionPage.tsx
frontend/src/pages/MenuComparisonResultsPage.tsx
```

**Journey 5 - Review Analysis:**
```
frontend/src/components/analysis/ReviewAnalysisForm.tsx
frontend/src/components/analysis/StreamingAnalysisResults.tsx
frontend/src/components/analysis/InsightsGrid.tsx
```

**Document your findings:**
- Component structure and props
- API endpoints called
- State management patterns
- Error handling approach
- Loading states
- User interactions

---

## 📊 DELIVERABLES CHECKLIST

### Week 1: Foundation & Journey 1
- [ ] Playwright configuration complete
- [ ] Test helpers created (auth, upload, forms, cleanup)
- [ ] Shared test data imported
- [ ] `01-onboarding.spec.ts` complete (100% passing)
- [ ] CI/CD pipeline configured
- [ ] **Deliverable:** Working auth tests + CI pipeline

### Week 2: Core Workflows (Journeys 2 & 3)
- [ ] Sample test files added to shared directory
- [ ] `02-invoice-workflow.spec.ts` complete (100% passing)
- [ ] `03-menu-workflow.spec.ts` complete (100% passing)
- [ ] API contracts validated
- [ ] **Deliverable:** Invoice + Menu tests passing

### Week 3: Advanced Features (Journeys 4 & 5)
- [ ] `04-comparison-workflow.spec.ts` complete (100% passing)
- [ ] `05-analysis-workflow.spec.ts` complete (100% passing)
- [ ] `06-error-handling.spec.ts` complete (100% passing)
- [ ] **Deliverable:** All journey tests passing

### Week 4: Polish & Production Ready
- [ ] `07-responsive.spec.ts` complete (100% passing)
- [ ] Flaky tests fixed (< 2% failure rate)
- [ ] Execution time optimized (< 21 minutes)
- [ ] Documentation complete
- [ ] **Deliverable:** Production-ready test suite

---

## 🎯 QUALITY STANDARDS

### Code Quality
- **Test Naming:** Clear, descriptive names following pattern: `test('user can [action] [expected result]')`
- **DRY Principle:** Reuse helpers, no duplicate code
- **Comments:** Only where logic is complex, code should be self-documenting
- **Error Messages:** Descriptive assertions that help debug failures

### Test Reliability
- **No Flakiness:** Tests must pass consistently (98%+ pass rate)
- **Proper Waits:** Use `waitFor` with appropriate timeouts, never `sleep()`
- **Isolation:** Each test independent, no shared state
- **Cleanup:** Always clean up test data after tests

### Performance
- **Parallel Execution:** Tests must support parallel execution
- **Efficient Selectors:** Use data-testid attributes, avoid fragile selectors
- **Minimal Setup:** Only set up what's needed for each test
- **Fast Feedback:** Critical tests run first

### Maintainability
- **Helper Functions:** Extract common patterns into helpers
- **Test Data:** Use shared test data from `shared/test-data/`
- **Documentation:** README in each directory explaining structure
- **Version Control:** Commit after each completed journey

---

## 🚨 CRITICAL REQUIREMENTS

### MUST DO
1. **Validate API Contracts:** Every API call must match backend contracts in `shared/api-contract-tests/`
2. **Use Shared Test Data:** Import test users from `shared/test-data/users.json`
3. **Test Real Flows:** No mocking of critical user journeys
4. **Handle Streaming:** Properly test SSE streaming for invoice, menu, and analysis
5. **Error Scenarios:** Test all error cases (network, validation, auth)

### MUST NOT DO
1. **No Hardcoded Data:** Use shared test data or generators
2. **No Sleep/Delays:** Use proper waits with timeouts
3. **No Skipped Tests:** Fix or remove, never skip
4. **No Console Logs:** Use proper logging or remove
5. **No Commented Code:** Delete unused code

---

## 📞 COORDINATION PROTOCOL

### Daily Sync (5 minutes)
**At end of each day, document:**
1. What was completed today
2. What's blocked or needs help
3. Any API changes discovered
4. Test data added/modified

**Format:**
```markdown
## Day X - [Date]
### Completed
- Journey 1: Auth tests (15/15 passing)
- Created auth helper utilities

### Blocked
- None

### API Changes
- None discovered

### Test Data Added
- Created shared/test-data/users.json
```

### API Contract Changes
**If you discover API doesn't match expectations:**
1. Document the mismatch in `shared/api-contract-tests/`
2. Note in daily sync
3. Continue with actual API behavior
4. Backend agent will update their tests

### Test Data Coordination
**When adding test data:**
1. Add to `shared/test-data/` directory
2. Update `shared/README.md`
3. Note in daily sync
4. Backend agent can now use same data

---

## 🛠️ DEVELOPMENT WORKFLOW

### Daily Workflow
```bash
# 1. Start development server
npm run dev

# 2. Run tests in watch mode (during development)
npm run test:e2e -- --headed --project=chromium

# 3. Run specific test file
npm run test:e2e -- tests/e2e/01-onboarding.spec.ts

# 4. Debug failing test
npm run test:e2e -- --debug tests/e2e/01-onboarding.spec.ts

# 5. Run full suite before commit
npm run test:e2e

# 6. Check coverage
npm run test:e2e -- --reporter=html
```

### Git Workflow
```bash
# After completing each journey
git add tests/production/frontend/e2e/0X-journey-name.spec.ts
git commit -m "feat(tests): Complete Journey X - [Name]"

# After completing each week
git add tests/production/frontend/
git commit -m "feat(tests): Week X complete - [Summary]"
git push
```

---

## 📈 PROGRESS TRACKING

### Week 1 Progress
```
Day 1: [ ] Setup + Audit (2 hours)
Day 2: [ ] Playwright config + Helpers (4 hours)
Day 3: [ ] Journey 1: Landing page tests (3 hours)
Day 4: [ ] Journey 1: Registration tests (3 hours)
Day 5: [ ] Journey 1: Login + Auth persistence (2 hours)
```

### Week 2 Progress
```
Day 6:  [ ] Journey 2: Upload + Streaming (4 hours)
Day 7:  [ ] Journey 2: Review table (3 hours)
Day 8:  [ ] Journey 2: Save + List (3 hours)
Day 9:  [ ] Journey 3: Menu upload + Streaming (4 hours)
Day 10: [ ] Journey 3: Menu review + Save (4 hours)
```

### Week 3 Progress
```
Day 11: [ ] Journey 4: Competitor discovery (3 hours)
Day 12: [ ] Journey 4: Selection + Analysis (4 hours)
Day 13: [ ] Journey 5: Analysis form + Streaming (4 hours)
Day 14: [ ] Journey 5: Insights + Evidence (3 hours)
Day 15: [ ] Error handling tests (4 hours)
```

### Week 4 Progress
```
Day 16: [ ] Responsive design tests (4 hours)
Day 17: [ ] Fix flaky tests (4 hours)
Day 18: [ ] Optimize execution time (3 hours)
Day 19: [ ] Documentation (3 hours)
Day 20: [ ] Final review + polish (4 hours)
```

---

## 🎓 BEST PRACTICES

### Test Structure
```typescript
test('user can complete registration successfully', async ({ page }) => {
  // ARRANGE: Set up test data
  const testUser = {
    email: generateUniqueEmail(),
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User'
  };
  
  // ACT: Perform user actions
  await page.goto('/register');
  await page.fill('[data-testid="email"]', testUser.email);
  await page.fill('[data-testid="password"]', testUser.password);
  await page.click('[data-testid="submit"]');
  
  // ASSERT: Verify expected outcomes
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
  
  // CLEANUP: Remove test data
  await cleanupTestUser(testUser.email);
});
```

### Helper Pattern
```typescript
// helpers/auth.ts
export async function loginViaUI(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}
```

### Error Handling
```typescript
test('shows error when upload fails', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/invoices/upload', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ detail: 'Upload failed' })
    });
  });
  
  await page.goto('/invoices/upload');
  await uploadFile(page, 'sample.pdf');
  
  // Verify error message shown
  await expect(page.locator('text=Upload failed')).toBeVisible();
});
```

---

## 🚀 GETTING STARTED

### Step 1: Complete Pre-Work (2 hours)
- [ ] Read all mandatory documents
- [ ] Audit existing tests
- [ ] Audit frontend components
- [ ] Document findings

### Step 2: Environment Setup (30 minutes)
```bash
cd tests/production/frontend

# Create package.json
npm init -y

# Install Playwright
npm install -D @playwright/test

# Install dependencies
npm install -D typescript @types/node

# Create playwright.config.ts
# (Use template from FRONTEND_TEST_OUTLINE_COMPLETE.md)
```

### Step 3: Create Test Helpers (1 hour)
```bash
# Create helper files
touch helpers/auth.ts
touch helpers/upload.ts
touch helpers/forms.ts
touch helpers/cleanup.ts

# Create fixture files
touch fixtures/testData.ts
```

### Step 4: Import Shared Test Data (30 minutes)
```bash
# Create shared test data
cd ../shared/test-data
touch users.json

# Add test users (see COORDINATION_GUIDE.md for format)
```

### Step 5: Start Journey 1 (Day 1-5)
```bash
# Create test file
touch e2e/01-onboarding.spec.ts

# Start implementing tests
# (Use code examples from FRONTEND_TEST_OUTLINE_COMPLETE.md)
```

---

## 📚 REFERENCE DOCUMENTS

### Primary References
- **Implementation Plan:** `tests/FRONTEND_TEST_OUTLINE_COMPLETE.md`
- **Quick Reference:** `tests/FRONTEND_TEST_QUICK_REFERENCE.md`
- **Coordination:** `tests/production/COORDINATION_GUIDE.md`

### Supporting Documents
- **Frontend Audit:** `tests/FRONTEND_AUDIT_SUMMARY.md`
- **User Journeys:** `tests/CRITICAL_USER_JOURNEYS_ANALYSIS.md`
- **Error Handling:** `tests/ERROR_HANDLING_AUDIT_RESULTS.md`

### Backend Coordination
- **Backend Plan:** `tests/BACKEND_AUDIT_SUMMARY.md` (for API understanding)
- **API Contracts:** `tests/production/shared/api-contract-tests/` (to be created)

---

## ✅ DEFINITION OF DONE

### For Each Test File
- [ ] All tests passing (100%)
- [ ] No flaky tests (98%+ pass rate over 10 runs)
- [ ] Execution time documented
- [ ] Helper functions extracted
- [ ] Error scenarios covered
- [ ] Code reviewed (self-review checklist)
- [ ] Committed to git

### For Each Week
- [ ] All deliverables complete
- [ ] Daily sync notes documented
- [ ] Progress tracker updated
- [ ] Blockers resolved or escalated
- [ ] Code quality standards met

### For Final Delivery
- [ ] All 7 test files complete
- [ ] Full suite passes (98%+ pass rate)
- [ ] Execution time < 21 minutes
- [ ] Documentation complete
- [ ] CI/CD pipeline working
- [ ] Coordination with backend agent complete
- [ ] Production ready

---

## 🎯 YOUR MISSION STARTS NOW

You have everything you need:
- ✅ Complete implementation plan
- ✅ Code examples for every test
- ✅ Clear quality standards
- ✅ Coordination protocol
- ✅ Progress tracking system

**Expected Outcome:** Production-grade E2E test suite in 4 weeks

**Your First Task:** Complete pre-work (2 hours), then begin Week 1 Day 1

**Remember:** High standards, clear communication, reliable tests.

---

## 📞 QUESTIONS?

- **Implementation questions:** Check `FRONTEND_TEST_OUTLINE_COMPLETE.md`
- **Coordination questions:** Check `COORDINATION_GUIDE.md`
- **Quick reference:** Check `FRONTEND_TEST_QUICK_REFERENCE.md`
- **Stuck on something:** Document in daily sync

---

**Good luck! Build something production-worthy.** 🚀
