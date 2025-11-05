# Production Deployment - What Gets Included

## ✅ INCLUDED in Production

### Core Application
- `api/` - All API routes and endpoints
- `services/` - All business logic services
- `frontend/src/` - All React components and pages
- `database/migrations/` - Database migration files (numbered)
- `prompts/` - LLM prompts for AI features
- `config/` - Configuration files

### Essential Config
- `package.json` files
- `requirements.txt` or `pyproject.toml`
- `.env.production.example` (template only)
- `README.md` (main project readme)

### Infrastructure
- `Dockerfile` (if using Docker)
- `docker-compose.yml` (if using Docker)
- CI/CD configs (`.github/workflows/`, etc.)

## ❌ EXCLUDED from Production

### Documentation (100+ files)
- All `*_COMPLETE.md`, `*_SUMMARY.md`, `*_GUIDE.md`
- All `*_AUDIT.md`, `*_ANALYSIS.md`, `*_REPORT.md`
- `MARKETING_*.md`, `SECURITY_*.md`, `CSP_*.md`
- `diagrams/` folder (all .mmd files)

### Test Files
- `tests/production/` - Production test suite
- `tests/e2e_auth/` - E2E auth tests
- `tests/module_tests/` - Module tests
- `test-invoice-parser/` - Test parser
- All `*.test.ts`, `*.spec.ts`, `*.test.tsx` files

### Development Scripts (50+ files)
- `verify_*.py` - Verification scripts
- `check_*.py` - Check scripts
- `analyze_*.py` - Analysis scripts
- `debug_*.py` - Debug scripts
- `seed_*.py` - Seed data scripts
- `audit_*.py` - Audit scripts
- `trace_*.py` - Trace scripts
- `cleanup_*.py` - Cleanup scripts

### SQL Verification Files
- `AUDIT_*.sql`
- `*_VERIFICATION.sql`
- `verify_*.sql`
- `database/production_schema_complete.sql` (export only)
- `database/rls_policies_only.sql` (export only)

### Logs and Monitoring
- `monitoring_logs/` folder
- `backend_logs.txt`
- All `*.log` files

### Sample/Test Data
- `park-avenue-menu-web-*.pdf`
- `*_verification_*.json`
- `*_session_report_*.json`

### Environment Files
- `.env` (local secrets)
- `.env.local`
- `.env.production` (actual secrets - never commit!)

## 🔧 How It Works

### Git (.gitignore)
- Prevents committing test files, docs, and secrets to your repo
- Keeps your repo clean for collaborators
- Run: `git status` to see what's tracked

### Docker (.dockerignore)
- Prevents copying unnecessary files into Docker images
- Makes builds faster and images smaller
- Reduces attack surface in production

### Deployment
When you deploy to production:
1. Only files NOT in `.gitignore` get committed to Git
2. Only files NOT in `.dockerignore` get copied to Docker
3. Your production environment is lean and secure

## 📝 Quick Commands

```bash
# See what Git will track
git status

# See what would be in a Docker build
docker build --no-cache -t test-build .

# Clean up untracked files (BE CAREFUL!)
git clean -n  # Dry run - shows what would be deleted
git clean -fd # Actually delete untracked files and directories

# Check Docker image size
docker images | grep your-app-name
```

## 🎯 Result

Your production deployment will be:
- **Smaller**: No docs, tests, or dev scripts
- **Faster**: Quicker builds and deploys
- **Cleaner**: Only production code
- **Safer**: No test data or verification files

Current repo has ~300+ files. Production will have ~100 essential files.
