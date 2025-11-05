#!/usr/bin/env python3
"""
Verify COGS Dashboard Data Flow
Tests the complete flow: Menu Items -> Recipes -> COGS Calculations
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Test credentials
EMAIL = "dadbodgeoff@gmail.com"
PASSWORD = "Password123!"
BASE_URL = "http://localhost:8000"

def test_cogs_dashboard_flow():
    """Test complete COGS dashboard data retrieval"""
    
    print("🔍 COGS Dashboard Verification\n")
    print("=" * 60)
    
    # Create session to maintain cookies
    session = requests.Session()
    
    # Step 1: Login
    print("\n1️⃣  Logging in...")
    login_response = session.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        return False
    
    login_data = login_response.json()
    user_id = login_data.get("user", {}).get("id")
    print(f"✅ Login successful")
    print(f"   User ID: {user_id}")
    print(f"   Cookies: {list(session.cookies.keys())}")
    
    # Step 2: Get current menu
    print("\n2️⃣  Fetching menu items...")
    menu_response = session.get(f"{BASE_URL}/api/v1/menu/current")
    
    if menu_response.status_code != 200:
        print(f"❌ Menu fetch failed: {menu_response.status_code}")
        print(f"   Response: {menu_response.text}")
        return False
    
    menu_data = menu_response.json()
    
    if not menu_data.get("success"):
        print(f"❌ Menu fetch unsuccessful")
        print(f"   Response: {menu_data}")
        return False
    
    # Count menu items
    total_items = 0
    categories = menu_data.get("categories", [])
    
    print(f"✅ Menu fetched successfully")
    print(f"   Categories: {len(categories)}")
    
    all_items = []
    for category in categories:
        items = category.get("items", [])
        total_items += len(items)
        all_items.extend(items)
        print(f"   - {category.get('name')}: {len(items)} items")
    
    print(f"\n   Total menu items: {total_items}")
    
    if total_items == 0:
        print("\n⚠️  No menu items found. Upload a menu first!")
        return True  # Not an error, just empty
    
    # Step 3: Fetch recipes for each item
    print(f"\n3️⃣  Fetching recipes for {min(5, total_items)} items (sample)...")
    
    items_with_recipes = 0
    items_without_recipes = 0
    recipe_details = []
    
    for item in all_items[:5]:  # Test first 5 items
        item_id = item.get("id")
        item_name = item.get("item_name")
        
        recipe_response = session.get(
            f"{BASE_URL}/api/v1/menu/items/{item_id}/recipe"
        )
        
        if recipe_response.status_code == 200:
            recipe_data = recipe_response.json()
            
            if recipe_data.get("success") and recipe_data.get("ingredients"):
                items_with_recipes += 1
                recipe_details.append({
                    "name": item_name,
                    "total_cogs": recipe_data.get("total_cogs", 0),
                    "gross_profit": recipe_data.get("gross_profit", 0),
                    "food_cost_percent": recipe_data.get("food_cost_percent", 0),
                    "ingredient_count": len(recipe_data.get("ingredients", []))
                })
                print(f"   ✅ {item_name}: {len(recipe_data.get('ingredients', []))} ingredients")
            else:
                items_without_recipes += 1
                print(f"   ⚪ {item_name}: No recipe")
        else:
            items_without_recipes += 1
            print(f"   ⚪ {item_name}: No recipe")
    
    # Step 4: Summary
    print("\n" + "=" * 60)
    print("📊 COGS Dashboard Summary")
    print("=" * 60)
    print(f"\n✅ Data Flow Working:")
    print(f"   - Menu items fetched: {total_items}")
    print(f"   - Items with recipes (sample): {items_with_recipes}/{min(5, total_items)}")
    print(f"   - Items without recipes (sample): {items_without_recipes}/{min(5, total_items)}")
    
    if recipe_details:
        print(f"\n📈 Recipe Details (Sample):")
        for recipe in recipe_details:
            print(f"\n   {recipe['name']}:")
            print(f"      COGS: ${recipe['total_cogs']:.2f}")
            print(f"      Margin: ${recipe['gross_profit']:.2f}")
            print(f"      Food Cost: {recipe['food_cost_percent']:.1f}%")
            print(f"      Ingredients: {recipe['ingredient_count']}")
    
    # Step 5: Test metrics calculation
    if recipe_details:
        print(f"\n🧮 Calculated Metrics:")
        avg_margin = sum(r['gross_profit'] for r in recipe_details) / len(recipe_details)
        avg_food_cost = sum(r['food_cost_percent'] for r in recipe_details) / len(recipe_details)
        
        print(f"   Average Margin: ${avg_margin:.2f}")
        print(f"   Average Food Cost: {avg_food_cost:.1f}%")
        
        # Health status
        healthy = sum(1 for r in recipe_details if r['food_cost_percent'] < 30)
        warning = sum(1 for r in recipe_details if 30 <= r['food_cost_percent'] < 35)
        danger = sum(1 for r in recipe_details if r['food_cost_percent'] >= 35)
        
        print(f"\n   Health Status:")
        print(f"      🟢 Healthy (<30%): {healthy}")
        print(f"      🟡 Warning (30-35%): {warning}")
        print(f"      🔴 High Cost (>35%): {danger}")
    
    print("\n" + "=" * 60)
    print("✅ COGS Dashboard verification complete!")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        success = test_cogs_dashboard_flow()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
