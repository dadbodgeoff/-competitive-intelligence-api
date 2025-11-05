# Installation & Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Frontend development server running on `http://localhost:5173`
- Backend API server running on `http://localhost:8000`

---

## Quick Start (5 minutes)

```bash
# 1. Navigate to test directory
cd tests/production/frontend

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npm run test:install

# 4. Run tests
npm run test:e2e
```

---

## Detailed Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@playwright/test` - Playwright test framework
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions

### Step 2: Install Playwright Browsers

```bash
npm run test:install
```

This downloads:
- Chromium
- Firefox
- WebKit (Safari)
- Mobile device emulators

**Note:** This is a one-time setup (~500MB download)

### Step 3: Verify Installation

```bash
# Run a single test file
npm run test:e2e -- e2e/01-onboarding.spec.ts

# Expected output:
# Running 15 tests using 4 workers
# ✓ 01-onboarding.spec.ts (15 tests passed)
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the test directory (optional):

```bash
# Frontend URL
VITE_APP_URL=http://localhost:5173

# Backend API URL
VITE_API_URL=http://localhost:8000

# Test environment
NODE_ENV=test
```

**Note:** These have sensible defaults and are optional.

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- e2e/01-onboarding.spec.ts

# Run specific test by name
npm run test:e2e -- -g "user can login"
```

### Development Mode

```bash
# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run in UI mode (interactive)
npm run test:e2e:ui
```

### Browser-Specific

```bash
# Run on specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run mobile tests
npm run test:e2e:mobile
```

### Viewing Reports

```bash
# Generate and open HTML report
npm run test:report
```

---

## Troubleshooting

### Issue: "Cannot find module '@playwright/test'"

**Solution:**
```bash
npm install
```

### Issue: "browserType.launch: Executable doesn't exist"

**Solution:**
```bash
npm run test:install
```

### Issue: "Error: page.goto: net::ERR_CONNECTION_REFUSED"

**Solution:** Make sure the frontend dev server is running:
```bash
cd ../../../frontend
npm run dev
```

### Issue: "Test timeout of 60000ms exceeded"

**Solution:** 
1. Check if backend API is running
2. Increase timeout in `playwright.config.ts`
3. Check network connectivity

### Issue: Tests are flaky

**Solution:**
1. Run tests in headed mode to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```
2. Add explicit waits if needed
3. Check for race conditions

---

## Test Data Setup

### Test Users

Test users are defined in `../shared/test-data/users.json`:

```json
{
  "free_tier_user": {
    "email": "free@test.com",
    "password": "Test123!@#"
  }
}
```

**Important:** These users must exist in your test database.

### Sample Files

Sample PDFs should be placed in `../shared/test-data/sample-files/`:

- `sample_invoice_5_items.pdf`
- `sample_invoice_20_items.pdf`
- `sample_menu_10_items.pdf`
- `sample_menu_30_items.pdf`

**Note:** These files are required for Journey 2 and 3 tests.

---

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: tests/production/frontend
        run: npm ci
      
      - name: Install Playwright
        working-directory: tests/production/frontend
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        working-directory: tests/production/frontend
        run: npm run test:e2e
        env:
          VITE_API_URL: ${{ secrets.TEST_API_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: tests/production/frontend/playwright-report/
```

---

## Development Workflow

### 1. Write Tests

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';
import { loginViaUI } from '../helpers/auth';

test('my feature works', async ({ page }) => {
  await loginViaUI(page);
  // Test code here
});
```

### 2. Run Tests Locally

```bash
# Run in headed mode to see what's happening
npm run test:e2e:headed -- e2e/my-feature.spec.ts
```

### 3. Debug Failures

```bash
# Run in debug mode
npm run test:e2e:debug -- e2e/my-feature.spec.ts
```

### 4. Commit Changes

```bash
git add e2e/my-feature.spec.ts
git commit -m "feat(tests): Add my feature tests"
```

---

## Best Practices

### 1. Use Test Helpers

```typescript
// Good
await loginViaUI(page);

// Avoid
await page.goto('/login');
await page.fill('[data-testid="email-input"]', 'test@example.com');
// ...
```

### 2. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  await cleanupBrowserStorage(page);
});
```

### 3. Use Shared Test Data

```typescript
import { TEST_USERS } from '../fixtures/testData';

await loginViaUI(page, TEST_USERS.free.email, TEST_USERS.free.password);
```

### 4. Wait for Elements

```typescript
// Good
await expect(page.locator('text=Success')).toBeVisible();

// Avoid
await page.waitForTimeout(1000); // Flaky!
```

---

## Next Steps

1. ✅ Installation complete
2. ✅ Run Journey 1 tests
3. 🚧 Create sample PDF files
4. 🚧 Verify test users exist in database
5. 🚧 Begin Journey 2 tests

---

## Support

- **Documentation:** See `README.md`
- **Test Outline:** See `../FRONTEND_TEST_OUTLINE_COMPLETE.md`
- **Quick Reference:** See `../FRONTEND_TEST_QUICK_REFERENCE.md`
- **Issues:** Check `DAILY_SYNC.md` for known issues

---

**Last Updated:** November 3, 2025  
**Status:** Ready for testing
