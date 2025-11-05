# ⚡ QUICK FIX GUIDE - 30 Minutes to Production Ready

## 🚨 You Have 6 Critical Security Issues

Your app code is secure ✅, but database security needs fixes ❌.

---

## Fix in 4 Steps (30 minutes)

### Step 1: Enable RLS (5 min)
```sql
-- Copy/paste this in Supabase SQL Editor:
-- File: database/migrations/021_enable_rls_critical_tables.sql

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_reviews ENABLE ROW LEVEL SECURITY;
```

### Step 2: Secure Functions (10 min)
```sql
-- Copy/paste this in Supabase SQL Editor:
-- File: database/migrations/022_fix_function_search_paths.sql

-- Run the entire migration file
```

### Step 3: Verify (5 min)
```sql
-- Copy/paste this in Supabase SQL Editor:
-- File: verify_rls_status.sql

-- Check output - should show no critical issues
```

### Step 4: Enable Password Check (2 min)
```
Supabase Dashboard → Settings → Authentication → Password Protection
☑ Enable HaveIBeenPwned
```

---

## Verify Success

Run this:
```bash
python audit_runner.py
```

Should show:
```
✅ Passed: 10
❌ Failed: 0
🎉 ALL CHECKS PASSED
```

---

## What You Fixed

1. **RLS on 6 tables** - Users can now only see their own data
2. **30 function search paths** - Prevents privilege escalation attacks
3. **Password checking** - Blocks compromised passwords

---

## Before Production Deploy

- [ ] Run all 4 steps above
- [ ] Update CORS origins in .env
- [ ] Set ENVIRONMENT=production
- [ ] Rotate JWT_SECRET_KEY
- [ ] Configure Sentry DSN

---

## Files to Run

1. `database/migrations/021_enable_rls_critical_tables.sql`
2. `database/migrations/022_fix_function_search_paths.sql`
3. `verify_rls_status.sql`

All files are in your project root.

---

## Need Details?

See: `SECURITY_FIXES_REQUIRED.md` for complete instructions
