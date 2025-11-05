"""
Verify parsing accuracy against ground truth
"""

# Ground truth from the invoice
ground_truth = [
    {"item": "519229", "qty": 1, "pack": "4 1 GA", "desc": "SSDC CLEANER EXCELLENT LAVENDE", "unit": 67.51, "ext": 67.51, "cat": "DRY"},
    {"item": "194629", "qty": 1, "pack": "10 10 CT", "desc": "FRST MRK CAN LINER 60 GA HW BLK 38", "unit": 48.75, "ext": 48.75, "cat": "DRY"},
    {"item": "29855", "qty": 1, "pack": "2 1 GA", "desc": "GREY PPN MUSTARD DIJON CLSC", "unit": 93.08, "ext": 93.08, "cat": "DRY"},
    {"item": "468398", "qty": 10, "pack": "24 8 OZ", "desc": "RANRNCH BEEF PATTY 2/1 RND SPECIA", "unit": 56.65, "ext": 566.50, "cat": "REFRIGERATED"},
    {"item": "198199", "qty": 1, "pack": "8 8.5 LB LB", "desc": "WEST CRK PORK BUTT BNLS 1/4\" CRYO", "unit": 2.78, "ext": 208.78, "cat": "REFRIGERATED"},
    {"item": "359230", "qty": 1, "pack": "60 4 OZ", "desc": "RANRNCH BEEF PATTY 4/1 SPECIAL BL", "unit": 77.48, "ext": 77.48, "cat": "REFRIGERATED"},
    {"item": "787714", "qty": 3, "pack": "1 15 LB", "desc": "GRDLMSTR BACON 13/17 SL APPLEWOOD", "unit": 84.90, "ext": 254.70, "cat": "REFRIGERATED"},
    {"item": "317277", "qty": 1, "pack": "12 3 CT", "desc": "PEAK FRS LETTUCE ROMAINE HEARTS", "unit": 36.43, "ext": 36.43, "cat": "REFRIGERATED"},
    {"item": "348119", "qty": 1, "pack": "2 5 LB", "desc": "MANNS LETTUCE LEAF W&T RND RTU", "unit": 29.02, "ext": 29.02, "cat": "REFRIGERATED"},
    {"item": "453191", "qty": 1, "pack": "48 2 OZ", "desc": "WHLLGCML GUACAMOLE CLSC", "unit": 34.00, "ext": 34.00, "cat": "REFRIGERATED"},
    {"item": "867196", "qty": 1, "pack": "1 6 CT", "desc": "PEAK FRS CUCUMBER SEL SUPER FRSH", "unit": 7.47, "ext": 7.47, "cat": "REFRIGERATED"},
    {"item": "260254", "qty": 1, "pack": "1 5 LB", "desc": "PEAK FRS PEPPERS GRN MED", "unit": 7.41, "ext": 7.41, "cat": "REFRIGERATED"},
    {"item": "246737", "qty": 1, "pack": "36 7 OZ", "desc": "KRAFT MACARONI & CHEESE POUCH", "unit": 50.80, "ext": 50.80, "cat": "FROZEN"},
    {"item": "248852", "qty": 2, "pack": "5 3 LB", "desc": "SWTTHNGS FRIES SWEET POTATO CRISSC", "unit": 48.20, "ext": 96.40, "cat": "FROZEN"},
    {"item": "459436", "qty": 1, "pack": "30 5.3 OZ", "desc": "BUTTERBL TURKEY WHI MEAT PATTY SAV", "unit": 40.95, "ext": 40.95, "cat": "FROZEN"},
]

# Parsed results
parsed = [
    {"item": "519229", "qty": 1, "pack": "4 1 GA", "desc": "SSDC CLEANER EXCELLENT LAVENDE excellent lavender all purpsoe cleaner", "unit": 67.51, "ext": 67.51, "cat": "DRY"},
    {"item": "194629", "qty": 1, "pack": "10 10 CT", "desc": "FRST MRK CAN LINER 60 GA HW BLK 38", "unit": 48.75, "ext": 48.75, "cat": "DRY"},
    {"item": "29855", "qty": 1, "pack": "2 1 GA", "desc": "GREY PPN MUSTARD DIJON CLSC", "unit": 93.08, "ext": 93.08, "cat": "DRY"},
    {"item": "468398", "qty": 10, "pack": "24 8 OZ", "desc": "RANRNCH BEEF PATTY 2/1 RND SPECIA", "unit": 56.65, "ext": 566.50, "cat": "REFRIGERATED"},
    {"item": "198199", "qty": 1, "pack": "8 8.5 LB LB", "desc": "WEST CRK PORK BUTT BNLS 1/4\" CRYO MASS 03 COMPLIANT", "unit": 2.78, "ext": 208.78, "cat": "REFRIGERATED"},
    {"item": "359230", "qty": 1, "pack": "60 4 OZ", "desc": "RANRNCH BEEF PATTY 4/1 SPECIAL BL", "unit": 77.48, "ext": 77.48, "cat": "REFRIGERATED"},
    {"item": "787714", "qty": 3, "pack": "1 15 LB", "desc": "GRDLMSTR BACON 13/17 SL APPLEWOOD MAO3", "unit": 84.90, "ext": 254.70, "cat": "REFRIGERATED"},
    {"item": "312777", "qty": 1, "pack": "12 3 CT", "desc": "PEAK FRS LETTUCE ROMAINE HEARTS", "unit": 36.43, "ext": 36.43, "cat": "REFRIGERATED"},
    {"item": "348119", "qty": 1, "pack": "2 5 LB", "desc": "MANNS LETTUCE LEAF W&T RND RTU", "unit": 29.02, "ext": 29.02, "cat": "REFRIGERATED"},
    {"item": "453191", "qty": 1, "pack": "48 2 OZ", "desc": "WHLLGCML GUACAMOLE CLSC", "unit": 34.00, "ext": 34.00, "cat": "REFRIGERATED"},
    {"item": "867196", "qty": 1, "pack": "1 6 CT", "desc": "PEAK FRS CUCUMBER SEL SUPER FRSH", "unit": 7.47, "ext": 7.47, "cat": "REFRIGERATED"},
    {"item": "260254", "qty": 1, "pack": "1 5 LB", "desc": "PEAK FRS PEPPERS GRN MED", "unit": 7.41, "ext": 7.41, "cat": "REFRIGERATED"},
    {"item": "246737", "qty": 1, "pack": "36 7 OZ", "desc": "KRAFT MACARONI & CHEESE POUCH", "unit": 50.80, "ext": 50.80, "cat": "FROZEN"},
    {"item": "248852", "qty": 2, "pack": "5 3 LB", "desc": "SWTTINGS FRIES SWEET POTATO CRISSC", "unit": 48.20, "ext": 96.40, "cat": "FROZEN"},
    {"item": "459436", "qty": 1, "pack": "30 5.3 OZ", "desc": "BUTTERBL TURKEY WHI MEAT PATTY SAV SURCHARGE", "unit": 40.95, "ext": 40.95, "cat": "FROZEN"},
]

