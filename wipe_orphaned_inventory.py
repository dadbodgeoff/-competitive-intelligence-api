"""
One-time cleanup: Delete all 65 orphaned inventory items
Safe because all invoices are already deleted
"""
import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def wipe_inventory():
    user_id = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"
    
    # Get inventory count
    result = supabase.table("inventory_items").select("id").eq("user_id", user_id).execute()
    inv_count = len(result.data or [])
    inv_ids = [item["id"] for item in result.data or []]
    
    print(f"Found {inv_count} orphaned inventory items")
    
    # Check for menu_item_ingredients that reference these
    if inv_ids:
        ingredients = supabase.table("menu_item_ingredients").select("id").in_("inventory_item_id", inv_ids).execute()
        ing_count = len(ingredients.data or [])
        
        if ing_count > 0:
            print(f"⚠️  Found {ing_count} menu recipe ingredients referencing these items")
            print("Deleting menu_item_ingredients first...")
            supabase.table("menu_item_ingredients").delete().in_("inventory_item_id", inv_ids).execute()
            print(f"✅ Deleted {ing_count} menu_item_ingredients")
    
    print("Deleting inventory items...")
    supabase.table("inventory_items").delete().eq("user_id", user_id).execute()
    
    # Verify
    verify = supabase.table("inventory_items").select("id").eq("user_id", user_id).execute()
    remaining = len(verify.data or [])
    
    print(f"✅ Deleted {inv_count} inventory items")
    print(f"✅ {remaining} items remaining (should be 0)")
    print("\n🎉 Clean slate! Ready to upload fresh invoices.")

if __name__ == "__main__":
    asyncio.run(wipe_inventory())
