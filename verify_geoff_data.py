"""
Quick verification of dadbodgeoff1@gmail.com data
"""
import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get user from auth.users first
auth_result = supabase.auth.admin.list_users()
user_email = 'dadbodgeoff1@gmail.com'
auth_user = None

for u in auth_result:
    if u.email == user_email:
        auth_user = u
        break

if not auth_user:
    print(f"User {user_email} not found in auth")
    exit(1)

user_id = auth_user.id

# Get profile
profile_result = supabase.table('users').select('first_name, last_name').eq('id', user_id).execute()
first_name = profile_result.data[0]['first_name'] if profile_result.data else 'User'

print(f"User: {first_name} ({user_email})")
print(f"User ID: {user_id}\n")

# Get invoice items (last 90 days)
cutoff = (datetime.now() - timedelta(days=90)).date().isoformat()

items_result = supabase.table('invoice_items')\
    .select('*, invoices!inner(vendor_name, invoice_date, user_id)')\
    .eq('invoices.user_id', user_id)\
    .gte('invoices.invoice_date', cutoff)\
    .execute()

if not items_result.data:
    print("No invoice items found")
    exit(0)

# Calculate stats (same logic as backend)
unique_items = len(set(item['description'].lower().strip() for item in items_result.data))
unique_vendors = len(set(item['invoices']['vendor_name'] for item in items_result.data))
total_purchases = len(items_result.data)
total_spend = sum(float(item['extended_price']) for item in items_result.data)

print("=" * 60)
print("REAL DATA FROM YOUR DATABASE (Last 90 Days)")
print("=" * 60)
print(f"✅ Items Tracked: {unique_items}")
print(f"✅ Active Vendors: {unique_vendors}")
print(f"✅ Total Purchases: {total_purchases}")
print(f"✅ Total Spend: ${total_spend:,.2f}")
print()

vendors = set(item['invoices']['vendor_name'] for item in items_result.data)
print(f"Vendors: {', '.join(vendors)}")
print()

print("Sample items:")
for item in items_result.data[:10]:
    print(f"  • {item['description']}: ${float(item['unit_price']):.2f} from {item['invoices']['vendor_name']}")

print("\n" + "=" * 60)
print("This is 100% REAL data - no mocks, no hardcoding!")
print("=" * 60)
