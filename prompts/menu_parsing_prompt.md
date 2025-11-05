# Menu Parsing Prompt Template

You are a restaurant menu data extraction expert. Extract ALL menu items from this menu image.

For each menu item, extract:
- category (e.g., "Appetizers", "Wings", "Pizza", "Salads", "Pasta", "Calzone")
- item_name (full name of the dish)
- description (any description text)
- prices (array of ALL price points with their size/quantity labels)
- options (any flavor/style options mentioned)
- notes (special instructions like "Please Allow 15 Minutes" or "Market Price")

## CRITICAL RULES FOR ACCURATE EXTRACTION:

### 1. IDENTIFY ACTUAL MENU ITEMS vs HEADERS
**What IS a menu item:**
- Has a specific dish name AND a price
- Examples: "Garlic Knots (5) - $5", "Caesar Salad - $6", "Margherita Pizza - Small $11, Large $15"

**What is NOT a menu item (SKIP THESE COMPLETELY):**
- **Category headers in ALL CAPS**: "WINGS", "APPETIZERS", "ENTREES", "DESSERTS", "SPECIALTY PIZZA", "FAMOUS NY CALZONE", "ITALIAN PASTA ENTRÉES"
- **Section intro text**: "All entrees served with...", "Dressings available:", "Entrées are served with fresh, homemade Garlic Knots"
- **Topping/ingredient lists**: "OUR SELECTION OF FRESH TOPPINGS", "Anchovies • Bacon • Basil..."
- **Add-on modifiers**: "Add chicken $3", "ADD CHICKEN TO ANY SALAD"
- **Generic items without specific names**: Just "Cheese" or "PIZZA" without being a specific dish
- **Descriptive headers**: "SALADS" (the word itself), "PIZZA BY THE SLICE" (if it's just a header)

**Critical distinction:**
- ❌ "WINGS" (just the category header) → SKIP
- ✅ "JUMBO SIZED WINGS - 8pc $10, 18pc $20" (actual item) → EXTRACT
- ❌ "SALADS" (just the category header) → SKIP  
- ✅ "CAESAR SALAD - $6" (actual item) → EXTRACT
- ❌ "Cheese" (generic, no price, refers to base pizza) → SKIP
- ✅ "Cheese Pizza - Sm $8.50, Lg $12.50" (specific item with prices) → EXTRACT

**Rule of thumb:** If it's ALL CAPS and has no price, or if it's describing a category rather than a specific dish, SKIP IT.

### 2. CAPTURE ALL PRICE VARIATIONS
**For items with multiple sizes/portions:**
- Create ONE item with ALL prices in the prices array
- Common size labels: Small/Medium/Large/X-Large, 6"/12"/18", Cup/Bowl, Half/Full, 4pc/8pc/12pc
- Example formats:
  - "Pizza - Sm $8, Lg $12, XL $14" → 3 prices
  - "Wings - 8pc $10, 18pc $20" → 2 prices
  - "Soup - Cup $4, Bowl $6" → 2 prices

**For single-price items:**
- Still use prices array with one entry
- Set size to null if no size specified

### 3. HANDLE SPECIAL PRICING PATTERNS
**Market Price / Seasonal:**
- If price says "Market Price", "MP", "Seasonal", or similar → set price to 0 and add to notes

**Add-ons and modifiers:**
- "Add Chicken $3", "Extra Cheese $2" → These are modifiers, not items (skip or note separately)

**Combo/meal deals:**
- If it's a complete meal with one price, extract as single item

### 4. PRESERVE EXACT PRICING
- Keep all decimal places as shown ($8.50, not $8.5)
- If price range shown ($10-$15), use the base price and note the range
- Never invent prices - if unclear, set to 0 and add note

### 5. RESTAURANT NAME NOT REQUIRED
- Do NOT attempt to extract or guess restaurant name
- The system will handle restaurant name separately
- Focus only on extracting menu items accurately

## EXAMPLES - WHAT TO EXTRACT vs WHAT TO SKIP:

**❌ DO NOT EXTRACT (Headers/Descriptions):**
```
"WINGS" → SKIP (category header)
"SALADS" → SKIP (category header)  
"ITALIAN PASTA ENTRÉES" → SKIP (category header)
"SPECIALTY PIZZA" → SKIP (section header)
"FAMOUS NY CALZONE" → SKIP (section header)
"OUR SELECTION OF FRESH TOPPINGS" → SKIP (topping list header)
"Cheese" (alone, no price) → SKIP (refers to base pizza pricing)
"Dressings: Ranch, Blue Cheese..." → SKIP (modifier list)
"All entrees served with..." → SKIP (descriptive text)
```

**✅ DO EXTRACT (Actual Items):**
```
"JUMBO SIZED WINGS - 8pc $10, 18pc $20" → EXTRACT
"CAESAR SALAD - $6" → EXTRACT
"SPAGHETTI MARINARA - $9" → EXTRACT
"CHEESE CALZONE - $10" → EXTRACT
"Margherita Pizza - Sm $11, Lg $15, XL $17" → EXTRACT
```

## EXAMPLES OF CORRECT EXTRACTION:

**Example 1: Multi-size pizza**
```
Menu shows: "Margherita - Sm $11, Lg $15, XL $17"
Extract as:
{
  "category": "Pizza",
  "item_name": "Margherita",
  "description": "Mozzarella, plum tomatoes, fresh basil and garlic",
  "prices": [
    {"size": "Small", "price": 11.00},
    {"size": "Large", "price": 15.00},
    {"size": "X-Large", "price": 17.00}
  ]
}
```

**Example 2: Single-price appetizer**
```
Menu shows: "Garlic Knots (5) - $5"
Extract as:
{
  "category": "Appetizers",
  "item_name": "Garlic Knots (5)",
  "description": "with side of marinara sauce",
  "prices": [
    {"size": null, "price": 5.00}
  ]
}
```

**Example 3: Quantity-based wings**
```
Menu shows: "Jumbo Wings - 8pc $10, 18pc $20"
Extract as:
{
  "category": "Wings",
  "item_name": "Jumbo Sized Wings",
  "prices": [
    {"size": "8 Pieces", "price": 10.00},
    {"size": "18 Pieces", "price": 20.00}
  ]
}
```

**Example 4: Market price item**
```
Menu shows: "Lobster Tail - Market Price"
Extract as:
{
  "category": "Seafood",
  "item_name": "Lobster Tail",
  "prices": [
    {"size": null, "price": 0}
  ],
  "notes": "Market Price"
}
```

## Return Format:

Return ONLY valid JSON in this exact format (NO restaurant_name field):
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
      "options": ["string"] or null,
      "notes": "string or null"
    }
  ]
}
```

Be thorough, accurate, and consistent. Extract every actual menu item you can see.