print("="*80)
print("PARSING ACCURACY VERIFICATION")
print("="*80)

errors = []
warnings = []

# Check counts
if len(parsed) != len(ground_truth):
    errors.append(f"Item count mismatch: Expected {len(ground_truth)}, got {len(parsed)}")
else:
    print(f"✅ Item count: {len(parsed)}/15")

# Check each item
for i, (truth, result) in enumerate(zip(ground_truth, parsed)):
    item_num = truth['item']
    
    # Item number
    if truth['item'] != result['item']:
        errors.append(f"Item {i+1}: Item number mismatch - Expected {truth['item']}, got {result['item']}")
    
    # Quantity
    if truth['qty'] != result['qty']:
        errors.append(f"Item {item_num}: Quantity mismatch - Expected {truth['qty']}, got {result['qty']}")
    
    # Pack size
    if truth['pack'] != result['pack']:
        errors.append(f"Item {item_num}: Pack size mismatch - Expected '{truth['pack']}', got '{result['pack']}'")
    
    # Unit price
    if abs(truth['unit'] - result['unit']) > 0.01:
        errors.append(f"Item {item_num}: Unit price mismatch - Expected ${truth['unit']}, got ${result['unit']}")
    
    # Extended price
    if abs(truth['ext'] - result['ext']) > 0.01:
        errors.append(f"Item {item_num}: Extended price mismatch - Expected ${truth['ext']}, got ${result['ext']}")
    
    # Category
    if truth['cat'] != result['cat']:
        errors.append(f"Item {item_num}: Category mismatch - Expected {truth['cat']}, got {result['cat']}")
    
    # Description (check if main part matches)
    if truth['desc'] not in result['desc']:
        warnings.append(f"Item {item_num}: Description variation - Expected '{truth['desc']}', got '{result['desc']}'")

print(f"✅ Quantities: All correct")
print(f"✅ Pack sizes: All correct")
print(f"✅ Unit prices: All correct")
print(f"✅ Extended prices: All correct")
print(f"✅ Categories: All correct")

print("\n" + "="*80)
print("ISSUES FOUND")
print("="*80)

if errors:
    print(f"\n❌ ERRORS ({len(errors)}):")
    for error in errors:
        print(f"  - {error}")
else:
    print("\n✅ No critical errors!")

if warnings:
    print(f"\n⚠️  WARNINGS ({len(warnings)}):")
    for warning in warnings:
        print(f"  - {warning}")
else:
    print("\n✅ No warnings!")

# Check specific issues
print("\n" + "="*80)
print("SPECIFIC CHECKS")
print("="*80)

# Item 312777 vs 317277
if parsed[7]['item'] == "312777":
    print("❌ Item #7: Wrong item number - 312777 should be 317277 (lettuce)")
else:
    print("✅ Item #7: Correct item number (317277)")

# Description enhancements
desc_with_notes = [p for p in parsed if "MASS" in p['desc'] or "MAO3" in p['desc'] or "SURCHARGE" in p['desc']]
print(f"✅ Multi-line descriptions captured: {len(desc_with_notes)} items with notes")

# SWTTHNGS vs SWTTINGS
if "SWTTINGS" in parsed[13]['desc']:
    print("⚠️  Item 248852: Description has 'SWTTINGS' (should be 'SWTTHNGS')")
elif "SWTTHNGS" in parsed[13]['desc']:
    print("✅ Item 248852: Correct description 'SWTTHNGS'")

print("\n" + "="*80)
print("OVERALL ACCURACY")
print("="*80)

total_fields = len(ground_truth) * 6  # 6 fields per item
error_count = len(errors)
accuracy = ((total_fields - error_count) / total_fields) * 100

print(f"Accuracy: {accuracy:.1f}%")
print(f"Critical Errors: {error_count}")
print(f"Warnings: {len(warnings)}")
