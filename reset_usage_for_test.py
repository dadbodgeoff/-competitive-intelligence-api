"""Reset usage limits for test user"""
from database.supabase_client import get_supabase_service_client

user_id = "455a0c46-b694-44e8-ab1c-ee36342037cf"

client = get_supabase_service_client()

# Delete menu comparison usage
result = client.table("usage_tracking").delete().eq(
    "user_id", user_id
).eq(
    "operation_type", "menu_comparison"
).execute()

print(f"✅ Deleted {len(result.data)} usage records for menu_comparison")

# Verify
remaining = client.table("usage_tracking").select("*").eq(
    "user_id", user_id
).eq(
    "operation_type", "menu_comparison"
).execute()

print(f"📊 Remaining records: {len(remaining.data)}")
