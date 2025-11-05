# Frontend Tests

Playwright E2E test suite for all 5 critical user journeys.

## Structure

```
frontend/
├── e2e/              # End-to-end tests (Playwright)
│   ├── 01-onboarding.spec.ts
│   ├── 02-invoice-workflow.spec.ts
│   ├── 03-menu-workflow.spec.ts
│   ├── 04-comparison-workflow.spec.ts
│   ├── 05-analysis-workflow.spec.ts
│   ├── 06-error-handling.spec.ts
│   └── 07-responsive.spec.ts
├── helpers/          # Test utilities
│   ├── auth.ts
│   ├── upload.ts
│   ├── forms.ts
│   └── cleanup.ts
└── fixtures/         # Test data
    ├── sample_invoice_5_items.pdf
    ├── sample_menu_10_items.pdf
    └── testData.ts
```

## Running Tests

```bash
# All tests
npm run test:e2e

# Specific journey
npm run test:e2e -- tests/e2e/01-onboarding.spec.ts

# Headed mode (see browser)
npm run test:e2e -- --headed

# Debug mode
npm run test:e2e -- --debug

# Specific browser
npm run test:e2e -- --project=chromium
```

## Test Journeys

1. **Onboarding & Authentication** (3 min)
   - Landing page → Register → Login → Auth persistence

2. **Invoice Workflow** (5 min)
   - Upload → Parse (streaming) → Review → Save → List → Detail

3. **Menu Workflow** (4 min)
   - Upload → Parse (streaming) → Review → Save → Dashboard → Recipes

4. **Menu Comparison** (4 min)
   - Discover → Select → Analyze → Results → Save

5. **Review Analysis** (5 min)
   - Form → Tier selection → Streaming → Insights → Evidence → Save

**Total:** ~21 minutes for full suite
