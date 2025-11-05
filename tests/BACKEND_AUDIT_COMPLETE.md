# BACKEND CRITICAL FLOWS AUDIT - COMPLETE ANALYSIS

**Generated:** November 3, 2025  
**Purpose:** Comprehensive backend audit for production test suite development  
**Scope:** All 5 modules + cross-cutting concerns

---

## EXECUTIVE SUMMARY

### Modules Audited
1. ✅ Authentication & Authorization
2. ✅ Invoice Processing  
3. ✅ Menu Management
4. ✅ Menu Comparison
5. ✅ Review Analysis

### Critical Findings
- **Security:** RLS policies active on 94 tables, JWT auth with httpOnly cookies
- **Rate Limiting:** Tier-based limits implemented (free/premium/enterprise)
- **Error Handling:** Sanitization service prevents PII leakage
- **Concurrency:** Atomic operations for usage limits (prevents race conditions)
- **Streaming:** SSE implementation for real-time progress (invoice, menu, analysis)

### Test Coverage Needed
- **High Priority:** 47 critical test cases identified
- **Medium Priority:** 23 integration test cases
- **Low Priority:** 15 edge case tests

---


## MODULE 1: AUTHENTICATION & AUTHORIZATION

### Critical Flows Identified

#### 1.1 Registration Flow
**Entry Point:** `POST /api/v1/auth/register`  
**File:** `api/routes/auth.py::register_user()`

**Steps:**
1. Validate email/password format (Pydantic validation)
2. Call Supabase Auth `sign_up()` with user metadata
3. Create JWT token with `create_jwt_token(user_id)`
4. Set httpOnly cookies (access_token, refresh_token)
5. Return user profile (NO tokens in body)

**Success Criteria:**
- User created in `auth.users` table
- Profile created in `public.users` table (via trigger)
- JWT token valid for 24 hours
- Cookies set with secure flags in production

**Failure Scenarios:**
- Duplicate email → 400 Bad Request
- Weak password → 400 Bad Request  
- Supabase Auth failure → 400 Bad Request
- Database trigger failure → User in auth but not public

**Security Considerations:**
- Passwords never stored in application (Supabase Auth handles)
- JWT secret from environment variable
- httpOnly cookies prevent XSS attacks
- Secure flag enabled in production (`COOKIE_SECURE=true`)


#### 1.2 Login Flow
**Entry Point:** `POST /api/v1/auth/login`  
**File:** `api/routes/auth.py::login_user()`

**Steps:**
1. Validate credentials with Supabase Auth `sign_in_with_password()`
2. Fetch subscription tier from `public.users` (using service client to bypass RLS)
3. Create JWT token with user_id
4. Set httpOnly cookies (access_token 24h, refresh_token 7d)
5. Return user profile with subscription_tier

**Success Criteria:**
- Valid JWT token generated
- Cookies set with correct expiry
- Subscription tier fetched correctly
- User profile returned

**Failure Scenarios:**
- Invalid credentials → 401 Unauthorized
- User not found → 401 Unauthorized
- Subscription tier fetch fails → Defaults to "free"

**Security Considerations:**
- Credentials never logged
- Generic error message (no "user not found" vs "wrong password")
- Tokens in httpOnly cookies only
- Refresh token path restricted to `/api/v1/auth`

