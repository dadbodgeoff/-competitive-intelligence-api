# Frontend E2E Testing - Quick Reference

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific journey
npm run test:e2e -- tests/e2e/01-onboarding.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Run specific browser
npm run test:e2e -- --project=chromium

# Run on mobile
npm run test:e2e -- --project=mobile-chrome
```

## Common Test Patterns

### Login
```typescript
import { loginViaUI } from '../helpers/auth';

test('my test', async ({ page }) => {
  await loginViaUI(page);
  // Test code here
});
```

### Upload File
```typescript
import { uploadAndWaitForParse } from '../helpers/upload';

test('upload invoice', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/invoices/upload');
  await uploadAndWaitForParse(page, 'tests/fixtures/sample_invoice.pdf');
  // Verify results
});
```

### Fill Form
```typescript
import { fillAnalysisForm } from '../helpers/forms';

test('submit analysis', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/analysis/new');
  await fillAnalysisForm(page, {
    restaurant_name: 'Test Pizza',
    location: 'New York, NY',
    tier: 'free',
  });
  await page.click('button:has-text("Analyze")');
});
```

### Wait for Navigation
```typescript
// Wait for URL change
await page.waitForURL('/dashboard');

// Wait for URL pattern
await page.waitForURL(/\/invoices\/[a-f0-9-]+/);
```

### Check Visibility
```typescript
// Wait for element
await expect(page.locator('text=Success')).toBeVisible();

// With timeout
await expect(page.locator('text=Loading')).toBeVisible({ timeout: 10000 });

// Check not visible
await expect(page.locator('text=Error')).not.toBeVisible();
```

### Mock API Responses
```typescript
test('handle error', async ({ page }) => {
  await page.route('**/api/v1/analysis/run', route => {
    route.fulfill({
      status: 400,
      body: JSON.stringify({ message: 'Invalid input' }),
    });
  });
  
  // Trigger API call
  // Verify error handling
});
```

## Test Data

### Test Users
```typescript
import { TEST_USERS } from '../fixtures/testData';

// Free tier user
await loginViaUI(page, TEST_USERS.free.email, TEST_USERS.free.password);

// Premium tier user
await loginViaUI(page, TEST_USERS.premium.email, TEST_USERS.premium.password);
```

### Test Files
```typescript
import { TEST_FILES } from '../fixtures/testData';

// Small invoice
await uploadFile(page, TEST_FILES.invoice.small);

// Large invoice
await uploadFile(page, TEST_FILES.invoice.large);

// Invalid file (for error testing)
await uploadFile(page, TEST_FILES.invoice.invalid);
```

## Debugging Tips

### Take Screenshot
```typescript
await page.screenshot({ path: 'debug.png' });
```

### Console Logs
```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

### Pause Execution
```typescript
await page.pause(); // Opens Playwright Inspector
```

### Slow Down
```typescript
test.use({ launchOptions: { slowMo: 1000 } });
```

## Common Selectors

```typescript
// By text
page.locator('text=Sign In')

// By test ID
page.locator('[data-testid="email-input"]')

// By role
page.locator('button[type="submit"]')

// By aria label
page.locator('button[aria-label="Edit item 1"]')

// CSS selector
page.locator('.btn-primary')

// Nth element
page.locator('.card >> nth=0')

// Has text
page.locator('button:has-text("Save")')
```

## Assertions

```typescript
// Visibility
await expect(page.locator('text=Success')).toBeVisible();
await expect(page.locator('text=Error')).not.toBeVisible();

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/invoices\/[a-f0-9-]+/);

// Text content
await expect(page.locator('h1')).toHaveText('Dashboard');
await expect(page.locator('h1')).toContainText('Dash');

// Count
await expect(page.locator('.card')).toHaveCount(5);

// Attribute
await expect(page.locator('button')).toHaveAttribute('disabled');
await expect(page.locator('button')).toHaveClass(/btn-primary/);

// Enabled/Disabled
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
```

## Best Practices

1. **Use data-testid for stable selectors**
   ```typescript
   <button data-testid="submit-button">Submit</button>
   await page.click('[data-testid="submit-button"]');
   ```

2. **Wait for navigation before assertions**
   ```typescript
   await page.click('button:has-text("Login")');
   await page.waitForURL('/dashboard');
   await expect(page.locator('text=Welcome')).toBeVisible();
   ```

3. **Use helpers for common operations**
   ```typescript
   // Good
   await loginViaUI(page);
   
   // Avoid
   await page.goto('/login');
   await page.fill('input[name="email"]', 'test@example.com');
   // ... repeated code
   ```

4. **Clean up test data**
   ```typescript
   test.afterEach(async () => {
     await cleanupTestData(page);
   });
   ```

5. **Use meaningful test names**
   ```typescript
   // Good
   test('user can upload invoice and see parsed items', ...)
   
   // Avoid
   test('test 1', ...)
   ```

## Troubleshooting

### Test is flaky
- Add explicit waits: `await page.waitForSelector('...')`
- Increase timeout: `{ timeout: 10000 }`
- Check for race conditions

### Element not found
- Check selector is correct
- Wait for element: `await page.waitForSelector('...')`
- Check if element is in shadow DOM

### Test times out
- Increase timeout in config
- Check if API is responding
- Look for infinite loops

### Screenshots don't match
- Update snapshots: `npm run test:e2e -- --update-snapshots`
- Check viewport size
- Check for animations

---

**Full Documentation**: See `FRONTEND_TEST_OUTLINE_COMPLETE.md`
