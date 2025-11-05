# COORDINATION GUIDE - PARALLEL TEST DEVELOPMENT

**Purpose:** Ensure backend and frontend test agents work together smoothly  
**Date:** November 3, 2025  
**Status:** ✅ Directory structure created and ready

---

## 📁 Complete Directory Structure

```
tests/production/
├── README.md                          # Main documentation
├── COORDINATION_GUIDE.md              # This file
├── SETUP_COMPLETE.md                  # Setup status
├── QUICK_START.md                     # Quick start guide
├── cleanup_old_tests.py               # Cleanup script
├── run_all_tests.sh                   # Run both suites
├── run_backend_tests.sh               # Backend only
├── run_frontend_tests.sh              # Frontend only
│
├── backend/                           # ✅ CREATED
│   ├── README.md                      # Backend test docs
│   ├── unit/                          # Unit tests
│   ├── integration/                   # Integration tests
│   ├── e2e/                          # End-to-end tests
│   ├── security/                     # Security tests
│   ├── performance/                  # Performance tests
│   └── fixtures/                     # Test data
│
├── frontend/                          # ✅ CREATED
│   ├── README.md                      # Frontend test docs
│   ├── e2e/                          # Playwright E2E tests
│   │   ├── 01-onboarding.spec.ts
│   │   ├── 02-invoice-workflow.spec.ts
│   │   ├── 03-menu-workflow.spec.ts
│   │   ├── 04-comparison-workflow.spec.ts
│   │   ├── 05-analysis-workflow.spec.ts
│   │   ├── 06-error-handling.spec.ts
│   │   └── 07-responsive.spec.ts
│   ├── helpers/                      # Test utilities
│   │   ├── auth.ts
│   │   ├── upload.ts
│   │   ├── forms.ts
│   │   └── cleanup.ts
│   └── fixtures/                     # Test data
│       ├── testData.ts
│       └── sample PDFs
│
├── shared/                            # ✅ CREATED
│   ├── README.md                      # Shared resources docs
│   ├── api-contract-tests/           # API contracts
│   │   ├── auth-endpoints.ts
│   │   ├── invoice-endpoints.ts
│   │   ├── menu-endpoints.ts
│   │   ├── comparison-endpoints.ts
│   │   └── analysis-endpoints.ts
│   └── test-data/                    # Shared test data
│       ├── users.json                # Test user accounts
│       └── sample-files/             # Sample PDFs
│           ├── sample_invoice.pdf
│           ├── sample_menu.pdf
│           └── invalid_file.txt
│
└── reports/                           # ✅ CREATED
    ├── backend-coverage/             # Backend coverage reports
    └── frontend-coverage/            # Frontend coverage reports
```

---

## ⚠️ Potential Issues & Solutions

### Issue 1: API Contract Mismatches
**Problem:** Backend changes endpoint, frontend tests break  
**Solution:** Use shared API contract tests

**Action Items:**
- [ ] Backend agent: Document all API endpoints in `shared/api-contract-tests/`
- [ ] Frontend agent: Validate against same contracts
- [ ] Both: Update contracts when APIs change

### Issue 2: Test Data Conflicts
**Problem:** Different test users/data cause flaky tests  
**Solution:** Use shared test data fixtures

**Action Items:**
- [ ] Backend agent: Create test users in `shared/test-data/users.json`
- [ ] Frontend agent: Use same user IDs from shared file
- [ ] Both: Don't create conflicting test data

### Issue 3: Environment Setup
**Problem:** Different environment variables cause failures  
**Solution:** Use shared `.env.test` file

**Action Items:**
- [ ] Backend agent: Document required env vars
- [ ] Frontend agent: Use same env vars
- [ ] Both: Keep `.env.test` in sync

### Issue 4: Timing Issues
**Problem:** Frontend tests run before backend is ready  
**Solution:** Use health check endpoints

**Action Items:**
- [ ] Backend agent: Implement `/health` endpoint
- [ ] Frontend agent: Wait for health check before tests
- [ ] Both: Use proper async/await patterns

