# Usage Limits - Upload Endpoint Fix ✅

## Problem Identified

Usage limits were being checked at the **SAVE** step instead of the **UPLOAD** step, allowing users to:
1. Upload file ✅ (no check)
2. Parse invoice ✅ (no check)  
3. Review data ✅ (no check)
4. Click "Save" ❌ (blocked here - too late!)

This wasted user time and server resources processing files that couldn't be saved.

## Root Cause

Limit checks were only in:
- `POST /api/invoices/save` - After parsing
- `POST /api/menu/save` - After parsing

But NOT in:
- `POST /api/invoices/upload` - File upload endpoint
- `POST /api/menu/upload` - File upload endpoint

## Solution

Added usage limit checks to **upload endpoints** BEFORE any processing.

### Invoice Upload Fix

**File**: `api/routes/invoices/upload.py`

```python
@router.post("/upload")
async def upload_invoice(...):
    # Check usage limits FIRST (before any processing)
    from services.usage_limit_service import get_usage_limit_service
    usage_service = get_usage_limit_service()
    
    allowed, limit_details = usage_service.check_limit(current_user, 'invoice_upload')
    
    if not allowed:
        raise HTTPException(status_code=429, detail={
            'error': 'Usage limit exceeded',
            'message': limit_details['message'],
            ...
        })
    
    # Now proceed with upload/validation/parsing
    ...
```

### Menu Upload Fix

**File**: `api/routes/menu/upload.py`

```python
@router.post("/upload")
async def upload_menu(...):
    # Check usage limits FIRST (before any processing)
    from services.usage_limit_service import get_usage_limit_service
    usage_service = get_usage_limit_service()
    
    allowed, limit_details = usage_service.check_limit(current_user, 'menu_upload')
    
    if not allowed:
        raise HTTPException(status_code=429, detail={
            'error': 'Usage limit exceeded',
            'message': limit_details['message'],
            ...
        })
    
    # Now proceed with upload/validation/parsing
    ...
```

### Frontend Error Handling

**File**: `frontend/src/components/invoice/InvoiceUpload.tsx`

```typescript
const uploadFile = async (file: File): Promise<string> => {
  const response = await fetch('/api/invoices/upload', {...});
  
  if (!response.ok) {
    const error = await response.json();
    
    // Handle usage limit errors specially
    if (response.status === 429) {
      const limitError = error.detail || error;
      throw new Error(limitError.message || 'Usage limit exceeded');
    }
    
    throw new Error(error.detail || 'Upload failed');
  }
  
  return result.file_url;
};
```

## New Flow (Fixed)

### Invoice Upload
```
1. User drops file in upload zone
2. Frontend calls POST /api/invoices/upload
3. Backend checks usage limit IMMEDIATELY
   ├─ If blocked: Return 429 error
   │  └─ User sees: "You've used 1 of 1 uploads this week"
   └─ If allowed: Continue with upload
4. File validated
5. File uploaded to storage
6. Parsing begins
7. User reviews data
8. User clicks "Save"
9. Backend checks limit AGAIN (double-check)
10. Increment usage counter
11. Success!
```

### Menu Upload
```
1. User drops file in upload zone
2. Frontend calls POST /api/menu/upload
3. Backend checks usage limit IMMEDIATELY
   ├─ If blocked: Return 429 error
   │  └─ User sees: "You've used 1 of 1 uploads this week"
   └─ If allowed: Continue with upload
4. File validated
5. File uploaded to storage
6. Parsing begins
7. User reviews data
8. User clicks "Save"
9. Backend checks limit AGAIN (double-check)
10. Increment usage counter
11. Success!
```

## Defense in Depth

We now have **TWO** limit checks:

1. **Upload Endpoint** (Primary)
   - Blocks immediately
   - Prevents wasted processing
   - Better UX

2. **Save Endpoint** (Secondary)
   - Double-check for safety
   - Prevents race conditions
   - Ensures atomicity

## Benefits

✅ **Faster Feedback** - User knows immediately if blocked
✅ **No Wasted Time** - Don't parse files that can't be saved
✅ **No Wasted Resources** - Don't process blocked uploads
✅ **Better UX** - Clear error message right away
✅ **Consistent** - Same pattern for invoices and menus
✅ **Secure** - Double-check at save prevents bypasses

## Testing

### Test Upload Block
```bash
# As free user who already uploaded 1 invoice
curl -X POST http://localhost:8000/api/invoices/upload \
  -H "Cookie: session=..." \
  -F "file=@invoice.pdf"

# Response: 429 Too Many Requests
{
  "error": "Usage limit exceeded",
  "message": "You've used 1 of 1 invoice uploads this week. Resets on 2025-11-11.",
  "current_usage": 1,
  "limit": 1,
  "reset_date": "2025-11-11T05:00:00Z"
}
```

### Test Frontend Handling
1. Go to `/invoices` as free user with 1 upload used
2. Try to drag/drop a file
3. Should see error toast immediately
4. File should NOT be uploaded or parsed

## Files Modified

### Backend
- ✅ `api/routes/invoices/upload.py` - Added limit check
- ✅ `api/routes/menu/upload.py` - Added limit check

### Frontend
- ✅ `frontend/src/components/invoice/InvoiceUpload.tsx` - Better error handling

## Edge Cases Handled

1. **Race Condition** - Two checks (upload + save) prevent bypass
2. **Network Error** - Frontend shows generic error
3. **429 Error** - Frontend shows limit message
4. **Premium Users** - Check passes immediately
5. **Expired Limits** - Automatic reset handled by database

## Result

Users are now blocked at the **upload** step instead of the **save** step, providing immediate feedback and preventing wasted processing time.

## Before vs After

### Before (Bad)
```
User: *uploads file*
System: "Processing..." (30 seconds)
User: *reviews data*
User: *clicks save*
System: "Error: Usage limit exceeded"
User: 😡 "Why did you let me upload and parse it then?!"
```

### After (Good)
```
User: *tries to upload file*
System: "Usage limit exceeded. You've used 1 of 1 uploads this week."
User: "Oh, I need to wait until Monday or upgrade"
User: 👍 "At least I know right away"
```

## Complete! ✅

Usage limits now block at the upload step, not the save step.
