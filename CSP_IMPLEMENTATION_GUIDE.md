# CSP Implementation Guide - Step by Step

This guide provides practical code examples for implementing Content Security Policy in your application.

---

## Step 1: Add CSP Middleware to Backend

### Option A: FastAPI Middleware (Recommended)

Create `api/middleware/csp.py`:

```python
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os

class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Skip CSP for development
        if os.getenv("APP_ENV") == "development":
            return response
        
        # Get environment-specific URLs
        api_url = os.getenv("VITE_API_URL", "")
        supabase_url = os.getenv("SUPABASE_URL", "")
        sentry_dsn = os.getenv("VITE_SENTRY_DSN", "")
        posthog_host = os.getenv("VITE_POSTHOG_HOST", "https://app.posthog.com")
        
        # Build CSP policy
        csp_parts = [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' https://fonts.googleapis.com",
            f"img-src 'self' data: blob: {supabase_url}",
            "font-src 'self' https://fonts.gstatic.com",
            f"connect-src 'self' {api_url} {supabase_url}",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
        ]
        
        # Add optional services if configured
        if sentry_dsn:
            # Extract domain from Sentry DSN
            sentry_domain = sentry_dsn.split("@")[1].split("/")[0] if "@" in sentry_dsn else ""
            if sentry_domain:
                csp_parts[5] += f" https://{sentry_domain}"
        
        if posthog_host:
            csp_parts[5] += f" {posthog_host}"
        
        # Join policy
        csp_policy = "; ".join(csp_parts)
        
        # Add CSP header
        response.headers["Content-Security-Policy"] = csp_policy
        
        # Add other security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response
```

### Register Middleware in `api/main.py`:

```python
from api.middleware.csp import CSPMiddleware

app = FastAPI()

# Add CSP middleware
app.add_middleware(CSPMiddleware)
```

---

## Step 2: Add CSP Meta Tag Fallback (Frontend)

Update `frontend/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Competitive Intelligence</title>
    
    <!-- CSP Meta Tag (fallback for static hosting) -->
    <!-- This will be overridden by HTTP header in production -->
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      script-src 'self';
      style-src 'self' https://fonts.googleapis.com;
      img-src 'self' data: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self';
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    ">
    
    <!-- Font preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Google Fonts import -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Step 3: Self-Host Google Fonts (Optional)

### Download Fonts

```bash
# Create fonts directory
mkdir -p frontend/public/fonts

# Download Inter font files
# Visit https://fonts.google.com/specimen/Inter
# Download and extract to frontend/public/fonts/inter/

# Download JetBrains Mono font files
# Visit https://fonts.google.com/specimen/JetBrains+Mono
# Download and extract to frontend/public/fonts/jetbrains-mono/
```

### Create Font CSS File

Create `frontend/public/fonts/fonts.css`:

```css
/* Inter Font Family */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('./inter/Inter-Light.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./inter/Inter-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./inter/Inter-Medium.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./inter/Inter-SemiBold.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./inter/Inter-Bold.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('./inter/Inter-ExtraBold.woff2') format('woff2');
}

/* JetBrains Mono Font Family */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./jetbrains-mono/JetBrainsMono-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./jetbrains-mono/JetBrainsMono-Medium.woff2') format('woff2');
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./jetbrains-mono/JetBrainsMono-SemiBold.woff2') format('woff2');
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./jetbrains-mono/JetBrainsMono-Bold.woff2') format('woff2');
}
```

### Update index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Competitive Intelligence</title>
    
    <!-- Self-hosted fonts (no external requests) -->
    <link rel="stylesheet" href="/fonts/fonts.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Update CSP Policy (Strict)

```python
csp_parts = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",  # No Google Fonts
    f"img-src 'self' data: blob: {supabase_url}",
    "font-src 'self'",  # No Google Fonts
    f"connect-src 'self' {api_url} {supabase_url}",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
]
```

---

## Step 4: Add CSP Violation Reporting

### Create Report Endpoint

Create `api/routes/csp_report.py`:

```python
from fastapi import APIRouter, Request
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/api/csp-report")
async def csp_violation_report(request: Request):
    """
    Receive and log CSP violation reports
    """
    try:
        report = await request.json()
        
        # Log violation
        logger.warning(
            f"CSP Violation: {report.get('csp-report', {}).get('violated-directive')} "
            f"blocked {report.get('csp-report', {}).get('blocked-uri')}"
        )
        
        # Optionally send to Sentry
        # sentry_sdk.capture_message(f"CSP Violation: {report}", level="warning")
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing CSP report: {e}")
        return {"status": "error"}
```

### Register Route

In `api/main.py`:

```python
from api.routes import csp_report

app.include_router(csp_report.router)
```

### Update CSP Policy to Include Reporting

```python
# In CSPMiddleware
csp_parts.append("report-uri /api/csp-report")

# Or use newer report-to directive
response.headers["Report-To"] = json.dumps({
    "group": "csp-endpoint",
    "max_age": 10886400,
    "endpoints": [{"url": "/api/csp-report"}]
})
csp_parts.append("report-to csp-endpoint")
```

---

## Step 5: Environment Configuration

### Backend `.env`

```bash
# CSP Configuration
CSP_ENABLED=true
CSP_REPORT_ONLY=false  # Set to true for testing

