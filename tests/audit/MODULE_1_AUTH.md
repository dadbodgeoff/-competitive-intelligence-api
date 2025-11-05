# MODULE 1: AUTHENTICATION & AUTHORIZATION - DETAILED AUDIT

## Overview
- **Entry Points:** `/api/v1/auth/*`
- **Files:** `api/routes/auth.py`, `api/middleware/auth.py`
- **Database:** `auth.users`, `public.users`, RLS policies
- **Security:** JWT tokens, httpOnly cookies, RLS enforcement

---

## Critical Flows

### 1.1 Registration Flow
**Endpoint:** `POST /api/v1/auth/register`  
**Handler:** `register_user()`

**Implementation Details:**
```python
# Validation: Pydantic UserRegister schema
- email: EmailStr (validated format)
- password: str (min 8 chars enforced by Supabase)
- first_name: Optional[str]
- last_name: Optional[str]

# Process:
1. supabase.auth.sign_up() → Creates auth.users record
2. Trigger creates public.users record with subscription_tier='free'
3. create_jwt_token(user_id) → JWT with 24h expiry
4. Set cookies: access_token (24h), refresh_token (7d)
5. Return UserResponse (no tokens in body)
```

**Test Cases Required:**
- [ ] TC-AUTH-001: Valid registration creates user + profile
- [ ] TC-AUTH-002: Duplicate email returns 400
- [ ] TC-AUTH-003: Invalid email format returns 400
- [ ] TC-AUTH-004: Weak password rejected by Supabase
- [ ] TC-AUTH-005: Cookies set correctly (httpOnly, secure in prod)
- [ ] TC-AUTH-006: JWT token valid and contains correct user_id
- [ ] TC-AUTH-007: Profile created with default subscription_tier='free'

