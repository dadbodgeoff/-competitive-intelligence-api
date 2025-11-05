# Invoice Parsing Prompt for Gemini

You are parsing a food service distributor invoice. Extract all data accurately.

## OUTPUT
JSON with this exact structure:

```json
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "vendor_name": "string",
  "line_items": [
    {
      "item_number": "string",
      "description": "string",
      "quantity": number,
      "pack_size": "string",
      "unit_price": number,
      "extended_price": number,
      "category": "string"
    }
  ],
  "subtotal": number,
  "tax": number,
  "total": number
}
```

## LINE ITEMS
Each item object:
- **item_number**: string (5-6 digits, e.g., "519229"; empty "" if none)
- **description**: string (full product name, may span multiple lines)
- **quantity**: number (**NEVER 0 unless truly $0 line**)
- **pack_size**: string (see Pack Size Rules below)
- **unit_price**: number (per pack, 2-4 decimals)
- **extended_price**: number (quantity × unit_price, 2 decimals)
- **category**: string (see Category Rules below)

### Pack Size Rules - CRITICAL
**Extract pack_size EXACTLY as shown on invoice, then normalize:**

1. **Look at the pack size column** - it may show fractions in boxes (e.g., "5" over "3 LB")
2. **If you see numbers stacked vertically in a box, it's a fraction:** "5" over "3 LB" means "5/3 LB"
3. **Normalize to SPACE-SEPARATED format:** [count] [size] [unit]
   
   **Examples:**
   - "6/10 OZ" → "6 10 OZ"
   - "12/3 CT" → "12 3 CT"  
   - "5/3 LB" → "5 3 LB" (even if shown as "5" over "3 LB" in a box)
   - "2/5 LB" → "2 5 LB" (even if shown as "2" over "5 LB" in a box)
   - "12x2 LB" → "12 2 LB"
   - "24 CT" → "24 CT"
   - "#10 can" → "1 10 CAN"
   
4. **CRITICAL: Do NOT concatenate adjacent numbers**
   - WRONG: "5" over "3 LB" → "53 LB" ❌
   - RIGHT: "5" over "3 LB" → "5 3 LB" ✅
   
5. **If unclear or missing:** Use empty string ""

**Common units:** LB, OZ, GA, QT, PT, CT, EA, DZ, CAN

### Quantity Rules - CRITICAL
**If quantity is unclear:**
1. Check if you can calculate: **quantity = extended_price ÷ unit_price**
2. Example: Unit=$50, Extended=$200 → quantity=4
3. **NEVER output 0** unless line is truly $0

### Category Rules
Use these EXACT values (lowercase):
- **"dry_goods"** (default for shelf-stable items, canned goods, dry ingredients)
- **"refrigerated"** (dairy, fresh meat, produce, eggs)
- **"frozen"** (frozen foods, ice cream)

### Extraction Rules
- Extract ONLY actual product lines
- Skip section headers like "** DRY **" or "** REFRIGERATED **"
- Skip summary rows, page headers/footers
- **Include surcharges/fees** as line items (e.g., "DELIVERY FEE", "FUEL SURCHARGE")
- Preserve brand names and product specifications in description

## EXAMPLES

**Example 1 - Simple:**
```
Invoice: "468398  10  24 8 OZ  BEEF PATTY  56.65  566.50"
Think: Pack="24 8 OZ" (already normalized), Qty=10 (clear), Category=refrigerated (meat)
```
Output:
```json
{
  "item_number": "468398",
  "description": "BEEF PATTY",
  "quantity": 10,
  "pack_size": "24 8 OZ",
  "unit_price": 56.65,
  "extended_price": 566.50,
  "category": "refrigerated"
}
```

**Example 2 - Normalize Pack Size:**
```
Invoice: "12345  2  6/10OZ  TOMATO SAUCE  3.00  6.00"
Think: Pack="6/10OZ" → normalize to "6 10 OZ", Qty=2 (clear), Category=dry_goods
```
Output:
```json
{
  "item_number": "12345",
  "description": "TOMATO SAUCE",
  "quantity": 2,
  "pack_size": "6 10 OZ",
  "unit_price": 3.00,
  "extended_price": 6.00,
  "category": "dry_goods"
}
```

**Example 3 - Calculate Quantity:**
```
Invoice: "67890  ??  12x2LB  FLOUR  5.00  20.00"
Think: Qty unclear → Calculate: $20÷$5=4. Pack="12x2LB" → "12 2 LB"
```
Output:
```json
{
  "item_number": "67890",
  "description": "FLOUR",
  "quantity": 4,
  "pack_size": "12 2 LB",
  "unit_price": 5.00,
  "extended_price": 20.00,
  "category": "dry_goods"
}
```

**Example 4 - Stacked Numbers in Box:**
```
Invoice: Item shows "5" on top line, "3 LB" on bottom line in pack size box
Think: Numbers stacked vertically = fraction → "5/3 LB" → normalize to "5 3 LB"
       NOT "53 LB" (concatenating is WRONG)
```
Output:
```json
{
  "item_number": "468398",
  "description": "BEEF PATTY",
  "quantity": 10,
  "pack_size": "5 3 LB",
  "unit_price": 56.65,
  "extended_price": 566.50,
  "category": "refrigerated"
}
```

## IMPORTANT
- Return ONLY valid JSON, no markdown blocks
- Think through pack_size normalization before outputting
- Calculate quantity if unclear but prices are present
- Use exact category values: "dry_goods", "refrigerated", "frozen"
- Ensure all numbers are numeric types, not strings
- Dates must be YYYY-MM-DD format
