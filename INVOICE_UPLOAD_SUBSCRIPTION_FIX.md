# Invoice Upload Subscription Tier Fix

## Problem
Invoice uploads were failing with `KeyError: 'subscription_tier'` when accessing usage limit details.

## Root Cause
The `usage_limit_service.py` had two error handling paths that returned a details dictionary without the `subscription_tier` key:
1. When no result was returned from the database function
2. When an exception occurred during the check

## Solution
Added `'subscription_tier': 'free'` to both error handling paths in `services/usage_limit_service.py`:

### Fixed Error Paths
1. **No result from database** (line 100-108)
2. **Exception during check** (line 110-118)

Both now include `subscription_tier` in the returned dictionary.

## How Premium Users Bypass Limits
Premium and enterprise users automatically get unlimited access through the database function `check_usage_limit()` in migration 023:

```sql
-- Premium/Enterprise users have unlimited access
IF v_subscription_tier IN ('premium', 'enterprise') THEN
    RETURN QUERY SELECT TRUE, 0, 999999, NOW(), 'Unlimited access'::TEXT;
    RETURN;
END IF;
```

This means:
- Premium users: Unlimited invoice uploads
- Enterprise users: Unlimited invoice uploads
- Free users: 1 weekly + 2 bonus per 28 days

## Testing
To test with your premium account:
1. Upload an invoice - should succeed without rate limit errors
2. Check the response - should not show usage limit warnings
3. The database function will return `allowed=TRUE` with message "Unlimited access"

## Files Modified
- `services/usage_limit_service.py` - Added `subscription_tier` to error paths
