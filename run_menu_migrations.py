"""
Run Menu Migrations in Correct Order
Runs migrations 012 and 013 for the menu system
"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def run_migrations():
    """Run menu migrations in order"""
    
    print("🚀 Running Menu System Migrations")
    print("=" * 70)
    
    # Connect to Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        print("   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
        return False
    
    client = create_client(supabase_url, supabase_key)
    
    migrations = [
        {
            "number": "012",
            "name": "Menu Management System",
            "file": "database/migrations/012_menu_management_system.sql",
            "tables": ["restaurant_menus", "menu_categories", "menu_items", "menu_item_prices"]
        },
        {
            "number": "013",
            "name": "Menu Item Ingredients (Plate Costing)",
            "file": "database/migrations/013_menu_item_ingredients.sql",
            "tables": ["menu_item_ingredients"]
        }
    ]
    
    for migration in migrations:
        print(f"\n📦 Migration {migration['number']}: {migration['name']}")
        print("-" * 70)
        
        # Check if already applied
        try:
            # Try to query the first table to see if it exists
            test_table = migration['tables'][0]
            client.table(test_table).select("*").limit(0).execute()
            print(f"⏭️  Already applied (table '{test_table}' exists)")
            continue
        except Exception:
            # Table doesn't exist, need to run migration
            pass
        
        # Read migration file
        try:
            with open(migration['file'], 'r', encoding='utf-8') as f:
                sql = f.read()
        except FileNotFoundError:
            print(f"❌ Migration file not found: {migration['file']}")
            return False
        
        # Run migration
        try:
            print(f"⏳ Running migration...")
            # Note: Supabase client doesn't have direct SQL execution
            # You need to run this via Supabase Dashboard or psql
            print(f"📋 Please run this migration manually:")
            print(f"   1. Go to Supabase Dashboard → SQL Editor")
            print(f"   2. Copy contents of: {migration['file']}")
            print(f"   3. Paste and click 'Run'")
            print(f"\n   Or use psql:")
            print(f"   psql $DATABASE_URL -f {migration['file']}")
            
            # Wait for user confirmation
            input(f"\n   Press Enter after running migration {migration['number']}...")
            
            # Verify migration was applied
            test_table = migration['tables'][0]
            client.table(test_table).select("*").limit(0).execute()
            print(f"✅ Migration {migration['number']} verified")
            
        except Exception as e:
            print(f"❌ Migration {migration['number']} failed: {e}")
            return False
    
    print("\n" + "=" * 70)
    print("✅ All menu migrations completed successfully!")
    print("=" * 70)
    print("\n📋 Tables created:")
    print("   Migration 012:")
    print("   - restaurant_menus")
    print("   - menu_categories")
    print("   - menu_items")
    print("   - menu_item_prices")
    print("\n   Migration 013:")
    print("   - menu_item_ingredients")
    print("\n🎉 Menu system and plate costing ready!")
    
    return True

if __name__ == "__main__":
    success = run_migrations()
    exit(0 if success else 1)
