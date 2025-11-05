# Menu Upload Usage Limits - Implementation Complete

## Problem
Free tier users could upload unlimited menus, which wasn't intended. Should be limited to 1 menu upload per week.

## Solution Implemented

### Backend Changes

#### 1. Added Usage Limit Check (`api/routes/menu/management.py`)
```python
@router.post("/save")
async def save_menu(...):
    # Check usage limits (free tier: 1 menu upload per week)
    usage_service = get_usage_limit_service()
    allowed, limit_details = usage_service.check_limit(current_user, 'menu_upload')
    
    if not allowed:
        raise HTTPException(status_code=429, detail={
            'error': 'Usage limit exceeded',
            'message': limit_details['message'],
            'current_usage': limit_details['current_usage'],
            'limit': limit_details['limit_value'],
            'reset_date': limit_details['reset_date']
        })
```

#### 2. Added Usage Increment After Success
```python
# Only increment after successful save
usage_service.increment_usage(
    user_id=current_user,
    operation_type='menu_upload',
    operation_id=menu_id,
    metadata={'items_count': len(menu_items)}
)
```

#### 3. Added Check Endpoint
```python
@router.get("/upload-limit")
async def check_menu_upload_limit(...):
    # Returns current usage, limit, reset date
    # Frontend can check before allowing upload
```

### Frontend Changes

#### 1. Added Limit Check on Page Load (`frontend/src/components/menu/MenuUpload.tsx`)
```typescript
const [uploadLimit, setUploadLimit] = useState<{
  allowed: boolean;
  current_usage: number;
  limit: number;
  reset_date: string;
  message: string;
  subscription_tier: string;
} | null>(null);

// Check limit on mount
useEffect(() => {
  fetch('/api/menu/upload-limit')
    .then(res => res.json())
    .then(data => setUploadLimit(data));
}, []);
```

#### 2. Added Warning UI
```typescript
{uploadLimit && !uploadLimit.allowed && (
  <Alert className="border-yellow-500/30 bg-yellow-500/10">
    <AlertDescription>
      <strong>Upload Limit Reached</strong>
      <p>{uploadLimit.message}</p>
      <p>Resets: {new Date(uploadLimit.reset_date).toLocaleDateString()}</p>
      <p>Upgrade to Premium for unlimited menu uploads.</p>
    </AlertDescription>
  </Alert>
)}
```

#### 3. Disabled Upload When Limit Reached
```typescript
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  disabled: (uploadLimit && !uploadLimit.allowed),
  // ... other options
});
```

#### 4. Show Usage Counter
```typescript
{uploadLimit && uploadLimit.allowed && (
  <p className="text-xs text-slate-500">
    {uploadLimit.current_usage} of {uploadLimit.limit} uploads used this week
  </p>
)}
```

## Usage Limits (Free Tier)

### Weekly Limits (Reset Monday 12:00 AM EST)
- ✅ 1 invoice upload
- ✅ 2 free review analyses
- ✅ 1 menu comparison
- ✅ **1 menu upload** (NEW - now enforced)
- ✅ 1 premium review analysis

### 28-Day Limits
- ✅ 2 bonus invoice uploads

### Premium/Enterprise
- ♾️ Unlimited everything

## Database Schema

Already exists in `user_usage_limits` table:
```sql
CREATE TABLE user_usage_limits (
    user_id UUID PRIMARY KEY,
    weekly_menu_uploads INTEGER DEFAULT 0,
    weekly_reset_date TIMESTAMP WITH TIME ZONE,
    -- ... other limits
);
```

Database function `check_usage_limit()` already handles:
- Automatic weekly resets (Monday 12:00 AM EST)
- Atomic increment operations
- Premium/Enterprise bypass
- Audit trail logging

## Error Handling

### Backend Response (429 Too Many Requests)
```json
{
  "error": "Usage limit exceeded",
  "message": "You've used 1 of 1 menu uploads this week. Resets on 2025-11-11.",
  "current_usage": 1,
  "limit": 1,
  "reset_date": "2025-11-11T05:00:00Z",
  "subscription_tier": "free"
}
```

### Frontend Display
- Yellow warning alert at top of page
- Upload zone disabled (grayed out)
- Clear message about when limit resets
- Upgrade prompt for premium users

## Testing

### Test Free Tier Limit
```bash
# As free user, upload first menu
POST /api/menu/save
# Response: 200 OK, usage_info: {current_usage: 1, limit: 1}

# Try to upload second menu
POST /api/menu/save
# Response: 429 Too Many Requests
# Error: "You've used 1 of 1 menu uploads this week"
```

### Test Premium Bypass
```bash
# As premium user
POST /api/menu/save
# Response: 200 OK (no limit check)

# Can upload unlimited menus
```

### Test Reset
```bash
# Wait until Monday 12:00 AM EST
# Or manually reset in database:
UPDATE user_usage_limits 
SET weekly_menu_uploads = 0 
WHERE user_id = 'test-user-id';
```

## User Experience

### Before Limit Reached
- Upload zone active
- Shows "0 of 1 uploads used this week"
- Normal upload flow

### After Limit Reached
- Yellow warning banner appears
- Upload zone disabled (can't drag/drop)
- Clear message: "Upload Limit Reached"
- Shows reset date
- Suggests premium upgrade

### Premium Users
- No warnings
- No limits
- Upload freely

## Security

✅ Atomic operations (no race conditions)
✅ Server-side enforcement (can't bypass)
✅ Audit trail (all uploads logged)
✅ Premium bypass (checked in database)
✅ Fail-closed (deny on error)

## Next Steps

1. ✅ Menu upload limits enforced
2. Consider: Email notification when limit reached
3. Consider: In-app upgrade flow
4. Consider: Grace period for first-time users
5. Monitor: Track how many users hit limits

## Related Files

- `services/usage_limit_service.py` - Core limit logic
- `api/routes/menu/management.py` - Enforcement
- `frontend/src/components/menu/MenuUpload.tsx` - UI
- `database/migrations/023_free_tier_usage_limits.sql` - Schema
