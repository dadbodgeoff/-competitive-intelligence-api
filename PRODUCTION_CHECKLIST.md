# Production Deployment Checklist

Quick reference for deploying to production today.

## Pre-Deployment (Do This First)

### 1. Create Production Supabase Project (15 minutes)
- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Name: `restaurant-analytics-prod`
- [ ] Generate strong database password (save it!)
- [ ] Wait for provisioning
- [ ] Copy URL, anon key, service_role key

### 2. Generate Strong JWT Secret (1 minute)
```powershell
# Run this in PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```
- [ ] Copy output and save securely

### 3. Set Up Production API Keys (10 minutes)
- [ ] Google Gemini: https://aistudio.google.com/app/apikey
- [ ] Google Places: https://console.cloud.google.com/apis/credentials
- [ ] SerpAPI: https://serpapi.com/manage-api-key
- [ ] Outscraper: https://app.outscraper.com/api-keys

### 4. Create .env.production File (5 minutes)
```bash
cp .env.production.example .env.production
```
- [ ] Fill in all CRITICAL secrets
- [ ] Fill in all API keys
- [ ] Set APP_ENV=production
- [ ] Set CSP_REPORT_ONLY=false
- [ ] Set COOKIE_SECURE=true

### 5. Verify Setup (2 minutes)
```bash
python verify_production_setup.py
```
- [ ] Fix any errors
- [ ] Review warnings
- [ ] All checks pass

## Deployment

### 6. Run Database Migrations (5 minutes)
```bash
# Set environment
$env:APP_ENV="production"

# Run migrations
python run_menu_migrations.py
python run_price_tracking_migration.py
```
- [ ] Migrations complete successfully
- [ ] Verify tables created in Supabase dashboard

### 7. Enable Row Level Security (5 minutes)
In Supabase SQL Editor, run:
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
-- Add more tables as needed
```
- [ ] RLS enabled on all user-facing tables

### 8. Deploy Application
Choose your deployment method:

#### Option A: Docker
```bash
docker build -f Dockerfile -t restaurant-analytics:prod .
docker run -d --env-file .env.production -p 8000:8000 restaurant-analytics:prod
```

#### Option B: Direct
```bash
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --env-file .env.production
```

- [ ] Application starts without errors
- [ ] Health check endpoint responds: `curl http://localhost:8000/health`

## Post-Deployment

### 9. Smoke Tests (10 minutes)
- [ ] User registration works
- [ ] User login works
- [ ] Invoice upload works
- [ ] Menu parsing works
- [ ] Review analysis works
- [ ] API rate limiting works

### 10. Set Up Monitoring
- [ ] Set up Supabase usage alerts
- [ ] Set up API key usage alerts (Google, SerpAPI, Outscraper)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring

### 11. Security Final Check
- [ ] `.env.production` is NOT in git
- [ ] All secrets are different from dev
- [ ] HTTPS is enabled
- [ ] CORS is configured correctly
- [ ] CSP headers are active
- [ ] Rate limiting is working

## Rollback Plan

If something goes wrong:
1. Keep old `.env.production` backed up
2. Document current deployment
3. Have database backup ready
4. Know how to revert to previous version

## Emergency Contacts

- Supabase Support: https://supabase.com/support
- Your team: [Add contact info]

---

## Quick Commands Reference

```bash
# Verify production setup
python verify_production_setup.py

# Run migrations
python run_menu_migrations.py

# Check logs (Docker)
docker logs <container-id>

# Restart service (Docker)
docker restart <container-id>

# Check database connection
python -c "from config.supabase_client import get_supabase_client; print(get_supabase_client())"
```

---

**Estimated Total Time:** 1-2 hours
**Last Updated:** November 3, 2025
