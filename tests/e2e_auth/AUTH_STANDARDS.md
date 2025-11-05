# 🔒 AUTH STANDARDS - SOURCE OF TRUTH

**THIS IS THE DEFINITIVE STANDARD FOR AUTHENTICATION IN THIS PROJECT**

Any deviation from these standards is a bug. No exceptions.

---

## 🎯 CORE PRINCIPLE

**ALL authentication MUST use HTTPOnly cookies. NO Bearer tokens. EVER.**

---

## ✅ CORRECT AUTH PATTERNS

### Backend (FastAPI)

#### ✅ CORRECT: Cookie-based Auth Dependency
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError

async def get_current_user(
    request: Request,
    supabase: Client = Depends(get_supabase)
) -> dict:
    """Get current user from HTTPOnly cookie"""
    # Get token from cookie
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        # ... fetch user from database
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
```

#### ✅ CORRECT: Login Endpoint
```python
@router.post("/login")
async def login(credentials: LoginCredentials, response: Response):
    """Login and set HTTPOnly cookie"""
    # Verify credentials
    user = await authenticate_user(credentials.email, credentials.password)
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Set HTTPOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,      # ✅ CRITICAL: Prevents JavaScript access
        secure=True,        # ✅ HTTPS only
        samesite="lax",     # ✅ CSRF protection
        max_age=3600,       # 1 hour
        path="/"
    )
    
    # Return user data ONLY (no token in body)
    return {"user": user}
```

#### ✅ CORRECT: Protected Endpoint
```python
@router.get("/invoices")
async def list_invoices(
    current_user: dict = Depends(get_current_user)
):
    """List user's invoices - requires auth"""
    invoices = await get_user_invoices(current_user["id"])
    return invoices
```

#### ✅ CORRECT: CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,  # ✅ CRITICAL: Allows cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Frontend (React + TypeScript)

#### ✅ CORRECT: API Client
```typescript
// services/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,  // ✅ CRITICAL: Sends cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// NO Authorization interceptor!
// Cookies are sent automatically
```

#### ✅ CORRECT: Login Function
```typescript
// stores/authStore.ts
async login(credentials: LoginCredentials) {
  const response = await apiClient.post('/api/v1/auth/login', credentials);
  
  // Cookies are set automatically by backend
  // Store user data ONLY (no token)
  set({
    user: response.data.user,
    isAuthenticated: true,
  });
}
```

#### ✅ CORRECT: Auth State
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // NO token field!
}
```

#### ✅ CORRECT: Fetch with Cookies
```typescript
// hooks/useSaveStream.ts
const response = await fetch(`${baseUrl}/invoices/save-stream`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // ✅ CRITICAL: Sends cookies
  body: JSON.stringify(data),
});
```

#### ✅ CORRECT: Protected Route
```typescript
// components/auth/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

---

## ❌ INCORRECT PATTERNS (BUGS!)

### ❌ WRONG: Bearer Token in Frontend
```typescript
// ❌ NEVER DO THIS
const token = localStorage.getItem('access_token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,  // ❌ BUG!
  }
});
```

### ❌ WRONG: Token in localStorage
```typescript
// ❌ NEVER DO THIS
localStorage.setItem('access_token', token);  // ❌ XSS VULNERABLE!
```

### ❌ WRONG: Token in Response Body
```python
# ❌ NEVER DO THIS
@router.post("/login")
async def login(credentials):
    token = create_token(user)
    return {
        "access_token": token,  # ❌ BUG!
        "user": user
    }
