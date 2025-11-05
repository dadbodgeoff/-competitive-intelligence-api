"""
Comprehensive audit of 10 real invoices for nrivikings8@gmail.com
Checks for data quality, edge cases, and silent errors
"""
import os
from supabase import create_client
from dotenv import load_dotenv
from collections import defaultdict
import json

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

USER_ID = "7a8e9f71-ca9f-46af-8694-41b5e52464ab"

print("=" * 80)
print("COMPREHENSIVE 10-INVOICE AUDIT")
print("=" * 80)
print()

# 1. Get all invoices
invoices = supabase.table("invoices").select("*").eq("user_id", USER_ID).order("created_at.desc").execute()
print(f"📋 Total Invoices: {len(invoices.data)}")
print()

# 2. Basic stats
print("=" * 80)
print("INVOICE OVERVIEW")
print("=" * 80)
for i, inv in enumerate(invoices.data, 1):
    print(f"{i}. Invoice #{inv['invoice_number']} - {inv['vendor_name']}")
    print(f"   Date: {inv['invoice_date']} | Total: ${inv['total']:.2f} | Status: {inv['status']}")
    print(f"   Parse: {inv['parse_method']} | Cost: ${inv.get('parse_cost', 0):.4f} | Time: {inv.get('parse_time_seconds', 0)}s")
print()

# 3. Get all invoice items
all_items = []
for inv in invoices.data:
    items = supabase.table("invoice_items").select("*").eq("invoice_id", inv['id']).execute()
    all_items.extend([(inv['invoice_number'], item) for item in items.data])

print("=" * 80)
print("LINE ITEMS ANALYSIS")
print("=" * 80)
print(f"📦 Total Line Items: {len(all_items)}")
print()

# 4. Data quality checks
issues = []

# Check for suspicious pack sizes
print("🔍 PACK SIZE QUALITY CHECK")
print("-" * 80)
suspicious_packs = []
for inv_num, item in all_items:
    pack = item.get('pack_size', '')
    if pack:
        # Check for concatenated numbers (e.g., "53 LB" instead of "5 3 LB")
        parts = pack.split()
        if len(parts) == 2 and parts[0].isdigit() and len(parts[0]) > 2:
            suspicious_packs.append((inv_num, item['description'][:40], pack))
        # Check for missing spaces
        if '/' in pack or 'x' in pack.lower():
            suspicious_packs.append((inv_num, item['description'][:40], pack))

if suspicious_packs:
    print(f"⚠️  Found {len(suspicious_packs)} suspicious pack sizes:")
    for inv_num, desc, pack in suspicious_packs[:10]:
        print(f"   Invoice #{inv_num}: {desc:<40} → '{pack}'")
else:
    print("✅ All pack sizes look good")
print()

# Check for zero quantities
print("🔍 QUANTITY QUALITY CHECK")
print("-" * 80)
zero_qty = [(inv_num, item['description'][:40], item['quantity']) 
            for inv_num, item in all_items if item['quantity'] == 0]
if zero_qty:
    print(f"⚠️  Found {len(zero_qty)} items with zero quantity:")
    for inv_num, desc, qty in zero_qty[:10]:
        print(f"   Invoice #{inv_num}: {desc}")
else:
    print("✅ No zero quantities found")
print()

# Check for price mismatches
print("🔍 PRICE CALCULATION CHECK")
print("-" * 80)
price_mismatches = []
for inv_num, item in all_items:
    calc_extended = round(item['quantity'] * item['unit_price'], 2)
    actual_extended = item['extended_price']
    diff = abs(calc_extended - actual_extended)
    if diff > 0.02:  # Allow 2 cent rounding difference
        price_mismatches.append((inv_num, item['description'][:40], 
                                calc_extended, actual_extended, diff))

if price_mismatches:
    print(f"⚠️  Found {len(price_mismatches)} price calculation mismatches:")
    for inv_num, desc, calc, actual, diff in price_mismatches[:10]:
        print(f"   Invoice #{inv_num}: {desc}")
        print(f"      Calculated: ${calc:.2f} | Actual: ${actual:.2f} | Diff: ${diff:.2f}")
else:
    print("✅ All price calculations match")
print()

# Check for missing data
print("🔍 MISSING DATA CHECK")
print("-" * 80)
missing_item_numbers = sum(1 for _, item in all_items if not item.get('item_number'))
missing_pack_sizes = sum(1 for _, item in all_items if not item.get('pack_size'))
missing_categories = sum(1 for _, item in all_items if not item.get('category'))

