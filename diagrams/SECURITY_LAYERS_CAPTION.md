# Security Layers Implementation

**Diagram:** `32_security_layers_implementation.mmd`

## What This Shows

This diagram focuses exclusively on the security improvements we implemented today, showing how they integrate with your existing security measures.

---

## Color Legend

- **Green (NEW ✨)** - Security features added today
- **Blue (EXISTING ✅)** - Security features you already had
- **Red (CRITICAL)** - User-facing components

---

## What We Added Today (Green)

### 1. SecurityHeadersMiddleware
**File:** `api/middleware/security_headers.py`

**What it does:**
- Adds all security headers to every response
- Environment-aware (dev vs production)
- Configurable via environment variables

**Headers added:**
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### 2. Content Security Policy (CSP)
**Protects against:** XSS (Cross-Site Scripting)

**Policy:**
```
default-src 'self';
script-src 'self';
style-src 'self' https://fonts.googleapis.com;
img-src 'self' data: blob: [SUPABASE_URL];
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' [API_URL] [SUPABASE_URL];
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**What it blocks:**
- Inline scripts (`<script>alert('xss')</script>`)
- External scripts from unauthorized domains
- eval() and Function() execution
- Inline event handlers (`onclick="..."`)

### 3. Strict-Transport-Security (HSTS)
**Protects against:** Downgrade attacks, man-in-the-middle

**Configuration:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**What it does:**
- Forces HTTPS for 1 year
- Applies to all subdomains
- Browser remembers and auto-upgrades HTTP to HTTPS
- Only active in production

### 4. X-Frame-Options
**Protects against:** Clickjacking

**Configuration:**
```
X-Frame-Options: DENY
```

**What it does:**
- Prevents your site from being embedded in iframes
- Blocks clickjacking attacks
- No exceptions

### 5. X-Content-Type-Options
**Protects against:** MIME sniffing attacks

**Configuration:**
```
X-Content-Type-Options: nosniff
```

**What it does:**
- Forces browser to respect Content-Type header
- Prevents browser from guessing file types
- Blocks execution of mistyped files

### 6. Referrer-Policy
**Protects against:** Information leakage

**Configuration:**
```
Referrer-Policy: strict-origin-when-cross-origin
```

**What it does:**
- Controls what referrer information is sent
- Full URL for same-origin requests
- Only origin for cross-origin requests
- Privacy protection

### 7. Permissions-Policy
**Protects against:** Unauthorized feature access

**Configuration:**
```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**What it does:**
- Disables geolocation API
- Disables microphone access
- Disables camera access
- Prevents feature abuse

### 8. CSP Violation Reporting
**File:** `api/routes/csp_report.py`

**Endpoint:** `POST /api/csp-report`

**What it does:**
- Receives CSP violation reports from browsers
- Logs violations for monitoring
- Helps identify issues before enforcement
- Optional Sentry integration

---

## What You Already Had (Blue)

### Cookie Security
- **HTTPOnly** - JavaScript cannot access cookies
- **Secure** - Cookies only sent over HTTPS
- **SameSite=Lax** - CSRF protection

### Authentication
- **JWT from HTTPOnly cookies** - Secure token storage
- **get_current_user middleware** - Validates all requests
- **Supabase Auth** - User management

### Authorization
- **Row Level Security (RLS)** - Database-level protection
- **Ownership Validator** - Service-level checks
- **User-scoped queries** - Only access own data

### Input Validation
- **Pydantic** - All API inputs validated
- **File Validator** - Size and type checking
- **Malware Scanner** - ClamAV integration

### Error Handling
- **Error Sanitizer** - Production/dev aware
- **Global exception handler** - Catches all errors
- **No information leakage** - Safe error messages

### Rate Limiting
- **Per-tier limits** - Free/Pro/Premium
- **Redis-backed** - Fast and reliable
- **Prevents abuse** - Protects resources

---

## Request Flow (Top to Bottom)

1. **User makes request** in browser
2. **Browser sends** with HTTPOnly cookies (SameSite=Lax, Secure)
3. **SecurityHeadersMiddleware** adds all security headers
4. **CORSMiddleware** checks origin
5. **Request Logging** sanitizes sensitive data
6. **Global Exception Handler** catches errors
7. **Authentication** validates JWT from cookie
8. **Rate Limiting** checks quota
9. **Input Validation** validates request data
10. **File Validation** checks uploads (if applicable)
11. **Malware Scanning** scans files (if applicable)
12. **Ownership Validation** checks user access
13. **Row Level Security** enforces database policies
14. **Response** sent back with security headers

---

## Defense in Depth

### Layer 1: Browser Security
- CSP blocks malicious scripts
- HSTS forces HTTPS
- X-Frame-Options prevents clickjacking

