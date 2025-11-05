# Usage Limits - Complete Frontend Integration

## Overview
Centralized system for checking and displaying usage limits across the entire application.

## Architecture

### Backend
```
api/routes/usage_limits.py
├── GET /api/usage/check/{operation_type}  - Check specific limit
├── GET /api/usage/summary                  - Get all limits
└── GET /api/usage/history                  - Get usage history
```

### Frontend
```
frontend/src/
├── hooks/useUsageLimits.ts                - React hooks for limit checking
├── components/common/UsageLimitWarning.tsx - Reusable UI components
└── [feature]/Component.tsx                 - Feature components use hooks
```

## Usage

### 1. Check a Specific Limit

```typescript
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning, UsageCounter } from '@/components/common/UsageLimitWarning';

function MyFeature() {
  const { limit, loading, isBlocked } = useUsageLimit('invoice_upload');
  
  return (
    <>
      {/* Show warning if blocked */}
      {limit && <UsageLimitWarning limit={limit} featureName="invoice uploads" />}
      
      {/* Show usage counter if allowed */}
      {limit && limit.allowed && <UsageCounter limit={limit} />}
      
      {/* Disable feature if blocked */}
      <Button disabled={isBlocked}>Upload Invoice</Button>
    </>
  );
}
```

### 2. Get Full Usage Summary

```typescript
import { useUsageSummary } from '@/hooks/useUsageLimits';

function UsageDashboard() {
  const { summary, loading, isPremium, isUnlimited } = useUsageSummary();
  
  if (isUnlimited) {
    return <div>You have unlimited access! 🎉</div>;
  }
  
  return (
    <div>
      <h2>Your Usage</h2>
      <p>Invoices: {summary?.weekly?.invoice_uploads.used} / {summary?.weekly?.invoice_uploads.limit}</p>
      <p>Menus: {summary?.weekly?.menu_uploads.used} / {summary?.weekly?.menu_uploads.limit}</p>
      <p>Analyses: {summary?.weekly?.free_analyses.used} / {summary?.weekly?.free_analyses.limit}</p>
    </div>
  );
}
```

## Operation Types

All features use these standardized operation types:

| Operation Type | Feature | Free Tier Limit |
|---------------|---------|-----------------|
| `invoice_upload` | Invoice uploads | 1/week + 2/month bonus |
| `menu_upload` | Menu uploads | 1/week |
| `free_analysis` | Free competitor analysis | 2/week |
| `premium_analysis` | Premium competitor analysis | 1/week |
| `menu_comparison` | Menu comparisons | 1/week |

## Implementation Checklist

### ✅ Already Implemented
- [x] Menu uploads (`MenuUpload.tsx`)
- [x] Backend endpoints (`api/routes/usage_limits.py`)
- [x] React hooks (`useUsageLimits.ts`)
- [x] UI components (`UsageLimitWarning.tsx`)

### 🔲 Need to Implement

#### Invoice Uploads
**File**: `frontend/src/components/invoice/InvoiceUpload.tsx`

```typescript
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning, UsageCounter } from '@/components/common/UsageLimitWarning';

function InvoiceUpload() {
  const { limit, isBlocked } = useUsageLimit('invoice_upload');
  
  return (
    <>
      {limit && <UsageLimitWarning limit={limit} featureName="invoice uploads" />}
      {limit && limit.allowed && <UsageCounter limit={limit} />}
      <UploadZone disabled={isBlocked} />
    </>
  );
}
```

#### Competitor Analysis (Free Tier)
**File**: `frontend/src/components/analysis/ReviewAnalysisForm.tsx`

```typescript
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning } from '@/components/common/UsageLimitWarning';

function ReviewAnalysisForm() {
  const { limit, isBlocked } = useUsageLimit('free_analysis');
  
  return (
    <>
      {limit && <UsageLimitWarning limit={limit} featureName="free analyses" />}
      <Button disabled={isBlocked}>Start Analysis</Button>
    </>
  );
}
```

#### Competitor Analysis (Premium Tier)
**File**: `frontend/src/components/analysis/TierSelector.tsx`

```typescript
import { useUsageLimit } from '@/hooks/useUsageLimits';

function TierSelector() {
  const { limit: premiumLimit } = useUsageLimit('premium_analysis');
  
  return (
    <div>
      <Button disabled={premiumLimit?.allowed === false}>
        Premium Analysis
      </Button>
      {premiumLimit && !premiumLimit.allowed && (
        <p>Used {premiumLimit.current_usage} of {premiumLimit.limit} this week</p>
      )}
    </div>
  );
}
```

#### Menu Comparison
**File**: `frontend/src/pages/MenuComparisonPage.tsx`

