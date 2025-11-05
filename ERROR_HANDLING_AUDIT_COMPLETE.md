# Error Handling Audit - RestaurantIQ

## Executive Summary

Audited error handling patterns across the application to identify good practices and areas for improvement. Found excellent patterns in invoice/menu upload with specific error messages, but generic error handling in auth flows and other areas.

## ✅ GOOD PATTERNS (Use as Templates)

### 1. **Invoice Upload - EXCELLENT** ⭐
**Location**: `frontend/src/components/invoice/InvoiceUpload.tsx`

**What's Good**:
```tsx
// Specific error handling for rate limits
if (response.status === 429) {
  const limitError = error.detail || error;
  throw new Error(limitError.message || 'Usage limit exceeded');
}

// Specific validation errors
if (!file.type.includes('pdf') && !file.type.includes('image')) {
  toast({
    title: 'Invalid file type',
    description: 'Please upload a PDF or image file',
    variant: 'destructive',
  });
  return;
}

if (file.size > 10 * 1024 * 1024) {
  toast({
    title: 'File too large',
    description: 'Maximum file size is 10MB',
    variant: 'destructive',
  });
  return;
}
```

**Why It's Good**:
- ✅ Specific error messages for each failure type
- ✅ User-friendly language
- ✅ Actionable guidance (file size limit, accepted types)
- ✅ Special handling for rate limits (429)
- ✅ Uses toast notifications consistently

### 2. **Menu Upload - EXCELLENT** ⭐
**Location**: `frontend/src/components/menu/MenuUpload.tsx`

**Same excellent patterns as invoice upload**:
- Specific rate limit handling
- Clear validation messages
- Consistent toast usage

### 3. **Review Analysis Form - GOOD** ✓
**Location**: `frontend/src/components/analysis/ReviewAnalysisForm.tsx`

**What's Good**:
```tsx
// Detects usage limit errors specifically
const isLimitError = error?.response?.status === 429 || 
                    error?.message?.includes('Usage limit') ||
                    error?.message?.includes('limit exceeded');

toast({
  variant: "destructive",
  title: isLimitError ? "Usage Limit Reached" : "Analysis Failed",
  description: error instanceof Error ? error.message : 'Failed to start analysis. Please try again.',
});
```

**Why It's Good**:
- ✅ Differentiates between limit errors and other failures
- ✅ Custom titles based on error type
- ✅ Fallback error message

## ❌ NEEDS IMPROVEMENT

### 1. **Login Form - GENERIC ERRORS** 🔴
**Location**: `frontend/src/components/auth/LoginForm.tsx`

**Current Problem**:
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

**Issues**:
- ❌ Shows raw error message from backend
- ❌ No differentiation between:
  - Invalid credentials (wrong password)
  - Account not found
  - Account locked
  - Network errors
  - Server errors

**Recommended Fix**:
```tsx
const getLoginErrorMessage = (error: string, status?: number): { title: string; description: string } => {
  // Check for specific error patterns
  if (status === 401 || error.toLowerCase().includes('invalid credentials') || error.toLowerCase().includes('incorrect password')) {
    return {
      title: 'Invalid Credentials',
      description: 'The email or password you entered is incorrect. Please try again.',
    };
  }
  
  if (status === 404 || error.toLowerCase().includes('not found') || error.toLowerCase().includes('no account')) {
    return {
      title: 'Account Not Found',
      description: 'No account exists with this email address. Would you like to create one?',
    };
  }
  
  if (status === 423 || error.toLowerCase().includes('locked') || error.toLowerCase().includes('suspended')) {
    return {
      title: 'Account Locked',
      description: 'Your account has been temporarily locked. Please contact support.',
    };
  }
  
  if (status === 429) {
    return {
      title: 'Too Many Attempts',
      description: 'Too many login attempts. Please wait a few minutes and try again.',
    };
  }
  
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: 'Our servers are experiencing issues. Please try again in a few moments.',
    };
  }
  
  // Network errors
  if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
    };
  }
  
  // Fallback
  return {
    title: 'Login Failed',
    description: error || 'An unexpected error occurred. Please try again.',
  };
};

// Usage:
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      <div className="space-y-1">
        <p className="font-semibold">{errorDetails.title}</p>
        <p className="text-sm">{errorDetails.description}</p>
      </div>
    </AlertDescription>
  </Alert>
)}
```

### 2. **Register Form - GENERIC ERRORS** 🔴
**Location**: `frontend/src/components/auth/RegisterForm.tsx`

**Current Problem**:
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

**Issues**:
- ❌ No differentiation between:
  - Email already exists
  - Weak password
  - Invalid email format
  - Network errors
  - Server errors

**Recommended Fix**:
```tsx
const getRegisterErrorMessage = (error: string, status?: number): { title: string; description: string } => {
  if (status === 409 || error.toLowerCase().includes('already exists') || error.toLowerCase().includes('email taken')) {
    return {
      title: 'Email Already Registered',
      description: 'An account with this email already exists. Try logging in instead.',
    };
  }
  
  if (status === 422 || error.toLowerCase().includes('invalid email')) {
    return {
      title: 'Invalid Email',
      description: 'Please enter a valid email address.',
    };
  }
  
  if (error.toLowerCase().includes('password') && error.toLowerCase().includes('weak')) {
    return {
      title: 'Weak Password',
      description: 'Password must be at least 8 characters with a special character.',
    };
  }
  
  if (status === 429) {
    return {
      title: 'Too Many Attempts',
      description: 'Too many registration attempts. Please wait a few minutes.',
    };
  }
  
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      description: 'Unable to create account right now. Please try again in a few moments.',
    };
  }
  
  return {
    title: 'Registration Failed',
    description: error || 'Unable to create account. Please try again.',
  };
};
```

