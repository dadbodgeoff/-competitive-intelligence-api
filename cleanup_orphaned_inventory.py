"""
Cleanup Orphaned Inventory Items
Find and remove inventory items not on any of the 9 current invoices
"""
import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Your 9 current invoices
CURRENT_INVOICES = [
    "3325130",
    "3321610", 
    "SYS-789456",
    "3314501",
    "3312838",
    "3308808",
    "3302546",
    "3295841",
    "3293561"  # From the SQL file
]

async def cleanup_orphaned_items():
    """Find and optionally delete orphaned inventory items"""
    
    print("=" * 80)
    print("ORPHANED INVENTORY CLEANUP")
    print("=" * 80)
    
    user_id = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"
    
    # Get all invoices for this user
    invoices_result = supabase.table("invoices").select(
        "id, invoice_number, vendor_name"
    ).eq("user_id", user_id).execute()
    
    all_invoices = invoices_result.data or []
    print(f"\n📋 Found {len(all_invoices)} total invoices in database")
    
    # Filter to current invoices
    current_invoice_ids = []
    for inv in all_invoices:
        if inv["invoice_number"] in CURRENT_INVOICES:
            current_invoice_ids.append(inv["id"])
            print(f"   ✅ {inv['vendor_name']} #{inv['invoice_number']}")
    
    print(f"\n✅ {len(current_invoice_ids)} current invoices found")
    
    # Get all invoice items from current invoices
    if current_invoice_ids:
        invoice_items_result = supabase.table("invoice_items").select(
            "description"
        ).in_("invoice_id", current_invoice_ids).execute()
        
        current_items = invoice_items_result.data or []
        current_item_names = set(item["description"] for item in current_items)
        print(f"📦 {len(current_item_names)} unique items on current invoices")
    else:
        current_item_names = set()
        print("⚠️  No current invoices found!")
    
    # Get all inventory items
    inventory_result = supabase.table("inventory_items").select(
        "id, name"
    ).eq("user_id", user_id).execute()
    
    inventory_items = inventory_result.data or []
    print(f"📦 {len(inventory_items)} total inventory items")
    
    # Find orphaned items
    orphaned = []
    valid = []
    
    for item in inventory_items:
        if item["name"] in current_item_names:
            valid.append(item)
        else:
            orphaned.append(item)
    
    print(f"\n{'='*80}")
    print("RESULTS")
    print(f"{'='*80}")
    print(f"✅ Valid items (on current invoices): {len(valid)}")
    print(f"❌ Orphaned items (not on any current invoice): {len(orphaned)}")
    
    if orphaned:
        print(f"\n{'='*80}")
        print(f"ORPHANED ITEMS ({len(orphaned)})")
        print(f"{'='*80}")
        for item in orphaned:
            print(f"   ❌ {item['name']}")
        
        # Ask for confirmation
        print(f"\n{'='*80}")
        response = input(f"\n⚠️  Delete these {len(orphaned)} orphaned items? (yes/no): ").strip().lower()
        
        if response == "yes":
            print("\n🗑️  Deleting orphaned items...")
            orphaned_ids = [item["id"] for item in orphaned]
            
            # Delete in batches of 100
            batch_size = 100
            for i in range(0, len(orphaned_ids), batch_size):
                batch = orphaned_ids[i:i+batch_size]
                supabase.table("inventory_items").delete().in_("id", batch).execute()
                print(f"   Deleted batch {i//batch_size + 1} ({len(batch)} items)")
            
            print(f"\n✅ Deleted {len(orphaned)} orphaned inventory items")
            
            # Verify
            verify_result = supabase.table("inventory_items").select(
                "id"
            ).eq("user_id", user_id).execute()
            remaining = len(verify_result.data or [])
            print(f"✅ {remaining} inventory items remaining (should be {len(valid)})")
        else:
            print("\n❌ Deletion cancelled")
    else:
        print("\n✅ No orphaned items found! All inventory items are on current invoices.")

if __name__ == "__main__":
    asyncio.run(cleanup_orphaned_items())