print(f"Missing item numbers: {missing_item_numbers}/{len(all_items)}")
print(f"Missing pack sizes: {missing_pack_sizes}/{len(all_items)}")
print(f"Missing categories: {missing_categories}/{len(all_items)}")
print()

# Category distribution
print("🔍 CATEGORY DISTRIBUTION")
print("-" * 80)
categories = defaultdict(int)
for _, item in all_items:
    cat = item.get('category', 'unknown')
    categories[cat] += 1

for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
    pct = (count / len(all_items) * 100)
    print(f"   {cat:<20} {count:>4} items ({pct:>5.1f}%)")
print()

# Vendor analysis
print("🔍 VENDOR ANALYSIS")
print("-" * 80)
vendors = defaultdict(int)
for inv in invoices.data:
    vendors[inv['vendor_name']] += 1

for vendor, count in sorted(vendors.items(), key=lambda x: x[1], reverse=True):
    print(f"   {vendor:<40} {count} invoices")
print()

# Parse performance
print("🔍 PARSE PERFORMANCE")
print("-" * 80)
parse_times = [inv.get('parse_time_seconds', 0) for inv in invoices.data if inv.get('parse_time_seconds')]
parse_costs = [inv.get('parse_cost', 0) for inv in invoices.data if inv.get('parse_cost')]

if parse_times:
    print(f"Average parse time: {sum(parse_times)/len(parse_times):.1f}s")
    print(f"Min: {min(parse_times)}s | Max: {max(parse_times)}s")
if parse_costs:
    print(f"Average parse cost: ${sum(parse_costs)/len(parse_costs):.4f}")
    print(f"Total cost: ${sum(parse_costs):.4f}")
print()

# Check for duplicates
print("🔍 DUPLICATE CHECK")
print("-" * 80)
invoice_keys = [(inv['invoice_number'], inv['vendor_name'], inv['invoice_date']) 
                for inv in invoices.data]
duplicates = [key for key in invoice_keys if invoice_keys.count(key) > 1]
if duplicates:
    print(f"⚠️  Found {len(set(duplicates))} duplicate invoices:")
    for key in set(duplicates):
        print(f"   Invoice #{key[0]} - {key[1]} - {key[2]}")
else:
    print("✅ No duplicates found")
print()

# Summary
print("=" * 80)
print("📊 SUMMARY")
print("=" * 80)
print()

total_issues = len(suspicious_packs) + len(zero_qty) + len(price_mismatches) + len(duplicates)

if total_issues == 0:
    print("🎉 EXCELLENT! No issues found in 10 invoices")
    print(f"   • {len(all_items)} line items processed successfully")
    print(f"   • All prices calculated correctly")
    print(f"   • All pack sizes normalized properly")
    print(f"   • No duplicates")
else:
    print(f"⚠️  Found {total_issues} potential issues:")
    if suspicious_packs:
        print(f"   • {len(suspicious_packs)} suspicious pack sizes")
    if zero_qty:
        print(f"   • {len(zero_qty)} zero quantities")
    if price_mismatches:
        print(f"   • {len(price_mismatches)} price mismatches")
    if duplicates:
        print(f"   • {len(set(duplicates))} duplicates")

print()
print("💰 COST ANALYSIS:")
print(f"   • Total parsing cost: ${sum(parse_costs):.4f}")
print(f"   • Average per invoice: ${sum(parse_costs)/len(parse_costs):.4f}")
print(f"   • Average per item: ${sum(parse_costs)/len(all_items):.6f}")

print()
print("=" * 80)

# Save detailed report
report = {
    'total_invoices': len(invoices.data),
    'total_items': len(all_items),
    'suspicious_pack_sizes': len(suspicious_packs),
    'zero_quantities': len(zero_qty),
    'price_mismatches': len(price_mismatches),
    'duplicates': len(set(duplicates)),
    'categories': dict(categories),
    'vendors': dict(vendors),
    'avg_parse_time': sum(parse_times)/len(parse_times) if parse_times else 0,
    'total_cost': sum(parse_costs)
}

with open('invoice_audit_report.json', 'w') as f:
    json.dump(report, f, indent=2)

print("📄 Detailed report saved to: invoice_audit_report.json")
print()
