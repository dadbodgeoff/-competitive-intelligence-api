"""
Quick script to get your test user ID from Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def get_user_id():
    """Get the first user ID from Supabase auth.users"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in .env")
        return None
    
    client = create_client(supabase_url, supabase_key)
    
    # Get users from auth.users
    try:
        # Note: This requires service role key
        result = client.auth.admin.list_users()
        
        if result and len(result) > 0:
            users = result
            print(f"\n✅ Found {len(users)} user(s) in your Supabase project:\n")
            
            for idx, user in enumerate(users, 1):
                email = user.email if hasattr(user, 'email') else 'No email'
                user_id = user.id if hasattr(user, 'id') else 'No ID'
                print(f"{idx}. Email: {email}")
                print(f"   ID: {user_id}\n")
            
            # Return first user ID
            first_user_id = users[0].id if hasattr(users[0], 'id') else None
            
            if first_user_id:
                print(f"📋 To use the first user for testing, add this to your .env:")
                print(f"TEST_USER_ID={first_user_id}")
                
                # Offer to add it automatically
                response = input("\n❓ Add TEST_USER_ID to .env automatically? (y/n): ")
                if response.lower() == 'y':
                    with open('.env', 'a') as f:
                        f.write(f"\n# Test User Configuration\nTEST_USER_ID={first_user_id}\n")
                    print("✅ Added TEST_USER_ID to .env")
                
                return first_user_id
        else:
            print("❌ No users found in Supabase")
            print("\n💡 You need to create a user first:")
            print("   1. Go to Supabase Dashboard → Authentication → Users")
            print("   2. Click 'Add User'")
            print("   3. Create a test user")
            print("   4. Run this script again")
            return None
            
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        print("\n💡 Alternative method:")
        print("   1. Go to Supabase Dashboard → SQL Editor")
        print("   2. Run: SELECT id, email FROM auth.users;")
        print("   3. Copy the ID and add to .env as TEST_USER_ID=<id>")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("GET TEST USER ID FROM SUPABASE")
    print("=" * 60)
    get_user_id()
