"""
Simple Pizza Invoice Seed - Performance Foodservice
Quantity=1, pack_size contains the count, extended_price = quantity * unit_price
"""
import os
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime
import uuid

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

user_id = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"
invoice_id = str(uuid.uuid4())

# Pizza ingredients - quantity=1, pack_size has the count
items = [
    # Dough
    ("DOUGH BALL PIZZA 8 OZ SMALL", 1, "50 8 OZ", 45.00, "FROZEN"),
    ("DOUGH BALL PIZZA 16 OZ LARGE", 1, "40 16 OZ", 72.00, "FROZEN"),
    ("DOUGH BALL PIZZA 20 OZ X-LARGE", 1, "30 20 OZ", 75.00, "FROZEN"),
    
    # Cheese
    ("CHEESE MOZZARELLA SHREDDED", 1, "4 5 LB", 78.40, "REFRIGERATED"),
    ("CHEESE RICOTTA WHOLE MILK", 1, "2 5 LB", 42.50, "REFRIGERATED"),
    ("CHEESE PROVOLONE SLICED", 1, "1 5 LB", 28.75, "REFRIGERATED"),
    
    # Sauce
    ("SAUCE PIZZA MARINARA", 1, "6 1 GA", 48.60, "REFRIGERATED"),
    ("SAUCE BBQ SMOKEY", 1, "2 1 GA", 24.50, "REFRIGERATED"),
    ("SAUCE BUFFALO HOT", 1, "2 1 GA", 26.80, "REFRIGERATED"),
    ("SAUCE RANCH DRESSING", 1, "4 1 GA", 32.00, "REFRIGERATED"),
    
    # Meats
    ("PEPPERONI SLICED PIZZA", 1, "2 5 LB", 52.90, "FROZEN"),
    ("SAUSAGE ITALIAN BULK", 1, "2 5 LB", 38.60, "FROZEN"),
    ("BACON PRECOOKED CRUMBLED", 1, "1 3 LB", 24.75, "FROZEN"),
    ("MEATBALL ITALIAN COOKED", 1, "120 1 OZ", 42.00, "FROZEN"),
    ("HAM DELI SLICED", 1, "1 5 LB", 26.50, "REFRIGERATED"),
    ("SALAMI GENOA SLICED", 1, "1 5 LB", 32.80, "REFRIGERATED"),
    ("CHICKEN BREAST BREADED", 1, "2 5 LB", 48.90, "FROZEN"),
    
    # Vegetables
    ("PEPPER GREEN BELL DICED", 1, "2 5 LB", 18.60, "REFRIGERATED"),
    ("ONION YELLOW DICED", 1, "2 5 LB", 12.40, "REFRIGERATED"),
    ("TOMATO PLUM FRESH", 1, "1 25 LB", 28.50, "REFRIGERATED"),
    ("OLIVE BLACK SLICED", 1, "6 6 LB", 42.00, "DRY"),
    ("MUSHROOM WHITE SLICED", 1, "2 5 LB", 22.80, "REFRIGERATED"),
    ("BASIL FRESH BUNCH", 1, "4 1 EA", 12.00, "REFRIGERATED"),
    ("GARLIC FRESH PEELED", 1, "1 5 LB", 18.50, "REFRIGERATED"),
    
    # Oil
    ("OIL OLIVE EXTRA VIRGIN", 1, "2 1 GA", 48.00, "DRY"),
]

# Calculate totals
subtotal = sum(price for _, _, _, price, _ in items)
tax = round(subtotal * 0.0625, 2)
total = subtotal + tax

print(f"Creating invoice PFS-PIZZA-001...")
print(f"  Items: {len(items)}, Total: ${total:.2f}")

# Insert invoice
supabase.table("invoices").insert({
    "id": invoice_id,
    "user_id": user_id,
    "invoice_number": "PFS-PIZZA-001",
    "vendor_name": "PERFORMANCE FOODSERVICE",
    "invoice_date": "2025-11-01",
    "raw_file_url": "seeded://pizza",
    "subtotal": subtotal,
    "tax": tax,
    "total": total,
    "status": "reviewed",
    "parse_method": "manual",
    "created_at": datetime.now().isoformat(),
    "updated_at": datetime.now().isoformat()
}).execute()

print("✅ Invoice created")

# Insert items
for i, (desc, qty, pack, price, cat) in enumerate(items, 1):
    supabase.table("invoice_items").insert({
        "id": str(uuid.uuid4()),
        "invoice_id": invoice_id,
        "item_number": f"{i:03d}",
        "description": desc,
        "quantity": qty,
        "pack_size": pack,
        "unit_price": price,
        "extended_price": qty * price,  # Must match!
        "category": cat,
        "created_at": datetime.now().isoformat()
    }).execute()

print(f"✅ {len(items)} items created")

# Create inventory
for desc, _, pack, price, cat in items:
    supabase.table("inventory_items").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": desc,
        "normalized_name": desc.lower().replace(" ", "_"),
        "category": cat.lower(),
        "unit_of_measure": "lb",
        "average_unit_cost": price,
        "last_purchase_price": price,
        "last_purchase_date": "2025-11-01",
        "current_quantity": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }).execute()

print(f"✅ {len(items)} inventory items created")
print("\n🎉 Pizza invoice seeded! Ready for recipe costing.")
