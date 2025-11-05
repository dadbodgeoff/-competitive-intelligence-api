"""
Seed Pizza Ingredients Invoice + Build Complete Recipes
Simulates user workflow: Upload invoice → Add ingredients to menu items
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
EMAIL = "dadbodgeoff@gmail.com"
PASSWORD = "Password123!"

# Pizza ingredients invoice data  
PIZZA_INGREDIENTS_INVOICE = {
    "vendor_name": "Sysco Food Services",
    "invoice_number": f"INV-PIZZA-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{datetime.now().microsecond}",
    "invoice_date": datetime.now().strftime("%Y-%m-%d"),
    "subtotal": 812.00,
    "tax": 48.72,
    "total": 860.72,
    "line_items": [
        # Cheese & Dairy
        {"description": "FRESH MOZZARELLA CHEESE", "quantity": 1, "pack_size": "6/5 lb", "unit_price": 89.50, "extended_price": 89.50},
        {"description": "SHREDDED MOZZARELLA CHEESE", "quantity": 2, "pack_size": "4/5 lb", "unit_price": 72.00, "extended_price": 144.00},
        {"description": "ASIAGO CHEESE SHREDDED", "quantity": 1, "pack_size": "2/5 lb", "unit_price": 45.00, "extended_price": 45.00},
        {"description": "ROMANO CHEESE GRATED", "quantity": 1, "pack_size": "2/5 lb", "unit_price": 42.00, "extended_price": 42.00},
        
        # Meats
        {"description": "PEPPERONI SLICED", "quantity": 1, "pack_size": "2/5 lb", "unit_price": 38.50, "extended_price": 38.50},
        {"description": "ITALIAN SAUSAGE BULK", "quantity": 1, "pack_size": "2/5 lb", "unit_price": 35.00, "extended_price": 35.00},
        {"description": "MEATBALLS COOKED 1OZ", "quantity": 1, "pack_size": "120 pieces", "unit_price": 42.00, "extended_price": 42.00},
        {"description": "HAM DICED", "quantity": 1, "pack_size": "2/5 lb", "unit_price": 32.00, "extended_price": 32.00},
        {"description": "BACON COOKED CRUMBLED", "quantity": 1, "pack_size": "4/2.5 lb", "unit_price": 48.00, "extended_price": 48.00},
        
        # Vegetables
        {"description": "MUSHROOMS SLICED", "quantity": 1, "pack_size": "4/5 lb", "unit_price": 28.00, "extended_price": 28.00},
        {"description": "GREEN PEPPERS DICED", "quantity": 1, "pack_size": "4/5 lb", "unit_price": 24.00, "extended_price": 24.00},
        {"description": "ONIONS DICED", "quantity": 1, "pack_size": "4/5 lb", "unit_price": 22.00, "extended_price": 22.00},
        {"description": "PLUM TOMATOES WHOLE", "quantity": 1, "pack_size": "6/#10 can", "unit_price": 36.00, "extended_price": 36.00},
        {"description": "FRESH BASIL", "quantity": 1, "pack_size": "12/1 oz", "unit_price": 18.00, "extended_price": 18.00},
        
        # Sauces & Oils
        {"description": "PIZZA SAUCE", "quantity": 2, "pack_size": "6/#10 can", "unit_price": 32.00, "extended_price": 64.00},
        {"description": "OLIVE OIL EXTRA VIRGIN", "quantity": 1, "pack_size": "4/1 gal", "unit_price": 52.00, "extended_price": 52.00},
        
        # Seasonings
        {"description": "ITALIAN HERB BLEND", "quantity": 1, "pack_size": "6/16 oz", "unit_price": 24.00, "extended_price": 24.00},
        {"description": "GARLIC MINCED", "quantity": 1, "pack_size": "4/32 oz", "unit_price": 28.00, "extended_price": 28.00},
    ]
}

# Recipe definitions for each pizza
PIZZA_RECIPES = {
    "White Pizza": [
        {"ingredient": "OLIVE OIL EXTRA VIRGIN", "quantity": 2, "unit": "oz"},
        {"ingredient": "ITALIAN HERB BLEND", "quantity": 0.5, "unit": "oz"},
        {"ingredient": "GARLIC MINCED", "quantity": 1, "unit": "oz"},
        {"ingredient": "SHREDDED MOZZARELLA CHEESE", "quantity": 8, "unit": "oz"},
    ],
    "Palermo Pizza": [
        {"ingredient": "OLIVE OIL EXTRA VIRGIN", "quantity": 2, "unit": "oz"},
        {"ingredient": "ASIAGO CHEESE SHREDDED", "quantity": 4, "unit": "oz"},
        {"ingredient": "ROMANO CHEESE GRATED", "quantity": 4, "unit": "oz"},
        {"ingredient": "ITALIAN HERB BLEND", "quantity": 0.5, "unit": "oz"},
        {"ingredient": "GARLIC MINCED", "quantity": 1, "unit": "oz"},
    ],
    "Margherita Pizza": [
        {"ingredient": "PIZZA SAUCE", "quantity": 4, "unit": "oz"},
        {"ingredient": "FRESH MOZZARELLA CHEESE", "quantity": 8, "unit": "oz"},
        {"ingredient": "PLUM TOMATOES WHOLE", "quantity": 4, "unit": "oz"},
        {"ingredient": "FRESH BASIL", "quantity": 0.25, "unit": "oz"},
        {"ingredient": "OLIVE OIL EXTRA VIRGIN", "quantity": 0.5, "unit": "oz"},
    ],
    "House Special Pizza": [
        {"ingredient": "PIZZA SAUCE", "quantity": 4, "unit": "oz"},
        {"ingredient": "SHREDDED MOZZARELLA CHEESE", "quantity": 8, "unit": "oz"},
        {"ingredient": "GREEN PEPPERS DICED", "quantity": 2, "unit": "oz"},
        {"ingredient": "MUSHROOMS SLICED", "quantity": 2, "unit": "oz"},
        {"ingredient": "ONIONS DICED", "quantity": 2, "unit": "oz"},
        {"ingredient": "ITALIAN SAUSAGE BULK", "quantity": 3, "unit": "oz"},
        {"ingredient": "MEATBALLS COOKED 1OZ", "quantity": 3, "unit": "ea"},
        {"ingredient": "PEPPERONI SLICED", "quantity": 2, "unit": "oz"},
    ],
    "Meat Lovers Pizza": [
        {"ingredient": "PIZZA SAUCE", "quantity": 4, "unit": "oz"},
        {"ingredient": "SHREDDED MOZZARELLA CHEESE", "quantity": 8, "unit": "oz"},
        {"ingredient": "PEPPERONI SLICED", "quantity": 3, "unit": "oz"},
        {"ingredient": "ITALIAN SAUSAGE BULK", "quantity": 3, "unit": "oz"},
        {"ingredient": "MEATBALLS COOKED 1OZ", "quantity": 3, "unit": "ea"},
        {"ingredient": "HAM DICED", "quantity": 2, "unit": "oz"},
        {"ingredient": "BACON COOKED CRUMBLED", "quantity": 2, "unit": "oz"},
    ],
    "Fresco Pizza": [
        {"ingredient": "OLIVE OIL EXTRA VIRGIN", "quantity": 2, "unit": "oz"},
        {"ingredient": "ITALIAN HERB BLEND", "quantity": 0.5, "unit": "oz"},
        {"ingredient": "GARLIC MINCED", "quantity": 1, "unit": "oz"},
        {"ingredient": "FRESH MOZZARELLA CHEESE", "quantity": 8, "unit": "oz"},
        {"ingredient": "PLUM TOMATOES WHOLE", "quantity": 4, "unit": "oz"},
    ],
}

def login():
    """Login and return cookies"""
    print("🔐 Logging in...")
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.status_code}")
    print("✅ Logged in successfully\n")
    return response.cookies

def save_invoice(cookies):
    """Save invoice through proper API endpoint"""
    print("📄 Saving pizza ingredients invoice...")
    print(f"   Vendor: {PIZZA_INGREDIENTS_INVOICE['vendor_name']}")
    print(f"   Items: {len(PIZZA_INGREDIENTS_INVOICE['line_items'])}")
    print(f"   Total: ${PIZZA_INGREDIENTS_INVOICE['total']:.2f}\n")
    
    response = requests.post(
        f"{BASE_URL}/api/v1/invoices/save",
        json={
            "invoice_data": PIZZA_INGREDIENTS_INVOICE,
            "parse_metadata": {
                "source": "seed_script",
                "confidence": "high",
                "items_extracted": len(PIZZA_INGREDIENTS_INVOICE['line_items']),
                "model_used": "manual_seed",
                "parse_time_seconds": 0,
                "cost": 0
            },
            "file_url": f"seed://pizza_ingredients_{datetime.now().strftime('%Y%m%d')}.pdf"
        },
        cookies=cookies
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to save invoice: {response.status_code}")
        print(response.text)
        raise Exception("Invoice save failed")
    
    result = response.json()
    invoice_id = result.get('invoice_id')
    print(f"✅ Invoice saved: {invoice_id}\n")
    return invoice_id

def get_menu_items(cookies):
    """Get menu items from current menu"""
    print("📋 Fetching menu items...")
    
    # First get the menu list
    list_response = requests.get(
        f"{BASE_URL}/api/v1/menu/list",
        cookies=cookies
    )
    
    if list_response.status_code != 200:
        raise Exception(f"Failed to get menu list: {list_response.status_code}")
    
    menus_data = list_response.json()
    menus = menus_data.get('data', [])
    
    if not menus:
        print("⚠️  No menus found\n")
        return []
    
    # Get the first menu's ID
    menu_id = menus[0]['id']
    print(f"   Using menu: {menus[0].get('restaurant_name', 'Unknown')} (ID: {menu_id})")
    
    # Now get the full menu with items
    response = requests.get(
        f"{BASE_URL}/api/v1/menu/current",
        params={"menu_id": menu_id},
        cookies=cookies
    )
    
    if response.status_code != 200:
        print(f"   Warning: Could not fetch menu details: {response.status_code}")
        return []
    
    menu_data = response.json()
    items = menu_data.get('items', [])
    print(f"✅ Found {len(items)} menu items\n")
    return items

def search_ingredient(cookies, query):
    """Search for ingredient in invoice items"""
    response = requests.get(
        f"{BASE_URL}/api/v1/menu/search-inventory",
        params={"q": query, "limit": 5},
        cookies=cookies
    )
    
    if response.status_code != 200:
        return None
    
    results = response.json().get('results', [])
    if not results:
        return None
    
    # Return best match (first result has highest similarity)
    return results[0]

def add_ingredient_to_menu_item(cookies, menu_item_id, invoice_item_id, quantity, unit, ingredient_name):
    """Add ingredient to menu item"""
    response = requests.post(
        f"{BASE_URL}/api/v1/menu/items/{menu_item_id}/ingredients",
        json={
            "invoice_item_id": invoice_item_id,
            "quantity_per_serving": quantity,
            "unit_of_measure": unit,
            "notes": f"Added by seed script"
        },
        cookies=cookies
    )
    
    if response.status_code != 200:
        print(f"   ❌ Failed to add {ingredient_name}: {response.status_code}")
        print(f"      {response.text}")
        return None
    
    result = response.json()
    return result

def build_recipes(cookies, menu_items):
    """Build recipes for all pizza items"""
    print("=" * 80)
    print("🍕 BUILDING PIZZA RECIPES")
    print("=" * 80 + "\n")
    
    # Create a map of menu items by name
    menu_map = {item['item_name']: item for item in menu_items}
    
    total_ingredients_added = 0
    total_cost = 0
    
    for pizza_name, recipe in PIZZA_RECIPES.items():
        if pizza_name not in menu_map:
            print(f"⚠️  Skipping {pizza_name} - not found in menu\n")
            continue
        
        menu_item = menu_map[pizza_name]
        menu_item_id = menu_item['id']
        
        print(f"🍕 {pizza_name}")
        print(f"   Menu Item ID: {menu_item_id}")
        print(f"   Recipe: {len(recipe)} ingredients")
        
        pizza_cost = 0
        
        for ingredient_spec in recipe:
            ingredient_name = ingredient_spec['ingredient']
            quantity = ingredient_spec['quantity']
            unit = ingredient_spec['unit']
            
            # Search for ingredient
            search_result = search_ingredient(cookies, ingredient_name)
            
            if not search_result:
                print(f"   ⚠️  Could not find: {ingredient_name}")
                continue
            
            invoice_item_id = search_result['id']
            
            # Add to menu item
            result = add_ingredient_to_menu_item(
                cookies, menu_item_id, invoice_item_id, 
                quantity, unit, ingredient_name
            )
            
            if result:
                cost = result.get('calculated_cost', 0)
                pizza_cost += cost
                total_ingredients_added += 1
                print(f"   ✅ {ingredient_name}: {quantity} {unit} = ${cost:.2f}")
            
        total_cost += pizza_cost
        print(f"   💰 Total COGS: ${pizza_cost:.2f}")
        print(f"   📊 Food Cost %: {(pizza_cost / 20.45 * 100):.1f}%\n")
    
    print("=" * 80)
    print(f"✅ COMPLETE!")
    print(f"   Total Ingredients Added: {total_ingredients_added}")
    print(f"   Total Recipe Cost: ${total_cost:.2f}")
    print("=" * 80)

def main():
    print("=" * 80)
    print("PIZZA RECIPE SEEDING SCRIPT")
    print("=" * 80 + "\n")
    
    try:
        # Step 1: Login
        cookies = login()
        
        # Step 2: Save invoice
        invoice_id = save_invoice(cookies)
        
        # Step 3: Get menu items
        menu_items = get_menu_items(cookies)
        
        # Step 4: Build recipes
        build_recipes(cookies, menu_items)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
