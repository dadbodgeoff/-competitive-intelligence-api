#!/usr/bin/env python3
"""
Seed Weekly Price Tracking Data
Creates 8 invoices (2 vendors x 4 weeks) with consistent items showing price changes
Date range: Oct 10 - Nov 4, 2024
"""
import os
import sys
from datetime import datetime
from decimal import Decimal
from supabase import create_client, Client

# Try to load .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  python-dotenv not installed, using environment variables directly")

# Supabase credentials - load from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# User ID for dadbodgeoff@gmail.com
# Get this by logging in and checking the auth token or database
USER_ID = "455a0c46-b694-44e8-ab1c-ee36342037cf"  # Your user ID
print(f"✅ Using user ID: {USER_ID}\n")

# Two vendors with different pricing
VENDORS = [
    {"name": "Sysco", "code": "SYS"},
    {"name": "US Foods", "code": "USF"},
]

# Consistent items that appear on every invoice
# Prices will change week by week to show trends
ITEMS = [
    # Item with INCREASING prices (produce shortage)
    {
        "name": "Tomatoes, Roma",
        "unit": "LB",
        "sysco_prices": [1.85, 1.95, 2.15, 2.35],  # +27% over 4 weeks
        "usfoods_prices": [1.80, 1.90, 2.10, 2.30],
    },
    # Item with DECREASING prices (seasonal abundance)
    {
        "name": "Chicken Breast, Boneless Skinless",
        "unit": "LB",
        "sysco_prices": [3.75, 3.60, 3.45, 3.25],  # -13% over 4 weeks
        "usfoods_prices": [3.70, 3.55, 3.40, 3.20],
    },
    # Item with SPIKE (recent supply issue)
    {
        "name": "Ground Beef 80/20",
        "unit": "LB",
        "sysco_prices": [4.25, 4.30, 5.50, 5.75],  # Spike in week 3-4
        "usfoods_prices": [4.20, 4.25, 5.45, 5.70],
    },
    # Item with DROP (overstock sale)
    {
        "name": "Salmon Fillet, Fresh",
        "unit": "LB",
        "sysco_prices": [12.50, 12.25, 9.50, 9.25],  # Drop in week 3-4
        "usfoods_prices": [12.25, 12.00, 9.25, 9.00],
    },
    # Stable items (normal pricing)
    {
        "name": "Flour, All Purpose",
        "unit": "LB",
        "sysco_prices": [0.45, 0.46, 0.45, 0.47],
        "usfoods_prices": [0.43, 0.44, 0.43, 0.45],
    },
    {
        "name": "Olive Oil, Extra Virgin",
        "unit": "GAL",
        "sysco_prices": [32.00, 32.50, 31.75, 32.25],
        "usfoods_prices": [31.50, 32.00, 31.25, 31.75],
    },
    {
        "name": "Cheese, Mozzarella Shredded",
        "unit": "LB",
        "sysco_prices": [3.25, 3.30, 3.28, 3.32],
        "usfoods_prices": [3.20, 3.25, 3.23, 3.27],
    },
    {
        "name": "Onions, Yellow",
        "unit": "LB",
        "sysco_prices": [0.65, 0.67, 0.66, 0.68],
        "usfoods_prices": [0.63, 0.65, 0.64, 0.66],
    },
    # Item showing vendor price difference (savings opportunity)
    {
        "name": "Butter, Unsalted",
        "unit": "LB",
        "sysco_prices": [4.75, 4.80, 4.85, 4.90],  # Sysco more expensive
        "usfoods_prices": [4.25, 4.30, 4.35, 4.40],  # US Foods cheaper
    },
    {
        "name": "Rice, Long Grain",
        "unit": "LB",
        "sysco_prices": [0.75, 0.76, 0.77, 0.78],
        "usfoods_prices": [0.72, 0.73, 0.74, 0.75],
    },
]

# Invoice dates: One per week for 4 weeks, 2 vendors each
INVOICE_DATES = [
    datetime(2024, 10, 10),  # Week 1: Oct 10
    datetime(2024, 10, 17),  # Week 2: Oct 17
    datetime(2024, 10, 24),  # Week 3: Oct 24
    datetime(2024, 10, 31),  # Week 4: Oct 31 (or Nov 4)
]

