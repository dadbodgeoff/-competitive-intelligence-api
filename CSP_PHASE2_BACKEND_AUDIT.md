# Phase 2: Backend Resource Discovery - Complete Audit

**Date:** November 3, 2025  
**Status:** ✅ Complete

---

## 2.1 Response Headers Audit

### Current Header Configuration

**Location:** `api/main.py`

**Existing Headers:**
- ✅ CORS headers (via CORSMiddleware)
  - `allow_origins`: `["http://localhost:3000", "http://localhost:5173"]`
  - `allow_credentials`: `True`
  - `allow_methods`: `["*"]`
  - `allow_headers`: `["*"]`

**Missing Security Headers:**
- ❌ No `Content-Security-Policy`
- ❌ No `X-Frame-Options`
- ❌ No `X-Content-Type-Options`
- ❌ No `Strict-Transport-Security` (HSTS)
- ❌ No `Referrer-Policy`
- ❌ No `Permissions-Policy`

**Cookie Headers:**
- ✅ Cookies set with `httponly=True`
- ✅ Cookies set with `secure=COOKIE_SECURE` (environment-aware)
- ✅ Cookies set with `samesite="lax"`

**Content-Type Headers:**
- ✅ Automatic via FastAPI for JSON responses
- ✅ Explicit for HTMLResponse (email confirmation page)

### CSP Impact
**Priority:** CRITICAL  
**Action Required:** Add security headers middleware before CSP implementation

---

## 2.2 HTML Response Generation

### HTML Generation Points

#### 1. Email Confirmation Page
**Location:** `api/main.py:266-268`
```python
@app.get("/auth/confirm")
async def confirm_email():
    with open("confirmation_page.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)
```

**File:** `confirmation_page.html` (referenced but not found in codebase)

**CSP Concerns:**
- ⚠️ Unknown if contains inline scripts/styles
- ⚠️ File not found in repository (may be missing or in .gitignore)
- **Action:** Locate file and audit for inline content

#### 2. API Documentation Pages
**Location:** `api/main.py:23-28`
```python
app = FastAPI(
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)
```

**CSP Concerns:**
- ⚠️ Swagger UI (`/api/docs`) uses inline scripts and styles
- ⚠️ ReDoc (`/api/redoc`) uses inline scripts and styles
- **Action:** These will need CSP exceptions or should be disabled in production

#### 3. Error Pages
**Location:** `api/main.py:32-116`
- Global exception handler returns JSON (no HTML)
- HTTP exception handler returns JSON (no HTML)
- Validation exception handler returns JSON (no HTML)

**CSP Impact:** ✅ No HTML in error responses

### Email Templates

**Search Results:** No email service found
- No SendGrid, Mailgun, or SMTP configuration
- `services/alerting.py` has TODO comments for future email integration
- Currently only logs alerts

**CSP Impact:** ✅ No email templates to audit (yet)

### Template Rendering

**Search Results:** No template engine found
- No Jinja2, Mako, or other template imports
- No template directories
- All responses are JSON or single HTMLResponse

**CSP Impact:** ✅ Minimal HTML generation

---

## 2.3 File Upload & User Content

### Upload Endpoints

#### 1. Invoice Upload
**Location:** `api/routes/invoices/upload.py`

**Endpoint:** `POST /api/invoices/upload`

**File Validation:**
- Max size: 10MB
- Allowed types: `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`
- PDF signature validation (checks for `%PDF` header)
- Malware scanning via ClamAV

**Storage:**
- Supabase Storage bucket: `"invoices"`
- Path format: `{user_id}/{timestamp}_{filename}`
- Signed URLs (1 hour expiry)

**Content-Type Validation:** ✅ Strong
```python
allowed_types = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
]
```

**Security Measures:**
- ✅ File size limits enforced
- ✅ Content-Type validation
- ✅ PDF signature validation
- ✅ Malware scanning
- ✅ File hash for duplicate detection
- ✅ User-scoped storage paths

#### 2. Menu Upload
**Location:** `api/routes/menu/upload.py`

**Endpoint:** `POST /api/menu/upload`

**File Validation:** Same as invoice upload
- Max size: 10MB
- Allowed types: PDF, JPEG, PNG
- Malware scanning

**Storage:**
- Supabase Storage bucket: `"menus"`
- Path format: `{user_id}/{timestamp}_{filename}`
- Signed URLs (1 hour expiry)

**Security Measures:** ✅ Same strong validation as invoices

### File Serving

