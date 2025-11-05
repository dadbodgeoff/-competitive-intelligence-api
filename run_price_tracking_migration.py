"""
Run Price Tracking Migration
Adds price tracking columns to inventory_items table
"""
import os
from dotenv import load_dotenv
from database.supabase_client import get_supabase_client

load_dotenv()

def run_migration():
    """Execute the price tracking migration"""
    print("🔄 Running price tracking migration...")
    
    # Read migration file
    migration_path = "database/migrations/009_price_tracking_columns.sql"
    with open(migration_path, 'r') as f:
        migration_sql = f.read()
    
    # Get Supabase client
    supabase = get_supabase_client()
    
    try:
        # Execute migration
        # Note: Supabase Python client doesn't support raw SQL execution
        # You'll need to run this via Supabase SQL Editor or psycopg2
        print("⚠️  This migration must be run via Supabase SQL Editor")
        print("📋 Copy the contents of:")
        print(f"   {migration_path}")
        print("   and paste into Supabase SQL Editor")
        print()
        print("Or run via psql:")
        print(f"   psql $DATABASE_URL < {migration_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    if success:
        print("✅ Migration instructions provided")
    else:
        print("❌ Migration failed")
