# Frontend Test Suite - Complete Outline

## Executive Summary

**Purpose**: Comprehensive E2E test coverage for all 5 critical user journeys
**Tool**: Playwright for E2E testing
**Target**: 95% coverage of user-facing functionality
**Execution Time**: < 15 minutes for full suite

---

## Journey 1: Onboarding & Authentication

### Entry Point
- **URL**: `/` (Landing Page)
- **Navigation**: Click "Sign Up" or "Get Started" CTA

### Components Audited
- `frontend/src/pages/LandingPage.tsx`
- `frontend/src/components/auth/RegisterForm.tsx`
- `frontend/src/components/auth/LoginForm.tsx`
- `frontend/src/stores/authStore.ts`
- `frontend/src/services/api/client.ts`

### Critical Test Steps

#### 1.1 Landing Page Navigation
```typescript
test('landing page displays and CTAs work', async ({ page }) => {
  await page.goto('/');
  
  // Verify hero section
  await expect(page.locator('text=Beat the Guy Across the Street')).toBeVisible();
  
  // Verify CTAs exist
  await expect(page.locator('text=Run Your First Scan')).toBeVisible();
  await expect(page.locator('text=Sign In')).toBeVisible();
  
  // Test navigation
  await page.click('text=Get Started');
  await expect(page).toHaveURL('/register');
});
```


