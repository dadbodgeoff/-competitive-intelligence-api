# Development Workflow Guide

## Your Setup

**Production Repo (GitHub):** https://github.com/dadbodgeo/restauarant-iq-prod.git  
**Local Dev:** This folder (where you work)

---

## File Organization

### Production Files (In GitHub)
These are the files that go to production:
```
api/                    # Backend routes & logic
services/               # Business logic
database/migrations/    # Database schema
frontend/src/          # React app
config/                # Configuration
models/                # Data models
prompts/               # LLM prompts
requirements.txt       # Python dependencies
Dockerfile             # Production build
docker-compose.yml     # Production deployment
.env.production.example # Production env template
README.md              # Project documentation
```

### Dev-Only Files (Local Only, Not in GitHub)
These stay on your machine for development:
```
*.md (except README)   # All your docs/notes
test_*.py              # Test scripts
verify_*.py            # Verification scripts
check_*.py             # Check scripts
audit_*.py             # Audit scripts
seed_*.py              # Seed data scripts
*.sql (except migrations) # SQL verification files
tests/                 # Test suites
diagrams/              # Architecture diagrams
monitoring_logs/       # Log files
*.json (test data)     # Test JSON files
.env                   # Your dev secrets
.env.dev               # Dev environment
```

---

## Daily Workflow

### Working on Features (Development)

1. **Make changes in your local folder**
   ```bash
   # Edit files normally
   # Run dev server
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Test locally**
   ```bash
   # Your test scripts work fine locally
   python test_something.py
   python verify_something.py
   ```

3. **When feature is done, commit to GitHub**
   ```bash
   # Stage only production code
   git add api/ services/ frontend/src/ database/migrations/
   
   # Or stage everything (gitignore handles the rest)
   git add .
   
   # Commit
   git commit -m "Add new feature: X"
   
   # Push to GitHub
   git push origin main
   ```

### What Gets Pushed vs What Stays Local

**Automatically Pushed (Production Code):**
- All code in `api/`, `services/`, `frontend/src/`
- Database migrations
- Docker files
- Requirements
- README.md

**Automatically Ignored (Dev Files):**
- Your test scripts (`test_*.py`)
- Your verification scripts (`verify_*.py`)
- All markdown docs except README
- Test data JSON files
- Logs
- SQL verification files

---

## Environment Files

### `.env` (Local Dev - NOT in GitHub)
Your development secrets. Use this daily.
```env
SUPABASE_URL=https://your-dev-project.supabase.co
GOOGLE_GEMINI_API_KEY=your-dev-key
# etc...
```

### `.env.production` (Production - NOT in GitHub)
Your production secrets. Only use when deploying.
```env
SUPABASE_URL=https://your-prod-project.supabase.co
GOOGLE_GEMINI_API_KEY=your-prod-key
# etc...
```

### `.env.production.example` (Template - IN GitHub)
Template for others to create their production env.

---

## Git Branches (Optional but Recommended)

### Simple Approach (What You Have Now)
```
main branch = production code
```
- Work directly on main
- Push when ready
- Deploy from main

### Better Approach (For Future)
```
main branch = production (stable)
dev branch = development (your daily work)
```

**Setup:**
```bash
# Create dev branch
git checkout -b dev

# Work on dev branch daily
git add .
git commit -m "Working on feature X"
git push origin dev

# When ready for production
git checkout main
git merge dev
git push origin main
```

---

## Quick Reference Commands

### Daily Development
```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up

# Run your test scripts (local only)
python test_something.py

# Check what will be committed
git status

# Commit your work
git add .
git commit -m "Description of changes"
git push origin main
```

### Deploying to Production
```bash
# Make sure main is up to date
git push origin main

# On Digital Ocean, pull latest
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d
```

---

## What's in GitHub vs What's Local

### GitHub (Production Repo)
- ✅ Clean production code
- ✅ README.md
- ✅ Docker files
- ✅ Database migrations
- ❌ No test scripts
- ❌ No docs/notes
- ❌ No test data
- ❌ No .env files

### Your Local Machine
- ✅ Everything from GitHub
- ✅ All your test scripts
- ✅ All your docs/notes
- ✅ All your verification scripts
- ✅ `.env` for development
- ✅ `.env.production` for deployment

---

## File Naming Conventions

**Production Code (Goes to GitHub):**
- `api/routes/something.py`
- `services/something_service.py`
- `frontend/src/components/Something.tsx`

**Dev Scripts (Stays Local):**
- `test_something.py`
- `verify_something.py`
- `check_something.py`
- `audit_something.py`
- `seed_something.py`

**Documentation (Stays Local):**
- `SOMETHING_GUIDE.md`
- `SOMETHING_AUDIT.md`
- `SOMETHING_COMPLETE.md`

---

## Checking What Will Be Committed

Before pushing, always check:
```bash
git status
```

Should see:
- ✅ Modified: `api/routes/something.py`
- ✅ Modified: `services/something.py`
- ❌ NOT showing: `test_*.py` files
- ❌ NOT showing: `*.md` files (except README)
- ❌ NOT showing: `.env` files

---

## Summary

**Your Workflow:**
1. Work locally with all your test scripts and docs
2. Use `.env` for development
3. When feature is done, `git add .` and `git commit`
4. `.gitignore` automatically excludes dev files
5. Push to GitHub - only production code goes up
6. Deploy from GitHub to Digital Ocean

**Key Point:** You can keep ALL your test scripts, docs, and verification files locally. They won't go to GitHub because `.gitignore` handles it automatically. Work however you want locally, git keeps it clean.
