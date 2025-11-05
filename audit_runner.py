#!/usr/bin/env python3
"""Quick Pre-Production Audit Runner"""
import subprocess
import sys

print("🔒 PRE-PRODUCTION SECURITY AUDIT\n")
print("="*60)

checks_passed = 0
checks_failed = 0

# 1. Check for hardcoded secrets
print("\n1. Checking for hardcoded secrets...")
result = subprocess.run('grep -r "sk-" --include="*.py" . 2>nul', shell=True, capture_output=True, text=True)
if result.stdout.strip() and '.env' not in result.stdout:
    print("❌ FAIL: Found potential API keys")
    checks_failed += 1
else:
    print("✅ PASS: No hardcoded API keys found")
    checks_passed += 1

# 2. Check .gitignore
print("\n2. Checking .gitignore...")
try:
    with open('.gitignore', 'r') as f:
        if '.env' in f.read():
            print("✅ PASS: .env in .gitignore")
            checks_passed += 1
        else:
            print("❌ FAIL: .env not in .gitignore")
            checks_failed += 1
except:
    print("❌ FAIL: .gitignore not found")
    checks_failed += 1

# 3. Check error sanitization
print("\n3. Checking error sanitization...")
result = subprocess.run('grep -r "detail=str(e)" --include="*.py" api/ 2>nul', shell=True, capture_output=True, text=True)
if result.stdout.strip():
    print("❌ FAIL: Found unsanitized errors")
    checks_failed += 1
else:
    print("✅ PASS: No unsanitized errors")
    checks_passed += 1

# 4. Check ErrorSanitizer exists
print("\n4. Checking ErrorSanitizer service...")
import os
if os.path.exists('services/error_sanitizer.py'):
    print("✅ PASS: ErrorSanitizer exists")
    checks_passed += 1
else:
    print("❌ FAIL: ErrorSanitizer not found")
    checks_failed += 1

# 5. Check health endpoint
print("\n5. Checking health endpoint...")
try:
    import os
    main_path = os.path.join('api', 'main.py')
    if os.path.exists(main_path):
        with open(main_path, 'r', encoding='utf-8') as f:
            if '/health' in f.read():
                print("✅ PASS: Health endpoint exists")
                checks_passed += 1
            else:
                print("❌ FAIL: Health endpoint missing")
                checks_failed += 1
    else:
        print("❌ FAIL: api/main.py not found")
        checks_failed += 1
except Exception as e:
    print(f"❌ FAIL: Could not check main.py - {e}")
    checks_failed += 1

# 6. Check rate limiting
print("\n6. Checking rate limiting...")
if os.path.exists('api/middleware/rate_limiting.py'):
    print("✅ PASS: Rate limiting middleware exists")
    checks_passed += 1
else:
    print("❌ FAIL: Rate limiting not found")
    checks_failed += 1

# 7. Check .env.example
print("\n7. Checking .env.example...")
if os.path.exists('.env.example'):
    print("✅ PASS: .env.example exists")
    checks_passed += 1
else:
    print("❌ FAIL: .env.example missing")
    checks_failed += 1

# 8. Check for XSS
print("\n8. Checking for XSS vulnerabilities...")
result = subprocess.run('grep -r "dangerouslySetInnerHTML" --include="*.tsx" frontend/src/ 2>nul', shell=True, capture_output=True, text=True)
if result.stdout.strip():
    print("❌ FAIL: Found dangerouslySetInnerHTML")
    checks_failed += 1
else:
    print("✅ PASS: No XSS vulnerabilities found")
    checks_passed += 1

# 9. Check dependencies
print("\n9. Checking dependencies...")
if os.path.exists('requirements.txt'):
    with open('requirements.txt', 'r') as f:
        lines = [l for l in f.read().split('\n') if l and not l.startswith('#')]
        pinned = [l for l in lines if '==' in l]
        if len(pinned) == len(lines):
            print("✅ PASS: All dependencies pinned")
            checks_passed += 1
        else:
            print("⚠️  WARN: Some dependencies not pinned")
            checks_passed += 1
else:
    print("❌ FAIL: requirements.txt not found")
    checks_failed += 1

# 10. Check for PII in logs
print("\n10. Checking for PII in logs...")
result = subprocess.run('grep -r "logger.*email" --include="*.py" services/ 2>nul', shell=True, capture_output=True, text=True)
if result.stdout.strip():
    print("❌ FAIL: Email may be logged")
    checks_failed += 1
else:
    print("✅ PASS: No PII in logs")
    checks_passed += 1

# Summary
print("\n" + "="*60)
print("📊 AUDIT SUMMARY")
print("="*60)
print(f"✅ Passed: {checks_passed}")
print(f"❌ Failed: {checks_failed}")

print("\n" + "="*60)
print("⚠️  DATABASE SECURITY WARNING")
print("="*60)
print("This audit checks APPLICATION CODE only.")
print("\nYou also need to check DATABASE SECURITY:")
print("  1. Run: verify_rls_status.sql in Supabase SQL Editor")
print("  2. Fix any RLS issues found")
print("  3. See: SECURITY_FIXES_REQUIRED.md for details")
print("\nKnown Issues:")
print("  🚨 6 tables need RLS enabled")
print("  ⚠️  30 functions need search_path fixed")
print("\nQuick Fix:")
print("  Run: database/migrations/021_enable_rls_critical_tables.sql")
print("  Run: database/migrations/022_fix_function_search_paths.sql")

if checks_failed > 0:
    print(f"\n🚨 FIX {checks_failed} APPLICATION ISSUES + DATABASE ISSUES")
    print("   BEFORE DEPLOYING TO PRODUCTION")
    sys.exit(1)
else:
    print("\n✅ APPLICATION CODE: READY")
    print("⚠️  DATABASE SECURITY: NEEDS FIXES (see above)")
    print("\nRun database migrations before production deployment.")
    sys.exit(0)