#### 1.2 Registration Flow
```typescript
test('user can register successfully', async ({ page }) => {
  await page.goto('/register');
  
  // Fill registration form
  await page.fill('input[name="first_name"]', 'John');
  await page.fill('input[name="last_name"]', 'Doe');
  await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
  await page.fill('input[name="password"]', 'Test123!@#');
  await page.fill('input[name="confirm_password"]', 'Test123!@#');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

#### 1.3 Login Flow
```typescript
test('user can login successfully', async ({ page }) => {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  
  // Submit
  await page.click('[data-testid="login-button"]');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
});
```

#### 1.4 Auth Persistence
```typescript
test('auth persists across page refresh', async ({ page }) => {
  // Login first
  await loginViaUI(page, 'test@example.com', 'password123');
  
  // Refresh page
  await page.reload();
  
  // Should still be on dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

### Success Criteria
- ✅ User can complete registration without errors
- ✅ User is automatically logged in after registration
- ✅ Auth state persists across page refreshes
- ✅ Login works with registered credentials
- ✅ Logout clears session and redirects to landing

### Error Scenarios
- Invalid email format shows validation error
- Weak password shows validation error
- Email already exists shows error message
- Network error during registration shows toast
- Invalid login credentials show error message

### Test Data Required
- Unique email generator: `test${Date.now()}@example.com`
- Valid password: `Test123!@#`
- Test user credentials stored in env

### Estimated Test Time
- 3 minutes

---

## Journey 2: Invoice Workflow

### Entry Point
- **URL**: `/dashboard` → Click "Upload Invoice"
- **Direct**: `/invoices/upload`

### Components Audited
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/InvoiceListPage.tsx`
- `frontend/src/pages/InvoiceDetailPage.tsx`
- `frontend/src/pages/PriceAnalyticsDashboard.tsx`
- `frontend/src/components/invoice/InvoiceUpload.tsx`
- `frontend/src/components/invoice/InvoiceReviewTable.tsx`
- `frontend/src/components/invoice/ProcessingResultScreen.tsx`
- `frontend/src/hooks/useInvoiceParseStream.ts`

### API Endpoints Used
- `POST /api/invoices/upload` - File upload
- `GET /api/invoices/parse-stream?file_url=...` - SSE streaming parse
- `POST /api/invoices/save` - Save reviewed invoice
- `GET /api/invoices/` - List invoices
- `GET /api/invoices/{id}` - Get invoice details
- `GET /api/price-analytics/trends` - Price analytics

### Critical Test Steps

#### 2.1 File Upload
```typescript
test('user can upload invoice PDF', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/invoices/upload');
  
  // Optional: Fill vendor hint
  await page.fill('input[id="vendor"]', 'Sysco');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/sample_invoice.pdf');
  
  // Should show progress
  await expect(page.locator('text=Parsing')).toBeVisible({ timeout: 5000 });
});
```

#### 2.2 Streaming Progress Display
```typescript
test('streaming progress updates display', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/invoices/upload');
  
  // Upload file
  await uploadFile(page, 'tests/fixtures/sample_invoice.pdf');
  
  // Wait for streaming to start
  await expect(page.locator('text=AI is reading')).toBeVisible({ timeout: 10000 });
  
  // Progress bar should be visible
  await expect(page.locator('[role="progressbar"]')).toBeVisible();
  
  // Wait for completion
  await expect(page.locator('text=Invoice Ready for Review')).toBeVisible({ timeout: 60000 });
});
```

#### 2.3 Review Table Interaction
```typescript
test('user can edit line items in review table', async ({ page }) => {
  // Assume invoice is already parsed
  await page.goto('/invoices/upload');
  await uploadAndWaitForParse(page, 'tests/fixtures/sample_invoice.pdf');
  
  // Click edit on first item
  await page.click('button[aria-label="Edit item 1"]');
  
  // Edit description
  await page.fill('input[aria-label="Description"]', 'Updated Description');
  
  // Save
  await page.click('button[aria-label="Save changes"]');
  
  // Verify update
  await expect(page.locator('text=Updated Description')).toBeVisible();
});
```


#### 2.4 Save Invoice
```typescript
test('user can save reviewed invoice', async ({ page }) => {
  await page.goto('/invoices/upload');
  await uploadAndWaitForParse(page, 'tests/fixtures/sample_invoice.pdf');
  
  // Click save button
  await page.click('button:has-text("Save Invoice")');
  
  // Should show success toast
  await expect(page.locator('text=Invoice saved')).toBeVisible();
  
  // Should redirect to invoice detail page
  await expect(page).toHaveURL(/\/invoices\/[a-f0-9-]+/);
});
```

#### 2.5 Invoice List & Detail Navigation
```typescript
test('user can view invoice list and navigate to detail', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/invoices');
  
  // Should show invoices
  await expect(page.locator('text=Invoices')).toBeVisible();
  
  // Click on first invoice
  await page.click('.cursor-pointer >> nth=0');
  
  // Should navigate to detail page
  await expect(page).toHaveURL(/\/invoices\/[a-f0-9-]+/);
  await expect(page.locator('text=Invoice Details')).toBeVisible();
});
```

#### 2.6 Price Analytics Dashboard
```typescript
test('price analytics dashboard loads and displays charts', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/price-analytics');
  
  // Should show dashboard
  await expect(page.locator('text=Price Analytics')).toBeVisible();
  
  // Should show charts (wait for data to load)
  await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
  
  // Should show summary cards
  await expect(page.locator('text=Total Items Tracked')).toBeVisible();
});
```

### Success Criteria
- ✅ File uploads without errors
- ✅ Real-time parsing updates display correctly
- ✅ Parsed items appear in review table
- ✅ User can edit line items
- ✅ User can save invoice
- ✅ Detail page shows correct data
- ✅ Analytics dashboard loads charts

### Error Scenarios
- Invalid file type shows error toast
- File too large shows error toast
- Parsing fails shows error message with retry option
- Network error during upload shows toast
- No items parsed shows appropriate message

### Test Data Required
- `tests/fixtures/sample_invoice.pdf` (5-10 line items)
- `tests/fixtures/large_invoice.pdf` (50+ line items)
- `tests/fixtures/invalid_file.txt` (for error testing)

### Estimated Test Time
- 5 minutes (including 60s parse time)

---

## Journey 3: Menu Workflow

### Entry Point
- **URL**: `/dashboard` → Click "Menu"
- **Direct**: `/menu/upload`

### Components Audited
- `frontend/src/pages/MenuDashboard.tsx`
- `frontend/src/pages/MenuParsingProgressPage.tsx`
- `frontend/src/components/menu/MenuUpload.tsx`
- `frontend/src/components/menu/MenuReviewTable.tsx`
- `frontend/src/components/menu/IngredientSearchModal.tsx`
- `frontend/src/components/menu/IngredientList.tsx`
- `frontend/src/hooks/useMenuParseStream.ts`

### API Endpoints Used
- `POST /api/menu/upload` - File upload
- `GET /api/menu/parse-stream?file_url=...` - SSE streaming parse
- `POST /api/menu/save` - Save reviewed menu
- `GET /api/menu/current` - Get current menu
- `GET /api/menu/items/{id}/recipe` - Get recipe/ingredients

### Critical Test Steps

#### 3.1 Menu Upload
```typescript
test('user can upload menu PDF', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/menu/upload');
  
  // Fill restaurant hint
  await page.fill('input[id="restaurant"]', 'Park Avenue Pizza');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/sample_menu.pdf');
  
  // Should show progress
  await expect(page.locator('text=Parsing Menu')).toBeVisible({ timeout: 5000 });
});
```

#### 3.2 Menu Streaming Progress
```typescript
test('menu parsing shows streaming progress', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/menu/upload');
  
  await uploadFile(page, 'tests/fixtures/sample_menu.pdf');
  
  // Wait for streaming
  await expect(page.locator('text=AI is reading your menu')).toBeVisible({ timeout: 10000 });
  
  // Progress bar visible
  await expect(page.locator('[role="progressbar"]')).toBeVisible();
  
  // Wait for completion
  await expect(page.locator('text=Menu Ready for Review')).toBeVisible({ timeout: 60000 });
});
```

#### 3.3 Menu Review Table
```typescript
test('menu items display in categorized table', async ({ page }) => {
  await page.goto('/menu/upload');
  await uploadAndWaitForParse(page, 'tests/fixtures/sample_menu.pdf');
  
  // Should show categories
  await expect(page.locator('text=Pizzas')).toBeVisible();
  await expect(page.locator('text=Appetizers')).toBeVisible();
  
  // Should show item count badges
  await expect(page.locator('text=items')).toBeVisible();
  
  // Can collapse/expand categories
  await page.click('button[aria-label="Collapse category"]');
  await expect(page.locator('table')).not.toBeVisible();
});
```

#### 3.4 Edit Menu Items
```typescript
test('user can edit menu items', async ({ page }) => {
  await page.goto('/menu/upload');
  await uploadAndWaitForParse(page, 'tests/fixtures/sample_menu.pdf');
  
  // Click edit on first item
  await page.click('button[aria-label="Edit item 1"]');
  
  // Edit name and price
  await page.fill('input[aria-label="Item name"]', 'Updated Pizza Name');
  await page.fill('input[aria-label="Unit price"]', '15.99');
  
  // Save
  await page.click('button[aria-label="Save changes"]');
  
  // Verify update
  await expect(page.locator('text=Updated Pizza Name')).toBeVisible();
  await expect(page.locator('text=$15.99')).toBeVisible();
});
```


#### 3.5 Save Menu
```typescript
test('user can save reviewed menu', async ({ page }) => {
  await page.goto('/menu/upload');
  await uploadAndWaitForParse(page, 'tests/fixtures/sample_menu.pdf');
  
  // Click save
  await page.click('button:has-text("Save Menu")');
  
  // Should show success toast
  await expect(page.locator('text=Menu saved')).toBeVisible();
  
  // Should redirect to menu dashboard
  await expect(page).toHaveURL('/menu/dashboard');
});
```

#### 3.6 Menu Dashboard Display
```typescript
test('menu dashboard shows saved menu', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/menu/dashboard');
  
  // Should show menu header
  await expect(page.locator('text=Menu Dashboard')).toBeVisible();
  
  // Should show stats
  await expect(page.locator('text=Categories')).toBeVisible();
  await expect(page.locator('text=Total Items')).toBeVisible();
  await expect(page.locator('text=Avg Price')).toBeVisible();
  
  // Should show menu items
  await expect(page.locator('text=Menu Items')).toBeVisible();
});
```

#### 3.7 Ingredient Linking (Recipe Builder)
```typescript
test('user can link menu item to inventory ingredients', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/menu/dashboard');
  
  // Click "Recipe" button on a menu item
  await page.click('button:has-text("Recipe")');
  
  // Should navigate to recipe page
  await expect(page).toHaveURL(/\/menu\/items\/[a-f0-9-]+\/recipe/);
  
  // Should show ingredient search
  await expect(page.locator('text=Link Ingredients')).toBeVisible();
  
  // Search for ingredient
  await page.fill('input[placeholder*="Search"]', 'Mozzarella');
  await page.click('text=Mozzarella Cheese');
  
  // Should add to recipe
  await expect(page.locator('text=Mozzarella Cheese')).toBeVisible();
});
```

### Success Criteria
- ✅ Menu uploads successfully
- ✅ Items are parsed correctly into categories
- ✅ User can edit menu items
- ✅ User can save menu
- ✅ Menu dashboard displays saved menu
- ✅ Ingredient search works
- ✅ COGS calculation displays (if ingredients linked)

### Error Scenarios
- Invalid file type shows error
- Parsing fails shows error with retry
- No items parsed shows message
- Ingredient search returns no results

### Test Data Required
- `tests/fixtures/sample_menu.pdf` (10-20 items, 3-4 categories)
- Test inventory items for ingredient linking

### Estimated Test Time
- 4 minutes

---

## Journey 4: Menu Comparison Workflow

### Entry Point
- **URL**: `/dashboard` → Click "Menu Comparison"
- **Direct**: `/menu-comparison`

### Components Audited
- `frontend/src/pages/MenuComparisonPage.tsx`
- `frontend/src/pages/CompetitorSelectionPage.tsx`
- `frontend/src/pages/MenuParsingProgressPage.tsx`
- `frontend/src/pages/MenuComparisonResultsPage.tsx`
- `frontend/src/pages/SavedComparisonsPage.tsx`
- `frontend/src/services/api/menuComparisonApi.ts`
- `frontend/src/types/menuComparison.ts`

### API Endpoints Used
- `POST /api/menu-comparison/discover` - Find competitors
- `POST /api/menu-comparison/select` - Select competitors
- `GET /api/menu-comparison/{id}/status` - Poll status
- `GET /api/menu-comparison/{id}/results` - Get results
- `GET /api/menu-comparison/saved` - List saved comparisons

### Critical Test Steps

#### 4.1 Start Comparison Form
```typescript
test('user can fill comparison form', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/menu-comparison');
  
  // Fill form
  await page.fill('input[name="restaurant_name"]', 'Park Avenue Pizza');
  await page.fill('input[name="location"]', 'New York, NY');
  await page.selectOption('select[name="category"]', 'pizza');
  await page.fill('input[name="radius_miles"]', '3');
  
  // Submit
  await page.click('button:has-text("Find Competitors")');
  
  // Should show loading
  await expect(page.locator('text=Finding Competitors')).toBeVisible();
});
```

#### 4.2 Competitor Discovery
```typescript
test('competitors are discovered and displayed', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/menu-comparison');
  
  await fillComparisonForm(page, {
    restaurant_name: 'Park Avenue Pizza',
    location: 'New York, NY',
    category: 'pizza',
  });
  
  await page.click('button:has-text("Find Competitors")');
  
  // Should navigate to selection page
  await expect(page).toHaveURL(/\/menu-comparison\/[a-f0-9-]+\/select/);
  
  // Should show competitors
  await expect(page.locator('text=Select Competitors')).toBeVisible();
  await expect(page.locator('text=0/2 Selected')).toBeVisible();
});
```

#### 4.3 Competitor Selection
```typescript
test('user can select 2 competitors', async ({ page }) => {
  await page.goto('/menu-comparison/test-id/select');
  
  // Click on first competitor
  await page.click('.cursor-pointer >> nth=0');
  await expect(page.locator('text=1/2 Selected')).toBeVisible();
  
  // Click on second competitor
  await page.click('.cursor-pointer >> nth=1');
  await expect(page.locator('text=2/2 Selected')).toBeVisible();
  await expect(page.locator('text=Ready to analyze')).toBeVisible();
  
  // Start analysis button should be enabled
  await expect(page.locator('button:has-text("Analyze Selected")')).toBeEnabled();
});
```

#### 4.4 Comparison Progress
```typescript
test('comparison shows progress during parsing', async ({ page }) => {
  await page.goto('/menu-comparison/test-id/select');
  await selectCompetitors(page, 2);
  
  // Start analysis
  await page.click('button:has-text("Analyze Selected")');
  
  // Should navigate to progress page
  await expect(page).toHaveURL(/\/menu-comparison\/[a-f0-9-]+\/parse/);
  
  // Should show progress
  await expect(page.locator('text=Parsing Menus')).toBeVisible();
  await expect(page.locator('[role="progressbar"]')).toBeVisible();
});
```


#### 4.5 Comparison Results Display
```typescript
test('comparison results display correctly', async ({ page }) => {
  await page.goto('/menu-comparison/test-id/results');
  
  // Should show results header
  await expect(page.locator('text=Menu Comparison Results')).toBeVisible();
  
  // Should show competitor cards
  await expect(page.locator('text=Competitor 1')).toBeVisible();
  await expect(page.locator('text=Competitor 2')).toBeVisible();
  
  // Should show menu items
  await expect(page.locator('table')).toBeVisible();
  
  // Should show pricing comparison
  await expect(page.locator('text=Price Comparison')).toBeVisible();
});
```

#### 4.6 Save Comparison
```typescript
test('user can save comparison', async ({ page }) => {
  await page.goto('/menu-comparison/test-id/results');
  
  // Click save button
  await page.click('button:has-text("Save Comparison")');
  
  // Should show success toast
  await expect(page.locator('text=Comparison saved')).toBeVisible();
});
```

#### 4.7 View Saved Comparisons
```typescript
test('user can view saved comparisons', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/menu-comparison/saved');
  
  // Should show saved comparisons list
  await expect(page.locator('text=Saved Comparisons')).toBeVisible();
  
  // Should show comparison cards
  await expect(page.locator('.cursor-pointer')).toBeVisible();
  
  // Click on a comparison
  await page.click('.cursor-pointer >> nth=0');
  
  // Should navigate to results
  await expect(page).toHaveURL(/\/menu-comparison\/[a-f0-9-]+\/results/);
});
```

### Success Criteria
- ✅ Competitors are discovered
- ✅ User can select exactly 2 competitors
- ✅ Comparison completes successfully
- ✅ Results display insights and pricing
- ✅ Comparison can be saved
- ✅ Saved comparisons can be retrieved

### Error Scenarios
- No competitors found shows message
- Comparison fails shows error with retry
- Network error during comparison shows toast
- Save fails shows error message

### Test Data Required
- Valid restaurant name and location
- Mock competitor data for testing

### Estimated Test Time
- 4 minutes

---

## Journey 5: Review Analysis Workflow

### Entry Point
- **URL**: `/dashboard` → Click "Analyze Competitors"
- **Direct**: `/analysis/new`

### Components Audited
- `frontend/src/components/analysis/ReviewAnalysisForm.tsx`
- `frontend/src/components/analysis/TierSelector.tsx`
- `frontend/src/components/analysis/AnalysisProgressTracker.tsx`
- `frontend/src/components/analysis/StreamingAnalysisResults.tsx`
- `frontend/src/components/analysis/ReviewAnalysisResults.tsx`
- `frontend/src/components/analysis/InsightsGrid.tsx`
- `frontend/src/components/analysis/ReviewEvidenceSection.tsx`
- `frontend/src/pages/SavedAnalysesPage.tsx`
- `frontend/src/hooks/useStreamingAnalysis.ts`

### API Endpoints Used
- `POST /api/v1/analysis/run` - Start analysis
- `GET /api/v1/analysis/{id}/stream` - SSE streaming results
- `GET /api/v1/analysis/{id}` - Get analysis results
- `GET /api/v1/analysis/saved` - List saved analyses

### Critical Test Steps

#### 5.1 Analysis Form Validation
```typescript
test('analysis form validates inputs', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/analysis/new');
  
  // Try to submit empty form
  await page.click('button:has-text("Analyze Competitors")');
  
  // Should show validation errors
  await expect(page.locator('text=Restaurant name is required')).toBeVisible();
  await expect(page.locator('text=Location is required')).toBeVisible();
});
```

#### 5.2 Fill Analysis Form
```typescript
test('user can fill analysis form', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/analysis/new');
  
  // Fill form
  await page.fill('[data-testid="restaurant-name"]', 'Test Pizza');
  await page.fill('[data-testid="location"]', 'New York, NY');
  
  // Select category
  await page.click('[data-testid="category"]');
  await page.click('[role="option"]:has-text("Pizza")');
  
  // Form should be valid
  await expect(page.locator('button:has-text("Analyze Competitors")')).toBeEnabled();
});
```

#### 5.3 Tier Selection
```typescript
test('user can select analysis tier', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/analysis/new');
  
  // Free tier should be default
  await expect(page.locator('[data-testid="tier-free"]')).toHaveClass(/selected/);
  
  // Click premium tier
  await page.click('[data-testid="tier-premium"]');
  await expect(page.locator('[data-testid="tier-premium"]')).toHaveClass(/selected/);
  
  // Should show tier differences
  await expect(page.locator('text=5 competitors')).toBeVisible();
  await expect(page.locator('text=25 insights')).toBeVisible();
});
```

#### 5.4 Streaming Analysis Progress
```typescript
test('streaming analysis shows real-time updates', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/analysis/new');
  
  await fillAnalysisForm(page, {
    restaurant_name: 'Test Pizza',
    location: 'New York, NY',
    category: 'pizza',
    tier: 'free',
  });
  
  // Submit
  await page.click('button:has-text("Analyze Competitors")');
  
  // Should show streaming progress
  await expect(page.locator('text=Finding competitors')).toBeVisible({ timeout: 10000 });
  
  // Progress updates should appear
  await expect(page.locator('text=Analyzing reviews')).toBeVisible({ timeout: 30000 });
  
  // Insights should stream in
  await expect(page.locator('.insight-card')).toBeVisible({ timeout: 60000 });
});
```


#### 5.5 Insights Display
```typescript
test('insights display correctly with categories', async ({ page }) => {
  await page.goto('/analysis/test-id/results');
  
  // Should show insights grid
  await expect(page.locator('text=Insights')).toBeVisible();
  
  // Should show insight cards
  const insightCards = page.locator('.insight-card');
  await expect(insightCards).toHaveCount(4); // Free tier: 4 insights
  
  // Should show insight types
  await expect(page.locator('text=threat')).toBeVisible();
  await expect(page.locator('text=opportunity')).toBeVisible();
  
  // Should show confidence badges
  await expect(page.locator('text=high')).toBeVisible();
});
```

#### 5.6 Evidence Reviews Expansion
```typescript
test('user can expand evidence reviews', async ({ page }) => {
  await page.goto('/analysis/test-id/results');
  
  // Click on an insight to expand
  await page.click('.insight-card >> nth=0');
  
  // Should show evidence section
  await expect(page.locator('text=Evidence')).toBeVisible();
  
  // Should show review quotes
  await expect(page.locator('.review-quote')).toBeVisible();
  
  // Should show competitor names
  await expect(page.locator('text=Competitor Pizza')).toBeVisible();
});
```

#### 5.7 Tab Navigation
```typescript
test('user can navigate between tabs', async ({ page }) => {
  await page.goto('/analysis/test-id/results');
  
  // Default tab: Overview
  await expect(page.locator('text=Overview')).toHaveClass(/active/);
  
  // Click Insights tab
  await page.click('text=Insights');
  await expect(page.locator('.insights-grid')).toBeVisible();
  
  // Click Evidence tab
  await page.click('text=Evidence');
  await expect(page.locator('.evidence-section')).toBeVisible();
  
  // Click Competitors tab
  await page.click('text=Competitors');
  await expect(page.locator('.competitors-table')).toBeVisible();
});
```

#### 5.8 Export Results
```typescript
test('user can export analysis to CSV', async ({ page }) => {
  await page.goto('/analysis/test-id/results');
  
  // Click export button
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Export CSV")');
  
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('Test_Pizza_analysis_');
});
```

#### 5.9 Save Analysis
```typescript
test('user can save analysis', async ({ page }) => {
  await page.goto('/analysis/test-id/results');
  
  // Click save button
  await page.click('button:has-text("Save Analysis")');
  
  // Should show success toast
  await expect(page.locator('text=Analysis saved')).toBeVisible();
});
```

#### 5.10 View Saved Analyses
```typescript
test('user can view saved analyses', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/analysis/saved');
  
  // Should show saved analyses list
  await expect(page.locator('text=Saved Analyses')).toBeVisible();
  
  // Should show analysis cards
  await expect(page.locator('.analysis-card')).toBeVisible();
  
  // Click on an analysis
  await page.click('.analysis-card >> nth=0');
  
  // Should navigate to results
  await expect(page).toHaveURL(/\/analysis\/[a-f0-9-]+\/results/);
});
```

### Success Criteria
- ✅ Form validates inputs correctly
- ✅ Tier selection works
- ✅ Streaming updates display in real-time
- ✅ Insights render correctly with categories
- ✅ Evidence reviews are accessible and expandable
- ✅ Tab navigation works
- ✅ CSV export works
- ✅ Analysis can be saved and retrieved

### Error Scenarios
- Invalid business name shows validation
- Analysis fails shows error with retry
- Network error during streaming shows toast
- No insights generated shows message
- Save fails shows error

### Test Data Required
- Valid restaurant name and location
- Mock streaming responses for testing

### Estimated Test Time
- 5 minutes

---

## Cross-Cutting Concerns

### Error Handling

#### Components Audited
- `frontend/src/components/ui/toast.tsx`
- `frontend/src/services/api/client.ts`

#### Test Scenarios

```typescript
test('API 400 error shows user-friendly toast', async ({ page }) => {
  await loginViaUI(page);
  
  // Trigger 400 error (e.g., invalid form data)
  await page.route('**/api/v1/analysis/run', route => {
    route.fulfill({
      status: 400,
      body: JSON.stringify({
        code: 'VALIDATION_ERROR',
        message: 'Invalid restaurant name',
      }),
    });
  });
  
  await page.goto('/analysis/new');
  await fillAnalysisForm(page, { restaurant_name: '', location: 'NY' });
  await page.click('button:has-text("Analyze")');
  
  // Should show error toast
  await expect(page.locator('text=Invalid restaurant name')).toBeVisible();
});

