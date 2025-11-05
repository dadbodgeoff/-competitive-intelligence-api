# Dev vs Production Secrets Comparison

## Visual Guide: What Changes, What Stays

### 🔴 CRITICAL - Must Be Different

| Secret | Development | Production | Why Different | How to Generate |
|--------|-------------|------------|---------------|-----------------|
| **JWT_SECRET_KEY** | `your-super-secret-jwt-key-change-this-in-production-2024` | `[64+ random chars]` | Forged tokens = account takeover | `python generate_jwt_secret.py` |
| **SUPABASE_URL** | `https://syxquxgynoinzwhwkosa.supabase.co` | `https://your-prod-project.supabase.co` | Separate databases, separate users | Create new project at supabase.com |
| **SUPABASE_ANON_KEY** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (dev) | `[New project key]` | Database access control | Copy from prod Supabase project |
| **SUPABASE_SERVICE_ROLE_KEY** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (dev) | `[New project key]` | Full database access | Copy from prod Supabase project |

**Risk if not changed:** 🚨 Complete security compromise - attackers can forge auth tokens and access your database

---

### 🟡 IMPORTANT - Should Be Different

| Secret | Development | Production | Why Different | How to Get |
|--------|-------------|------------|---------------|------------|
| **GOOGLE_GEMINI_API_KEY** | `AIzaSyByUR9t7Zu2mXAQyVXDr4CaSBvvZoRvIxE` | `[New key]` | Separate billing, rate limits | https://aistudio.google.com/app/apikey |
| **GOOGLE_PLACES_API_KEY** | `AIzaSyDPODKuwtE1YiN2jcGCDkIWJSYDN5TLAC0` | `[New key]` | Separate billing, rate limits | https://console.cloud.google.com/apis/credentials |
| **SERPAPI_KEY** | `d36efe5ca9439abd39403a11c463625951c5acd8...` | `[New key]` | Separate billing, usage tracking | https://serpapi.com/manage-api-key |
| **OUTSCRAPER_API_KEY** | `ZWNlZGE0NzFhOGE1NGQxYjhhYjE3MzBlZjRjMWE2YjJ8...` | `[New key]` | Separate billing, usage tracking | https://app.outscraper.com/api-keys |

**Risk if not changed:** ⚠️ Mixed billing, rate limit conflicts, harder to debug production issues

---

### 🟢 OK TO KEEP SAME - Configuration Values

| Setting | Value | Why Same | Notes |
|---------|-------|----------|-------|
| **JWT_ALGORITHM** | `HS256` | Standard algorithm | No need to change |
| **JWT_EXPIRATION_HOURS** | `24` | Business logic | Can adjust if needed |
| **RATE_LIMIT_FREE_TIER** | `10` | Business logic | Same limits in both |
| **RATE_LIMIT_PRO_TIER** | `100` | Business logic | Same limits in both |
| **RATE_LIMIT_WINDOW_MINUTES** | `60` | Business logic | Same limits in both |
| **INVOICE_BATCH_PROCESSING** | `true` | Performance feature | Can be same |
| **INVOICE_ASYNC_PROCESSING** | `false` or `true` | Performance feature | Adjust based on needs |

**These are safe to keep the same** - they're configuration, not secrets

---

### 🔧 SHOULD CHANGE - Environment Settings

| Setting | Development | Production | Why Different |
|---------|-------------|------------|---------------|
| **APP_ENV** | `development` | `production` | Enables prod mode |
| **APP_HOST** | `localhost` | `0.0.0.0` | Accept external connections |
| **CSP_REPORT_ONLY** | `true` | `false` | Enforce CSP in prod |
| **COOKIE_SECURE** | `false` | `true` | HTTPS only cookies |
| **COOKIE_SAMESITE** | `lax` | `strict` | Stronger CSRF protection |
| **LOG_LEVEL** | `DEBUG` | `INFO` or `WARNING` | Less verbose logging |

---

## Quick Decision Tree

```
Is it a SECRET (password, key, token)?
├─ YES → Is it for authentication/database?
│  ├─ YES → 🔴 MUST be different (critical)
│  └─ NO → 🟡 SHOULD be different (best practice)
└─ NO → Is it environment-specific?
   ├─ YES → 🔧 SHOULD change (dev vs prod)
   └─ NO → 🟢 OK to keep same (configuration)
```

---

## Verification Commands

```bash
# Check what's different
python compare_env_files.py

# Verify production setup
python verify_production_setup.py

# Generate new JWT secret
python generate_jwt_secret.py
```

---

## Example: Correct Production Setup

```env
# ❌ WRONG - Reusing dev secrets
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-2024
SUPABASE_URL=https://syxquxgynoinzwhwkosa.supabase.co

# ✅ CORRECT - New production secrets
JWT_SECRET_KEY=Kx9mP2nQ7rS4tU8vW1xY5zA3bC6dE9fG2hJ4kL7mN0pQ3rS6tU9vW2xY5zA8bC1dE
SUPABASE_URL=https://myapp-prod-xyz123.supabase.co
```

---

## Security Checklist

Before deploying to production:

- [ ] JWT_SECRET_KEY is 64+ random characters
- [ ] JWT_SECRET_KEY is different from dev
- [ ] Supabase URL points to production project
- [ ] Supabase keys are from production project
- [ ] All API keys are production-specific
- [ ] APP_ENV is set to "production"
- [ ] CSP_REPORT_ONLY is set to "false"
- [ ] COOKIE_SECURE is set to "true"
- [ ] .env.production is NOT in git
- [ ] Verification script passes: `python verify_production_setup.py`

---

## Time Estimates

| Task | Time |
|------|------|
| Generate JWT secret | 1 minute |
| Create Supabase project | 15 minutes |
| Get production API keys | 10 minutes |
| Create .env.production | 5 minutes |
| Verify setup | 2 minutes |
| **Total** | **~30 minutes** |

---

## Need Help?

1. **Start here:** `PRODUCTION_SECRETS_GUIDE.md`
2. **Step-by-step:** `PRODUCTION_SETUP_GUIDE.md`
3. **Quick reference:** `QUICK_PRODUCTION_REFERENCE.md`
4. **Deployment:** `PRODUCTION_CHECKLIST.md`

Or just run: `setup_production.bat`

---

**Last Updated:** November 3, 2025
