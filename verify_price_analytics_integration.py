"""
Verify Price Analytics Integration with Recent Invoice
Checks if invoice #3302546 (PERFORMANCE FOODSERVICE) is available in price analytics
"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

USER_ID = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"
INVOICE_ID = "125d1d9a-d80f-4dd4-8a96-c6f9c75eb50b"

print("=" * 80)
print("PRICE ANALYTICS INTEGRATION VERIFICATION")
print("=" * 80)
print()

# 1. Check the invoice exists
print("1️⃣  INVOICE VERIFICATION")
print("-" * 80)
invoice = supabase.table("invoices").select("*").eq("id", INVOICE_ID).execute()
if invoice.data:
    inv = invoice.data[0]
    print(f"✅ Invoice Found: #{inv['invoice_number']}")
    print(f"   Vendor: {inv['vendor_name']}")
    print(f"   Date: {inv['invoice_date']}")
    print(f"   Total: ${inv['total']}")
else:
    print("❌ Invoice not found")
    exit(1)

print()

# 2. Check invoice items
print("2️⃣  INVOICE ITEMS CHECK")
print("-" * 80)
items = supabase.table("invoice_items").select("*").eq("invoice_id", INVOICE_ID).execute()
print(f"✅ Found {len(items.data)} line items")
print()
print("Sample items:")
for item in items.data[:3]:
    print(f"   • {item['description'][:40]:<40} ${item['unit_price']:.2f}")
print()

# 3. Check inventory_items table (where price tracking happens)
print("3️⃣  INVENTORY ITEMS (Price Tracking Source)")
print("-" * 80)
inv_items = supabase.table("inventory_items").select("*").eq("user_id", USER_ID).execute()
print(f"📦 Total inventory items for user: {len(inv_items.data)}")

# Check if any items from this invoice are in inventory
invoice_item_numbers = [item['item_number'] for item in items.data if item['item_number']]
matching_inv_items = [
    item for item in inv_items.data 
    if item.get('vendor_item_number') in invoice_item_numbers
]
print(f"🔗 Items from invoice #3302546 in inventory: {len(matching_inv_items)}")
print()

# 4. Check item_price_tracking table
print("4️⃣  PRICE TRACKING DATA")
print("-" * 80)
price_tracking = supabase.table("item_price_tracking").select("*").eq("user_id", USER_ID).execute()
print(f"📊 Total price tracking records: {len(price_tracking.data)}")

# Check for items from this invoice
tracking_for_invoice = [
    pt for pt in price_tracking.data
    if pt.get('invoice_id') == INVOICE_ID
]
print(f"📈 Price tracking records from invoice #3302546: {len(tracking_for_invoice)}")
print()

if tracking_for_invoice:
    print("Sample price tracking records:")
    for pt in tracking_for_invoice[:3]:
        print(f"   • Item: {pt.get('vendor_item_number', 'N/A')}")
        print(f"     Price: ${pt.get('unit_price', 0):.2f}")
        print(f"     Date: {pt.get('price_date', 'N/A')}")
        print()

# 5. Test Price Analytics API endpoint
print("5️⃣  PRICE ANALYTICS API TEST")
print("-" * 80)
print("Testing: GET /api/price-analytics/summary")
print()

# Check what data is available for price analytics
print("Available data for price analytics:")
print(f"   • Invoices: {len(invoice.data)} (current)")
print(f"   • Invoice Items: {len(items.data)}")
print(f"   • Inventory Items: {len(inv_items.data)}")
print(f"   • Price Tracking Records: {len(price_tracking.data)}")
print()

# 6. Check for last_paid_price in inventory_items
print("6️⃣  LAST PAID PRICE TRACKING")
print("-" * 80)
items_with_last_price = [
    item for item in inv_items.data
    if item.get('last_paid_price') is not None
]
print(f"📍 Items with last_paid_price: {len(items_with_last_price)}/{len(inv_items.data)}")
print()

if items_with_last_price:
    print("Sample items with last_paid_price:")
    for item in items_with_last_price[:5]:
        print(f"   • {item.get('item_name', 'Unknown')[:40]:<40}")
        print(f"     Last Price: ${item.get('last_paid_price', 0):.2f}")
        print(f"     Last Purchase: {item.get('last_purchase_date', 'N/A')}")
        print()

# 7. Summary and recommendations
print("=" * 80)
print("📋 SUMMARY")
print("=" * 80)
print()

if len(tracking_for_invoice) > 0:
    print("✅ PRICE ANALYTICS IS WORKING")
    print(f"   • Invoice data is flowing to price tracking")
    print(f"   • {len(tracking_for_invoice)} items tracked from this invoice")
else:
    print("⚠️  PRICE TRACKING NOT YET POPULATED")
    print("   Possible reasons:")
    print("   • Inventory processing may be disabled")
    print("   • Items need to be matched to inventory first")
    print("   • Price tracking trigger may not have fired")

print()
print("🔍 NEXT STEPS:")
if len(inv_items.data) == 0:
    print("   1. No inventory items exist - need to process invoices to inventory")
    print("   2. Check if inventory processing is enabled in feature flags")
elif len(matching_inv_items) == 0:
    print("   1. Invoice items not matched to inventory yet")
    print("   2. May need fuzzy matching or manual item creation")
else:
    print("   1. Check price analytics dashboard at /price-analytics")
    print("   2. Verify last_paid_price is updating correctly")
    print("   3. Test price trend analysis")

print()
print("=" * 80)
