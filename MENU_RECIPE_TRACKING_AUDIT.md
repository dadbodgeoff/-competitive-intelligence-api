# Menu Recipe Tracking System - Deep Audit Report

**Date:** November 4, 2025  
**Status:** 🔴 CRITICAL ISSUES FOUND - System Not Fully Functional

---

## Executive Summary

The menu recipe tracking system has a **fundamental architecture mismatch** between what was designed (Migration 025) and what's actually implemented. The system is trying to use an outdated `inventory_items` intermediary table instead of linking directly to `invoice_items` (the source of truth).

### The Core Problem

**DESIGNED ARCHITECTURE (Migration 025):**
```
menu_item_ingredients → invoice_items (SOURCE OF TRUTH)
                         ↓
                    pack_size, unit_price, description
                    (always up-to-date pricing)
```

**ACTUAL IMPLEMENTATION:**
```
menu_item_ingredients → inventory_items → invoice_items
                         ↑ (BROKEN LINK)
                    (outdated intermediary)
```

---

## Source of Truth: invoice_items Table

Your `invoice_items` table contains everything needed for COGS tracking:

```sql
Columns in invoice_items:
- id (UUID) ✅
- invoice_id (UUID) ✅
- item_number (e.g., "MOZZ-FRESH-001") ✅
- description (e.g., "FRESH MOZZARELLA CHEESE") ✅
- quantity (1.00) ✅
- pack_size (e.g., "6/5 lb") ✅ CRITICAL FOR UNIT COST CALCULATION
- unit_price (e.g., $87.00) ✅ LAST PAID PRICE
- extended_price (87.00) ✅
- category ("REFRIGERATED") ✅
- created_at (timestamp) ✅ FOR TRACKING PRICE HISTORY
```

**Example Data:**
- FRESH MOZZARELLA CHEESE: 5 invoices with prices ranging from $84.60 to $89.40
- Pack size: "6/5 lb" (6 bags of 5 pounds each = 30 lbs total)
- This allows calculating: $87.00 ÷ 30 lbs = $2.90/lb

---

## Critical Issues Found

### 🔴 Issue #1: Database Schema Mismatch

**Migration 025 Added:**
```sql
ALTER TABLE menu_item_ingredients 
ADD COLUMN invoice_item_id UUID REFERENCES invoice_items(id);

-- Made inventory_item_id nullable (deprecated)
ALTER COLUMN inventory_item_id DROP NOT NULL;
```

**Current Schema (Migration 013):**
```sql
CREATE TABLE menu_item_ingredients (
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    -- invoice_item_id column exists but NOT BEING USED
)
```

**Problem:** The code is still using `inventory_item_id` everywhere instead of `invoice_item_id`.

---

### 🔴 Issue #2: Backend Service Using Wrong Field

**File:** `services/menu_recipe_service.py`

**Line 147-155 (search_inventory_items):**
```python
# ❌ WRONG: Searching invoice_items but returning as "inventory items"
all_items_result = self.client.table("invoice_items").select(
    "id, description, pack_size, unit_price, created_at, invoice_id, invoices!inner(user_id)"
).eq("invoices.user_id", user_id).execute()

# Returns items with:
enhanced_items.append({
    "id": item["id"],  # ❌ This is invoice_item_id but treated as inventory_item_id
    "source": "invoice_items",  # ✅ Correctly marked
})
```

**Line 560-575 (add_ingredient):**
```python
# ❌ WRONG: Saving to inventory_item_id instead of invoice_item_id
ingredient_data = {
    "menu_item_id": menu_item_id,
    "invoice_item_id": invoice_item_id,  # ✅ Correct field name
    "quantity_per_serving": quantity_per_serving,
    # ...
}

# BUT the insert fails because:
# 1. invoice_item_id column might not exist in production DB
# 2. inventory_item_id is still NOT NULL in schema
```

---

### 🔴 Issue #3: Frontend TypeScript Types Wrong

**File:** `frontend/src/types/menuRecipe.ts`

**Lines 69-76:**
```typescript
export interface AddIngredientRequest {
  inventory_item_id: string;  // ❌ WRONG FIELD NAME
  menu_item_price_id: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  notes?: string;
}
```

**Should be:**
```typescript
export interface AddIngredientRequest {
  invoice_item_id: string;  // ✅ CORRECT - links to source of truth
  menu_item_price_id: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  notes?: string;
}
```

---

### 🔴 Issue #4: API Route Backward Compatibility Confusion

**File:** `api/routes/menu/recipes.py`

**Lines 40-56:**
```python
class AddIngredientRequest(BaseModel):
    invoice_item_id: Optional[str] = None  # ✅ New field
    inventory_item_id: Optional[str] = None  # ❌ Deprecated but still accepted
    # ...
    
    def get_item_id(self) -> str:
        """Get the item ID, preferring invoice_item_id"""
        if self.invoice_item_id:
            return self.invoice_item_id
        if self.inventory_item_id:  # ❌ Falls back to wrong field
            return self.inventory_item_id
        raise ValueError("Either invoice_item_id or inventory_item_id must be provided")
```

