#!/usr/bin/env python3
"""
Quick database setup script
"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def setup_database():
    print("🗄️ Setting up Supabase database...")
    
    # Create Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        print(f"✅ Connected to Supabase: {supabase_url}")
        
        # Test connection by checking if users table exists
        try:
            result = supabase.table("users").select("*").limit(1).execute()
            print("✅ Users table exists and accessible")
            return True
        except Exception as e:
            print(f"⚠️ Users table not found or not accessible: {e}")
            print("📝 You need to run the schema.sql in your Supabase dashboard")
            return False
            
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        return False

if __name__ == "__main__":
    setup_database()