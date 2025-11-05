# Shared Test Resources

Resources shared between backend and frontend test suites.

## Structure

```
shared/
├── api-contract-tests/    # API contract validation
│   ├── auth-endpoints.ts
│   ├── invoice-endpoints.ts
│   ├── menu-endpoints.ts
│   ├── comparison-endpoints.ts
│   └── analysis-endpoints.ts
│
└── test-data/            # Shared test data
    ├── users.json        # Test user accounts
    └── sample-files/     # Sample PDFs for testing
        ├── sample_invoice.pdf
        ├── sample_menu.pdf
        └── invalid_file.txt
```

## API Contracts

API contracts ensure backend and frontend stay in sync.

**Backend Agent:** Documents all API endpoints here  
**Frontend Agent:** Validates requests/responses against contracts

### Example Contract

```typescript
// api-contract-tests/auth-endpoints.ts
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

## Test Data

### users.json
Consistent test users across both suites:

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

### Sample Files
- **sample_invoice.pdf** - Sysco format, 5-10 line items
- **sample_menu.pdf** - Restaurant menu, 10-20 items, 3-4 categories
- **invalid_file.txt** - For error testing

## Usage

### Backend (Python)
```python
import json
from pathlib import Path

# Load test users
with open('../shared/test-data/users.json') as f:
    test_users = json.load(f)

free_user = test_users['free_tier_user']

# Load sample file
SAMPLE_INVOICE = Path(__file__).parent.parent / 'shared/test-data/sample-files/sample_invoice.pdf'
```

### Frontend (TypeScript)
```typescript
import testUsers from '../../shared/test-data/users.json';

export const FREE_TIER_USER = testUsers.free_tier_user;

// Load sample file
const SAMPLE_INVOICE = 'tests/production/shared/test-data/sample-files/sample_invoice.pdf';
```

## Coordination

When adding new test data:
1. Add to appropriate location in `shared/`
2. Update this README
3. Notify other agent
4. Both agents can now use the data
