# Quick Command Reference

## Installation

```bash
npm install                 # Install dependencies
npm run test:install        # Install Playwright browsers
```

## Running Tests

```bash
npm run test:e2e                              # Run all tests
npm run test:e2e -- e2e/01-onboarding.spec.ts # Run specific file
npm run test:e2e -- -g "user can login"       # Run specific test
```

## Development

```bash
npm run test:e2e:headed     # Run with visible browser
npm run test:e2e:debug      # Run in debug mode
npm run test:e2e:ui         # Run in UI mode (interactive)
```

## Browser-Specific

```bash
npm run test:e2e:chromium   # Run on Chrome
npm run test:e2e:firefox    # Run on Firefox
npm run test:e2e:webkit     # Run on Safari
npm run test:e2e:mobile     # Run on mobile devices
```

## Reports

```bash
npm run test:report         # View HTML report
```

## File Locations

```
e2e/01-onboarding.spec.ts          # Journey 1: Auth tests
helpers/auth.ts                     # Auth utilities
helpers/upload.ts                   # Upload utilities
helpers/forms.ts                    # Form utilities
helpers/cleanup.ts                  # Cleanup utilities
fixtures/testData.ts                # Test data
```

## Common Helpers

```typescript
// Auth
import { loginViaUI, registerViaUI, logout } from '../helpers/auth';

// Upload
import { uploadFile, uploadAndWaitForParse } from '../helpers/upload';

// Forms
import { fillAnalysisForm, editLineItem } from '../helpers/forms';

// Cleanup
import { cleanupBrowserStorage } from '../helpers/cleanup';

// Test Data
import { TEST_USERS, TEST_FILES } from '../fixtures/testData';
```

## Troubleshooting

```bash
# Frontend not running?
cd ../../../frontend && npm run dev

# Backend not running?
cd ../../../ && python -m uvicorn api.main:app --reload

# Tests failing?
npm run test:e2e:headed -- e2e/01-onboarding.spec.ts

# Need to debug?
npm run test:e2e:debug -- e2e/01-onboarding.spec.ts
```
