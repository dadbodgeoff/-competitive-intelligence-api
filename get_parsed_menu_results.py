"""
Fetch and display parsed menu results for comparison
"""
import requests
import json

BASE_URL = "http://localhost:8000"
EMAIL = "nrivikings8@gmail.com"
PASSWORD = "testpass123"

# Login
login_response = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    json={"email": EMAIL, "password": PASSWORD}
)
token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get current menu
menu_response = requests.get(
    f"{BASE_URL}/api/menu/current",
    headers=headers
)

if menu_response.status_code != 200:
    print(f"Error: {menu_response.status_code}")
    print(menu_response.text)
    exit(1)

data = menu_response.json()

if not data.get('menu'):
    print("No menu found")
    exit(1)

menu = data['menu']
items = data['items']

print("=" * 100)
print(f"RESTAURANT: {menu['restaurant_name']}")
print(f"TOTAL ITEMS EXTRACTED: {len(items)}")
print("=" * 100)

# Group by category
categories = {}
for item in items:
    cat = item['category']
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(item)

# Print each category with all details
for cat_name in sorted(categories.keys()):
    items_in_cat = categories[cat_name]
    print(f"\n{'='*100}")
    print(f"CATEGORY: {cat_name} ({len(items_in_cat)} items)")
    print('='*100)
    
    for idx, item in enumerate(items_in_cat, 1):
        print(f"\n{idx}. {item['name']}")
        
        if item.get('description'):
            print(f"   Description: {item['description']}")
        
        if item.get('base_price'):
            print(f"   Base Price: ${item['base_price']}")
        
        if item.get('size_prices'):
            print(f"   Size Prices: {json.dumps(item['size_prices'], indent=6)}")

print("\n" + "=" * 100)
print("END OF MENU")
print("=" * 100)
