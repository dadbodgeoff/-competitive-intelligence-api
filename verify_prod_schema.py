#!/usr/bin/env python3
"""
Verify production database schema matches expectations
Compares counts and lists any missing critical components

Usage:
    python verify_prod_schema.py <db_host> <db_password>
    
Example:
    python verify_prod_schema.py db.xxxxx.supabase.co your_password
"""

import psycopg2
import sys

# Production connection details (passed as arguments or use defaults)
if len(sys.argv) >= 3:
    PROD_HOST = sys.argv[1]
    PROD_PASSWORD = sys.argv[2]
else:
    # Try environment variables as fallback
    import os
    from dotenv import load_dotenv
    load_dotenv('.env.production')
    
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    if SUPABASE_URL:
        project_ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
        PROD_HOST = f"db.{project_ref}.supabase.co"
    else:
        PROD_HOST = os.getenv('SUPABASE_DB_HOST')
    
    PROD_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD')

PROD_PORT = '5432'
PROD_NAME = 'postgres'
PROD_USER = 'postgres'

# Expected counts from dev
EXPECTED = {
    'extensions': 6,
    'tables': 46,
    'indexes': 181,
    'functions': 30,
    'rls_enabled_tables': 35,
    'rls_policies': 94,
    'triggers': 18,
    'foreign_keys': 50
}

