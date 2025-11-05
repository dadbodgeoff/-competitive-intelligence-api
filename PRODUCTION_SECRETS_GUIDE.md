# Production Secrets Management Guide

## Quick Start (30 minutes to production-ready)

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script - it will guide you through everything
setup_production.bat
```

### Option 2: Manual Setup
Follow the steps below.

---

## What Needs to Change for Production

### 🔴 CRITICAL - Must Be Different (Security Risk)

| Secret | Dev Value | Production Action | Why Critical |
|--------|-----------|-------------------|--------------|
| `JWT_SECRET_KEY` | Weak dev key | Generate 64+ char random | Forged tokens = account takeover |
| `SUPABASE_URL` | Dev project | Create new prod project | Separate databases |
| `SUPABASE_ANON_KEY` | Dev project | Use prod project key | Database access control |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev project | Use prod project key | Full database access |

**Impact if not changed:** Attackers can forge authentication tokens, access dev database, or compromise user data.

### 🟡 IMPORTANT - Should Be Different (Best Practice)

| Secret | Dev Value | Production Action | Why Important |
|--------|-----------|-------------------|---------------|
| `GOOGLE_GEMINI_API_KEY` | Free tier | Separate paid key | Billing, rate limits |
| `GOOGLE_PLACES_API_KEY` | Free tier | Separate paid key | Billing, rate limits |
| `SERPAPI_KEY` | Free tier | Separate paid key | Billing, rate limits |
| `OUTSCRAPER_API_KEY` | Free tier | Separate paid key | Billing, rate limits |

**Impact if not changed:** Mixed billing, rate limit conflicts, harder to track usage.

### 🟢 OK TO KEEP SAME (Configuration)

These can be the same in dev and prod:
- `JWT_ALGORITHM` (HS256)
- `JWT_EXPIRATION_HOURS` (24)
- `RATE_LIMIT_*` settings
- `INVOICE_BATCH_PROCESSING` flag
- Feature flags

---

## Step-by-Step Setup

### 1. Generate JWT Secret (2 minutes)

**Option A: Using Python script**
```bash
python generate_jwt_secret.py
```

**Option B: Using PowerShell**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option C: Using OpenSSL (if installed)**
```bash
openssl rand -base64 64
```

Copy the output - this is your `JWT_SECRET_KEY`.

### 2. Create Production Supabase Project (15 minutes)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name:** `restaurant-analytics-prod`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to your users
4. Wait for provisioning (~2 minutes)
5. Go to **Project Settings > API**
6. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Up Production API Keys (10 minutes)

#### Google Gemini API
1. Go to https://aistudio.google.com/app/apikey
2. Create new API key
3. Set up billing alerts
4. Copy key → `GOOGLE_GEMINI_API_KEY`

#### Google Places API
1. Go to https://console.cloud.google.com/apis/credentials
2. Create new API key
3. Restrict to your production domain
4. Enable Places API
5. Copy key → `GOOGLE_PLACES_API_KEY`

#### SerpAPI
1. Go to https://serpapi.com/manage-api-key
2. Create new key or upgrade to paid plan
3. Set usage alerts
4. Copy key → `SERPAPI_KEY`

#### Outscraper
1. Go to https://app.outscraper.com/api-keys
2. Create new API key
3. Set up billing alerts
4. Copy key → `OUTSCRAPER_API_KEY`

### 4. Create .env.production File (5 minutes)

```bash
# Copy the template
cp .env.production.example .env.production

# Edit with your values (use notepad, VS Code, etc.)
notepad .env.production
```

Fill in all the values you collected above.

### 5. Verify Your Setup (1 minute)

```bash
python verify_production_setup.py
```

This will check:
- ✓ All critical secrets are set
- ✓ Secrets are different from dev
- ✓ Secrets meet minimum strength requirements
- ✓ Production configurations are correct

Fix any errors before proceeding.

### 6. Compare Dev vs Prod (Optional)

```bash
python compare_env_files.py
```

This shows a side-by-side comparison of your dev and prod environments.

---

## Security Best Practices

### DO ✓
- Use separate Supabase projects for dev/prod
- Generate cryptographically secure secrets (64+ chars)
- Store `.env.production` in a secure vault (not git!)
- Rotate secrets every 90 days
- Set up monitoring for API usage
- Use different API keys for dev/prod
- Enable Row Level Security (RLS) on all tables
- Set up billing alerts for all paid APIs

### DON'T ✗
- Commit `.env.production` to git (it's in `.gitignore`)
- Share production secrets in Slack/email
- Reuse dev secrets in production
- Use weak or guessable secrets
- Store secrets in code or config files
- Give production access to everyone

---

## Deployment Checklist

Use this quick checklist when deploying:

```bash
# 1. Verify setup
python verify_production_setup.py

# 2. Run migrations
python run_menu_migrations.py
python run_price_tracking_migration.py

# 3. Deploy (choose your method)
# Docker:
docker build -f Dockerfile -t restaurant-analytics:prod .
docker run -d --env-file .env.production -p 8000:8000 restaurant-analytics:prod

# Or direct:
uvicorn api.main:app --host 0.0.0.0 --port 8000 --env-file .env.production

# 4. Smoke test
curl http://localhost:8000/health
```

See `PRODUCTION_CHECKLIST.md` for detailed steps.

---

## Troubleshooting

### "JWT_SECRET_KEY is too short"
Generate a new one with `python generate_jwt_secret.py` (should be 64+ characters).

### "Using dev Supabase project"
You need to create a separate production Supabase project. Don't reuse the dev one.

### "API key not set"
Make sure you've filled in all API keys in `.env.production`.

### "Same as dev environment"
Critical secrets must be different. Generate new ones for production.

---

## Files Created for You

| File | Purpose |
|------|---------|
| `PRODUCTION_SETUP_GUIDE.md` | Comprehensive setup guide |
| `PRODUCTION_CHECKLIST.md` | Quick deployment checklist |
| `PRODUCTION_SECRETS_GUIDE.md` | This file - secrets management |
| `.env.production.example` | Template for production env |
| `verify_production_setup.py` | Automated verification script |
| `generate_jwt_secret.py` | JWT secret generator |
| `compare_env_files.py` | Compare dev vs prod |
| `setup_production.bat` | Automated setup script (Windows) |

---

## Need Help?

1. Run `python verify_production_setup.py` to see what's wrong
2. Check `PRODUCTION_SETUP_GUIDE.md` for detailed instructions
3. Use `PRODUCTION_CHECKLIST.md` for step-by-step deployment

---

**Last Updated:** November 3, 2025
**Estimated Setup Time:** 30-45 minutes
