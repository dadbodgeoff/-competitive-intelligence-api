"""
Audit Inventory Item Conversions
Shows which items are converting correctly vs returning $0
"""
import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from services.unit_converter import UnitConverter
from decimal import Decimal
import json

load_dotenv()

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

converter = UnitConverter()

async def audit_all_inventory():
    """Pull all inventory items and test conversion"""
    
    print("=" * 80)
    print("INVENTORY CONVERSION AUDIT")
    print("=" * 80)
    
    # Get user ID (replace with your actual user ID)
    user_id = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"
    
    # Get all inventory items
    inv_result = supabase.table("inventory_items").select(
        "id, name, unit_of_measure, average_unit_cost"
    ).eq("user_id", user_id).execute()
    
    items = inv_result.data or []
    print(f"\n📦 Found {len(items)} inventory items\n")
    
    success_count = 0
    fail_count = 0
    results = []
    
    for item in items:
        print(f"\n{'='*80}")
        print(f"🔍 {item['name']}")
        print(f"{'='*80}")
        
        # Get most recent invoice item
        invoice_result = supabase.table("invoice_items").select(
            "pack_size, unit_price, created_at"
        ).eq("description", item["name"]).order(
            "created_at", desc=True
        ).limit(1).execute()
        
        result = {
            "name": item["name"],
            "inventory_unit": item["unit_of_measure"],
            "average_cost": float(item.get("average_unit_cost") or 0),
            "has_invoice_data": False,
            "pack_size": None,
            "pack_price": None,
            "calculated_unit_cost": None,
            "base_unit": None,
            "unit_cost_per_piece": None,
            "status": "❌ FAIL",
            "error": None
        }
        
        if not invoice_result.data:
            result["error"] = "No invoice data found"
            print(f"   ❌ No invoice data found")
            fail_count += 1
        else:
            invoice_item = invoice_result.data[0]
            pack_size = invoice_item.get("pack_size")
            pack_price = float(invoice_item.get("unit_price") or 0)
            
            result["has_invoice_data"] = True
            result["pack_size"] = pack_size
            result["pack_price"] = pack_price
            
            print(f"   📋 Pack Size: {pack_size}")
            print(f"   💰 Pack Price: ${pack_price:.2f}")
            
            if not pack_size:
                result["error"] = "Pack size is null"
                print(f"   ❌ Pack size is null")
                fail_count += 1
            elif pack_price <= 0:
                result["error"] = "Pack price is $0 or negative"
                print(f"   ❌ Pack price is $0 or negative")
                fail_count += 1
            else:
                # Try to parse and convert
                try:
                    parsed = converter.parse_pack_size(pack_size)
                    if not parsed:
                        result["error"] = f"Could not parse pack size: {pack_size}"
                        print(f"   ❌ Could not parse pack size")
                        fail_count += 1
                    else:
                        print(f"   ✅ Parsed: count={parsed['count']}, size={parsed['size']}, unit={parsed['unit']}, type={parsed['type']}")
                        
                        # Calculate unit costs
                        unit_cost_weight, weight_unit, unit_cost_piece, error = converter.calculate_unit_cost_from_pack(
                            Decimal(str(pack_price)),
                            pack_size
                        )
                        
                        if error:
                            result["error"] = error
                            print(f"   ❌ Calculation error: {error}")
                            fail_count += 1
                        else:
                            if unit_cost_weight:
                                result["calculated_unit_cost"] = float(unit_cost_weight)
                                result["base_unit"] = weight_unit
                                print(f"   ✅ Unit Cost (weight): ${unit_cost_weight:.4f}/{weight_unit}")
                            
                            if unit_cost_piece:
                                result["unit_cost_per_piece"] = float(unit_cost_piece)
                                print(f"   ✅ Unit Cost (piece): ${unit_cost_piece:.4f}/ea")
                            
                            if unit_cost_weight or unit_cost_piece:
                                result["status"] = "✅ SUCCESS"
                                success_count += 1
                            else:
                                result["error"] = "No unit cost calculated"
                                print(f"   ❌ No unit cost calculated")
                                fail_count += 1
                
                except Exception as e:
                    result["error"] = str(e)
                    print(f"   ❌ Exception: {e}")
                    fail_count += 1
        
        results.append(result)
    
    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"📊 Success Rate: {(success_count / len(items) * 100):.1f}%")
    
    # Show failures
    failures = [r for r in results if r["status"] == "❌ FAIL"]
    if failures:
        print(f"\n{'='*80}")
        print(f"FAILED ITEMS ({len(failures)})")
        print(f"{'='*80}")
        for f in failures:
            print(f"\n❌ {f['name']}")
            print(f"   Pack Size: {f['pack_size']}")
            print(f"   Pack Price: ${f['pack_price']:.2f}" if f['pack_price'] else "   Pack Price: None")
            print(f"   Error: {f['error']}")
    
    # Show successes
    successes = [r for r in results if r["status"] == "✅ SUCCESS"]
    if successes:
        print(f"\n{'='*80}")
        print(f"SUCCESSFUL ITEMS ({len(successes)})")
        print(f"{'='*80}")
        for s in successes:
            print(f"\n✅ {s['name']}")
            print(f"   Pack: {s['pack_size']} @ ${s['pack_price']:.2f}")
            if s['calculated_unit_cost']:
                print(f"   Cost: ${s['calculated_unit_cost']:.4f}/{s['base_unit']}")
            if s['unit_cost_per_piece']:
                print(f"   Cost: ${s['unit_cost_per_piece']:.4f}/ea")
    
    # Save to JSON
    with open("inventory_conversion_audit.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Full results saved to: inventory_conversion_audit.json")

if __name__ == "__main__":
    asyncio.run(audit_all_inventory())
