# Supabase Production - Quick Start

## 🚀 5-Minute Overview

You need to create a **separate** Supabase project for production.

---

## Why Separate Projects?

| Dev Project | Prod Project |
|-------------|--------------|
| Test data | Real customer data |
| Shared credentials | Secret credentials |
| Experimental features | Stable features only |
| Can break things | Must be reliable |

**Never use dev database in production!**

---

## The 3 Things You Need

### 1. Project URL
```
https://your-new-project.supabase.co
```

### 2. Anon Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Service Role Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Quick Steps

### 1. Create Project (5 min)
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `restaurant-analytics-prod`
4. Generate strong password (save it!)
5. Choose region closest to users
6. Click "Create"
7. Wait 2-3 minutes

### 2. Get Credentials (2 min)
1. Click ⚙️ Settings → API
2. Copy "Project URL"
3. Copy "anon public" key
4. Copy "service_role" key
5. Paste all three into `.env.production`

### 3. Run Migrations (15 min)
1. In Supabase: Click "SQL Editor" → "New query"
2. Run this command to see migration list:
   ```bash
   python list_migrations.py
   ```
3. For each migration file:
   - Open file in your editor
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Wait for success
   - Move to next file

### 4. Verify (1 min)
```bash
python verify_production_setup.py
```

---

## Your .env.production Should Look Like

```env
# Supabase Production (NEW PROJECT)
SUPABASE_URL=https://your-new-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (GENERATE NEW)
JWT_SECRET_KEY=run-python-generate_jwt_secret.py

# API Keys (USE PRODUCTION KEYS)
GOOGLE_GEMINI_API_KEY=your-prod-key
GOOGLE_PLACES_API_KEY=your-prod-key
SERPAPI_KEY=your-prod-key
OUTSCRAPER_API_KEY=your-prod-key
```

---

## Commands You'll Need

```bash
# See all migrations in order
python list_migrations.py

# Generate JWT secret
python generate_jwt_secret.py

# Verify everything is correct
python verify_production_setup.py

# Compare dev vs prod
python compare_env_files.py
```

---

## Detailed Guides

| Guide | When to Use |
|-------|-------------|
| **SUPABASE_VISUAL_GUIDE.md** | Step-by-step with screenshots descriptions |
| **SUPABASE_PRODUCTION_SETUP.md** | Detailed text instructions |
| **SUPABASE_QUICKSTART.md** | This file - quick overview |

---

## Common Questions

**Q: Can I just use my dev Supabase project?**
A: No! You need separate projects for security and data isolation.

**Q: Will this cost money?**
A: Free tier is fine to start. Upgrade when you need more resources.

**Q: What if I mess up?**
A: You can delete the project and start over. Your dev project is safe.

**Q: How long does this take?**
A: 20-30 minutes total if you follow the steps.

**Q: Do I need to migrate my dev data?**
A: No! Start with a clean production database.

---

## Success Checklist

- [ ] Created new Supabase project
- [ ] Copied URL and keys to `.env.production`
- [ ] Ran all migrations in SQL Editor
- [ ] Verified tables exist in Table Editor
- [ ] Ran `python verify_production_setup.py` successfully
- [ ] Connection test passed

---

## Next: Complete Production Setup

After Supabase is done:

1. Generate JWT secret: `python generate_jwt_secret.py`
2. Get production API keys (Google, SerpAPI, etc.)
3. Run full setup: `setup_production.bat`
4. Deploy!

---

**Time Required:** 20-30 minutes
**Difficulty:** Easy (just copy/paste)
**Last Updated:** November 3, 2025