# URLs for CSP policy
VITE_API_URL=https://api.yourdomain.com
SUPABASE_URL=https://your-project.supabase.co

# Optional services
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Frontend `.env.production`

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_POSTHOG_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

---

## Step 6: Testing CSP

### Test Script

Create `test_csp.py`:

```python
import requests

def test_csp_headers():
    """Test that CSP headers are present"""
    response = requests.get("https://yourdomain.com")
    
    assert "Content-Security-Policy" in response.headers
    csp = response.headers["Content-Security-Policy"]
    
    # Check required directives
    assert "default-src 'self'" in csp
    assert "script-src 'self'" in csp
    assert "frame-ancestors 'none'" in csp
    
    print("✅ CSP headers present and valid")

def test_csp_violations():
    """Test that violations are blocked"""
    # This would require browser automation (Selenium/Playwright)
    pass

if __name__ == "__main__":
    test_csp_headers()
```

### Browser Testing Checklist

```javascript
// Open browser console and run these tests

// 1. Test inline script (should be blocked)
const script = document.createElement('script');
script.textContent = 'console.log("inline")';
document.body.appendChild(script);
// Expected: CSP violation

// 2. Test external script (should be blocked)
const extScript = document.createElement('script');
extScript.src = 'https://evil.com/script.js';
document.body.appendChild(extScript);
// Expected: CSP violation

// 3. Test eval (should be blocked)
try {
  eval('console.log("eval")');
} catch (e) {
  console.log('✅ eval blocked:', e);
}

// 4. Test inline style (should be blocked)
const div = document.createElement('div');
div.setAttribute('style', 'color: red');
document.body.appendChild(div);
// Expected: CSP violation (if style-src doesn't allow 'unsafe-inline')
```

---

## Step 7: Gradual Rollout

### Phase 1: Report-Only Mode (1-2 weeks)

```python
# In CSPMiddleware
if os.getenv("CSP_REPORT_ONLY", "false").lower() == "true":
    response.headers["Content-Security-Policy-Report-Only"] = csp_policy
else:
    response.headers["Content-Security-Policy"] = csp_policy
```

### Phase 2: Enforce for New Users

```python
# In CSPMiddleware
async def dispatch(self, request: Request, call_next):
    response = await call_next(request)
    
    # Check if user is in CSP test group
    user_id = request.state.user_id if hasattr(request.state, 'user_id') else None
    
    if user_id and should_enforce_csp(user_id):
        response.headers["Content-Security-Policy"] = csp_policy
    else:
        response.headers["Content-Security-Policy-Report-Only"] = csp_policy
    
    return response
```

### Phase 3: Full Enforcement

```python
# Set CSP_REPORT_ONLY=false in production
response.headers["Content-Security-Policy"] = csp_policy
```

---

## Step 8: Monitoring & Maintenance

### Set Up Alerts

```python
# In csp_report.py
@router.post("/api/csp-report")
async def csp_violation_report(request: Request):
    report = await request.json()
    violation = report.get('csp-report', {})
    
    # Alert on high-severity violations
    if violation.get('violated-directive', '').startswith('script-src'):
        # Send alert to Slack/PagerDuty
        send_alert(f"Critical CSP violation: {violation}")
    
    return {"status": "ok"}
```

### Dashboard Query

```sql
-- Query CSP violations from logs
SELECT 
    DATE(timestamp) as date,
    violated_directive,
    blocked_uri,
    COUNT(*) as violation_count
FROM csp_violations
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY date, violated_directive, blocked_uri
ORDER BY violation_count DESC;
```

---

## Troubleshooting

### Issue: Fonts not loading

**Solution:** Check `font-src` directive includes font domain

```python
"font-src 'self' https://fonts.gstatic.com"
```

### Issue: API calls blocked

**Solution:** Add API URL to `connect-src`

```python
f"connect-src 'self' {api_url}"
```

### Issue: Images from Supabase blocked

**Solution:** Add Supabase URL to `img-src`

```python
f"img-src 'self' data: blob: {supabase_url}"
```

### Issue: Vite HMR not working in development

**Solution:** Add WebSocket to dev CSP

```python
if os.getenv("APP_ENV") == "development":
    csp_parts[5] += " ws://localhost:5173"
```

---

## Summary

**Implementation Time:** 2-4 hours  
**Testing Time:** 1-2 weeks (report-only mode)  
**Maintenance:** Minimal (monitor violations)

**Benefits:**
- ✅ Prevents XSS attacks
- ✅ Blocks malicious scripts
- ✅ Protects user data
- ✅ Improves security posture
- ✅ Compliance with security standards

**Next Steps:**
1. Implement CSP middleware
2. Test in staging environment
3. Enable report-only mode in production
4. Monitor violations for 1-2 weeks
5. Fix any legitimate violations
6. Enable enforcement mode
7. Set up ongoing monitoring
