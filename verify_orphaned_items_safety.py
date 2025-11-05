"""
Verify Orphaned Items Safety Check
1. Check if orphaned items have any pricing data
2. Explain the 106 invoice items vs 65 inventory items difference
"""
import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CURRENT_INVOICES = [
    "3325130", "3321610", "SYS-789456", "3314501", "3312838",
    "3308808", "3302546", "3295841", "3293561"
]

async def verify_safety():
    print("=" * 80)
    print("ORPHANED ITEMS SAFETY VERIFICATION")
    print("=" * 80)
    
    user_id = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"
    
    # Get current invoice IDs
    invoices_result = supabase.table("invoices").select(
        "id, invoice_number"
    ).eq("user_id", user_id).execute()
    
    all_invoices = invoices_result.data or []
    current_invoice_ids = [inv["id"] for inv in all_invoices if inv["invoice_number"] in CURRENT_INVOICES]
    
    # Get items from current invoices
    invoice_items_result = supabase.table("invoice_items").select(
        "description"
    ).in_("invoice_id", current_invoice_ids).execute()
    
    current_item_names = set(item["description"] for item in invoice_items_result.data or [])
    
    # Get all inventory items
    inventory_result = supabase.table("inventory_items").select(
        "id, name, average_unit_cost, last_purchase_price, last_purchase_date, current_quantity"
    ).eq("user_id", user_id).execute()
    
    inventory_items = inventory_result.data or []
    
    # Separate orphaned vs valid
    orphaned = []
    valid = []
    
    for item in inventory_items:
        if item["name"] in current_item_names:
            valid.append(item)
        else:
            orphaned.append(item)
    
    print(f"\n📊 INVENTORY BREAKDOWN:")
    print(f"   Total inventory items: {len(inventory_items)}")
    print(f"   ✅ Valid (on current invoices): {len(valid)}")
    print(f"   ❌ Orphaned (not on current invoices): {len(orphaned)}")
    
    # Check orphaned items for pricing data
    print(f"\n{'='*80}")
    print("ORPHANED ITEMS PRICING CHECK")
    print(f"{'='*80}")
    
    has_pricing = []
    no_pricing = []
    
    for item in orphaned:
        avg_cost = float(item.get("average_unit_cost") or 0)
        last_price = float(item.get("last_purchase_price") or 0)
        
        if avg_cost > 0 or last_price > 0:
            has_pricing.append({
                "name": item["name"],
                "avg_cost": avg_cost,
                "last_price": last_price,
                "last_date": item.get("last_purchase_date")
            })
        else:
            no_pricing.append(item["name"])
    
    print(f"\n❌ Orphaned items WITH pricing data: {len(has_pricing)}")
    if has_pricing:
        print("\n⚠️  WARNING: These items have pricing but aren't on current invoices:")
        for item in has_pricing[:10]:  # Show first 10
            print(f"   • {item['name']}")
            print(f"     Avg: ${item['avg_cost']:.2f}, Last: ${item['last_price']:.2f}, Date: {item['last_date']}")
        if len(has_pricing) > 10:
            print(f"   ... and {len(has_pricing) - 10} more")
    
    print(f"\n✅ Orphaned items WITHOUT pricing: {len(no_pricing)}")
    print("   (Safe to delete - no pricing data)")
    
    # Explain the 106 vs 65 difference
    print(f"\n{'='*80}")
    print("INVOICE ITEMS vs INVENTORY ITEMS DIFFERENCE")
    print(f"{'='*80}")
    
    # Count total invoice items
    all_invoice_items = supabase.table("invoice_items").select(
        "description"
    ).in_("invoice_id", current_invoice_ids).execute()
    
    total_invoice_items = len(all_invoice_items.data or [])
    unique_invoice_items = len(set(item["description"] for item in all_invoice_items.data or []))
    
    print(f"\n📋 Invoice Items (from 9 invoices):")
    print(f"   Total line items: {total_invoice_items}")
    print(f"   Unique items: {unique_invoice_items}")
    
    print(f"\n📦 Inventory Items:")
    print(f"   Total: {len(inventory_items)}")
    print(f"   Valid (on current invoices): {len(valid)}")
    print(f"   Orphaned (old test data): {len(orphaned)}")
    
    print(f"\n💡 EXPLANATION:")
    print(f"   • {total_invoice_items} total line items across 9 invoices")
    print(f"   • {unique_invoice_items} unique items (same item appears on multiple invoices)")
    print(f"   • {len(valid)} inventory items created from those unique items")
    print(f"   • {len(orphaned)} orphaned items from old test invoices (not in current 9)")
    
    # Check for duplicates
    print(f"\n{'='*80}")
    print("DUPLICATE CHECK")
    print(f"{'='*80}")
    
    from collections import Counter
    name_counts = Counter(item["name"] for item in inventory_items)
    duplicates = {name: count for name, count in name_counts.items() if count > 1}
    
    if duplicates:
        print(f"\n⚠️  Found {len(duplicates)} duplicate inventory items:")
        for name, count in list(duplicates.items())[:5]:
            print(f"   • {name}: {count} copies")
    else:
        print("\n✅ No duplicate inventory items found")
    
    # RECOMMENDATION
    print(f"\n{'='*80}")
    print("SAFETY RECOMMENDATION")
    print(f"{'='*80}")
    
    if has_pricing:
        print(f"\n⚠️  CAUTION: {len(has_pricing)} orphaned items have pricing data")
        print("   These might be from old invoices that were deleted.")
        print("   Review them before deleting to ensure they're truly obsolete.")
        print(f"\n   Safe to delete: {len(no_pricing)} items with no pricing")
        print(f"   Review first: {len(has_pricing)} items with pricing")
    else:
        print(f"\n✅ SAFE TO DELETE: All {len(orphaned)} orphaned items have no pricing data")
        print("   These are ghost records from early testing.")

if __name__ == "__main__":
    asyncio.run(verify_safety())
