# Production Environment Setup Guide

## Overview
This guide walks you through setting up a secure production environment with proper secret rotation.

## Step 1: Create Production Supabase Project

1. Go to https://supabase.com/dashboard
2. Create a NEW project (don't use your dev project)
3. Name it something like "restaurant-analytics-prod"
4. Choose a strong database password (32+ random characters)
5. Wait for project to provision (~2 minutes)

### Get Your Production Supabase Credentials

Once provisioned, go to Project Settings > API:
- Copy `Project URL` → This is your `SUPABASE_URL`
- Copy `anon public` key → This is your `SUPABASE_ANON_KEY`
- Copy `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Generate Strong JWT Secret

Run this command to generate a cryptographically secure JWT secret:

```bash
# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# On Linux/Mac:
openssl rand -base64 64
```

Save this output as your `JWT_SECRET_KEY`.

## Step 3: Set Up Production API Keys

### Google Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create a NEW API key (don't reuse dev key)
3. Set up billing alerts
4. Consider setting quota limits

### SerpAPI Key
1. Go to https://serpapi.com/manage-api-key
2. Create a new API key or use a separate paid plan
3. Set up usage alerts

### Outscraper API Key
1. Go to https://app.outscraper.com/api-keys
2. Create a new API key for production
3. Set up billing alerts

### Google Places API Key
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a NEW API key
3. Restrict it to your production domain
4. Enable only required APIs (Places API, Maps JavaScript API)

## Step 4: Create Production Environment File

Create a new file `.env.production` (this should NOT be committed to git):

```bash
# Copy the template
cp .env.production.example .env.production

# Edit with your production values
# Use a secure editor or vault system
```

## Step 5: Configure Production Settings

Update these settings in `.env.production`:

```env
# Environment
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000

# Security
CSP_REPORT_ONLY=false
COOKIE_SECURE=true
COOKIE_SAMESITE=strict

# Performance
INVOICE_BATCH_PROCESSING=true
INVOICE_ASYNC_PROCESSING=true

# Monitoring
LOG_LEVEL=INFO
```

## Step 6: Set Up Production Database

Run migrations on your production Supabase:

```bash
# Set environment to production
export APP_ENV=production

# Run migrations
python run_menu_migrations.py
python run_price_tracking_migration.py
```

## Step 7: Security Checklist

- [ ] JWT_SECRET_KEY is 64+ random characters
- [ ] Supabase project is separate from dev
- [ ] All API keys are production-specific
- [ ] Database password is 32+ random characters
- [ ] `.env.production` is in `.gitignore`
- [ ] CSP_REPORT_ONLY is set to false
- [ ] COOKIE_SECURE is set to true
- [ ] Row Level Security (RLS) is enabled on all tables
- [ ] API rate limiting is configured
- [ ] Monitoring/logging is set up

## Step 8: Deploy

### Option A: Docker Deployment

```bash
# Build production image
docker build -f Dockerfile -t restaurant-analytics:prod .

# Run with production env
docker run -d \
  --env-file .env.production \
  -p 8000:8000 \
  restaurant-analytics:prod
```

### Option B: Direct Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment
export APP_ENV=production

# Run with production config
uvicorn api.main:app --host 0.0.0.0 --port 8000 --env-file .env.production
```

## Step 9: Verify Production Setup

Run the verification script:

```bash
python verify_production_setup.py
```

This will check:
- All critical secrets are set
- Secrets are different from dev
- Database connectivity
- API key validity
- Security settings

## Secret Management Best Practices

### DO:
- Use environment variables or secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly (every 90 days)
- Use different secrets for dev/staging/prod
- Set up monitoring for secret usage
- Use strong, random secrets (64+ characters for JWT)

### DON'T:
- Commit `.env.production` to git
- Share production secrets in Slack/email
- Reuse dev secrets in production
- Use weak/guessable secrets
- Store secrets in code or config files

## Monitoring Production

Set up alerts for:
- Failed authentication attempts
- API rate limit hits
- Database connection errors
- High error rates
- Unusual API usage patterns

## Rollback Plan

If something goes wrong:

1. Keep your old `.env.production` backed up
2. Have a database backup strategy
3. Document your deployment process
4. Test rollback in staging first

## Support

If you encounter issues:
1. Check logs: `docker logs <container-id>`
2. Verify environment variables are loaded
3. Test database connectivity
4. Check API key quotas/limits
5. Review security settings

---

**Last Updated:** November 3, 2025
**Version:** 1.0
