"""
Seed a realistic Sysco invoice for cross-vendor price comparison testing
"""
from dotenv import load_dotenv
import os
from datetime import datetime
import uuid
import json
load_dotenv()
from supabase import create_client

USER_ID = '7a8e9f71-ca9f-46af-8694-41b5e52464ab'
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

# Sysco items with overlapping products for price comparison
sysco_items = [
    # Overlapping items with different prices
    {"description": "FETA CHEESE GREEK CRUMBLE", "quantity": 2, "unit_price": 28.95, "unit": "CS", "item_number": "SYS-1001"},
    {"description": "BEEF PATTY 4/1 SPECIAL BLEND", "quantity": 3, "unit_price": 76.50, "unit": "CS", "item_number": "SYS-1002"},
    {"description": "BACON 13/17 SL APPLEWOOD", "quantity": 2, "unit_price": 83.75, "unit": "CS", "item_number": "SYS-1003"},
    {"description": "FRIES SWEET POTATO CRISSCUT", "quantity": 4, "unit_price": 49.25, "unit": "CS", "item_number": "SYS-1004"},
    {"description": "FRIES 3/8 STRAIGHT CUT", "quantity": 3, "unit_price": 42.95, "unit": "CS", "item_number": "SYS-1005"},
    {"description": "LETTUCE LEAF W&T RND RTU", "quantity": 2, "unit_price": 30.15, "unit": "CS", "item_number": "SYS-1006"},
    
    # New Sysco-only items
    {"description": "CHICKEN BREAST BONELESS SKINLESS", "quantity": 4, "unit_price": 89.50, "unit": "CS", "item_number": "SYS-2001"},
    {"description": "GROUND BEEF 80/20", "quantity": 5, "unit_price": 67.25, "unit": "CS", "item_number": "SYS-2002"},
    {"description": "PIZZA DOUGH BALL 16OZ", "quantity": 6, "unit_price": 42.80, "unit": "CS", "item_number": "SYS-2003"},
    {"description": "MOZZARELLA CHEESE SHREDDED", "quantity": 3, "unit_price": 52.30, "unit": "CS", "item_number": "SYS-2004"},
    {"description": "TOMATO SAUCE PIZZA", "quantity": 4, "unit_price": 28.75, "unit": "CS", "item_number": "SYS-2005"},
    {"description": "PEPPERONI SLICED", "quantity": 2, "unit_price": 45.60, "unit": "CS", "item_number": "SYS-2006"},
    {"description": "MUSHROOMS SLICED", "quantity": 2, "unit_price": 32.40, "unit": "CS", "item_number": "SYS-2007"},
    {"description": "ONIONS DICED", "quantity": 2, "unit_price": 24.85, "unit": "CS", "item_number": "SYS-2008"},
    {"description": "GREEN PEPPERS DICED", "quantity": 2, "unit_price": 26.90, "unit": "CS", "item_number": "SYS-2009"},
]

print("Creating Sysco invoice...")

# Calculate totals
subtotal = sum(item["quantity"] * item["unit_price"] for item in sysco_items)
tax = round(subtotal * 0.07, 2)
total = round(subtotal + tax, 2)

# Create parsed_json matching real invoice structure
line_items = []
for item in sysco_items:
    line_items.append({
        "description": item["description"],
        "quantity": item["quantity"],
        "unit_price": item["unit_price"],
        "extended_price": round(item["quantity"] * item["unit_price"], 2),
        "item_number": item["item_number"],
        "pack_size": "",
        "category": "DRY",
        "confidence": "high",
        "validation_status": "passed"
    })

parsed_json = {
    "invoice_number": "SYS-789456",
    "vendor_name": "SYSCO",
    "invoice_date": "2025-10-25",
    "subtotal": subtotal,
    "tax": tax,
    "total": total,
    "line_items": line_items,
    "post_processing": {
        "confidence": "high",
        "corrections_made": 0,
        "items_needing_review": 0,
        "items_with_issues": [],
        "validation_warnings": [],
        "details": []
    }
}

# Create invoice with all required fields
invoice_data = {
    "id": str(uuid.uuid4()),
    "user_id": USER_ID,
    "invoice_number": "SYS-789456",
    "vendor_name": "SYSCO",
    "invoice_date": "2025-10-25",
    "subtotal": subtotal,
    "tax": tax,
    "total": total,
    "parse_method": "gemini_flash",
    "parse_cost": 0.0,
    "parse_time_seconds": 0,
    "parse_tokens_used": 0,
    "status": "reviewed",
    "raw_file_url": "https://example.com/sysco-seed-invoice.pdf",  # Dummy URL
    "parsed_json": parsed_json,
    "created_at": datetime.now().isoformat(),
    "updated_at": datetime.now().isoformat()
}

result = supabase.table('invoices').insert(invoice_data).execute()
invoice_id = result.data[0]['id']
print(f"✅ Created invoice: {invoice_data['invoice_number']} (ID: {invoice_id})")
print(f"   Subtotal: ${subtotal:.2f}")
print(f"   Tax: ${tax:.2f}")
print(f"   Total: ${total:.2f}")

# Create invoice items
items_data = []
for idx, item in enumerate(sysco_items, 1):
    extended_price = round(item["quantity"] * item["unit_price"], 2)
    items_data.append({
        "id": str(uuid.uuid4()),
        "invoice_id": invoice_id,
        "item_number": item["item_number"],
        "description": item["description"],
        "quantity": float(item["quantity"]),
        "pack_size": item["unit"],
        "unit_price": item["unit_price"],
        "extended_price": extended_price,
        "category": "DRY",
        "user_corrected": False,
        "created_at": datetime.now().isoformat()
    })

result = supabase.table('invoice_items').insert(items_data).execute()
print(f"✅ Created {len(items_data)} invoice items")

print("\n" + "="*60)
print("SYSCO INVOICE SEEDED SUCCESSFULLY")
print("="*60)
print(f"\nCross-vendor comparison now available for 6 items!")
print("\nPrice differences:")
print("  • Feta Cheese: Sysco $28.95 vs PFS $30.36 (Sysco 4.6% cheaper)")
print("  • Bacon: Sysco $83.75 vs PFS $85.34 (Sysco 1.9% cheaper)")
print("  • Sweet Potato Fries: Sysco $49.25 vs PFS $48.43 (Sysco 1.7% more)")
print("  • Straight Cut Fries: Sysco $42.95 vs PFS $43.33 (Sysco 0.9% cheaper)")
print("  • Lettuce: Sysco $30.15 vs PFS $29.37 (Sysco 2.7% more)")
print("\nRefresh your Price Analytics page to see cross-vendor data!")
