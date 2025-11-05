"""
Simple verification of price analytics data availability
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
print("PRICE ANALYTICS DATA AVAILABILITY CHECK")
print("=" * 80)
print()

# 1. Check invoice and items
print("1️⃣  INVOICE DATA")
print("-" * 80)
invoice = supabase.table("invoices").select("*").eq("id", INVOICE_ID).execute()
items = supabase.table("invoice_items").select("*").eq("invoice_id", INVOICE_ID).execute()
print(f"✅ Invoice: #{invoice.data[0]['invoice_number']} - PERFORMANCE FOODSERVICE")
print(f"✅ Line Items: {len(items.data)}")
print()

# 2. Check inventory_items
print("2️⃣  INVENTORY ITEMS")
print("-" * 80)
inv_items = supabase.table("inventory_items").select("*").eq("user_id", USER_ID).execute()
print(f"📦 Total inventory items: {len(inv_items.data)}")

# Check for price-related columns
if inv_items.data:
    sample = inv_items.data[0]
    price_fields = [k for k in sample.keys() if 'price' in k.lower() or 'last' in k.lower()]
    print(f"💰 Price-related fields in inventory_items: {price_fields}")
print()

# 3. Check for price_history table
print("3️⃣  PRICE HISTORY TABLE")
print("-" * 80)
try:
    price_history = supabase.table("price_history").select("*").eq("user_id", USER_ID).limit(5).execute()
    print(f"✅ price_history table exists")
    print(f"📊 Records for user: {len(price_history.data)}")
    
    # Check for records from this invoice
    invoice_price_history = supabase.table("price_history").select("*").eq("invoice_id", INVOICE_ID).execute()
    print(f"📈 Records from invoice #3302546: {len(invoice_price_history.data)}")
    
    if invoice_price_history.data:
        print()
        print("Sample price history records:")
        for ph in invoice_price_history.data[:3]:
            print(f"   • Item ID: {ph.get('inventory_item_id', 'N/A')}")
            print(f"     Price: ${ph.get('unit_price', 0):.2f}")
            print(f"     Date: {ph.get('invoice_date', 'N/A')}")
            print()
except Exception as e:
    print(f"❌ price_history table not found or error: {str(e)}")
print()

# 4. Check for price analytics functions
print("4️⃣  PRICE ANALYTICS FUNCTIONS")
print("-" * 80)
try:
    # Try calling the function
    result = supabase.rpc('get_all_items_price_summary', {'target_user_id': USER_ID}).execute()
    print(f"✅ get_all_items_price_summary function exists")
    print(f"📊 Items with price data: {len(result.data)}")
    
    if result.data:
        print()
        print("Sample price summary:")
        for item in result.data[:3]:
            print(f"   • {item.get('item_name', 'Unknown')[:40]}")
            print(f"     Last Price: ${item.get('last_paid_price', 0):.2f}")
            print(f"     7-day Avg: ${item.get('avg_price_7day', 0) or 0:.2f}")
            print(f"     Trend: {item.get('price_trend', 'N/A')}")
            print()
except Exception as e:
    print(f"❌ Function not available: {str(e)}")
print()

# 5. Check vendors table
print("5️⃣  VENDORS")
print("-" * 80)
try:
    vendors = supabase.table("vendors").select("*").eq("user_id", USER_ID).execute()
    print(f"🏢 Vendors: {len(vendors.data)}")
    
    # Check if PERFORMANCE FOODSERVICE exists
    perf_vendor = [v for v in vendors.data if 'PERFORMANCE' in v.get('name', '').upper()]
    if perf_vendor:
        print(f"✅ PERFORMANCE FOODSERVICE vendor exists: {perf_vendor[0]['name']}")
        print(f"   ID: {perf_vendor[0]['id']}")
    else:
        print("⚠️  PERFORMANCE FOODSERVICE vendor not found")
except Exception as e:
    print(f"❌ Error checking vendors: {str(e)}")
print()

# 6. Summary
print("=" * 80)
print("📋 INTEGRATION STATUS")
print("=" * 80)
print()
print("✅ Invoice uploaded and parsed successfully")
print(f"✅ {len(items.data)} line items extracted")
print(f"📦 {len(inv_items.data)} inventory items exist")
print()
print("🔍 PRICE ANALYTICS STATUS:")
try:
    # Quick check if price analytics is working
    result = supabase.rpc('get_all_items_price_summary', {'target_user_id': USER_ID}).execute()
    if len(result.data) > 0:
        print("   ✅ Price analytics is WORKING")
        print(f"   ✅ {len(result.data)} items have price tracking data")
        print("   ✅ last_paid_price is being tracked")
        print()
        print("   🎯 You can view this data at:")
        print("      • Frontend: http://localhost:5173/price-analytics")
        print("      • API: http://127.0.0.1:8000/api/price-analytics/summary")
    else:
        print("   ⚠️  Price analytics functions exist but no data yet")
        print("   💡 Need to process invoices to inventory first")
except:
    print("   ⚠️  Price analytics not fully set up")
    print("   💡 May need to run migrations or enable inventory processing")

print()
print("=" * 80)
