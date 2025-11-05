# Digital Ocean Deployment Audit & Checklist

**Date:** November 4, 2024  
**Status:** Pre-Deployment Review

## 🎯 Executive Summary

Your app is **95% ready** for Digital Ocean deployment. Here are the critical items to address:

### ✅ What's Working Well
- Docker setup is production-ready
- No hardcoded localhost URLs found
- Frontend properly uses environment variables
- CORS configured for production domains
- Security headers middleware in place
- Health checks configured
- Multi-stage Docker build optimized
- Static file serving configured for production

### ⚠️ Critical Issues to Fix

1. **VITE_API_URL Not Set in Production** - Frontend won't know where to reach backend
2. **Missing .env.production file** - Need to create from template
3. **ALLOWED_ORIGINS needs your domain** - CORS will block requests
4. **No reverse proxy/nginx config** - Digital Ocean needs this for SSL/routing
5. **Frontend build not tested** - Need to verify production build works

---

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

#### Create `.env.production` file:
```bash
cp .env.production.example .env.production
```

#### Fill in these CRITICAL values:
```env
# Your Digital Ocean domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Supabase Production (create NEW project!)
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Generate new JWT secret (run: openssl rand -base64 64)
JWT_SECRET_KEY=your-64-character-random-secret

# Production API keys (separate from dev!)
GOOGLE_GEMINI_API_KEY=your-prod-key
GOOGLE_PLACES_API_KEY=your-prod-key
SERPAPI_KEY=your-prod-key
OUTSCRAPER_API_KEY=your-prod-key

# Security
COOKIE_SECURE=true
CSP_REPORT_ONLY=false
ENVIRONMENT=production
APP_ENV=production
```

### 2. Frontend Environment Variables

**CRITICAL:** You need to set `VITE_API_URL` for production!

#### Option A: Same Domain (Recommended)
If frontend and backend are on same domain (e.g., yourdomain.com):
- **Don't set VITE_API_URL** - it will default to empty string
- Frontend will make requests to `/api/*` (same origin)
- Digital Ocean needs reverse proxy to route `/api/*` → `:8000`

#### Option B: Separate Domains
If API is on different domain (e.g., api.yourdomain.com):
```env
# In your build environment or docker-compose.yml
VITE_API_URL=https://api.yourdomain.com
```

### 3. Docker Compose Production Setup

Your `docker-compose.yml` is good but needs these additions:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - ENVIRONMENT=production
      - APP_ENV=production
      - LOG_LEVEL=INFO
      # ADD THIS for frontend to know API location
      - VITE_API_URL=${VITE_API_URL:-}
    depends_on:
      - redis
    restart: unless-stopped