```typescript
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning } from '@/components/common/UsageLimitWarning';

function MenuComparisonPage() {
  const { limit, isBlocked } = useUsageLimit('menu_comparison');
  
  return (
    <>
      {limit && <UsageLimitWarning limit={limit} featureName="menu comparisons" />}
      <Button disabled={isBlocked}>Compare Menus</Button>
    </>
  );
}
```

## Backend Enforcement

All backend routes MUST check limits before performing operations:

```python
from services.usage_limit_service import get_usage_limit_service

@router.post("/some-operation")
async def some_operation(current_user: str = Depends(get_current_user)):
    # 1. Check limit
    usage_service = get_usage_limit_service()
    allowed, details = usage_service.check_limit(current_user, 'operation_type')
    
    if not allowed:
        raise HTTPException(status_code=429, detail={
            'error': 'Usage limit exceeded',
            'message': details['message'],
            'current_usage': details['current_usage'],
            'limit': details['limit_value'],
            'reset_date': details['reset_date']
        })
    
    # 2. Perform operation
    result = await do_operation()
    
    # 3. Increment usage (only after success)
    usage_service.increment_usage(
        user_id=current_user,
        operation_type='operation_type',
        operation_id=result.id
    )
    
    return result
```

## Error Handling

### Backend Response (429 Too Many Requests)
```json
{
  "error": "Usage limit exceeded",
  "message": "You've used 1 of 1 uploads this week. Resets on 2025-11-11.",
  "current_usage": 1,
  "limit": 1,
  "reset_date": "2025-11-11T05:00:00Z",
  "subscription_tier": "free"
}
```

### Frontend Handling
```typescript
try {
  await apiClient.post('/some-operation');
} catch (error) {
  if (error.response?.status === 429) {
    const details = error.response.data;
    toast({
      title: 'Usage Limit Reached',
      description: details.message,
      variant: 'destructive',
    });
  }
}
```

## Testing

### Test Limit Check
```bash
# Check invoice upload limit
curl http://localhost:8000/api/usage/check/invoice_upload \
  -H "Cookie: session=..."

# Response:
{
  "success": true,
  "allowed": true,
  "current_usage": 0,
  "limit": 1,
  "reset_date": "2025-11-11T05:00:00Z",
  "message": "You have 1 invoice upload remaining this week",
  "subscription_tier": "free"
}
```

### Test Usage Summary
```bash
curl http://localhost:8000/api/usage/summary \
  -H "Cookie: session=..."

# Response:
{
  "subscription_tier": "free",
  "unlimited": false,
  "weekly": {
    "invoice_uploads": {"used": 0, "limit": 1, "reset_date": "2025-11-11T05:00:00Z"},
    "menu_uploads": {"used": 1, "limit": 1, "reset_date": "2025-11-11T05:00:00Z"},
    "free_analyses": {"used": 0, "limit": 2, "reset_date": "2025-11-11T05:00:00Z"}
  }
}
```

## UI Components

### UsageLimitWarning
Shows when limit is reached:
- Yellow warning banner
- Clear message about limit
- Reset date
- Upgrade button (for free users)

### UsageCounter
Shows current usage:
- Progress bar
- "X of Y used" text
- Warning when near limit (80%+)

## Next Steps

1. ✅ Menu uploads - DONE
2. 🔲 Invoice uploads - Add to `InvoiceUpload.tsx`
3. 🔲 Free analyses - Add to `ReviewAnalysisForm.tsx`
4. 🔲 Premium analyses - Add to `TierSelector.tsx`
5. 🔲 Menu comparisons - Add to `MenuComparisonPage.tsx`
6. 🔲 Usage dashboard - Create new page showing all limits
7. 🔲 Upgrade flow - Add premium upgrade modal

## Files Modified

### Created
- `frontend/src/hooks/useUsageLimits.ts`
- `frontend/src/components/common/UsageLimitWarning.tsx`
- `api/routes/usage_limits.py`

### Modified
- `api/main.py` - Added usage limits router
- `frontend/src/components/menu/MenuUpload.tsx` - Uses new hooks
- `api/routes/menu/management.py` - Already has enforcement

### Need to Modify
- `frontend/src/components/invoice/InvoiceUpload.tsx`
- `frontend/src/components/analysis/ReviewAnalysisForm.tsx`
- `frontend/src/components/analysis/TierSelector.tsx`
- `frontend/src/pages/MenuComparisonPage.tsx`
- `api/routes/invoices/management.py` - Add enforcement
- `api/routes/tier_analysis.py` - Add enforcement
- `api/routes/menu_comparison.py` - Add enforcement

## Benefits

✅ **Centralized** - One place to manage all limits
✅ **Reusable** - Same hooks/components everywhere
✅ **Consistent** - Same UI/UX across features
✅ **Type-safe** - TypeScript interfaces
✅ **Testable** - Easy to mock and test
✅ **Maintainable** - Change once, update everywhere
