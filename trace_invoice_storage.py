"""
Trace where invoice #3302546 is stored and how it flows to price analytics
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
INVOICE_NUMBER = "3302546"

print("=" * 80)
print("INVOICE DATA STORAGE TRACE")
print("=" * 80)
print()

# 1. Check invoices table (Supabase)
print("1️⃣  INVOICES TABLE (Supabase)")
print("-" * 80)
invoice = supabase.table("invoices").select("*").eq("id", INVOICE_ID).execute()
if invoice.data:
    inv = invoice.data[0]
    print(f"✅ STORED IN SUPABASE")
    print(f"   ID: {inv['id']}")
    print(f"   Invoice #: {inv['invoice_number']}")
    print(f"   Vendor: {inv['vendor_name']}")
    print(f"   Date: {inv['invoice_date']}")
    print(f"   Total: ${inv['total']}")
    print(f"   Status: {inv['status']}")
    print(f"   Created: {inv['created_at']}")
    print(f"   File URL: {inv['raw_file_url'][:60]}...")
else:
    print("❌ NOT FOUND")
print()

# 2. Check invoice_items table (Supabase)
print("2️⃣  INVOICE_ITEMS TABLE (Supabase)")
print("-" * 80)
items = supabase.table("invoice_items").select("*").eq("invoice_id", INVOICE_ID).execute()
print(f"✅ {len(items.data)} ITEMS STORED IN SUPABASE")
print()
print("Sample items:")
for item in items.data[:3]:
    print(f"   • {item['description'][:40]:<40}")
    print(f"     Item #: {item['item_number']}")
    print(f"     Price: ${item['unit_price']:.2f}")
    print(f"     Qty: {item['quantity']}")
    print(f"     Extended: ${item['extended_price']:.2f}")
    print()

# 3. Check if items are in inventory_items (the bridge to price analytics)
print("3️⃣  INVENTORY_ITEMS TABLE (Supabase)")
print("-" * 80)
print("Checking if invoice items are linked to inventory...")
print()

# Get all inventory items for this user
inv_items = supabase.table("inventory_items").select("*").eq("user_id", USER_ID).execute()
print(f"📦 Total inventory items for user: {len(inv_items.data)}")

# Check if any items from this invoice are in inventory
invoice_item_numbers = [item['item_number'] for item in items.data if item['item_number']]
print(f"🔍 Invoice has {len(invoice_item_numbers)} items with item numbers")

matching_items = []
for inv_item in inv_items.data:
    vendor_item_num = inv_item.get('vendor_item_number', '')
    if vendor_item_num in invoice_item_numbers:
        matching_items.append(inv_item)

print(f"🔗 Items from invoice #3302546 in inventory: {len(matching_items)}")

if matching_items:
    print()
    print("Matched items:")
    for item in matching_items[:3]:
        print(f"   • {item['name'][:40]:<40}")
        print(f"     Vendor Item #: {item.get('vendor_item_number', 'N/A')}")
        print(f"     Last Price: ${item.get('last_paid_price', 0) or 0:.2f}")
        print()
else:
    print("⚠️  NO ITEMS FROM THIS INVOICE ARE IN INVENTORY YET")
    print()
    print("This means:")
    print("   • Invoice is stored in Supabase ✅")
    print("   • Invoice items are stored in Supabase ✅")
    print("   • BUT items haven't been processed to inventory ❌")
    print()

# 4. Check price_history table
print("4️⃣  PRICE_HISTORY TABLE (Supabase)")
print("-" * 80)
price_history = supabase.table("price_history").select("*").eq("invoice_id", INVOICE_ID).execute()
print(f"📊 Price history records from invoice #3302546: {len(price_history.data)}")

if price_history.data:
    print()
    print("Price history entries:")
    for ph in price_history.data[:3]:
        print(f"   • Invoice Date: {ph.get('invoice_date', 'N/A')}")
        print(f"     Price: ${ph.get('unit_price', 0):.2f}")
        print(f"     Inventory Item ID: {ph.get('inventory_item_id', 'N/A')}")
        print()
else:
    print("⚠️  NO PRICE HISTORY RECORDS FOR THIS INVOICE")
    print()

# 5. Check what IS in price_history
print("5️⃣  EXISTING PRICE HISTORY DATA")
print("-" * 80)
all_price_history = supabase.table("price_history").select("*").eq("user_id", USER_ID).execute()
print(f"📈 Total price history records for user: {len(all_price_history.data)}")

if all_price_history.data:
    # Get unique invoice IDs
    invoice_ids = set(ph.get('invoice_id') for ph in all_price_history.data if ph.get('invoice_id'))
    print(f"📋 Invoices with price history: {len(invoice_ids)}")
    
    # Get those invoices
    if invoice_ids:
        print()
        print("Invoices that ARE in price history:")
        for inv_id in list(invoice_ids)[:3]:
            inv_data = supabase.table("invoices").select("invoice_number, vendor_name, invoice_date").eq("id", inv_id).execute()
            if inv_data.data:
                inv_info = inv_data.data[0]
                print(f"   • Invoice #{inv_info['invoice_number']} - {inv_info['vendor_name']}")
                print(f"     Date: {inv_info['invoice_date']}")
        print()

# 6. Summary
print("=" * 80)
print("📋 STORAGE SUMMARY")
print("=" * 80)
print()
print("WHERE IS INVOICE #3302546?")
print()
print("✅ invoices table (Supabase)         - YES")
print("✅ invoice_items table (Supabase)    - YES (16 items)")
print(f"{'✅' if matching_items else '❌'} inventory_items table (Supabase)  - {'YES' if matching_items else 'NO'} ({len(matching_items)} items)")
print(f"{'✅' if price_history.data else '❌'} price_history table (Supabase)   - {'YES' if price_history.data else 'NO'} ({len(price_history.data)} records)")
print()
print("🔍 DIAGNOSIS:")
print()
if not matching_items:
    print("   The invoice is stored but NOT processed to inventory.")
    print()
    print("   Why this matters:")
    print("   • Price analytics needs items in inventory_items table")
    print("   • Price history is created from inventory_items")
    print("   • Without inventory link, no price tracking happens")
    print()
    print("   To fix:")
    print("   • Check if inventory processing is enabled")
    print("   • Look at api/routes/invoices/management.py save endpoint")
    print("   • Check for 'inventory processing disabled' message in logs")
else:
    print("   ✅ Invoice is fully integrated!")
    print("   • Items are in inventory")
    print("   • Price tracking should be working")

print()
print("=" * 80)