**Method:** Supabase Storage signed URLs
- URLs expire after 1 hour
- User-scoped access via RLS (assumed)
- No direct file serving from backend

**CSP Impact:**
- Need to allow Supabase Storage domain in `img-src`
- Signed URLs are temporary and user-specific
- No risk of serving user-uploaded scripts (only images/PDFs)

### User-Generated Content

**Types of User Content:**
1. **Uploaded Files:** PDFs and images only
2. **Database Content:** Text data (restaurant names, menu items, etc.)
3. **No HTML/JavaScript:** Users cannot upload executable content

**Content Rendering:**
- PDFs/Images: Processed by Gemini API, not rendered in browser
- Text data: Rendered via React (auto-escaped)
- No rich text editors or HTML input

**CSP Impact:** ✅ LOW RISK
- User content is text or images only
- No user-provided HTML/JavaScript
- React handles escaping automatically

### PDF Generation

**Search Results:** No PDF generation found
- No reportlab, pdfkit, or weasyprint
- PDFs are uploaded by users, not generated
- No invoice/report generation features

**CSP Impact:** ✅ No PDF generation to consider

---

## Summary: Phase 2 Findings

### Critical Issues for CSP

1. **Missing Security Headers** (CRITICAL)
   - No CSP header infrastructure
   - No X-Frame-Options, X-Content-Type-Options, etc.
   - **Action:** Add security headers middleware

2. **API Documentation Pages** (HIGH)
   - Swagger UI and ReDoc use inline scripts
   - **Action:** Disable in production or add CSP exceptions

3. **Email Confirmation Page** (MEDIUM)
   - File referenced but not found
   - Unknown inline content
   - **Action:** Locate and audit file

### Strengths

1. **Minimal HTML Generation** ✅
   - Only one HTML endpoint (email confirmation)
   - All other responses are JSON
   - No template engine complexity

2. **Strong File Upload Security** ✅
   - Content-Type validation
   - Malware scanning
   - Size limits
   - User-scoped storage

3. **No User HTML Content** ✅
   - Users can only upload PDFs/images
   - No rich text or HTML input
   - React auto-escapes all text

4. **No Email Templates Yet** ✅
   - No inline styles in emails to worry about
   - Future feature, not current concern

### CSP Requirements from Backend

#### Required CSP Directives

**default-src**
- `'self'` (for same-origin resources)

**script-src**
- `'self'` (for bundled JS)
- Swagger/ReDoc domains (if keeping in prod)

**style-src**
- `'self'` (for bundled CSS)
- Swagger/ReDoc domains (if keeping in prod)

**img-src**
- `'self'`
- `data:` (for inline images if any)
- Supabase Storage domain (for uploaded files)

**connect-src**
- `'self'` (for API calls)
- Supabase domain (for database/storage)
- External API domains (Google, SerpAPI, etc.)

**frame-src**
- `'none'` (no iframes needed)

**object-src**
- `'none'` (no plugins)

### Recommended Actions

**Before CSP Implementation:**

1. **Add Security Headers Middleware**
   ```python
   @app.middleware("http")
   async def add_security_headers(request: Request, call_next):
       response = await call_next(request)
       response.headers["X-Frame-Options"] = "DENY"
       response.headers["X-Content-Type-Options"] = "nosniff"
       response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
       # Add CSP header here later
       return response
   ```

2. **Locate confirmation_page.html**
   - Check if file exists
   - Audit for inline scripts/styles
   - Move inline content to external files

3. **Decide on API Docs**
   - Disable in production, OR
   - Add CSP exceptions for Swagger/ReDoc

4. **Document Supabase Storage Domain**
   - Get exact domain for CSP img-src
   - Verify signed URL format

**During CSP Implementation:**

5. **Start with Report-Only Mode**
   ```python
   response.headers["Content-Security-Policy-Report-Only"] = policy
   ```

6. **Add Violation Reporting Endpoint**
   ```python
   @app.post("/api/csp-report")
   async def csp_report(request: Request):
       # Log CSP violations
       pass
   ```

7. **Test All Upload/Download Flows**
   - Verify images load from Supabase Storage
   - Verify PDFs can be accessed
   - Check signed URL compatibility

---

## Next Steps

✅ Phase 2 Complete  
⏭️ Ready for Phase 3: Third-Party Service Audit

**Phase 2 Completion Status:**
- [x] Response headers audited
- [x] HTML generation points identified
- [x] File upload security verified
- [x] User content handling documented
- [x] CSP requirements extracted
- [x] Action items prioritized