```

### ❌ WRONG: Missing withCredentials
```typescript
// ❌ NEVER DO THIS
axios.create({
  baseURL: '/api',
  // Missing withCredentials: true  ❌ BUG!
});
```

### ❌ WRONG: Missing credentials: 'include'
```typescript
// ❌ NEVER DO THIS
fetch(url, {
  method: 'POST',
  // Missing credentials: 'include'  ❌ BUG!
});
```

---

## 🔍 VERIFICATION CHECKLIST

### Backend Checklist
- [ ] All protected endpoints use `Depends(get_current_user)`
- [ ] Login sets HTTPOnly cookie
- [ ] Login does NOT return token in body
- [ ] CORS allows credentials (`allow_credentials=True`)
- [ ] Cookie has `httponly=True`
- [ ] Cookie has `secure=True` (production)
- [ ] Cookie has `samesite="lax"`

### Frontend Checklist
- [ ] API client uses `withCredentials: true`
- [ ] All fetch calls use `credentials: 'include'`
- [ ] Auth store has NO token field
- [ ] No `localStorage.setItem('token', ...)`
- [ ] No `Authorization: Bearer` headers
- [ ] Protected routes use `<ProtectedRoute>`

### Browser Verification
```javascript
// Run in browser console after login
localStorage.getItem('access_token')  // → null ✅
document.cookie                        // → "" ✅ (HttpOnly blocks access)
useAuthStore.getState().user          // → {...} ✅
useAuthStore.getState().token         // → undefined ✅
```

### Network Tab Verification
- ✅ Login response has `Set-Cookie: access_token=...; HttpOnly`
- ✅ All API requests have `Cookie: access_token=...`
- ❌ NO requests have `Authorization: Bearer`

---

## 📋 MODULE-SPECIFIC STANDARDS

### Auth Module
- `POST /api/v1/auth/login` - Sets cookie, returns user
- `POST /api/v1/auth/register` - Sets cookie, returns user
- `POST /api/v1/auth/logout` - Clears cookie
- `GET /api/v1/auth/me` - Requires cookie, returns user

### Invoice Module
- `GET /api/invoices` - Requires cookie
- `POST /api/invoices/upload` - Requires cookie
- `POST /api/invoices/save` - Requires cookie
- `POST /api/invoices/save-stream` - Requires cookie ⚠️ **THE BUG WE FIXED**
- `GET /api/invoices/{id}` - Requires cookie + ownership check
- `DELETE /api/invoices/{id}` - Requires cookie + ownership check

### Menu Module
- `GET /api/menu/list` - Requires cookie
- `POST /api/menu/upload` - Requires cookie
- `POST /api/menu/save` - Requires cookie
- `GET /api/menu/search-inventory` - Requires cookie
- `GET /api/menu/items/{id}/recipe` - Requires cookie + ownership check

### Price Analytics Module
- `GET /api/analytics/*` - All endpoints require cookie

### Menu Comparison Module
- `POST /api/menu-comparison/discover` - Requires cookie
- `GET /api/menu-comparison/{id}/*` - Requires cookie + ownership check
- `GET /api/menu-comparison/saved` - Requires cookie

### Review Analysis Module
- `POST /api/v1/analysis/run` - Requires cookie
- `GET /api/v1/analysis/{id}/*` - Requires cookie + ownership check

---

## 🚨 CRITICAL SECURITY RULES

### Rule 1: NO Token Exposure
**Tokens MUST NEVER be accessible to JavaScript**
- ✅ Cookies with `httponly=True`
- ❌ localStorage
- ❌ sessionStorage
- ❌ Response body
- ❌ URL parameters

### Rule 2: NO Bearer Tokens
**ALL authentication MUST use cookies**
- ✅ `Cookie: access_token=...`
- ❌ `Authorization: Bearer ...`

### Rule 3: Data Ownership
**Users MUST ONLY access their own data**
- Every endpoint checks `current_user.id`
- Database queries filter by `user_id`
- 403 Forbidden if accessing others' data

### Rule 4: CORS Configuration
**Credentials MUST be allowed**
- `allow_credentials=True` in backend
- `withCredentials: true` in frontend
- `credentials: 'include'` in fetch

---

## 🧪 TEST REQUIREMENTS

Every new endpoint MUST have tests for:
1. ✅ Returns 401 without cookie
2. ✅ Returns 200 with valid cookie
3. ✅ Returns 403 when accessing others' data
4. ✅ Does NOT accept Bearer token
5. ✅ Frontend page redirects to /login when not authenticated

---

## 📝 CODE REVIEW CHECKLIST

Before merging ANY auth-related code:
- [ ] No `localStorage.setItem('token', ...)`
- [ ] No `Authorization: Bearer` headers
- [ ] All API calls use `withCredentials` or `credentials: 'include'`
- [ ] All endpoints use `Depends(get_current_user)`
- [ ] Login sets HTTPOnly cookie
- [ ] Tests verify 401 without auth
- [ ] Tests verify 200 with auth

---

## 🔧 FIXING AUTH BUGS

### If you find Bearer tokens:
1. Remove `Authorization` header
2. Add `withCredentials: true` (axios) or `credentials: 'include'` (fetch)
3. Verify cookies are sent in Network tab

### If you find localStorage tokens:
1. Remove `localStorage.setItem/getItem('token')`
2. Remove token from state
3. Verify cookies are used instead

### If endpoints don't require auth:
1. Add `current_user: dict = Depends(get_current_user)` parameter
2. Add test verifying 401 without auth
3. Verify cookie is required

---

## 📚 REFERENCE IMPLEMENTATIONS

### Perfect Examples (Copy These!)
- ✅ `frontend/src/services/api/client.ts` - API client
- ✅ `frontend/src/stores/authStore.ts` - Auth state
- ✅ `frontend/src/hooks/useInvoiceParseStream.ts` - Fetch with cookies
- ✅ `api/routes/auth.py` - Login endpoint
- ✅ `api/dependencies/auth.py` - Auth dependency

### Bug Examples (DON'T Copy These!)
- ❌ `frontend/src/hooks/useSaveStream.ts` (BEFORE fix) - Bearer token bug

---

## 🎯 SUMMARY

**ONE RULE TO RULE THEM ALL:**

> If JavaScript can access the token, it's a bug.  
> If a request doesn't send cookies, it's a bug.  
> If an endpoint doesn't check auth, it's a bug.

**NO EXCEPTIONS.**

---

## 📞 WHEN IN DOUBT

1. Check this document
2. Look at reference implementations
3. Run E2E auth tests: `python tests/e2e_auth/test_runner.py`
4. Verify in browser console: `document.cookie` should be empty
5. Check Network tab: Requests should have `Cookie` header, NOT `Authorization`

**This document is the source of truth. Follow it exactly.**
