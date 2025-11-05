"""
Audit Analytics Data for User
Checks what data exists and what's needed for price analytics to work
"""
import os
from supabase import create_client
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase connection
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://kapbytccfblkfqrdviec.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_ROLE_KEY not found in environment")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# User email to check
USER_EMAIL = "dadbodgeoff@gmail.com"

print("=" * 80)
print("ANALYTICS DATA AUDIT")
print("=" * 80)
print(f"User: {USER_EMAIL}")
print()

# Get user ID
try:
    user_response = supabase.table("users").select("id, email, subscription_tier").eq("email", USER_EMAIL).execute()
    if not user_response.data:
        print(f"❌ User not found: {USER_EMAIL}")
        exit(1)
    
    user = user_response.data[0]
    user_id = user['id']
    print(f"✅ User found: {user_id}")
    print(f"   Subscription: {user.get('subscription_tier', 'free')}")
    print()
except Exception as e:
    print(f"❌ Error finding user: {e}")
    exit(1)

# Check invoices
print("📄 INVOICES")
print("-" * 80)
try:
    invoices = supabase.table("invoices").select("*").eq("user_id", user_id).execute()
    print(f"Total invoices: {len(invoices.data)}")
    
    if invoices.data:
        # Show date range
        dates = [inv['invoice_date'] for inv in invoices.data if inv.get('invoice_date')]
        if dates:
            print(f"Date range: {min(dates)} to {max(dates)}")
        
        # Show vendors
        vendors = set(inv['vendor_name'] for inv in invoices.data if inv.get('vendor_name'))
        print(f"Vendors: {', '.join(vendors)}")
    print()
except Exception as e:
    print(f"❌ Error: {e}")
    print()

# Check invoice items
print("📦 INVOICE ITEMS")
print("-" * 80)
try:
    # Get invoice items with invoice info
    items_query = supabase.table("invoice_items").select(
        "*, invoices!inner(user_id, vendor_name, invoice_date)"
    ).eq("invoices.user_id", user_id).execute()
    
    items = items_query.data
    print(f"Total invoice items: {len(items)}")
    
    if items:
        # Check for required fields
        items_with_price = [i for i in items if i.get('unit_price')]
        items_with_desc = [i for i in items if i.get('item_description')]
        
        print(f"Items with unit_price: {len(items_with_price)}")
        print(f"Items with description: {len(items_with_desc)}")
        
        # Show sample items
        print("\nSample items:")
        for item in items[:5]:
            print(f"  - {item.get('item_description', 'NO DESC')}: ${item.get('unit_price', 0)}")
    print()
except Exception as e:
    print(f"❌ Error: {e}")
    print()

# Check inventory items (needed for price tracking)
print("🏪 INVENTORY ITEMS")
print("-" * 80)
try:
    inventory = supabase.table("inventory_items").select("*").eq("user_id", user_id).execute()
    print(f"Total inventory items: {len(inventory.data)}")
    
    if inventory.data:
        # Check for price tracking fields
        items_with_current_price = [i for i in inventory.data if i.get('current_price')]
        items_with_avg_price = [i for i in inventory.data if i.get('avg_price')]
        
        print(f"Items with current_price: {len(items_with_current_price)}")
        print(f"Items with avg_price: {len(items_with_avg_price)}")
        
        # Show sample
        print("\nSample inventory items:")
        for item in inventory.data[:5]:
            print(f"  - {item.get('item_description', 'NO DESC')}: ${item.get('current_price', 0)}")
    print()
except Exception as e:
    print(f"❌ Error: {e}")
    print()

# Check item_price_tracking (critical for analytics)
print("📊 ITEM PRICE TRACKING")
print("-" * 80)
try:
    price_tracking = supabase.table("item_price_tracking").select(
        "*, inventory_items!inner(user_id)"
    ).eq("inventory_items.user_id", user_id).execute()
    
    print(f"Total price tracking records: {len(price_tracking.data)}")
    
    if price_tracking.data:
        # Check date range
        dates = [pt['recorded_at'] for pt in price_tracking.data if pt.get('recorded_at')]
        if dates:
            print(f"Date range: {min(dates)} to {max(dates)}")
        
        # Check for price changes
        records_with_change = [pt for pt in price_tracking.data if pt.get('price_change_percent')]
        print(f"Records with price changes: {len(records_with_change)}")
        
        # Show sample
        print("\nSample price tracking:")
        for pt in price_tracking.data[:5]:
            change = pt.get('price_change_percent', 0)
            print(f"  - Item {pt.get('inventory_item_id')}: ${pt.get('price', 0)} ({change:+.1f}%)")
    else:
        print("⚠️  NO PRICE TRACKING DATA - This is why analytics shows 0!")
        print("   Price tracking is required for:")
        print("   - Price anomalies (negative alerts)")
        print("   - Savings opportunities (positive alerts)")
        print("   - Price trends")
    print()
except Exception as e:
    print(f"❌ Error: {e}")
    print()

# Check extended_price_tracking (for vendor comparisons)
print("💰 EXTENDED PRICE TRACKING")
print("-" * 80)
try:
    extended = supabase.table("extended_price_tracking").select(
        "*, inventory_items!inner(user_id)"
    ).eq("inventory_items.user_id", user_id).execute()
    
    print(f"Total extended tracking records: {len(extended.data)}")
    
    if extended.data:
        # Check vendors
        vendors = set(ext['vendor_name'] for ext in extended.data if ext.get('vendor_name'))
        print(f"Vendors tracked: {', '.join(vendors)}")
        
        # Show sample
        print("\nSample extended tracking:")
        for ext in extended.data[:5]:
            print(f"  - {ext.get('vendor_name')}: ${ext.get('price', 0)}")
    else:
        print("⚠️  NO EXTENDED TRACKING - Vendor comparisons won't work!")
    print()
except Exception as e:
    print(f"❌ Error: {e}")
    print()

# DIAGNOSIS
print("=" * 80)
print("DIAGNOSIS")
print("=" * 80)

if len(invoices.data) == 0:
    print("❌ NO INVOICES - Upload invoices first!")
elif len(items) == 0:
    print("❌ NO INVOICE ITEMS - Invoices may not have been parsed correctly!")
elif len(inventory.data) == 0:
    print("❌ NO INVENTORY ITEMS - Items need to be mapped to inventory!")
elif len(price_tracking.data) == 0:
    print("❌ NO PRICE TRACKING - This is the problem!")
    print("\n   SOLUTION:")
    print("   1. Run: python seed_weekly_price_tracking.py")
    print("   2. Or upload multiple invoices over time")
    print("   3. Price tracking is created when:")
    print("      - Same item appears in multiple invoices")
    print("      - Prices change between invoices")
else:
    print("✅ All data structures exist!")
    print(f"\n   You have:")
    print(f"   - {len(invoices.data)} invoices")
    print(f"   - {len(items)} invoice items")
    print(f"   - {len(inventory.data)} inventory items")
    print(f"   - {len(price_tracking.data)} price tracking records")
    print(f"   - {len(extended.data)} extended tracking records")
    
    # Check if there should be alerts
    thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
    recent_changes = [pt for pt in price_tracking.data 
                     if pt.get('recorded_at', '') >= thirty_days_ago 
                     and abs(pt.get('price_change_percent', 0)) >= 10]
    
    print(f"\n   Recent price changes (>10%): {len(recent_changes)}")
    
    if len(recent_changes) == 0:
        print("   ⚠️  No significant price changes in last 30 days")
        print("      - Try lowering the threshold in dashboard")
        print("      - Or seed more varied price data")

print()
print("=" * 80)