test('API 401 error redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Mock 401 response
  await page.route('**/api/v1/auth/me', route => {
    route.fulfill({ status: 401 });
  });
  
  await page.reload();
  
  // Should redirect to login
  await expect(page).toHaveURL('/login');
});

test('API 500 error shows generic error message', async ({ page }) => {
  await loginViaUI(page);
  
  await page.route('**/api/invoices/upload', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ detail: 'Internal server error' }),
    });
  });
  
  await page.goto('/invoices/upload');
  await uploadFile(page, 'tests/fixtures/sample_invoice.pdf');
  
  // Should show error toast
  await expect(page.locator('text=Internal server error')).toBeVisible();
});

test('network timeout shows error', async ({ page }) => {
  await loginViaUI(page);
  
  await page.route('**/api/invoices/upload', route => {
    // Simulate timeout by never responding
    setTimeout(() => route.abort('timedout'), 30000);
  });
  
  await page.goto('/invoices/upload');
  await uploadFile(page, 'tests/fixtures/sample_invoice.pdf');
  
  // Should show timeout error
  await expect(page.locator('text=Request timed out')).toBeVisible({ timeout: 35000 });
});

test('offline network shows error', async ({ page, context }) => {
  await loginViaUI(page);
  
  // Go offline
  await context.setOffline(true);
  
  await page.goto('/invoices/upload');
  await uploadFile(page, 'tests/fixtures/sample_invoice.pdf');
  
  // Should show network error
  await expect(page.locator('text=Network error')).toBeVisible();
});
```

### Loading States

```typescript
test('form submission shows loading state', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/analysis/new');
  
  await fillAnalysisForm(page, {
    restaurant_name: 'Test Pizza',
    location: 'New York, NY',
  });
  
  // Click submit
  await page.click('button:has-text("Analyze Competitors")');
  
  // Button should show loading
  await expect(page.locator('button:has-text("Analyzing")')).toBeVisible();
  await expect(page.locator('.animate-spin')).toBeVisible();
  
  // Button should be disabled
  await expect(page.locator('button:has-text("Analyzing")')).toBeDisabled();
});