### 3. **Auth Store - NEEDS BACKEND ERROR PARSING** 🟡
**Location**: `frontend/src/stores/authStore.ts`

**Current Problem**:
```tsx
catch (error) {
  set({
    error: error instanceof Error ? error.message : 'Login failed',
  });
}
```

**Issues**:
- ❌ Doesn't extract HTTP status codes
- ❌ Doesn't parse backend error responses
- ❌ Generic fallback messages

**Recommended Fix**:
```tsx
catch (error: any) {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.detail || error?.response?.data?.message;
  const errorMessage = backendMessage || (error instanceof Error ? error.message : 'Login failed');
  
  set({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: errorMessage,
    errorStatus: status, // Add this to state
  });
  throw error;
}
```

### 4. **Dashboard API - SILENT FAILURES** 🟡
**Location**: `frontend/src/services/api/dashboardApi.ts`

**Current Problem**:
```tsx
} catch (error) {
  console.error('Failed to fetch negative alerts:', error);
  return 0; // Silent failure
}
```

**Issues**:
- ❌ Errors are logged but not shown to user
- ❌ Returns default values (0, []) hiding failures
- ❌ User doesn't know data is missing

**Recommended Fix**:
```tsx
} catch (error) {
  console.error('Failed to fetch negative alerts:', error);
  
  // Show toast notification for critical data
  toast({
    title: 'Unable to Load Alerts',
    description: 'Some dashboard data couldn't be loaded. Try refreshing the page.',
    variant: 'destructive',
  });
  
  return 0;
}

// OR return error state that UI can handle:
return { data: 0, error: 'Failed to load alerts' };
```

## 📋 IMPLEMENTATION CHECKLIST

### High Priority (User-Facing Errors)
- [ ] **Login Form**: Add specific error messages for:
  - [ ] Invalid credentials (401)
  - [ ] Account not found (404)
  - [ ] Too many attempts (429)
  - [ ] Server errors (500+)
  - [ ] Network errors

- [ ] **Register Form**: Add specific error messages for:
  - [ ] Email already exists (409)
  - [ ] Invalid email format (422)
  - [ ] Weak password
  - [ ] Too many attempts (429)
  - [ ] Server errors (500+)

- [ ] **Auth Store**: Parse backend errors properly
  - [ ] Extract HTTP status codes
  - [ ] Parse backend error responses
  - [ ] Store error status in state

### Medium Priority (Data Loading)
- [ ] **Dashboard API**: Show user-friendly errors when data fails to load
- [ ] **Menu Comparison API**: Improve stream error handling
- [ ] **Analytics API**: Add error notifications

### Low Priority (Nice to Have)
- [ ] Add error boundary components for React errors
- [ ] Add retry buttons on failed API calls
- [ ] Add offline detection and messaging
- [ ] Add error tracking/monitoring integration

## 🎯 ERROR MESSAGE GUIDELINES

### DO ✅
- **Be specific**: "Invalid email or password" not "Login failed"
- **Be actionable**: "File must be under 10MB" not "File too large"
- **Be friendly**: "Unable to connect" not "Network error 503"
- **Differentiate**: Different messages for different error types
- **Provide next steps**: "Try again" or "Contact support"

### DON'T ❌
- Show raw error messages from backend
- Use technical jargon (401, 500, etc.)
- Leave users guessing what went wrong
- Hide errors silently
- Use generic "Something went wrong" for everything

## 🔧 UTILITY FUNCTIONS TO CREATE

### 1. Error Message Parser
```tsx
// frontend/src/utils/errorMessages.ts

export function parseAuthError(error: any): { title: string; description: string } {
  const status = error?.response?.status;
  const message = error?.response?.data?.detail || error?.message || '';
  
  // ... implementation from above
}

export function parseUploadError(error: any): { title: string; description: string } {
  // ... similar pattern
}

export function parseAPIError(error: any): { title: string; description: string } {
  // ... similar pattern
}
```

### 2. Toast Helper
```tsx
// frontend/src/utils/toastHelpers.ts

export function showErrorToast(toast: any, error: any, context: string) {
  const { title, description } = parseAPIError(error);
  
  toast({
    variant: 'destructive',
    title,
    description,
  });
}
```

## 📊 ERROR TRACKING RECOMMENDATIONS

1. **Add Sentry or similar** for production error tracking
2. **Log error patterns** to identify common issues
3. **Track error rates** by endpoint/feature
4. **Monitor user impact** of errors

## 🎓 LEARNING FROM GOOD PATTERNS

The invoice/menu upload components show the gold standard:
1. Validate early (file type, size)
2. Show specific messages for each failure
3. Handle rate limits specially (429)
4. Use consistent toast notifications
5. Provide clear next steps

**Apply this pattern everywhere!**
