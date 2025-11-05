#!/usr/bin/env python3
"""
Export ONLY RLS policies from dev database
This creates a clean SQL file with just the policies
"""

import psycopg2

# DEV Connection details
DEV_HOST = "db.syxquxgynoinzwhwkosa.supabase.co"
DEV_PORT = "5432"
DEV_NAME = "postgres"
DEV_USER = "postgres"
DEV_PASSWORD = "upUK2zWkEnSrFjbvYlI7aJexGhLRgAdH"

def export_rls_policies():
    """Export RLS policies from dev"""
    
    print("\n" + "="*70)
    print("Exporting RLS Policies from DEV")
    print("="*70 + "\n")
    
    try:
        print(f"Connecting to DEV: {DEV_HOST}...")
        conn = psycopg2.connect(
            host=DEV_HOST,
            port=DEV_PORT,
            database=DEV_NAME,
            user=DEV_USER,
            password=DEV_PASSWORD
        )
        
        cursor = conn.cursor()
        
        # Get all policies with their full definitions
        print("Fetching RLS policies...")
        cursor.execute("""
            SELECT 
                schemaname,
                tablename,
                policyname,
                permissive,
                roles,
                cmd,
                qual,
                with_check
            FROM pg_policies 
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
        """)
        
        policies = cursor.fetchall()
        print(f"Found {len(policies)} policies\n")
        
        # Open output file
        output_file = "database/rls_policies_only.sql"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("-- ============================================================================\n")
            f.write("-- RLS POLICIES EXPORT\n")
            f.write(f"-- Exported from DEV: {DEV_HOST}\n")
            f.write(f"-- Total Policies: {len(policies)}\n")
            f.write("-- ============================================================================\n\n")
            f.write("-- IMPORTANT: Run this AFTER tables are created and RLS is enabled\n\n")
            
            current_table = None
            
            for schema, table, policy_name, permissive, roles, cmd, qual, with_check in policies:
                # Add table header
                if table != current_table:
                    if current_table is not None:
                        f.write("\n")
                    f.write(f"-- Policies for {table}\n")
                    current_table = table
                
                # Build CREATE POLICY statement
                policy_sql = f"CREATE POLICY \"{policy_name}\" ON {schema}.{table}"
                
                # Add command type
                if cmd == '*':
                    policy_sql += " FOR ALL"
                elif cmd == 'r':
                    policy_sql += " FOR SELECT"
                elif cmd == 'a':
                    policy_sql += " FOR INSERT"
                elif cmd == 'w':
                    policy_sql += " FOR UPDATE"
                elif cmd == 'd':
                    policy_sql += " FOR DELETE"
                
                # Add roles if not public
                if roles and roles != ['public']:
                    policy_sql += f" TO {', '.join(roles)}"
                
                # Add USING clause
                if qual:
                    policy_sql += f"\n  USING ({qual})"
                
                # Add WITH CHECK clause
                if with_check:
                    policy_sql += f"\n  WITH CHECK ({with_check})"
                
                policy_sql += ";\n"
                
                f.write(policy_sql)
        
        cursor.close()
        conn.close()
        
        print("="*70)
        print(f"✅ RLS policies exported to: {output_file}")
        print("="*70)
        print(f"\nExported {len(policies)} policies")
        print("\nNext steps:")
        print("1. Review the file: database/rls_policies_only.sql")
        print("2. Run it in your PRODUCTION Supabase SQL Editor")
        print("3. Verify with: SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    import sys
    success = export_rls_policies()
    sys.exit(0 if success else 1)