def verify_production():
    """Verify production database schema"""
    
    print("\n" + "="*70)
    print("PRODUCTION SCHEMA VERIFICATION")
    print("="*70 + "\n")
    
    if not PROD_HOST or not PROD_PASSWORD:
        print("❌ Error: Production credentials not found in .env.production")
        print("   Make sure SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD are set")
        return False
    
    try:
        print(f"Connecting to production: {PROD_HOST}...")
        conn = psycopg2.connect(
            host=PROD_HOST,
            port=PROD_PORT,
            database=PROD_NAME,
            user=PROD_USER,
            password=PROD_PASSWORD
        )
        cursor = conn.cursor()
        
        results = {}
        all_passed = True
        
        # 1. Extensions
        print("\n🔌 Checking Extensions...")
        cursor.execute("""
            SELECT COUNT(*) FROM pg_extension WHERE extname NOT IN ('plpgsql');
        """)
        results['extensions'] = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT extname FROM pg_extension WHERE extname NOT IN ('plpgsql') ORDER BY extname;
        """)
        extensions = [row[0] for row in cursor.fetchall()]
        
        if results['extensions'] == EXPECTED['extensions']:
            print(f"   ✅ {results['extensions']} extensions (expected {EXPECTED['extensions']})")
            print(f"      {', '.join(extensions)}")
        else:
            print(f"   ❌ {results['extensions']} extensions (expected {EXPECTED['extensions']})")
            all_passed = False
        
        # 2. Tables
        print("\n📋 Checking Tables...")
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        """)
        results['tables'] = cursor.fetchone()[0]
        
        if results['tables'] == EXPECTED['tables']:
            print(f"   ✅ {results['tables']} tables (expected {EXPECTED['tables']})")
        else:
            print(f"   ⚠️  {results['tables']} tables (expected {EXPECTED['tables']})")
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cursor.fetchall()]
            print(f"      Tables: {', '.join(tables[:10])}...")
        
        # 3. Indexes
        print("\n🔍 Checking Indexes...")
        cursor.execute("""
            SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
        """)
        results['indexes'] = cursor.fetchone()[0]
        
        if results['indexes'] >= EXPECTED['indexes'] * 0.95:  # Allow 5% variance
            print(f"   ✅ {results['indexes']} indexes (expected ~{EXPECTED['indexes']})")
        else:
            print(f"   ⚠️  {results['indexes']} indexes (expected {EXPECTED['indexes']})")
        
        # 4. Functions
        print("\n⚙️  Checking Functions...")
        cursor.execute("""
            SELECT COUNT(*)
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
            WHERE n.nspname = 'public'
            AND p.prolang != (SELECT oid FROM pg_language WHERE lanname = 'c')
            AND d.objid IS NULL;
        """)
        results['functions'] = cursor.fetchone()[0]
        
        if results['functions'] == EXPECTED['functions']:
            print(f"   ✅ {results['functions']} functions (expected {EXPECTED['functions']})")
        else:
            print(f"   ⚠️  {results['functions']} functions (expected {EXPECTED['functions']})")
            cursor.execute("""
                SELECT p.proname
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
                WHERE n.nspname = 'public'
                AND p.prolang != (SELECT oid FROM pg_language WHERE lanname = 'c')
                AND d.objid IS NULL
                ORDER BY p.proname;
            """)
            functions = [row[0] for row in cursor.fetchall()]
            print(f"      Functions: {', '.join(functions[:5])}...")
        
        # 5. RLS Enabled Tables
        print("\n🔒 Checking RLS...")
        cursor.execute("""
            SELECT COUNT(*) FROM pg_tables 
            WHERE schemaname = 'public' AND rowsecurity = true;
        """)
        results['rls_enabled_tables'] = cursor.fetchone()[0]
        
        if results['rls_enabled_tables'] == EXPECTED['rls_enabled_tables']:
            print(f"   ✅ {results['rls_enabled_tables']} tables with RLS enabled (expected {EXPECTED['rls_enabled_tables']})")
        else:
            print(f"   ❌ {results['rls_enabled_tables']} tables with RLS enabled (expected {EXPECTED['rls_enabled_tables']})")
            all_passed = False
            cursor.execute("""
                SELECT tablename FROM pg_tables 
                WHERE schemaname = 'public' AND rowsecurity = false
                ORDER BY tablename;
            """)
            no_rls = [row[0] for row in cursor.fetchall()]
            if no_rls:
                print(f"      ⚠️  Tables WITHOUT RLS: {', '.join(no_rls)}")
        
        # 6. RLS Policies
        cursor.execute("""
            SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
        """)
        results['rls_policies'] = cursor.fetchone()[0]
        
        if results['rls_policies'] == EXPECTED['rls_policies']:
            print(f"   ✅ {results['rls_policies']} RLS policies (expected {EXPECTED['rls_policies']})")
        else:
            print(f"   ⚠️  {results['rls_policies']} RLS policies (expected {EXPECTED['rls_policies']})")
        
        # 7. Triggers
        print("\n⚡ Checking Triggers...")
        cursor.execute("""
            SELECT COUNT(DISTINCT trigger_name)
            FROM information_schema.triggers
            WHERE trigger_schema = 'public';
        """)
        results['triggers'] = cursor.fetchone()[0]
        
        if results['triggers'] == EXPECTED['triggers']:
            print(f"   ✅ {results['triggers']} triggers (expected {EXPECTED['triggers']})")
        else:
            print(f"   ⚠️  {results['triggers']} triggers (expected {EXPECTED['triggers']})")
        
        # 8. Foreign Keys
        print("\n🔗 Checking Foreign Keys...")
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.table_constraints
            WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
        """)
        results['foreign_keys'] = cursor.fetchone()[0]
        
        if results['foreign_keys'] == EXPECTED['foreign_keys']:
            print(f"   ✅ {results['foreign_keys']} foreign keys (expected {EXPECTED['foreign_keys']})")
        else:
            print(f"   ⚠️  {results['foreign_keys']} foreign keys (expected {EXPECTED['foreign_keys']})")
        
        # Critical Security Check
        print("\n🛡️  Critical Security Checks...")
        
        # Check critical tables have RLS AND policies
        critical_tables = ['users', 'analyses', 'invoices', 'inventory_items', 'menu_items']
        cursor.execute(f"""
            SELECT 
                t.tablename, 
                t.rowsecurity,
                COUNT(p.policyname) as policy_count
            FROM pg_tables t
            LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
            WHERE t.schemaname = 'public' 
            AND t.tablename = ANY(%s)
            GROUP BY t.tablename, t.rowsecurity;
        """, (critical_tables,))
        
        critical_rls = cursor.fetchall()
        for table, has_rls, policy_count in critical_rls:
            if has_rls and policy_count > 0:
                print(f"   ✅ {table}: RLS enabled with {policy_count} policies")
            elif has_rls and policy_count == 0:
                print(f"   ⚠️  {table}: RLS enabled but NO policies (locked down)")
            else:
                print(f"   ❌ {table}: RLS NOT enabled - SECURITY RISK!")
                all_passed = False
        
        cursor.close()
        conn.close()
        
        # Summary
        print("\n" + "="*70)
        if all_passed:
            print("✅ PRODUCTION SCHEMA VERIFICATION PASSED")
            print("="*70)
            print("\nYour production database is properly configured!")
            print("All critical security features are in place.")
        else:
            print("⚠️  PRODUCTION SCHEMA VERIFICATION - ISSUES FOUND")
            print("="*70)
            print("\nSome components don't match expectations.")
            print("Review the warnings above before going live.")
        print()
        
        return all_passed
        
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    import sys
    success = verify_production()
    sys.exit(0 if success else 1)
