# Quick Production Reference Card

## 🚀 Fastest Path to Production (30 min)

```bash
# 1. Run automated setup
setup_production.bat

# 2. Deploy
docker-compose -f docker-compose.yml --env-file .env.production up -d

# 3. Verify
curl http://localhost:8000/health
```

---

## 🔑 Critical Secrets Checklist

| Secret | Status | Action |
|--------|--------|--------|
| ☐ JWT_SECRET_KEY | Must change | `python generate_jwt_secret.py` |
| ☐ SUPABASE_URL | Must change | Create new project at supabase.com |
| ☐ SUPABASE_ANON_KEY | Must change | Copy from new Supabase project |
| ☐ SUPABASE_SERVICE_ROLE_KEY | Must change | Copy from new Supabase project |
| ☐ GOOGLE_GEMINI_API_KEY | Should change | Create at aistudio.google.com |
| ☐ GOOGLE_PLACES_API_KEY | Should change | Create at console.cloud.google.com |
| ☐ SERPAPI_KEY | Should change | Create at serpapi.com |
| ☐ OUTSCRAPER_API_KEY | Should change | Create at outscraper.com |

---

## 📋 Commands You'll Need

```bash
# Generate JWT secret
python generate_jwt_secret.py

# Verify setup
python verify_production_setup.py

# Compare dev vs prod
python compare_env_files.py

# Run migrations
python run_menu_migrations.py
python run_price_tracking_migration.py

# Deploy with Docker
docker build -f Dockerfile -t restaurant-analytics:prod .
docker run -d --env-file .env.production -p 8000:8000 restaurant-analytics:prod

# Check logs
docker logs <container-id>

# Health check
curl http://localhost:8000/health
```

---

## 🔗 Important Links

| Service | URL | What to Get |
|---------|-----|-------------|
| Supabase | https://supabase.com/dashboard | URL, anon key, service_role key |
| Google Gemini | https://aistudio.google.com/app/apikey | API key |
| Google Cloud | https://console.cloud.google.com/apis/credentials | Places API key |
| SerpAPI | https://serpapi.com/manage-api-key | API key |
| Outscraper | https://app.outscraper.com/api-keys | API key |

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Using dev Supabase project in production
   ✅ Create separate production project

2. ❌ Weak JWT secret (< 32 characters)
   ✅ Use 64+ character random string

3. ❌ Committing .env.production to git
   ✅ It's already in .gitignore, keep it that way

4. ❌ Reusing dev API keys
   ✅ Use separate production keys for billing/monitoring

5. ❌ Skipping RLS setup
   ✅ Enable Row Level Security on all tables

---

## 🎯 Success Criteria

Your production is ready when:
- ✓ `python verify_production_setup.py` passes with no errors
- ✓ All critical secrets are different from dev
- ✓ Supabase production project is created
- ✓ Database migrations have run successfully
- ✓ Application starts without errors
- ✓ Health check endpoint responds
- ✓ User registration/login works
- ✓ RLS is enabled on all tables

---

## 📚 Documentation

| File | When to Use |
|------|-------------|
| `PRODUCTION_SECRETS_GUIDE.md` | Start here - overview of what needs to change |
| `PRODUCTION_SETUP_GUIDE.md` | Detailed step-by-step instructions |
| `PRODUCTION_CHECKLIST.md` | During deployment - check off each step |
| `QUICK_PRODUCTION_REFERENCE.md` | This file - quick commands and links |

---

## 🆘 Troubleshooting

**Problem:** Verification script fails
**Solution:** Run `python verify_production_setup.py` and fix reported errors

**Problem:** Can't connect to database
**Solution:** Check SUPABASE_URL and keys are correct

**Problem:** JWT authentication fails
**Solution:** Ensure JWT_SECRET_KEY is set and matches between services

**Problem:** API rate limits hit immediately
**Solution:** Check you're using production API keys, not dev keys

---

**Time to Production:** 30-45 minutes
**Last Updated:** November 3, 2025
