# GitHub & Production Deployment Checklist

## Pre-Push Checklist

### 1. Clean Up Sensitive Data
- [x] `.env` is in `.gitignore`
- [x] `.env.production` is in `.gitignore`
- [x] No API keys in code
- [x] No hardcoded secrets
- [x] Test files excluded from git
- [x] Documentation excluded from git

### 2. Verify Docker Setup
- [ ] `docker-compose build` succeeds
- [ ] `docker-compose up` starts all services
- [ ] Health check passes: `curl http://localhost:8000/health`
- [ ] Frontend builds: `cd frontend && npm run build`

### 3. Create Production Environment
- [ ] Create `.env.production` from `.env.production.example`
- [ ] Generate new JWT secret: `openssl rand -base64 64`
- [ ] Create production Supabase project
- [ ] Get production API keys (separate from dev)
- [ ] Update `ALLOWED_ORIGINS` with your domain

### 4. Test Locally
```bash
# Build production image
docker build -t restaurant-iq:test .

# Run with production env
docker run -p 8000:8000 --env-file .env.production restaurant-iq:test

# Test health
curl http://localhost:8000/health
```

## GitHub Setup

### 1. Create Repository
```bash
# On GitHub, create new private repository
# Then locally:
git remote add origin https://github.com/yourusername/restaurant-intelligence.git
```

### 2. Initial Commit
```bash
# Check what will be committed
git status

# Add all files (gitignore will exclude junk)
git add .

# Commit
git commit -m "Initial commit - Production ready SaaS platform"

# Push
git push -u origin main
```

### 3. Verify Upload
- Check GitHub - should NOT see:
  - `.env` or `.env.production`
  - `test_*.py` files
  - `*.md` files (except README.md)
  - `diagrams/` folder
  - `tests/` folder
  - JSON test files

## Digital Ocean Deployment

### Option A: App Platform (Recommended)

1. **Connect GitHub:**
   - Go to Digital Ocean → App Platform
   - Click "Create App"
   - Connect your GitHub repository
   - Select branch: `main`

2. **Configure Build:**
   - Build Command: `npm run build` (for frontend)
   - Run Command: `uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4`
   - Dockerfile: Use existing Dockerfile

3. **Add Environment Variables:**
   - Copy all from `.env.production`
   - Add in Digital Ocean dashboard under "Environment Variables"

4. **Add Redis:**
   - Click "Add Component" → "Database" → "Redis"
   - Update `REDIS_HOST` in environment variables

5. **Configure Domain:**
   - Add your custom domain
   - Digital Ocean handles SSL automatically

6. **Deploy:**
   - Click "Deploy"
   - Wait 5-10 minutes
   - Monitor build logs

### Option B: Droplet (More Control)

1. **Create Droplet:**
   - Ubuntu 22.04
   - $6/month minimum
   - Add SSH key

2. **SSH and Setup:**
```bash
ssh root@your-droplet-ip

# Run deployment script
wget https://raw.githubusercontent.com/yourusername/restaurant-intelligence/main/deploy-to-digital-ocean.sh
chmod +x deploy-to-digital-ocean.sh
./deploy-to-digital-ocean.sh
```

3. **Configure DNS:**
   - Point A record to droplet IP
   - Wait for DNS propagation (5-30 minutes)

## Post-Deployment Verification

### 1. Test Endpoints
```bash
# Health check
curl https://yourdomain.com/health

# API health
curl https://yourdomain.com/api/v1/health

# Frontend loads
curl https://yourdomain.com/ | grep "RestaurantIQ"
```

### 2. Test User Flow
- [ ] Register new user
- [ ] Login works
- [ ] Upload invoice
- [ ] Parse menu
- [ ] Run review analysis
- [ ] Check dashboard

### 3. Monitor
- [ ] Check logs for errors
- [ ] Verify database connections
- [ ] Test API rate limiting
- [ ] Confirm cookies work (auth)

## Rollback Plan

If something breaks:

```bash
# Revert to previous commit
git revert HEAD
git push

# Or rollback in Digital Ocean dashboard
# Apps → Your App → Settings → Rollback
```

## Security Checklist

- [ ] `.env.production` NOT in GitHub
- [ ] JWT secret is 64+ random characters
- [ ] All API keys are production-specific
- [ ] COOKIE_SECURE=true
- [ ] ALLOWED_ORIGINS set to your domain
- [ ] Supabase RLS enabled
- [ ] Rate limiting configured
- [ ] HTTPS/SSL enabled

## Cost Estimate

**Minimum Setup:**
- Digital Ocean Droplet: $6/month
- Domain: $12/year
- **Total: ~$7/month**

**Recommended Setup:**
- Digital Ocean App Platform: $12/month
- Redis: $15/month
- Domain: $12/year
- **Total: ~$28/month**

**API Costs (Usage-Based):**
- Google Gemini: Free tier (60 requests/min)
- SerpAPI: $50/month (5,000 searches)
- Outscraper: $30/month (1,000 requests)

## Next Steps After Deploy

1. **Set up monitoring:**
   - Sentry for error tracking
   - PostHog for analytics
   - Uptime monitoring

2. **Configure backups:**
   - Database backups (Supabase handles this)
   - Environment variable backup (secure vault)

3. **Set up CI/CD:**
   - GitHub Actions for automated testing
   - Auto-deploy on push to main

4. **Marketing:**
   - Update landing page copy
   - Set up email (SendGrid/Mailgun)
   - Create demo account

## Troubleshooting

**Build fails:**
- Check Docker logs: `docker-compose logs api`
- Verify all dependencies in `requirements.txt`
- Check frontend build: `cd frontend && npm run build`

**Database connection fails:**
- Verify Supabase credentials in `.env.production`
- Check RLS policies are set up
- Confirm migrations ran successfully

**Frontend blank page:**
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in `api/main.py`

---

**Ready to ship?** Follow this checklist step by step. You got this! 🚀