test('file upload shows progress indicator', async ({ page }) => {
  await loginViaUI(page);
  await page.goto('/invoices/upload');
  
  await uploadFile(page, 'tests/fixtures/sample_invoice.pdf');
  
  // Should show progress bar
  await expect(page.locator('[role="progressbar"]')).toBeVisible();
  
  // Should show percentage
  await expect(page.locator('text=%')).toBeVisible();
});

test('data fetching shows skeleton loader', async ({ page }) => {
  await loginViaUI(page);
  
  // Delay API response
  await page.route('**/api/invoices/', route => {
    setTimeout(() => route.continue(), 2000);
  });
  
  await page.goto('/invoices');
  
  // Should show loading spinner
  await expect(page.locator('.animate-spin')).toBeVisible();
});
```


### Responsive Design

```typescript
test('mobile viewport (375px) works correctly', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');
  
  // Mobile menu should be visible
  await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();
  
  // Desktop nav should be hidden
  await expect(page.locator('nav.hidden.md\\:flex')).not.toBeVisible();
  
  // Sticky bottom CTA should be visible
  await expect(page.locator('.fixed.bottom-0')).toBeVisible();
});

test('tablet viewport (768px) works correctly', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  
  await loginViaUI(page);
  await page.goto('/dashboard');
  
  // Grid should adjust to 2 columns
  const grid = page.locator('.grid');
  await expect(grid).toHaveClass(/md:grid-cols-2/);
});

