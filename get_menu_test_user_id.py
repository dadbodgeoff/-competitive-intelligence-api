#!/usr/bin/env python3
"""
Get User ID for Menu Testing
Queries Supabase for user by email
"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def get_user_id_by_email(email: str):
    """Get user ID from email"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    client = create_client(supabase_url, supabase_key)
    
    # Query users table
    result = client.table("users").select("id, first_name, last_name").eq(
        "id", client.auth.admin.list_users().users[0].id
    ).execute()
    
    # Alternative: Query auth.users directly
    users = client.auth.admin.list_users()
    
    for user in users.users:
        if user.email == email:
            print(f"✅ Found user: {user.email}")
            print(f"   User ID: {user.id}")
            return user.id
    
    print(f"❌ User not found: {email}")
    return None

if __name__ == "__main__":
    email = "nrivikings8@gmail.com"
    user_id = get_user_id_by_email(email)
    
    if user_id:
        print(f"\n📋 Add this to your test script:")
        print(f'TEST_USER_ID = "{user_id}"')
