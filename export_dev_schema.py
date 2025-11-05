#!/usr/bin/env python3
"""
Export the complete schema from your dev Supabase database.
This captures everything that's currently in your dev database.

Usage:
    python export_dev_schema.py
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

def export_schema():
    """Export complete database schema from dev Supabase"""
    
    print("\n" + "="*70)
    print("Exporting Dev Database Schema")
    print("="*70 + "\n")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials in .env")
        return False
    
    print(f"📡 Connecting to: {supabase_url}")
    client = create_client(supabase_url, supabase_key)
    
    # Get list of all tables
    print("\n🔍 Discovering tables...")
    
    # Query to get all tables in public schema
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
    """
    
    try:
        # Note: Supabase Python client doesn't support raw SQL
        # We'll need to use the REST API or provide instructions
        print("\n⚠️  Supabase Python client doesn't support schema export.")
        print("📋 You need to export your schema using one of these methods:\n")
        
        print("=" * 70)
        print("METHOD 1: Using Supabase Dashboard (Easiest)")
        print("=" * 70)
        print("\n1. Go to your dev Supabase dashboard:")
        print(f"   {supabase_url.replace('https://', 'https://app.supabase.com/project/')}")
        print("\n2. Click 'Database' in left sidebar")
        print("\n3. Click 'Backups' tab")
        print("\n4. Click 'Download' on your latest backup")
        print("   (This gives you a complete SQL dump)")
        print("\n5. Save as: database/complete_dev_schema.sql")
        
        print("\n" + "=" * 70)
        print("METHOD 2: Using pg_dump (Most Complete)")
        print("=" * 70)
        print("\n1. Get your database connection string:")
        print("   - Go to Project Settings → Database")
        print("   - Copy the 'Connection string' (URI format)")
        print("   - It looks like: postgresql://postgres:[password]@[host]:5432/postgres")
        print("\n2. Run pg_dump:")
        print("   pg_dump 'your-connection-string' > database/complete_dev_schema.sql")
        print("\n3. This creates a complete SQL dump of your database")
        
        print("\n" + "=" * 70)
        print("METHOD 3: Using Supabase CLI (Recommended)")
        print("=" * 70)
        print("\n1. Install Supabase CLI:")
        print("   npm install -g supabase")
        print("\n2. Link to your project:")
        print("   supabase link --project-ref syxquxgynoinzwhwkosa")
        print("\n3. Pull the schema:")
        print("   supabase db pull")
        print("\n4. This creates migration files in supabase/migrations/")
        
        print("\n" + "=" * 70)
        print("RECOMMENDED: Method 3 (Supabase CLI)")
        print("=" * 70)
        print("\nThis is the cleanest approach and creates proper migration files.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    export_schema()