### Layer 2: Cookie Security
- HTTPOnly prevents XSS token theft
- Secure ensures HTTPS only
- SameSite prevents CSRF

### Layer 3: Network Security
- CORS restricts origins
- HTTPS encrypts traffic
- Rate limiting prevents abuse

### Layer 4: Authentication
- JWT validation
- Token expiry checking
- Secure token storage

### Layer 5: Authorization
- RLS at database level
- Ownership checks at service level
- User-scoped queries

### Layer 6: Input Validation
- Pydantic type checking
- File size/type validation
- Malware scanning

### Layer 7: Error Handling
- Error sanitization
- No stack traces in production
- Safe error messages

---

## What Protects Against What

### XSS (Cross-Site Scripting)
1. **CSP** - Blocks inline scripts and unauthorized sources
2. **React** - Auto-escapes all user input
3. **X-Content-Type-Options** - Prevents MIME confusion
4. **HTTPOnly cookies** - Prevents token theft

### CSRF (Cross-Site Request Forgery)
1. **SameSite=Lax** - Blocks cross-site cookie sending
2. **CORS** - Restricts origins
3. **Authentication** - All requests require valid token

### Clickjacking
1. **X-Frame-Options: DENY** - Prevents iframe embedding
2. **CSP frame-ancestors 'none'** - Additional protection

### Man-in-the-Middle
1. **HSTS** - Forces HTTPS
2. **Secure cookies** - HTTPS only
3. **TLS/SSL** - Encrypted transport

### SQL Injection
1. **Supabase client** - Parameterized queries
2. **Pydantic** - Input validation
3. **RLS** - Database-level protection

### Malware
1. **ClamAV** - Scans all uploads
2. **File type validation** - Only PDF/images
3. **File size limits** - 10MB maximum

### Information Leakage
1. **Error Sanitizer** - Hides internal errors
2. **Request logging** - Sanitizes auth headers
3. **Referrer-Policy** - Controls referrer info

### Unauthorized Access
1. **Authentication** - JWT validation
2. **RLS** - Database policies
3. **Ownership Validator** - Service checks

---

## Configuration

### Environment Variables

**Development:**
```bash
ENVIRONMENT=development  # Skips CSP, HSTS
CSP_REPORT_ONLY=true     # Report violations only
```

**Production:**
```bash
ENVIRONMENT=production   # Enables all security
CSP_REPORT_ONLY=false    # Enforce CSP
USE_GOOGLE_FONTS=true    # Allow Google Fonts
```

### Files Modified

1. **api/main.py** - Added SecurityHeadersMiddleware
2. **api/middleware/security_headers.py** - NEW file
3. **api/routes/csp_report.py** - NEW file
4. **.env** - Added CSP configuration

---

## Testing

### Check Headers (Production Mode)
```bash
curl -I https://yourdomain.com/health
```

**Expected headers:**
```
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Monitor CSP Violations
```bash
# Check logs for violations
grep "CSP Violation" logs/app.log
```

### Test in Browser
1. Open DevTools Console
2. Try: `eval('console.log("test")')`
3. Expected: CSP violation error

---

## Before vs After

### Before Today
- ❌ No CSP
- ❌ No HSTS
- ❌ No X-Frame-Options
- ❌ No X-Content-Type-Options
- ❌ No Referrer-Policy
- ✅ HTTPOnly cookies
- ✅ Authentication
- ✅ RLS
- ✅ Input validation

### After Today
- ✅ CSP (report-only mode)
- ✅ HSTS (production only)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ CSP violation monitoring
- ✅ All existing security maintained

---

## Production Readiness

### Critical Security ✅
- [x] CSP implemented
- [x] HSTS configured
- [x] Clickjacking protection
- [x] MIME sniffing protection
- [x] Cookie security
- [x] Authentication
- [x] Authorization
- [x] Input validation
- [x] Error sanitization
- [x] Rate limiting

### Deployment Steps
1. Set `ENVIRONMENT=production`
2. Set `CSP_REPORT_ONLY=true` (initially)
3. Deploy and monitor for 1-2 weeks
4. Check `/api/csp-report` logs
5. Fix any legitimate violations
6. Set `CSP_REPORT_ONLY=false`
7. Deploy with enforcement

---

## Summary

**What we added:** 6 security headers + CSP monitoring  
**What we kept:** All existing security measures  
**Time to implement:** 2 hours  
**Breaking changes:** None (report-only mode)  
**Production ready:** Yes (after monitoring period)  

**Your app now has enterprise-grade security headers that protect against XSS, clickjacking, MIME sniffing, downgrade attacks, and information leakage.**