**Problem:** Frontend is sending `inventory_item_id`, so it always uses the fallback path.

---

### 🔴 Issue #5: get_recipe() Still Queries inventory_items

**File:** `services/menu_recipe_service.py`

**Lines 380-420:**
```python
async def get_recipe(self, menu_item_id, user_id, price_id):
    # Gets ingredients
    ingredients_result = self.client.table("menu_item_ingredients").select(
        "id, inventory_item_id, quantity_per_serving, ..."  # ❌ Still using inventory_item_id
    ).eq("menu_item_id", menu_item_id).execute()
    
    for ing in ingredients_result.data:
        # ❌ Queries inventory_items (intermediary)
        inv_result = self.client.table("inventory_items").select(
            "name, average_unit_cost, last_purchase_date, last_purchase_price"
        ).eq("id", ing["inventory_item_id"]).execute()
        
        # Then tries to find invoice_items by name matching
        invoice_items_result = self.client.table("invoice_items").select(
            "pack_size, unit_price, created_at"
        ).ilike("description", f"%{inv_item['name']}%").execute()  # ❌ FUZZY MATCH - UNRELIABLE
```

**Problem:** This creates a broken chain:
1. Saves `inventory_item_id` (which may not exist)
2. Tries to look up inventory item
3. Fuzzy matches back to invoice_items by name
4. **Result:** Wrong prices, missing data, or complete failure

---

## How It Should Work (Correct Architecture)

### User Flow:
1. User uploads menu → menu items created
2. User clicks "Add Ingredient" on a menu item
3. **Search directly in `invoice_items`** using fuzzy matching
4. User selects "FRESH MOZZARELLA CHEESE" (invoice_item_id: `082afd16-...`)
5. System shows: Pack "6/5 lb" @ $87.00 = $2.90/lb
6. User enters: "4 oz" per serving
7. System converts: 4 oz = 0.25 lb × $2.90/lb = $0.73 per serving
8. **Save to `menu_item_ingredients`:**
   ```sql
   INSERT INTO menu_item_ingredients (
       menu_item_id,
       invoice_item_id,  -- ✅ Direct link to source of truth
       quantity_per_serving,
       unit_of_measure
   ) VALUES (
       'menu-item-uuid',
       '082afd16-3a39-4668-8a4a-5e91f6487199',  -- ✅ Invoice item ID
       4.0,
       'oz'
   );
   ```

### When Calculating COGS:
```sql
SELECT 
    mii.quantity_per_serving,
    mii.unit_of_measure,
    ii.pack_size,
    ii.unit_price,
    ii.description,
    ii.created_at as last_purchase_date
FROM menu_item_ingredients mii
JOIN invoice_items ii ON ii.id = mii.invoice_item_id  -- ✅ Direct join
WHERE mii.menu_item_id = 'menu-item-uuid'
ORDER BY ii.created_at DESC  -- ✅ Always get latest price
LIMIT 1;
```

**Benefits:**
- ✅ Always uses latest invoice price
- ✅ No intermediary table to maintain
- ✅ Pack size always available for unit cost calculation
- ✅ Price history automatically tracked via invoice_items
- ✅ No fuzzy matching needed (direct foreign key)

---

## Why inventory_items Is Wrong for Recipes

The `inventory_items` table was designed for **inventory management**, not recipe costing:

```sql
CREATE TABLE inventory_items (
    id UUID,
    user_id UUID,
    name TEXT,  -- ❌ Normalized name (not exact invoice description)
    current_quantity DECIMAL,  -- ❌ Stock level (irrelevant for recipes)
    average_unit_cost DECIMAL,  -- ❌ Average (not last paid price)
    last_purchase_price DECIMAL,  -- ⚠️  Might be outdated
    last_purchase_date DATE,  -- ⚠️  No link back to invoice
    -- ❌ NO pack_size column!
    -- ❌ NO invoice_id link!
)
```

**Problems:**
1. No `pack_size` → Can't calculate unit costs accurately
2. `average_unit_cost` → Not the actual last paid price
3. No direct link to invoices → Can't track price changes
4. Normalized names → Fuzzy matching required (error-prone)

---

## What Needs to Be Fixed

### Priority 1: Database Migration (MUST RUN FIRST)

**Check if migration 025 was applied:**
```sql
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'menu_item_ingredients' 
AND column_name IN ('invoice_item_id', 'inventory_item_id');
```