```

### 4. Reverse Proxy Configuration (CRITICAL!)

Digital Ocean needs a reverse proxy (nginx/Caddy) to:
- Handle SSL/HTTPS
- Route `/api/*` to backend `:8000`
- Serve frontend static files
- Handle WebSocket upgrades (for streaming)

#### Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (Digital Ocean handles this)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for long-running requests
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000;
    }

    # Frontend static files
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. Build & Test Locally First

```bash
# Build frontend
cd frontend
npm run build

# Verify build output
ls -la dist/

# Test production build locally
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
```

### 6. Database Setup

**CRITICAL:** Create a NEW Supabase project for production!

1. Go to https://supabase.com/dashboard
2. Create new project (don't use dev project!)
3. Run migrations:
   ```bash
   # Copy all SQL from database/migrations/ to Supabase SQL Editor
   # Run in order: 001, 002, 003, etc.
   ```
4. Enable RLS on all tables
5. Verify policies are in place

### 7. Security Checklist

- [ ] `.env.production` is NOT in git (check `.gitignore`)
- [ ] JWT_SECRET_KEY is 64+ random characters
- [ ] All API keys are production-specific (not dev keys)
- [ ] COOKIE_SECURE=true
- [ ] CSP_REPORT_ONLY=false
- [ ] ALLOWED_ORIGINS set to your domain
- [ ] Supabase RLS enabled on all tables
- [ ] Database password is strong (32+ chars)
- [ ] Rate limiting configured
- [ ] HTTPS/SSL enabled (Digital Ocean handles this)

### 8. Digital Ocean Specific Setup

#### App Platform (Recommended - Easiest):
1. Connect GitHub repo
2. Set environment variables in dashboard
3. Configure build command: `npm run build` (for frontend)
4. Configure run command: `uvicorn api.main:app --host 0.0.0.0 --port 8000`
5. Add Redis addon
6. Configure custom domain

#### Droplet (More Control):
1. Create Ubuntu 22.04 droplet
2. Install Docker & Docker Compose
3. Clone repo
4. Create `.env.production`
5. Run `docker-compose up -d`
6. Configure nginx reverse proxy
7. Set up SSL with Let's Encrypt
8. Configure firewall (ufw)

---

## 🚨 Critical Issues Found

### Issue #1: VITE_API_URL Not Configured
**Impact:** Frontend won't know where to send API requests in production

**Fix:**
```yaml
# In docker-compose.yml, add to api service:
environment:
  - VITE_API_URL=  # Empty for same-origin, or set to API domain
```

**OR** if using separate domains:
```bash
# Build frontend with API URL
docker build --build-arg VITE_API_URL=https://api.yourdomain.com -t frontend .
```

### Issue #2: No Reverse Proxy Configuration
**Impact:** Can't route traffic properly, no SSL, frontend won't be served

**Fix:** Add nginx configuration (see section 4 above)

### Issue #3: Frontend Build Not in Docker Image
**Impact:** Your Dockerfile builds frontend, but docker-compose.yml doesn't expose it

**Fix:** Either:
- Use nginx to serve frontend (recommended)
- OR let FastAPI serve it (already configured in `api/main.py` when ENVIRONMENT=production)

### Issue #4: Redis Not Configured in Production
**Impact:** Caching won't work, performance degraded

**Fix:** Your docker-compose.yml already has Redis - just verify it's running

---

## 🎯 Recommended Deployment Strategy

### Option 1: All-in-One Container (Simplest)
Your current setup already does this! FastAPI serves frontend in production.

**Pros:**
- Single container
- Simpler deployment
- Already configured

**Cons:**
- Less scalable
- Frontend and backend coupled

**Deploy:**
```bash
# Build
docker build -t restaurant-iq:prod .

# Run
docker run -d \
  --env-file .env.production \
  -p 8000:8000 \
  restaurant-iq:prod
```

### Option 2: Separate Frontend + Backend (Recommended)
Use nginx to serve frontend, proxy API to backend.

**Pros:**
- Better performance
- Can scale independently
- Standard architecture

**Cons:**
- More complex setup
- Need nginx config

**Deploy:**
```bash
# Use docker-compose
docker-compose -f docker-compose.yml up -d

# Add nginx in front
# (Digital Ocean App Platform handles this automatically)
```

---

## 📝 Deployment Steps (Digital Ocean App Platform)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Create App in Digital Ocean:**
   - Go to App Platform
   - Connect GitHub repo
   - Select branch: `main`

3. **Configure Build Settings:**
   - **Build Command:** `npm run build` (for frontend)
   - **Run Command:** `uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4`
   - **Dockerfile:** Use existing Dockerfile

4. **Set Environment Variables:**
   Copy all from `.env.production` into Digital Ocean dashboard

5. **Add Redis Component:**
   - Click "Add Component"
   - Select "Database" → "Redis"
   - Note the connection string
   - Update REDIS_HOST in environment variables

6. **Configure Domain:**
   - Add your custom domain
   - Digital Ocean handles SSL automatically

7. **Deploy:**
   - Click "Deploy"
   - Wait 5-10 minutes
   - Monitor build logs

8. **Verify:**
   ```bash
   curl https://yourdomain.com/health
   curl https://yourdomain.com/api/v1/health
   ```

---

## 🔍 Post-Deployment Verification

### Test These Endpoints:
```bash
# Health check
curl https://yourdomain.com/health

# API health
curl https://yourdomain.com/api/v1/health

# Frontend loads
curl https://yourdomain.com/

# Auth works
curl -X POST https://yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Check Logs:
```bash
# Docker logs
docker logs <container-id>

# Or in Digital Ocean dashboard
# Go to App → Runtime Logs
```

### Monitor:
- Response times
- Error rates
- API usage/quotas
- Database connections
- Redis memory

---

## 🐛 Common Issues & Fixes

### "CORS Error"
**Cause:** ALLOWED_ORIGINS not set correctly  
**Fix:** Update `.env.production` with your domain

### "API Not Found"
**Cause:** Reverse proxy not routing `/api/*` correctly  
**Fix:** Check nginx config or Digital Ocean routing

### "Frontend Shows Blank Page"
**Cause:** Frontend build failed or not served  
**Fix:** Check build logs, verify `frontend/dist` exists

### "Database Connection Failed"
**Cause:** Wrong Supabase credentials  
**Fix:** Verify SUPABASE_URL and keys in `.env.production`

### "Cookies Not Working"
**Cause:** COOKIE_SECURE=true but not using HTTPS  
**Fix:** Ensure SSL is enabled (Digital Ocean handles this)

---

## 📚 Additional Resources

- [Digital Ocean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Docker Compose Production Guide](https://docs.docker.com/compose/production/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## ✅ Final Checklist Before Deploy

- [ ] Created `.env.production` with all secrets
- [ ] Generated new JWT secret (64+ chars)
- [ ] Created separate Supabase production project
- [ ] Ran all migrations on production database
- [ ] Enabled RLS on all Supabase tables
- [ ] Set ALLOWED_ORIGINS to your domain
- [ ] Set COOKIE_SECURE=true
- [ ] Set CSP_REPORT_ONLY=false
- [ ] Tested frontend build locally (`npm run build`)
- [ ] Tested Docker build locally
- [ ] Verified health endpoints work
- [ ] Configured reverse proxy (nginx or Digital Ocean)
- [ ] Set up monitoring/logging
- [ ] Documented rollback procedure
- [ ] Backed up `.env.production` securely (NOT in git!)

---

**Ready to deploy?** Start with Option 1 (All-in-One) for simplicity, then migrate to Option 2 if you need better performance/scaling.

**Questions?** Check the logs first, then verify environment variables are loaded correctly.
