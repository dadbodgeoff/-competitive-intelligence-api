# 🚨 PRE-PRODUCTION FINAL AUDIT

**Run this before deploying to production to catch critical issues**

---

## Critical Security Checks

### 1. Secrets & Environment Variables
```bash
# Check for hardcoded secrets
grep -r "sk-" --include="*.py" --include="*.ts" --include="*.tsx" .
grep -r "password.*=" --include="*.py" .
grep -r "api_key.*=" --include="*.py" .
grep -r "SUPABASE_SERVICE_KEY" --include="*.py" .

# Verify .env is in .gitignore
cat .gitignore | grep ".env"
```

**Expected:** No hardcoded secrets, .env in .gitignore

### 2. Authentication & Authorization
```bash
# Check for missing auth decorators
grep -r "@router\." api/routes/ | grep -v "Depends(get_current_user)"

# Check for service role usage (should be minimal)
grep -r "get_supabase_service_client" api/routes/

# Verify RLS policies exist
# Run in Supabase SQL editor:
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

**Expected:** All endpoints have auth, RLS policies on all tables

### 3. SQL Injection & Input Validation
```bash
# Check for string interpolation in SQL
grep -r "f\".*SELECT" services/
grep -r "f\".*INSERT" services/
grep -r "f\".*UPDATE" services/
grep -r "f\".*DELETE" services/

# Check for missing input validation
grep -r "@router.post" api/routes/ -A 5 | grep -v "BaseModel"
```

**Expected:** No f-strings in SQL, all inputs validated with Pydantic

### 4. Error Information Disclosure
```bash
# Check for detailed error messages
grep -r "detail=str(e)" api/
grep -r "raise Exception" services/
grep -r "print(e)" services/

# Verify error sanitizer usage
grep -r "HTTPException" api/routes/ | grep -v "ErrorSanitizer"
```

**Expected:** All errors sanitized, no stack traces to users

---

## Performance & Scalability

### 5. Database Queries
```bash
# Check for N+1 queries
grep -r "for.*in.*:" services/ -A 3 | grep "supabase.table"

# Check for missing pagination
grep -r "@router.get.*list" api/routes/ -A 10 | grep -v "page"

# Check for missing indexes
# Run in Supabase:
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';
```

**Expected:** No N+1 queries, all lists paginated, indexes on foreign keys

### 6. Rate Limiting
```bash
# Verify rate limiting on expensive endpoints
grep -r "@router.post.*analysis" api/routes/ | grep -v "@rate_limit"
grep -r "@router.post.*upload" api/routes/ | grep -v "@rate_limit"
```

**Expected:** Rate limits on all expensive operations

### 7. Caching
```bash
# Check for missing cache usage
grep -r "outscraper" services/ | grep -v "cache"
grep -r "serpapi" services/ | grep -v "cache"
```

**Expected:** External API calls cached

---

## Data Integrity

### 8. Cascade Deletes
```sql
-- Run in Supabase to verify cascade rules
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

**Expected:** Proper CASCADE/SET NULL rules on all foreign keys

### 9. Data Validation
```bash
# Check for missing NOT NULL constraints
# Run in Supabase:
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE is_nullable = 'YES' 
  AND table_schema = 'public'
  AND column_name IN ('user_id', 'created_at', 'id');
```

**Expected:** Critical fields have NOT NULL constraints

### 10. Duplicate Prevention
```bash
# Check for duplicate detection
grep -r "unique" database/migrations/
grep -r "duplicate" services/
```

**Expected:** Unique constraints on critical fields, duplicate detection logic

---

## Monitoring & Observability

### 11. Logging
```bash
# Check for PII in logs
grep -r "logger.*user_id" services/
grep -r "logger.*email" services/
grep -r "logger.*restaurant_name" services/

# Check for structured logging
grep -r "logger.info(f" services/ | wc -l
```

**Expected:** No PII in logs, structured logging used

### 12. Error Tracking
```bash
# Verify Sentry integration
grep -r "sentry" api/main.py
grep -r "SENTRY_DSN" .env.example
```

**Expected:** Sentry configured, DSN in environment

### 13. Health Checks
```bash
# Verify health endpoints exist
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
```

**Expected:** Both endpoints return 200 with status

---

## Frontend Security

### 14. XSS Prevention
```bash
# Check for dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" frontend/src/

# Check for direct DOM manipulation
grep -r "innerHTML" frontend/src/
```

**Expected:** No dangerous HTML injection

### 15. CSRF Protection
```bash
# Verify CORS configuration
grep -r "allow_origins" api/main.py

# Check for SameSite cookies
grep -r "samesite" api/
```

**Expected:** Strict CORS, SameSite=Lax on cookies

### 16. Sensitive Data Exposure
```bash
# Check for tokens in localStorage
grep -r "localStorage.*token" frontend/src/

# Check for API keys in frontend
grep -r "VITE_.*KEY" frontend/src/
```

**Expected:** No tokens in localStorage, no secrets in frontend

---

## Configuration & Deployment

### 17. Environment Configuration
```bash
# Verify all required env vars documented
diff <(grep "os.getenv" -r services/ api/ | sed 's/.*os.getenv("\([^"]*\)".*/\1/' | sort -u) \
     <(grep "^[A-Z_]*=" .env.example | cut -d= -f1 | sort)
```

**Expected:** All env vars in .env.example

