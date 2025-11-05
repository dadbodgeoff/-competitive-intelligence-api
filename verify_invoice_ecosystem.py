#!/usr/bin/env python3
"""
Invoice Ecosystem Verification Script
Verifies that invoice #1277265 went through complete pricing ecosystem
"""
import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

def main():
    # Connect to Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found")
        return
    
    client = create_client(supabase_url, supabase_key)
    
    print("=" * 80)
    print("INVOICE #1277265 - COMPLETE ECOSYSTEM VERIFICATION")
    print("=" * 80)
    print()
    
    # 1. Find the invoice
    print("1️⃣  INVOICE HEADER")
    print("-" * 80)
    invoice_result = client.table("invoices").select("*").ilike(
        "vendor_name", "%sysco%intermountain%"
    ).eq("invoice_number", "1277265").order("created_at", desc=True).limit(1).execute()
    
    if not invoice_result.data:
        print("❌ Invoice not found!")
        return
    
    invoice = invoice_result.data[0]
    invoice_id = invoice['id']
    user_id = invoice['user_id']
    
    print(f"✅ Invoice ID: {invoice_id}")
    print(f"   Vendor: {invoice['vendor_name']}")
    print(f"   Number: {invoice['invoice_number']}")
    print(f"   Date: {invoice['invoice_date']}")
    print(f"   Total: ${invoice['total']}")
    print(f"   Status: {invoice['status']}")
    print(f"   Parse Method: {invoice['parse_method']}")
    print(f"   Parse Time: {invoice['parse_time_seconds']}s")
    print(f"   Parse Cost: ${invoice['parse_cost']}")
    print()
    
    # 2. Line Items
    print("2️⃣  LINE ITEMS")
    print("-" * 80)
    items_result = client.table("invoice_items").select("*").eq(
        "invoice_id", invoice_id
    ).execute()
    
    line_items = items_result.data
    print(f"✅ Found {len(line_items)} line items")
    for i, item in enumerate(line_items, 1):
        print(f"   {i}. {item['description'][:50]}")
        print(f"      Qty: {item['quantity']} × ${item['unit_price']} = ${item['extended_price']}")
    print()
    
    # 3. Vendor
    print("3️⃣  VENDOR RECORD")
    print("-" * 80)
    vendor_result = client.table("vendors").select("*").eq(
        "normalized_name", "sysco intermountain"
    ).execute()
    
    if vendor_result.data:
        vendor = vendor_result.data[0]
        vendor_id = vendor['id']
        print(f"✅ Vendor ID: {vendor_id}")
        print(f"   Name: {vendor['name']}")
        print(f"   Type: {vendor['vendor_type']}")
    else:
        print("❌ Vendor not found!")
        return
    print()
    
    # 4. Vendor Item Mappings (Fuzzy Matching)
    print("4️⃣  VENDOR ITEM MAPPINGS (Fuzzy Matching)")
    print("-" * 80)
    
    item_numbers = [item['item_number'] for item in line_items if item['item_number']]
    
    mappings_result = client.table("vendor_item_mappings").select(
        "*, inventory_items(name)"
    ).eq("vendor_id", vendor_id).in_("vendor_item_number", item_numbers).execute()
    
    mappings = mappings_result.data
    print(f"✅ Found {len(mappings)} mappings")
    for mapping in mappings:
        print(f"   {mapping['vendor_item_number']}: {mapping['vendor_description'][:40]}")
        print(f"      → {mapping['inventory_items']['name']}")
        confidence = mapping.get('confidence_score', 'N/A')
        method = mapping.get('mapping_method', 'N/A')
        print(f"      Confidence: {confidence}, Method: {method}")
    print()
    
    # 5. Inventory Items
    print("5️⃣  INVENTORY ITEMS")
    print("-" * 80)
    inventory_item_ids = [m['inventory_item_id'] for m in mappings]
    
    inventory_result = client.table("inventory_items").select("*").in_(
        "id", inventory_item_ids
    ).execute()
    
    inventory_items = inventory_result.data
    print(f"✅ Found {len(inventory_items)} inventory items")
    for item in inventory_items:
        print(f"   {item['name']}")
        print(f"      Current Qty: {item['current_quantity']} {item['unit_of_measure']}")
        print(f"      Category: {item['category']}")
    print()
    
    # 6. Inventory Transactions
    print("6️⃣  INVENTORY TRANSACTIONS")
    print("-" * 80)
    transactions_result = client.table("inventory_transactions").select(
        "*, inventory_items(name)"
    ).eq("reference_id", invoice_id).eq("reference_type", "invoice").execute()
    
    transactions = transactions_result.data
    print(f"✅ Found {len(transactions)} transactions")
    total_value = 0
    for txn in transactions:
        print(f"   {txn['inventory_items']['name'][:40]}")
        qty_change = txn['quantity_change']
        running_bal = txn['running_balance']
        print(f"      Qty Change: {qty_change:+.2f} → Balance: {running_bal:.2f}")
        if txn.get('unit_cost') and txn.get('total_cost'):
            print(f"      Cost: ${txn['unit_cost']} × {abs(qty_change)} = ${txn['total_cost']}")
            total_value += float(txn['total_cost'])
    print(f"   Total Value Added: ${total_value:.2f}")
    print()
    
    # 7. Price History
    print("7️⃣  PRICE HISTORY")
    print("-" * 80)
    price_result = client.table("price_history").select(
        "*, inventory_items(name)"
    ).eq("invoice_id", invoice_id).execute()
    
    prices = price_result.data
    print(f"✅ Found {len(prices)} price records")
    for price in prices:
        print(f"   {price['inventory_items']['name'][:40]}")
        print(f"      Unit Price: ${price['unit_price']}")
        if price.get('price_per_base_unit'):
            print(f"      Per Base Unit: ${price['price_per_base_unit']}")
    print()
    
    # 8. Price Changes
    print("8️⃣  PRICE CHANGES")
    print("-" * 80)
    
    # Get previous prices for comparison
    for price in prices[:3]:  # Show first 3 for brevity
        item_id = price['inventory_item_id']
        
        # Get previous price
        prev_result = client.table("price_history").select("unit_price").eq(
            "inventory_item_id", item_id
        ).eq("vendor_id", vendor_id).lt(
            "invoice_date", invoice['invoice_date']
        ).order("invoice_date", desc=True).limit(1).execute()
        
        if prev_result.data:
            prev_price = prev_result.data[0]['unit_price']
            current_price = price['unit_price']
            change = ((current_price - prev_price) / prev_price * 100)
            
            print(f"   {price['inventory_items']['name'][:40]}")
            print(f"      ${prev_price} → ${current_price} ({change:+.1f}%)")
        else:
            print(f"   {price['inventory_items']['name'][:40]}")
            print(f"      ${price['unit_price']} (first price)")
    print()
    
    # 9. Inventory Alerts
    print("9️⃣  INVENTORY ALERTS")
    print("-" * 80)
    # Try to find alerts related to this invoice (may use different field names)
    try:
        alerts_result = client.table("inventory_alerts").select("*").eq(
            "invoice_id", invoice_id
        ).execute()
    except:
        # Fallback: get recent alerts for this user
        alerts_result = client.table("inventory_alerts").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(10).execute()
    
    alerts = alerts_result.data
    if alerts:
        print(f"✅ Found {len(alerts)} alerts")
        for alert in alerts:
            severity_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(
                alert['severity'], "⚪"
            )
            print(f"   {severity_emoji} {alert['alert_type']}: {alert['title']}")
            print(f"      {alert['message']}")
    else:
        print("✅ No alerts generated (all prices normal)")
    print()
    
    # 10. Processed Events
    print("🔟 PROCESSED EVENTS (Idempotency)")
    print("-" * 80)
    processed_result = client.table("processed_events").select("*").eq(
        "event_id", invoice_id
    ).eq("event_type", "invoice_saved").execute()
    
    if processed_result.data:
        event = processed_result.data[0]
        print(f"✅ Processing complete")
        print(f"   Result: {event['processing_result']}")
        print(f"   Processed At: {event['processed_at']}")
    else:
        print("❌ Not marked as processed!")
    print()
    
    # Summary
    print("=" * 80)
    print("ECOSYSTEM VERIFICATION SUMMARY")
    print("=" * 80)
    
    checks = [
        ("Invoice Saved", bool(invoice)),
        ("Line Items Created", len(line_items) > 0),
        ("Vendor Identified", bool(vendor_result.data)),
        ("Items Mapped (Fuzzy)", len(mappings) > 0),
        ("Inventory Updated", len(transactions) > 0),
        ("Prices Tracked", len(prices) > 0),
        ("Processing Complete", bool(processed_result.data)),
    ]
    
    all_passed = True
    for check_name, passed in checks:
        status = "✅" if passed else "❌"
        print(f"{status} {check_name}")
        if not passed:
            all_passed = False
    
    print()
    if all_passed:
        print("🎉 ALL CHECKS PASSED - Invoice fully integrated into ecosystem!")
    else:
        print("⚠️  SOME CHECKS FAILED - Review above for details")
    print()
    
    # Export summary
    summary = {
        "invoice_id": invoice_id,
        "invoice_number": invoice['invoice_number'],
        "vendor": invoice['vendor_name'],
        "total": float(invoice['total']),
        "line_items_count": len(line_items),
        "mappings_count": len(mappings),
        "transactions_count": len(transactions),
        "prices_tracked": len(prices),
        "alerts_count": len(alerts),
        "all_checks_passed": all_passed,
        "verified_at": datetime.now().isoformat()
    }
    
    with open(f"invoice_verification_{invoice['invoice_number']}.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"📄 Summary exported to: invoice_verification_{invoice['invoice_number']}.json")


if __name__ == "__main__":
    main()