test('desktop viewport (1920px) works correctly', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  await loginViaUI(page);
  await page.goto('/dashboard');
  
  // Grid should show 3 columns
  const grid = page.locator('.grid');
  await expect(grid).toHaveClass(/lg:grid-cols-3/);
});

test('touch interactions work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await loginViaUI(page);
  await page.goto('/analysis/new');
  
  // Tap on tier selector
  await page.tap('[data-testid="tier-free"]');
  
  // Should select tier
  await expect(page.locator('[data-testid="tier-free"]')).toHaveClass(/selected/);
});

test('inputs are touch-friendly (min 44px height)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/login');
  
  // Check input height
  const emailInput = page.locator('[data-testid="email-input"]');
  const box = await emailInput.boundingBox();
  
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
```

---

## Test Utilities & Helpers

### Authentication Helper
```typescript
// tests/helpers/auth.ts
export async function loginViaUI(
  page: Page,
  email = 'test@example.com',
  password = 'password123'
) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function loginViaAPI(page: Page, user: TestUser) {
  // Set auth cookie directly via API
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
    }),
  });
  
  const { access_token } = await response.json();
  
  // Set cookie in browser context
  await page.context().addCookies([{
    name: 'access_token',
    value: access_token,
    domain: 'localhost',
    path: '/',
  }]);
}
```

### File Upload Helper
```typescript
// tests/helpers/upload.ts
export async function uploadFile(page: Page, filePath: string) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
}

