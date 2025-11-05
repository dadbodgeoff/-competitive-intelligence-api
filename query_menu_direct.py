"""
Direct database query to get parsed menu
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import json

# Load .env from parent directory
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Get the most recent menu for the user
user_id = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"

# Get menu
menu_response = supabase.table("restaurant_menus").select("*").eq("user_id", user_id).eq("status", "active").order("created_at", desc=True).limit(1).execute()

if not menu_response.data:
    print("No menu found")
    exit(1)

menu = menu_response.data[0]
menu_id = menu['id']

print("=" * 100)
print(f"RESTAURANT: {menu['restaurant_name']}")
print(f"MENU ID: {menu_id}")
print(f"VERSION: {menu['menu_version']}")
print("=" * 100)

# Get all categories for this menu
categories_response = supabase.table("menu_categories").select("*").eq("menu_id", menu_id).order("display_order").execute()
categories = {cat['id']: cat for cat in categories_response.data}

# Get all items for this menu with prices
items_response = supabase.table("menu_items").select("*, menu_item_prices(*)").eq("menu_id", menu_id).order("display_order").execute()
items = items_response.data

print(f"TOTAL ITEMS: {len(items)}")
print(f"TOTAL CATEGORIES: {len(categories)}")
print("=" * 100)

# Group by category
items_by_category = {}
for item in items:
    cat_id = item['category_id']
    cat_name = categories[cat_id]['category_name']
    if cat_name not in items_by_category:
        items_by_category[cat_name] = []
    items_by_category[cat_name].append(item)

# Print each category
for cat_name in sorted(items_by_category.keys()):
    items_in_cat = items_by_category[cat_name]
    print(f"\n{'='*100}")
    print(f"CATEGORY: {cat_name} ({len(items_in_cat)} items)")
    print('='*100)
    
    for idx, item in enumerate(items_in_cat, 1):
        print(f"\n{idx}. {item['item_name']}")
        
        if item.get('description'):
            print(f"   Description: {item['description']}")
        
        if item.get('options'):
            print(f"   Options: {json.dumps(item['options'])}")
        
        if item.get('notes'):
            print(f"   Notes: {item['notes']}")
        
        # Print prices
        prices = item.get('menu_item_prices', [])
        if prices:
            if len(prices) == 1 and not prices[0].get('size_label'):
                print(f"   Price: ${prices[0]['price']}")
            else:
                print(f"   Prices:")
                for price in prices:
                    size = price.get('size_label', 'Standard')
                    print(f"      {size}: ${price['price']}")

print("\n" + "=" * 100)
print("END OF MENU")
print("=" * 100)