---

## 🤝 Coordination Points

### 1. API Contracts (CRITICAL)

**Backend Agent Responsibilities:**
```typescript
// Document in: shared/api-contract-tests/auth-endpoints.test.ts

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
    cookies: ['access_token', 'refresh_token']
  }
}
```

**Frontend Agent Responsibilities:**
```typescript
// Validate in: frontend/integration/auth-api.test.tsx

test('register endpoint matches contract', async () => {
  const response = await api.register({
    email: 'test@example.com',
    password: 'SecurePass123!'
  });
  
  // Validate against AUTH_CONTRACTS.register
  expect(response).toMatchContract(AUTH_CONTRACTS.register);
});
```

### 2. Test Data (IMPORTANT)

**Shared Test Users:**
```json
// shared/test-data/users.json
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

**Backend Usage:**
```python
# backend/conftest.py
import json

@pytest.fixture
def test_users():
    with open('../shared/test-data/users.json') as f:
        return json.load(f)

@pytest.fixture
async def free_tier_user(test_users):
    return test_users['free_tier_user']
```

**Frontend Usage:**
```typescript
// frontend/fixtures/test-users.ts
import testUsers from '../../shared/test-data/users.json';

export const FREE_TIER_USER = testUsers.free_tier_user;
export const PREMIUM_TIER_USER = testUsers.premium_tier_user;
```

### 3. Sample Files (IMPORTANT)

**Shared Location:** `shared/test-data/sample-files/`

Files needed:
- `sample_invoice.pdf` (Sysco format)
- `sample_menu.pdf` (Restaurant menu)
- `invalid_file.txt` (For error testing)

**Backend Usage:**
```python
SAMPLE_INVOICE = Path(__file__).parent.parent / 'shared/test-data/sample-files/sample_invoice.pdf'
```

**Frontend Usage:**
```typescript
const SAMPLE_INVOICE = new File(
  [await fs.readFile('../../shared/test-data/sample-files/sample_invoice.pdf')],
  'sample_invoice.pdf',
  { type: 'application/pdf' }
);
```

---

## 📋 Communication Protocol

### Daily Sync (Recommended)
- **Time:** End of day
- **Format:** Quick status update
- **Topics:**
  - API changes made today
  - Test data added/modified
  - Blockers encountered

### API Change Notification
**When backend changes an API:**
1. Update contract in `shared/api-contract-tests/`
2. Notify frontend agent
3. Frontend agent updates tests

**Template:**
```
API CHANGE: POST /api/invoices/parse
- Added field: vendor_hint (optional string)
- Changed response: Added parse_metadata.cost
- Contract updated: shared/api-contract-tests/invoice-endpoints.test.ts
```

### Test Data Change Notification
**When either agent adds test data:**
1. Update `shared/test-data/`
2. Notify other agent
3. Document in this file

---

## 📋 Frontend Test Implementation Plan

Based on `tests/FRONTEND_TEST_OUTLINE_COMPLETE.md`:

### 5 Critical User Journeys
1. **Onboarding & Authentication** (3 min)
   - Landing page → Register → Login → Auth persistence
   - File: `frontend/e2e/01-onboarding.spec.ts`

2. **Invoice Workflow** (5 min)
   - Upload → Parse (streaming) → Review → Save → List → Detail
   - File: `frontend/e2e/02-invoice-workflow.spec.ts`

3. **Menu Workflow** (4 min)
   - Upload → Parse (streaming) → Review → Save → Dashboard → Recipes
   - File: `frontend/e2e/03-menu-workflow.spec.ts`

4. **Menu Comparison** (4 min)
   - Discover → Select → Analyze → Results → Save
   - File: `frontend/e2e/04-comparison-workflow.spec.ts`

5. **Review Analysis** (5 min)
   - Form → Tier selection → Streaming → Insights → Evidence → Save
   - File: `frontend/e2e/05-analysis-workflow.spec.ts`

### Cross-Cutting Tests
- **Error Handling** - File: `frontend/e2e/06-error-handling.spec.ts`
- **Responsive Design** - File: `frontend/e2e/07-responsive.spec.ts`

### Test Helpers
- `helpers/auth.ts` - Login utilities
- `helpers/upload.ts` - File upload utilities
- `helpers/forms.ts` - Form filling utilities
- `helpers/cleanup.ts` - Cleanup utilities

### Total Execution Time
~21 minutes for full E2E suite

---

## 🚀 Getting Started Checklist

### Backend Agent
- [x] Directory structure created
- [ ] Set up pytest configuration (`backend/pytest.ini`)
- [ ] Create `backend/conftest.py` with fixtures
- [ ] Create `backend/requirements.txt`
- [ ] Create shared test users in `shared/test-data/users.json`
- [ ] Document API contracts in `shared/api-contract-tests/`
- [ ] Add sample files to `shared/test-data/sample-files/`
- [ ] Implement health check endpoint
- [ ] Start with Module 1 (Auth) tests

### Frontend Agent
- [x] Directory structure created
- [x] Set up Playwright configuration (`frontend/playwright.config.ts`)
- [x] Create `frontend/package.json` with test dependencies
- [x] Import shared test users from `shared/test-data/users.json`
- [ ] Validate API contracts from `shared/api-contract-tests/`
- [ ] Use sample files from `shared/test-data/sample-files/` (TODO: create files)
- [x] Create test helpers in `frontend/helpers/`
- [x] Start with Journey 1 (Onboarding) tests - 15 tests complete

---

## 🔍 Integration Points

### Point 1: Authentication Flow
**Backend:** Tests JWT generation, cookie setting  
**Frontend:** Tests login form, cookie storage, auth state

**Coordination:**
- Backend ensures cookies set correctly
- Frontend validates cookies received
- Both test token expiry (24h)

### Point 2: File Upload
**Backend:** Tests file storage, size limits  
**Frontend:** Tests file selection, upload progress

**Coordination:**
- Backend enforces 10MB limit
- Frontend validates before upload
- Both test error handling

### Point 3: Streaming (SSE)
**Backend:** Tests SSE event emission  
**Frontend:** Tests SSE event reception

**Coordination:**
- Backend documents event types
- Frontend validates event order
- Both test error events

### Point 4: Error Handling
**Backend:** Tests error sanitization  
**Frontend:** Tests error display

**Coordination:**
- Backend returns safe error messages
- Frontend displays user-friendly errors
- Both test error scenarios

---

## 🎯 Success Criteria

### Backend Tests Complete When:
- [ ] All 140 test cases passing
- [ ] 80%+ code coverage
- [ ] All API contracts documented
- [ ] All security tests passing
- [ ] Performance benchmarks met

### Frontend Tests Complete When:
- [ ] All component tests passing
- [ ] 75%+ code coverage
- [ ] All user journeys tested
- [ ] All API contracts validated
- [ ] Accessibility tests passing

### Integration Complete When:
- [ ] Backend + Frontend tests run together
- [ ] No conflicts in test data
- [ ] API contracts match
- [ ] Combined coverage report generated
- [ ] CI/CD pipeline passing

---

## 🛠️ Tools for Coordination

### 1. API Contract Validation
```bash
# Run contract tests
cd tests/production/shared
npm run test:contracts
```

### 2. Test Data Validation
```bash
# Validate shared test data
cd tests/production/shared
python validate_test_data.py
```

### 3. Combined Test Run
```bash
# Run both suites
cd tests/production
./run_all_tests.sh
```

---

## 📝 Notes

- **No blocking dependencies:** Both agents can work in parallel
- **Minimal coordination needed:** Only at API contract level
- **Independent progress:** Each agent tracks their own checklist
- **Flexible timeline:** No strict ordering required
- **Easy integration:** Designed to merge smoothly at the end