export async function uploadAndWaitForParse(
  page: Page,
  filePath: string,
  timeout = 60000
) {
  await uploadFile(page, filePath);
  await page.waitForSelector('text=Ready for Review', { timeout });
}
```

### Form Helpers
```typescript
// tests/helpers/forms.ts
export async function fillAnalysisForm(
  page: Page,
  data: {
    restaurant_name: string;
    location: string;
    category?: string;
    tier?: 'free' | 'premium';
  }
) {
  await page.fill('[data-testid="restaurant-name"]', data.restaurant_name);
  await page.fill('[data-testid="location"]', data.location);
  
  if (data.category) {
    await page.click('[data-testid="category"]');
    await page.click(`[role="option"]:has-text("${data.category}")`);
  }
  
  if (data.tier) {
    await page.click(`[data-testid="tier-${data.tier}"]`);
  }
}
```


### Test Data Management
```typescript
// tests/fixtures/testData.ts
export const TEST_USERS = {
  free: {
    email: 'free@test.com',
    password: 'Test123!@#',
    subscription_tier: 'free',
  },
  premium: {
    email: 'premium@test.com',
    password: 'Test123!@#',
    subscription_tier: 'premium',
  },
};

export const TEST_FILES = {
  invoice: {
    small: 'tests/fixtures/sample_invoice_5_items.pdf',
    medium: 'tests/fixtures/sample_invoice_20_items.pdf',
    large: 'tests/fixtures/sample_invoice_50_items.pdf',
    invalid: 'tests/fixtures/invalid_file.txt',
  },
  menu: {
    small: 'tests/fixtures/sample_menu_10_items.pdf',
    medium: 'tests/fixtures/sample_menu_30_items.pdf',
    invalid: 'tests/fixtures/invalid_menu.txt',
  },
};

