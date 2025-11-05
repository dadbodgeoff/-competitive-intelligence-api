"""
Seed Performance Foodservice Invoice for Pizza Recipes
Includes: Dough balls, mozzarella, ricotta, sauce, toppings
"""
import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
import uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def seed_pizza_invoice():
    user_id = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"
    
    # Invoice header
    invoice_id = str(uuid.uuid4())
    invoice_number = "PFS-PIZZA-001"
    invoice_date = "2025-11-01"
    
    print(f"Creating invoice {invoice_number}...")
    
    # Line items for pizza ingredients
    items = [
        # DOUGH BALLS (3 sizes for different pizza sizes)
        {
            "item_number": "001",
            "description": "DOUGH BALL PIZZA 8 OZ SMALL",
            "quantity": 1,
            "pack_size": "50 8 OZ",
            "unit_price": 45.00,
            "extended_price": 45.00,
            "category": "FROZEN"
        },
        {
            "item_number": "002", 
            "description": "DOUGH BALL PIZZA 16 OZ LARGE",
            "quantity": 40,
            "pack_size": "40 16 OZ",
            "unit_price": 72.00,
            "extended_price": 72.00,
            "category": "FROZEN"
        },
        {
            "item_number": "003",
            "description": "DOUGH BALL PIZZA 20 OZ X-LARGE",
            "quantity": 30,
            "pack_size": "30 20 OZ",
            "unit_price": 75.00,
            "extended_price": 75.00,
            "category": "FROZEN"
        },
        
        # CHEESE (Main ingredients)
        {
            "item_number": "004",
            "description": "CHEESE MOZZARELLA SHREDDED PIZZA BLEND",
            "quantity": 4,
            "pack_size": "4 5 LB",
            "unit_price": 78.40,
            "extended_price": 78.40,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "005",
            "description": "CHEESE RICOTTA WHOLE MILK TUB",
            "quantity": 2,
            "pack_size": "2 5 LB",
            "unit_price": 42.50,
            "extended_price": 42.50,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "006",
            "description": "CHEESE PROVOLONE SLICED DELI",
            "quantity": 1,
            "pack_size": "1 5 LB",
            "unit_price": 28.75,
            "extended_price": 28.75,
            "category": "REFRIGERATED"
        },
        
        # SAUCE
        {
            "item_number": "007",
            "description": "SAUCE PIZZA MARINARA TRADITIONAL",
            "quantity": 6,
            "pack_size": "6 1 GA",
            "unit_price": 48.60,
            "extended_price": 48.60,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "008",
            "description": "SAUCE BBQ SMOKEY SWEET",
            "quantity": 2,
            "pack_size": "2 1 GA",
            "unit_price": 24.50,
            "extended_price": 24.50,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "009",
            "description": "SAUCE BUFFALO HOT WING",
            "quantity": 2,
            "pack_size": "2 1 GA",
            "unit_price": 26.80,
            "extended_price": 26.80,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "010",
            "description": "SAUCE RANCH DRESSING BOTTLE",
            "quantity": 4,
            "pack_size": "4 1 GA",
            "unit_price": 32.00,
            "extended_price": 32.00,
            "category": "REFRIGERATED"
        },
        
        # MEATS
        {
            "item_number": "011",
            "description": "PEPPERONI SLICED PIZZA CUP CHAR",
            "quantity": 2,
            "pack_size": "2 5 LB",
            "unit_price": 52.90,
            "extended_price": 52.90,
            "category": "FROZEN"
        },
        {
            "item_number": "012",
            "description": "SAUSAGE ITALIAN BULK MILD",
            "quantity": 2,
            "pack_size": "2 5 LB",
            "unit_price": 38.60,
            "extended_price": 38.60,
            "category": "FROZEN"
        },
        {
            "item_number": "013",
            "description": "BACON PRECOOKED CRUMBLED",
            "quantity": 1,
            "pack_size": "1 3 LB",
            "unit_price": 24.75,
            "extended_price": 24.75,
            "category": "FROZEN"
        },
        {
            "item_number": "014",
            "description": "MEATBALL ITALIAN COOKED 1 OZ",
            "quantity": 1,
            "pack_size": "120 1 OZ",
            "unit_price": 42.00,
            "extended_price": 42.00,
            "category": "FROZEN"
        },
        {
            "item_number": "015",
            "description": "HAM DELI SLICED HONEY",
            "quantity": 1,
            "pack_size": "1 5 LB",
            "unit_price": 26.50,
            "extended_price": 26.50,
            "category": "FROZEN"
        },
        {
            "item_number": "016",
            "description": "SALAMI GENOA SLICED DELI",
            "quantity": 1,
            "pack_size": "1 5 LB",
            "unit_price": 32.80,
            "extended_price": 32.80,
            "category": "FROZEN"
        },
        {
            "item_number": "017",
            "description": "CHICKEN BREAST BREADED COOKED DICED",
            "quantity": 2,
            "pack_size": "2 5 LB",
            "unit_price": 48.90,
            "extended_price": 48.90,
            "category": "FROZEN"
        },
        
        # VEGETABLES
        {
            "item_number": "018",
            "description": "PEPPER GREEN BELL DICED FRESH",
            "quantity": 2,
            "pack_size": "2 5 LB",
            "unit_price": 18.60,
            "extended_price": 18.60,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "019",
            "description": "ONION YELLOW DICED FRESH",
            "quantity": 2,
            "pack_size": "2 5 LB",
            "unit_price": 12.40,
            "extended_price": 12.40,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "020",
            "description": "TOMATO PLUM FRESH WHOLE",
            "quantity": 1,
            "pack_size": "1 25 LB",
            "unit_price": 28.50,
            "extended_price": 28.50,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "021",
            "description": "OLIVE BLACK SLICED CAN",
            "quantity": 6,
            "pack_size": "6 6 LB",
            "unit_price": 42.00,
            "extended_price": 42.00,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "022",
            "description": "MUSHROOM WHITE SLICED FRESH",
            "quantity": 2,
            "pack_size": "2 5 LB",
            "unit_price": 22.80,
            "extended_price": 22.80,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "023",
            "description": "BASIL FRESH BUNCH",
            "quantity": 4,
            "pack_size": "4 1 EA",
            "unit_price": 12.00,
            "extended_price": 12.00,
            "category": "REFRIGERATED"
        },
        {
            "item_number": "024",
            "description": "GARLIC FRESH PEELED CLOVES",
            "quantity": 1,
            "pack_size": "1 5 LB",
            "unit_price": 18.50,
            "extended_price": 18.50,
            "category": "REFRIGERATED"
        },
        
        # OILS & SEASONINGS
        {
            "item_number": "025",
            "description": "OIL OLIVE EXTRA VIRGIN",
            "quantity": 2,
            "pack_size": "2 1 GA",
            "unit_price": 48.00,
            "extended_price": 48.00,
            "category": "DRY"
        },
    ]
    
    # Calculate totals
    subtotal = sum(item["extended_price"] for item in items)
    tax = round(subtotal * 0.0625, 2)  # 6.25% tax
    total = subtotal + tax
    
    print(f"   Items: {len(items)}")
    print(f"   Subtotal: ${subtotal:.2f}")
    print(f"   Tax: ${tax:.2f}")
    print(f"   Total: ${total:.2f}")
    
    # Insert invoice
    invoice_data = {
        "id": invoice_id,
        "user_id": user_id,
        "invoice_number": invoice_number,
        "vendor_name": "PERFORMANCE FOODSERVICE",
        "invoice_date": invoice_date,
        "raw_file_url": "seeded://pizza-ingredients",
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "status": "reviewed",
        "parse_method": "manual",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    supabase.table("invoices").insert(invoice_data).execute()
    print(f"✅ Invoice created")
    
    # Insert invoice_items
    for item in items:
        item_data = {
            "id": str(uuid.uuid4()),
            "invoice_id": invoice_id,
            "item_number": item["item_number"],
            "description": item["description"],
            "quantity": item["quantity"],
            "pack_size": item["pack_size"],
            "unit_price": item["unit_price"],
            "extended_price": item["extended_price"],
            "category": item["category"],
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("invoice_items").insert(item_data).execute()
    
    print(f"✅ {len(items)} invoice items created")
    
    # Create inventory_items (fuzzy matching will happen automatically)
    print("\n📦 Creating inventory items...")
    for item in items:
        inv_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "name": item["description"],
            "category": item["category"],
            "unit_of_measure": "lb",  # Default, will be overridden by pack parsing
            "average_unit_cost": item["unit_price"] / item["quantity"],
            "last_purchase_price": item["unit_price"],
            "last_purchase_date": invoice_date,
            "current_quantity": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        supabase.table("inventory_items").insert(inv_data).execute()
    
    print(f"✅ {len(items)} inventory items created")
    
    print(f"\n🎉 Pizza invoice seeded successfully!")
    print(f"   Invoice: {invoice_number}")
    print(f"   Total: ${total:.2f}")
    print(f"   Ready for recipe costing!")

if __name__ == "__main__":
    asyncio.run(seed_pizza_invoice())