def create_invoice(vendor, week_index, invoice_date):
    """Create invoice with items"""
    vendor_name = vendor["name"]
    vendor_code = vendor["code"]
    invoice_number = f"{vendor_code}-{invoice_date.strftime('%Y%m%d')}"
    
    print(f"  📄 Creating invoice {invoice_number} from {vendor_name} on {invoice_date.date()}")
    
    # Calculate total first
    total_amount = Decimal("0.00")
    for item in ITEMS:
        if vendor_code == "SYS":
            unit_price = item["sysco_prices"][week_index]
        else:
            unit_price = item["usfoods_prices"][week_index]
        quantity = 20
        total_amount += Decimal(str(unit_price)) * Decimal(str(quantity))
    
    # First create the invoice header
    invoice_data = {
        "user_id": USER_ID,
        "vendor_name": vendor_name,
        "invoice_number": invoice_number,
        "invoice_date": invoice_date.isoformat(),
        "subtotal": float(total_amount),
        "tax": 0.00,
        "total": float(total_amount),
        "status": "completed",
        "parse_method": "manual_seed",
        "raw_file_url": f"test://seed/{invoice_number}",
        "file_hash": f"test_{invoice_number}",
    }
    
    invoice_result = supabase.table("invoices").insert(invoice_data).execute()
    invoice_id = invoice_result.data[0]["id"]
    
    # Now add all items with prices for this week
    line_items = []
    
    for item in ITEMS:
        # Get price for this vendor and week
        if vendor_code == "SYS":
            unit_price = item["sysco_prices"][week_index]
        else:
            unit_price = item["usfoods_prices"][week_index]
        
        # Consistent quantities
        quantity = 20
        extended_price = Decimal(str(unit_price)) * Decimal(str(quantity))
        
        line_items.append({
            "invoice_id": invoice_id,
            "item_number": f"{vendor_code}-{item['name'][:10].upper().replace(' ', '')}",
            "description": item["name"],
            "quantity": quantity,
            "unit_price": float(unit_price),
            "extended_price": float(extended_price),
        })
    
    # Insert into invoice_items (source of truth for price analytics)
    if line_items:
        supabase.table("invoice_items").insert(line_items).execute()
    
    print(f"    ✅ {len(line_items)} items, total: ${total_amount:.2f}")
    return invoice_id

def seed_data():
    """Seed weekly price tracking data"""
    print("\n" + "="*70)
    print("🌱 SEEDING WEEKLY PRICE TRACKING DATA")
    print("="*70 + "\n")
    
    print(f"📅 Date Range: Oct 10 - Oct 31, 2024 (4 weeks)")
    print(f"🏪 Vendors: {len(VENDORS)}")
    print(f"📦 Items per invoice: {len(ITEMS)}")
    print(f"📄 Total invoices: {len(VENDORS) * len(INVOICE_DATES)}")
    print()
    
    invoice_count = 0
    
    for week_index, invoice_date in enumerate(INVOICE_DATES):
        print(f"📅 Week {week_index + 1}: {invoice_date.date()}")
        for vendor in VENDORS:
            create_invoice(vendor, week_index, invoice_date)
            invoice_count += 1
        print()
    
    print("="*70)
    print(f"✅ SEEDING COMPLETE")
    print("="*70)
    print(f"\n📊 Summary:")
    print(f"  • Total invoices: {invoice_count}")
    print(f"  • Total line items: {invoice_count * len(ITEMS)}")
    print(f"  • Weeks covered: 4")
    print(f"  • Vendors: 2")
    print()
    print("🎯 Expected Analytics:")
    print(f"  ✓ Tomatoes: INCREASING +27% (${ITEMS[0]['sysco_prices'][0]:.2f} → ${ITEMS[0]['sysco_prices'][3]:.2f})")
    print(f"  ✓ Chicken: DECREASING -13% (${ITEMS[1]['sysco_prices'][0]:.2f} → ${ITEMS[1]['sysco_prices'][3]:.2f})")
    print(f"  ✓ Beef: SPIKE +35% in week 3 (${ITEMS[2]['sysco_prices'][1]:.2f} → ${ITEMS[2]['sysco_prices'][2]:.2f})")
    print(f"  ✓ Salmon: DROP -24% in week 3 (${ITEMS[3]['sysco_prices'][1]:.2f} → ${ITEMS[3]['sysco_prices'][2]:.2f})")
    print(f"  ✓ Butter: Savings opportunity (Sysco ${ITEMS[8]['sysco_prices'][3]:.2f} vs US Foods ${ITEMS[8]['usfoods_prices'][3]:.2f})")
    print()
    print("🌐 View at: http://localhost:5173/analytics")
    print()

if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
