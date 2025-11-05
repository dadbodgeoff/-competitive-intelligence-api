# 🚀 Quick Deploy Checklist - Digital Ocean

**Time to Deploy:** ~30 minutes  
**Difficulty:** Medium

## Before You Start

You need:
- [ ] Digital Ocean account
- [ ] Domain name (DNS configured)
- [ ] GitHub repo with your code
- [ ] Production Supabase project created
- [ ] Production API keys ready

---

## 🎯 The 5 Critical Things You MUST Do

### 1. Create `.env.production` (5 minutes)

```bash
# Copy template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Must change:**
- `SUPABASE_URL` - Your production Supabase URL
- `SUPABASE_ANON_KEY` - Production anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Production service role key
- `JWT_SECRET_KEY` - Generate with: `openssl rand -base64 64`
- `ALLOWED_ORIGINS` - Your domain (e.g., `https://yourdomain.com`)
- All API keys (Google, SerpAPI, Outscraper)

### 2. Set VITE_API_URL (2 minutes)

**If using same domain (recommended):**
```yaml
# In docker-compose.yml, add to api service environment:
- VITE_API_URL=
```

**If using separate API domain:**
```yaml
- VITE_API_URL=https://api.yourdomain.com
```

### 3. Update ALLOWED_ORIGINS (1 minute)

In `.env.production`:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 4. Test Build Locally (5 minutes)

```bash
# Build frontend
cd frontend
npm run build

# Build Docker image
docker build -t restaurant-iq:test .

# Test it
docker run -p 8000:8000 --env-file .env.production restaurant-iq:test

# Visit http://localhost:8000/health
```

### 5. Set Up Reverse Proxy (10 minutes)

Use the provided `nginx.conf`:
```bash
# Update domain in nginx.conf
sed -i 's/yourdomain.com/YOURDOMAIN/g' nginx.conf

# Copy to nginx
sudo cp nginx.conf /etc/nginx/sites-available/restaurant-iq
sudo ln -s /etc/nginx/sites-available/restaurant-iq /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚢 Deployment Options

### Option A: Digital Ocean App Platform (Easiest)

**Pros:** Automatic SSL, scaling, monitoring  
**Cons:** More expensive (~$12/month minimum)

**Steps:**
1. Push code to GitHub
2. Go to Digital Ocean → App Platform → Create App
3. Connect GitHub repo
4. Configure:
   - **Build Command:** `npm run build`
   - **Run Command:** `uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4`
5. Add environment variables from `.env.production`
6. Add Redis component
7. Deploy!

**Cost:** ~$12-25/month

### Option B: Droplet + Docker (More Control)

**Pros:** Cheaper, full control  
**Cons:** Manual setup, you manage everything

**Steps:**
1. Create Ubuntu 22.04 droplet ($6/month)
2. SSH into droplet
3. Run deployment script:
   ```bash
   wget https://raw.githubusercontent.com/yourusername/restaurant-iq/main/deploy-to-digital-ocean.sh
   chmod +x deploy-to-digital-ocean.sh
   sudo ./deploy-to-digital-ocean.sh
   ```
4. Follow prompts

**Cost:** ~$6-12/month

---

## 🔍 Post-Deployment Tests

Run these after deployment:

```bash
# Health check
curl https://yourdomain.com/health

# API health
curl https://yourdomain.com/api/v1/health

# Frontend loads
curl https://yourdomain.com/ | grep "RestaurantIQ"

# Register user
curl -X POST https://yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

---

## ⚠️ Common Issues

### "CORS Error"
**Fix:** Update `ALLOWED_ORIGINS` in `.env.production`

### "502 Bad Gateway"
**Fix:** Backend not running. Check: `docker-compose logs api`

### "Frontend Blank Page"
**Fix:** Build failed. Check: `docker-compose logs api` and verify `frontend/dist` exists

### "Database Connection Failed"
**Fix:** Wrong Supabase credentials. Verify in `.env.production`

### "API Returns 404"
**Fix:** Nginx not routing correctly. Check `/var/log/nginx/error.log`

---

## 📊 Monitoring

After deployment, monitor:

```bash
# Docker logs
docker-compose logs -f api

# Nginx logs
tail -f /var/log/nginx/restaurant-iq-error.log

# System resources
htop
docker stats
```

---

## 🔄 Updates & Rollbacks

### Deploy Update:
```bash
git pull
docker-compose build
docker-compose up -d
```

### Rollback:
```bash
git checkout <previous-commit>
docker-compose build
docker-compose up -d
```

---

## 💰 Cost Estimate

### Minimum Setup:
- Digital Ocean Droplet: $6/month
- Domain: $12/year
- **Total: ~$7/month**

### Recommended Setup:
- Digital Ocean App Platform: $12/month
- Redis: $15/month
- Domain: $12/year
- **Total: ~$28/month**

### API Costs (Usage-Based):
- Google Gemini: Free tier (60 requests/min)
- SerpAPI: $50/month (5,000 searches)
- Outscraper: $30/month (1,000 requests)
- **Total: ~$80/month** (only if you hit limits)

---

## ✅ Final Checklist

Before going live:

- [ ] `.env.production` created with all secrets
- [ ] JWT secret generated (64+ chars)
- [ ] Production Supabase project created
- [ ] All migrations run on production DB
- [ ] RLS enabled on all tables
- [ ] ALLOWED_ORIGINS set to your domain
- [ ] COOKIE_SECURE=true
- [ ] Frontend builds successfully
- [ ] Docker image builds successfully
- [ ] Health endpoints return 200
- [ ] SSL certificate installed
- [ ] DNS points to your server
- [ ] Tested registration flow
- [ ] Tested login flow
- [ ] Tested invoice upload
- [ ] Tested menu upload
- [ ] Tested review analysis
- [ ] Monitoring set up
- [ ] Backups configured

---

## 🆘 Need Help?

1. Check logs first: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test locally before deploying
4. Check Digital Ocean status page
5. Review the full audit: `DIGITAL_OCEAN_DEPLOYMENT_AUDIT.md`

---

**Ready?** Start with Option A (App Platform) for the easiest deployment!
