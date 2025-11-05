# 🚀 Start Here: Production Setup

**Goal:** Get your app production-ready in 30 minutes

---

## The Fastest Way

```bash
# Run this one command and follow the prompts:
setup_production.bat
```

That's it! The script will guide you through everything.

---

## What You Need to Do

### 1. Create New Supabase Project (15 min)
- Go to https://supabase.com/dashboard
- Click "New Project"
- Name it `restaurant-analytics-prod`
- Save the URL and keys

### 2. Generate JWT Secret (1 min)
```bash
python generate_jwt_secret.py
```
Copy the output.

### 3. Get Production API Keys (10 min)
- Google Gemini: https://aistudio.google.com/app/apikey
- Google Places: https://console.cloud.google.com/apis/credentials
- SerpAPI: https://serpapi.com/manage-api-key
- Outscraper: https://app.outscraper.com/api-keys

### 4. Fill in .env.production (5 min)
```bash
cp .env.production.example .env.production
# Edit .env.production with your values
```

### 5. Verify (1 min)
```bash
python verify_production_setup.py
```

---

## What Must Change

| Secret | Why | How |
|--------|-----|-----|
| JWT_SECRET_KEY | Security | `python generate_jwt_secret.py` |
| Supabase URL/Keys | Separate databases | Create new project |
| API Keys | Billing/limits | Create production keys |

**Don't reuse dev secrets in production!**

---

## Documentation

| File | Use When |
|------|----------|
| **START_HERE_PRODUCTION.md** | 👈 You are here |
| **QUICK_PRODUCTION_REFERENCE.md** | Need quick commands/links |
| **DEV_VS_PROD_SECRETS.md** | Want to see what changes |
| **PRODUCTION_SECRETS_GUIDE.md** | Need detailed secret info |
| **PRODUCTION_SETUP_GUIDE.md** | Want step-by-step guide |
| **PRODUCTION_CHECKLIST.md** | Ready to deploy |

---

## Tools Created for You

```bash
setup_production.bat           # Automated setup wizard
verify_production_setup.py     # Check your config
generate_jwt_secret.py         # Generate secure JWT secret
compare_env_files.py           # Compare dev vs prod
```

---

## Quick Commands

```bash
# Setup
setup_production.bat

# Verify
python verify_production_setup.py

# Deploy
docker-compose --env-file .env.production up -d

# Check
curl http://localhost:8000/health
```

---

## Success Criteria

You're ready when:
- ✓ Verification script passes
- ✓ All secrets are different from dev
- ✓ Production Supabase project created
- ✓ Application starts without errors

---

## Need Help?

Run the automated setup:
```bash
setup_production.bat
```

Or read the detailed guide:
```bash
# Open in your editor
code PRODUCTION_SETUP_GUIDE.md
```

---

**Estimated Time:** 30-45 minutes
**Last Updated:** November 3, 2025

🎯 **Ready?** Run `setup_production.bat` now!
