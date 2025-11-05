# Safe Frontend Error Handling Guide
**Date:** November 2, 2025
**Status:** ✅ Non-Breaking Enhancement

## What Was Added

Added **optional** safe error handling wrapper to `frontend/src/services/api/client.ts` that doesn't break existing code.

### New Functions

1. **`safeRequest<T>()`** - Wrapper for API calls that returns errors instead of throwing
2. **`getErrorMessage()`** - User-friendly error messages based on status codes

## Key Features

✅ **Non-Breaking** - Existing code continues to work exactly as before
✅ **Opt-In** - Use only where you want better error handling
✅ **Type-Safe** - Full TypeScript support
✅ **User-Friendly** - Automatic error message translation

## Usage Examples

### Option 1: Keep Existing Code (No Changes Needed)

```typescript
// This still works exactly as before - NO CHANGES REQUIRED
try {
  const response = await apiClient.get('/invoices');
  setInvoices(response.data);
} catch (error) {
  toast.error('Failed to load invoices');
}
```

### Option 2: Use Safe Wrapper (Opt-In)

```typescript
import { safeRequest, getErrorMessage } from '@/services/api/client';

// Returns {data, error, success} instead of throwing
const result = await safeRequest(() => apiClient.get('/invoices'));

if (result.success) {
  setInvoices(result.data);
} else {
  // User-friendly error message automatically provided
  toast.error(result.error.message);
}
```

### Option 3: Custom Error Handling

```typescript
const result = await safeRequest(
  () => apiClient.post('/invoices', invoiceData),
  {
    errorMessage: 'Failed to save invoice',
    onError: (error) => {
      // Custom error handling
      if (error.status === 402) {
        navigate('/upgrade');
      }
    }
  }
);
```

## Migration Strategy (Gradual, No Rush)

### Phase 1: New Code Only
Use `safeRequest()` for all **new** API calls. Don't touch existing code.

### Phase 2: High-Value Updates (Optional)
Update critical user flows where better error messages help:
- Login/Register
- Invoice upload
- Payment processing

### Phase 3: Gradual Migration (Optional)
Slowly migrate existing code as you touch it. No deadline.

## Error Message Mapping

The wrapper automatically provides user-friendly messages:

| Status | Auto Message |
|--------|-------------|
| 400 | "Invalid request. Please check your input." |
| 401 | "Please log in to continue." |
| 403 | "You don't have permission to do that." |
| 404 | "The requested resource was not found." |
| 409 | "This action conflicts with existing data." |
| 422 | "Invalid data provided. Please check your input." |
| 429 | "Too many requests. Please slow down." |
| 500 | "Server error. Please try again later." |
| 502/503 | "Service temporarily unavailable." |

## Real-World Examples

### Example 1: Invoice Upload (Before)

```typescript
// Old way - still works fine
const handleUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/invoices/upload', formData);
    toast.success('Invoice uploaded!');
    navigate(`/invoices/${response.data.id}`);
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Upload failed');
  }
};
```

### Example 1: Invoice Upload (New - Optional)

```typescript
// New way - better error handling
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const result = await safeRequest(
    () => apiClient.post('/invoices/upload', formData),
    {
      errorMessage: 'Failed to upload invoice',
      onError: (error) => {
        // Handle specific errors
        if (error.status === 413) {
          toast.error('File too large. Maximum size is 10MB.');
        } else if (error.status === 402) {
          toast.error('Upgrade to upload more invoices.');
        }
      }
    }
  );
  
  if (result.success) {
    toast.success('Invoice uploaded!');
    navigate(`/invoices/${result.data.id}`);
  } else {
    // Generic error already shown by onError or default message
    toast.error(result.error.message);
  }
};
```

### Example 2: Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  setLoading(true);
  
  const result = await safeRequest(
    () => apiClient.post('/api/endpoint', data),
    { errorMessage: 'Failed to save changes' }
  );
  
  setLoading(false);
  
  if (result.success) {
    toast.success('Saved successfully!');
    onClose();
  } else {
    // Error message automatically user-friendly
    toast.error(result.error.message);
    
    // Can also check specific errors
    if (result.error.status === 422) {
      setFieldErrors(result.error.details?.errors);
    }
  }
};
```

### Example 3: Data Fetching

```typescript
const loadData = async () => {
  setLoading(true);
  
  const result = await safeRequest(() => apiClient.get('/data'));
  
  setLoading(false);
  
  if (result.success) {
    setData(result.data);
  } else {
    // Show error in UI instead of toast
    setError(result.error.message);
  }
};
```

## Benefits

### For Users
- ✅ Clear, actionable error messages
- ✅ No technical jargon
- ✅ Consistent error experience

### For Developers
- ✅ Less boilerplate code
- ✅ Type-safe error handling
- ✅ Automatic error logging in dev
- ✅ Easy to add custom error handling

### For Debugging
- ✅ Errors logged in development
- ✅ Full error details available
- ✅ Easy to track down issues

## Testing

### Test Error Scenarios

```typescript
// Test 401 - Unauthorized
const result = await safeRequest(() => apiClient.get('/protected'));
expect(result.success).toBe(false);
expect(result.error?.status).toBe(401);
expect(result.error?.message).toContain('log in');

// Test 404 - Not Found
const result = await safeRequest(() => apiClient.get('/nonexistent'));
expect(result.error?.message).toContain('not found');

// Test 500 - Server Error
const result = await safeRequest(() => apiClient.get('/error'));
expect(result.error?.message).toContain('Server error');
```

## Rollout Plan

### Week 1: No Changes
- ✅ Code added but not used
- ✅ Existing functionality unchanged
- ✅ Zero risk

### Week 2-4: New Features Only
- Use `safeRequest()` for new API calls
- Existing code untouched
- Low risk

### Month 2+: Gradual Migration (Optional)
- Update high-value flows
- Migrate as you touch code
- No deadline, no pressure

## Backwards Compatibility

**100% backwards compatible:**
- All existing API calls work unchanged
- No breaking changes
- Opt-in only
- Can mix old and new styles

## When to Use Each Style

### Use Old Style (try/catch) When:
- Code already works well
- Simple error handling needed
- Quick prototypes
- You're in a hurry

### Use New Style (safeRequest) When:
- Building new features
- Need better error messages
- Want type-safe errors
- Complex error handling needed

## Common Patterns

### Pattern 1: Simple Fetch

```typescript
const { data, error } = await safeRequest(() => apiClient.get('/items'));
if (error) return toast.error(error.message);
setItems(data);
```

### Pattern 2: Form with Validation

```typescript
const result = await safeRequest(() => apiClient.post('/items', formData));
if (!result.success) {
  if (result.error.status === 422) {
    setErrors(result.error.details?.errors);
  } else {
    toast.error(result.error.message);
  }
  return;
}
toast.success('Saved!');
```

### Pattern 3: Silent Failure

```typescript
const result = await safeRequest(() => apiClient.get('/optional-data'));
// Don't show error, just use fallback
setData(result.data || fallbackData);
```

## Conclusion

This is a **safe, non-breaking enhancement** that:
- ✅ Doesn't require any immediate changes
- ✅ Improves error handling when you want it
- ✅ Provides better UX for users
- ✅ Makes debugging easier

**Use it when it helps, ignore it when it doesn't.**