**If invoice_item_id doesn't exist, run:**
```sql
-- Add invoice_item_id column
ALTER TABLE menu_item_ingredients 
ADD COLUMN IF NOT EXISTS invoice_item_id UUID REFERENCES invoice_items(id) ON DELETE RESTRICT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_menu_ingredients_invoice_item 
ON menu_item_ingredients(invoice_item_id);

-- Make inventory_item_id nullable (for migration)
ALTER TABLE menu_item_ingredients 
ALTER COLUMN inventory_item_id DROP NOT NULL;
```

### Priority 2: Backend Service (menu_recipe_service.py)

**Changes needed:**
1. `search_inventory_items()` - Already correct (searches invoice_items)
2. `add_ingredient()` - Change database insert to use `invoice_item_id`
3. `get_recipe()` - Query `invoice_items` directly, not via `inventory_items`
4. Remove all `inventory_items` table queries from recipe logic

### Priority 3: Frontend Types (menuRecipe.ts)

**Change:**
```typescript
export interface AddIngredientRequest {
  invoice_item_id: string;  // Changed from inventory_item_id
  menu_item_price_id: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  notes?: string;
}

export interface MenuItemIngredient {
  id: string;
  invoice_item_id: string;  // Changed from inventory_item_id
  invoice_item_description: string;  // Changed from inventory_item_name
  // ... rest stays same
}
```

### Priority 4: Frontend Component (IngredientSearchModal.tsx)

**Line 71:**
```typescript
await onAdd({
  invoice_item_id: selectedItem.id,  // Changed from inventory_item_id
  menu_item_price_id: menuItemPriceId || null,
  quantity_per_serving: quantityNum,
  unit_of_measure: unit,
  notes: notes || undefined,
});
```

### Priority 5: API Route (api/routes/menu/recipes.py)

**Remove backward compatibility:**
```python
class AddIngredientRequest(BaseModel):
    invoice_item_id: str  # Required, no fallback
    menu_item_price_id: Optional[str] = None
    quantity_per_serving: float
    unit_of_measure: str
    notes: Optional[str] = None
```

---

## Testing Strategy

### 1. Verify Database Schema
```sql
-- Check columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_item_ingredients'
ORDER BY ordinal_position;

-- Should show:
-- invoice_item_id | uuid | YES
-- inventory_item_id | uuid | YES (nullable for migration)
```

### 2. Test Add Ingredient Flow
```python
# Test script
import requests

# 1. Search for ingredient
response = requests.get(
    "http://localhost:8000/api/v1/menu/search-inventory",
    params={"q": "mozzarella", "limit": 10},
    headers={"Authorization": f"Bearer {token}"}
)
results = response.json()["results"]
invoice_item_id = results[0]["id"]

# 2. Add to recipe
response = requests.post(
    f"http://localhost:8000/api/v1/menu/items/{menu_item_id}/ingredients",
    json={
        "invoice_item_id": invoice_item_id,  # ✅ Correct field
        "quantity_per_serving": 4.0,
        "unit_of_measure": "oz"
    },
    headers={"Authorization": f"Bearer {token}"}
)

# 3. Verify saved correctly
response = requests.get(
    f"http://localhost:8000/api/v1/menu/items/{menu_item_id}/recipe",
    headers={"Authorization": f"Bearer {token}"}
)
recipe = response.json()
print(recipe["ingredients"][0])
# Should show invoice_item_id, not inventory_item_id
```

### 3. Test COGS Calculation
```sql
-- Verify recipe links to invoice_items
SELECT 
    mi.item_name as menu_item,
    mii.quantity_per_serving,
    mii.unit_of_measure,
    ii.description as ingredient,
    ii.pack_size,
    ii.unit_price as pack_price,
    ii.created_at as last_purchase
FROM menu_item_ingredients mii
JOIN menu_items mi ON mi.id = mii.menu_item_id
JOIN invoice_items ii ON ii.id = mii.invoice_item_id  -- ✅ Direct join
WHERE mi.id = 'your-menu-item-id';
```

---

## Summary of Findings

| Component | Status | Issue |
|-----------|--------|-------|
| Database Schema | 🟡 Partial | Migration 025 may not be applied |
| Backend Service | 🔴 Broken | Using inventory_item_id instead of invoice_item_id |
| Frontend Types | 🔴 Broken | TypeScript interfaces use wrong field names |
| Frontend Components | 🔴 Broken | Sending inventory_item_id to API |
| API Routes | 🟡 Partial | Has backward compatibility but confusing |
| Unit Conversion | 🟢 Working | UnitConverter service is correct |
| Fuzzy Matching | 🟢 Working | Search finds invoice_items correctly |

---

## Next Steps

**DO NOT MAKE CHANGES YET** - You requested audit only.

When ready to fix:
1. Confirm migration 025 is applied to database
2. Update backend service to use invoice_item_id
3. Update frontend types
4. Update frontend components
5. Remove backward compatibility from API
6. Test end-to-end flow
7. Migrate any existing data from inventory_item_id to invoice_item_id

---

**End of Audit Report**
