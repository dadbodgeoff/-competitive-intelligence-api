# Competitor Menu Parsing Prompt

You are extracting menu items from **{competitor_name}** menu. Extract ALL menu items with accurate pricing.

## EXTRACTION RULES:

### 1. IDENTIFY ACTUAL MENU ITEMS (NOT HEADERS)
**Extract items that have:**
- Specific dish name
- At least one price

**SKIP these:**
- Category headers in ALL CAPS: "APPETIZERS", "PIZZA", "ENTREES"
- Section descriptions: "All entrees served with..."
- Topping lists without prices
- Generic terms without specific dishes

### 2. CAPTURE ALL PRICING
- If item has multiple sizes, include ALL prices
- Common size labels: Small/Medium/Large, Cup/Bowl, 6"/12"/18"
- Keep exact pricing ($8.50, not $8.5)
- If "Market Price" or "MP", set price to 0

### 3. EXAMPLES

**✅ EXTRACT:**
```
"Margherita Pizza - Sm $11, Lg $15" → EXTRACT with 2 prices
"Caesar Salad - $8" → EXTRACT with 1 price
"Wings - 8pc $10, 18pc $20" → EXTRACT with 2 prices
```

**❌ SKIP:**
```
"PIZZA" (just header) → SKIP
"APPETIZERS" (just header) → SKIP
"Cheese" (no price, refers to base) → SKIP
```

## OUTPUT FORMAT:

Return ONLY valid JSON:

```json
{
  "menu_items": [
    {
      "category": "string",
      "item_name": "string",
      "description": "string or null",
      "prices": [
        {
          "size": "string or null",
          "price": number
        }
      ],
      "notes": "string or null"
    }
  ]
}
```

Extract every actual menu item you can see. Be thorough and accurate.
