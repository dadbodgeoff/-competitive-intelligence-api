"""Get dev user ID from Supabase"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Get user by email
result = supabase.table("users").select("id, first_name, last_name").eq(
    "id", 
    supabase.auth.admin.list_users().users[0].id if supabase.auth.admin.list_users().users else None
).execute()

# Try auth.users directly
auth_result = supabase.auth.admin.list_users()

for user in auth_result.users:
    if user.email == "nrivikings8@gmail.com":
        print(f"Found user: {user.id}")
        print(f"Email: {user.email}")
        break