export function generateUniqueEmail() {
  return `test${Date.now()}@example.com`;
}
```

### Cleanup Helper
```typescript
// tests/helpers/cleanup.ts
export async function cleanupTestUser(userId: string) {
  await fetch(`${API_URL}/api/v1/test/cleanup/${userId}`, {
    method: 'DELETE',
  });
}

export async function cleanupTestData(page: Page) {
  // Delete all test invoices
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
```

---

## Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  use: {
    baseURL: process.env.VITE_APP_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## Test Execution Strategy

### Local Development
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
```

### CI/CD Pipeline
```yaml
# .github/workflows/e2e-tests.yml
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
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_API_URL: ${{ secrets.TEST_API_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```


---

## Test File Structure

```
frontend/
├── tests/
│   ├── e2e/
│   │   ├── 01-onboarding.spec.ts          # Journey 1: Auth
│   │   ├── 02-invoice-workflow.spec.ts    # Journey 2: Invoices
│   │   ├── 03-menu-workflow.spec.ts       # Journey 3: Menu
│   │   ├── 04-comparison-workflow.spec.ts # Journey 4: Comparison
│   │   ├── 05-analysis-workflow.spec.ts   # Journey 5: Analysis
│   │   ├── 06-error-handling.spec.ts      # Cross-cutting: Errors
│   │   └── 07-responsive.spec.ts          # Cross-cutting: Responsive
│   │
│   ├── helpers/
│   │   ├── auth.ts                        # Auth utilities
│   │   ├── upload.ts                      # File upload utilities
│   │   ├── forms.ts                       # Form filling utilities
│   │   └── cleanup.ts                     # Cleanup utilities
│   │
│   ├── fixtures/
│   │   ├── sample_invoice_5_items.pdf
│   │   ├── sample_invoice_20_items.pdf
│   │   ├── sample_invoice_50_items.pdf
│   │   ├── sample_menu_10_items.pdf
│   │   ├── sample_menu_30_items.pdf
│   │   ├── invalid_file.txt
│   │   └── testData.ts
│   │
│   └── playwright.config.ts
│
└── package.json
```

---

## Success Metrics

### Coverage Goals
- **User Journeys**: 5/5 complete flows (100%)
- **Critical Components**: 95%+ coverage
- **API Integration**: All endpoints tested
- **Error Scenarios**: All error codes tested

### Performance Goals
- **Execution Time**: < 15 minutes for full suite
- **Flakiness Rate**: < 2% failure rate
- **Parallel Execution**: 4 workers minimum

### Quality Goals
- **Maintainability**: < 1 hour/week maintenance
- **Readability**: Clear test names and comments
- **Reliability**: 98%+ pass rate in CI

---

## Implementation Priority

### Week 1: Foundation
1. Set up Playwright configuration
2. Create test helpers and utilities
3. Implement Journey 1 (Onboarding)
4. Set up CI/CD pipeline

### Week 2: Core Workflows
1. Implement Journey 2 (Invoice Workflow)
2. Implement Journey 3 (Menu Workflow)
3. Add error handling tests

### Week 3: Advanced Features
1. Implement Journey 4 (Menu Comparison)
2. Implement Journey 5 (Review Analysis)
3. Add responsive design tests

### Week 4: Polish & Optimization
1. Fix flaky tests
2. Optimize test execution time
3. Add visual regression tests (optional)
4. Document test suite

---

## Maintenance Guidelines

### Weekly Tasks
- Review test failures in CI
- Update test data if schema changes
- Fix flaky tests immediately
- Update snapshots if UI changes

### Monthly Tasks
- Review test coverage gaps
- Update tests for new features
- Optimize slow tests
- Audit test data cleanup

### Quarterly Tasks
- Review test suite effectiveness
- Remove obsolete tests
- Update testing strategy
- Train team on test writing

---

## Conclusion

This comprehensive frontend test outline provides:

✅ **Complete Coverage**: All 5 critical user journeys mapped
✅ **Detailed Test Steps**: Specific Playwright code examples
✅ **Error Scenarios**: All error cases documented
✅ **Test Utilities**: Reusable helpers for efficiency
✅ **CI/CD Integration**: Ready for automated testing
✅ **Maintenance Plan**: Long-term sustainability

**Total Estimated Time**: 21 minutes for full E2E suite
- Journey 1 (Onboarding): 3 min
- Journey 2 (Invoice): 5 min
- Journey 3 (Menu): 4 min
- Journey 4 (Comparison): 4 min
- Journey 5 (Analysis): 5 min

**Next Steps**:
1. Review and approve test outline
2. Set up Playwright in frontend project
3. Create test fixtures (sample PDFs)
4. Implement tests journey by journey
5. Integrate with CI/CD pipeline