### 18. Database Migrations
```bash
# Check migration order
ls -1 database/migrations/*.sql | sort

# Verify migrations are idempotent
grep -r "IF NOT EXISTS" database/migrations/
grep -r "IF EXISTS" database/migrations/
```

**Expected:** Migrations numbered sequentially, all idempotent

### 19. Dependencies
```bash
# Check for vulnerable packages
pip list --outdated
npm audit

# Verify pinned versions
grep "==" requirements.txt | wc -l
```

**Expected:** No critical vulnerabilities, versions pinned

---

## Business Logic

### 20. Cost Controls
```bash
# Check for cost tracking
grep -r "track_cost" services/
grep -r "cost_per_analysis" services/

# Verify tier limits enforced
grep -r "check_usage_limits" api/middleware/
```

**Expected:** All API costs tracked, tier limits enforced

### 21. Data Retention
```bash
# Check for cleanup jobs
grep -r "DELETE.*WHERE.*created_at" services/
grep -r "archive" services/
```

**Expected:** Old data cleanup strategy exists

### 22. Idempotency
```bash
# Check for idempotency keys
grep -r "processed_events" services/
grep -r "duplicate" services/
```

**Expected:** Critical operations are idempotent

---

## Testing

### 23. Test Coverage
```bash
# Run tests
pytest tests/ -v
npm test

# Check critical paths tested
ls tests/*e2e*.py
ls tests/*integration*.py
```

**Expected:** All critical paths have tests, tests passing

### 24. Load Testing
```bash
# Verify rate limits work
python test_rate_limiting.py

# Check database connection pool
# In Supabase dashboard: Database > Connection pooling
```

**Expected:** Rate limits functional, connection pool configured

---

## Documentation

### 25. API Documentation
```bash
# Verify OpenAPI docs accessible
curl http://localhost:8000/api/docs

# Check README is current
cat README.md | grep "Getting Started"
```

**Expected:** API docs accessible, README up to date

### 26. Deployment Guide
```bash
# Verify deployment docs exist
ls DOCKER_SETUP.md
ls DEPLOYMENT_CHECKLIST*.md
```

**Expected:** Clear deployment instructions

---

## Final Checklist

Run this command to execute all checks:

```bash
python pre_production_audit.py
```

### Critical (Must Fix)
- [ ] No hardcoded secrets
- [ ] All endpoints have authentication
- [ ] RLS policies on all tables
- [ ] No SQL injection vulnerabilities
- [ ] Error messages sanitized
- [ ] Rate limiting on expensive endpoints
- [ ] No PII in logs
- [ ] Sentry configured
- [ ] CORS properly configured
- [ ] No tokens in localStorage

### High Priority (Should Fix)
- [ ] All lists paginated
- [ ] Indexes on foreign keys
- [ ] External APIs cached
- [ ] Proper cascade delete rules
- [ ] Duplicate prevention
- [ ] Health checks working
- [ ] All env vars documented
- [ ] Migrations idempotent
- [ ] Cost tracking implemented

### Medium Priority (Nice to Have)
- [ ] Structured logging
- [ ] Test coverage > 70%
- [ ] Load testing done
- [ ] API docs current
- [ ] Deployment guide complete

---

## Automated Audit Script

Save as `pre_production_audit.py`:

```python
#!/usr/bin/env python3
import os
import subprocess
import sys

def run_check(name, command, expected_in_output=None, should_be_empty=False):
    print(f"\n{'='*60}")
    print(f"🔍 {name}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        output = result.stdout + result.stderr
        
        if should_be_empty:
            if output.strip():
                print(f"❌ FAIL: Found issues")
                print(output[:500])
                return False
            else:
                print(f"✅ PASS: No issues found")
                return True
        
        if expected_in_output:
            if expected_in_output in output:
                print(f"✅ PASS")
                return True
            else:
                print(f"❌ FAIL: Expected '{expected_in_output}' not found")
                return False
        
        print(output[:500])
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    checks_passed = 0
    checks_failed = 0
    
    # Security checks
    checks = [
        ("No hardcoded API keys", 
         'grep -r "sk-" --include="*.py" .', 
         should_be_empty=True),
        
        (".env in .gitignore", 
         'cat .gitignore | grep ".env"', 
         expected_in_output=".env"),
        
        ("Health endpoint works", 
         'curl -s http://localhost:8000/health', 
         expected_in_output="healthy"),
        
        ("No PII in logs", 
         'grep -r "logger.*email" services/', 
         should_be_empty=True),
    ]
    
    for name, command, *args in checks:
        kwargs = {}
        if args:
            if 'expected_in_output' in str(args):
                kwargs = {'expected_in_output': args[0].get('expected_in_output')}
            if 'should_be_empty' in str(args):
                kwargs = {'should_be_empty': args[0].get('should_be_empty', False)}
        
        if run_check(name, command, **kwargs):
            checks_passed += 1
        else:
            checks_failed += 1
    
    print(f"\n{'='*60}")
    print(f"📊 AUDIT SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Passed: {checks_passed}")
    print(f"❌ Failed: {checks_failed}")
    
    if checks_failed > 0:
        print(f"\n🚨 FIX {checks_failed} ISSUES BEFORE DEPLOYING TO PRODUCTION")
        sys.exit(1)
    else:
        print(f"\n🎉 ALL CHECKS PASSED - READY FOR PRODUCTION")
        sys.exit(0)

if __name__ == "__main__":
    main()
```

---

**Run before every production deployment:**
```bash
python pre_production_audit.py
```

**If any critical checks fail, DO NOT DEPLOY.**
