# Recipe Ingredient Architecture - Critical Fix Needed

## Current Problem

**Search returns**: `invoice_item.id` (from `invoice_items` table)
**Add ingredient expects**: `inventory_item.id` (from `inventory_items` table)
**Result**: "Inventory item not found" error

## Architecture Understanding

```
invoice_items (SOURCE OF TRUTH)
    ↓ (needs mapping)
inventory_items (NORMALIZED REFERENCE)
    ↓ (links to)
menu_item_ingredients (RECIPE STORAGE)
```

## The Missing Piece

When a user selects an item from search:
1. ✅ Search finds `invoice_item` with fuzzy matching
2. ❌ **MISSING**: Create/find corresponding `inventory_item`
3. ❌ Save link to `menu_item_ingredients`

## Solution Options

### Option 1: Create inventory_item on-the-fly (RECOMMENDED)
When adding an ingredient, if the `invoice_item.id` is provided:
1. Look up the `invoice_item` details
2. Find or create matching `inventory_item` by name
3. Link the `inventory_item.id` to `menu_item_ingredients`

### Option 2: Change schema to reference invoice_items directly
- Risky: requires migration
- Breaks existing `inventory_items` references
- Not recommended

## Implementation for Option 1

Update `add_ingredient()` in `services/menu_recipe_service.py`:

```python
async def add_ingredient(
    self,
    menu_item_id: str,
    invoice_item_id: str,  # Changed: now accepts invoice_item_id
    quantity_per_serving: float,
    unit_of_measure: str,
    user_id: str,
    menu_item_price_id: Optional[str] = None,
    notes: Optional[str] = None
) -> Dict:
    # Step 1: Get invoice_item details (SOURCE OF TRUTH)
    invoice_item = self.client.table("invoice_items").select(
        "id, description, pack_size, unit_price"
    ).eq("id", invoice_item_id).execute()
    
    if not invoice_item.data:
        raise Exception("Invoice item not found")
    
    item_data = invoice_item.data[0]
    item_name = item_data["description"]
    
    # Step 2: Find or create inventory_item
    inventory_item = self.client.table("inventory_items").select(
        "id"
    ).eq("name", item_name).eq("user_id", user_id).limit(1).execute()
    
    if inventory_item.data:
        # Use existing inventory_item
        inventory_item_id = inventory_item.data[0]["id"]
    else:
        # Create new inventory_item
        new_inv_item = self.client.table("inventory_items").insert({
            "name": item_name,
            "user_id": user_id,
            "last_purchase_price": item_data["unit_price"],
            "last_purchase_date": datetime.utcnow().isoformat()
        }).execute()
        inventory_item_id = new_inv_item.data[0]["id"]
    
    # Step 3: Create menu_item_ingredient link
    # ... rest of function
```

## What Needs to Change

1. **API Parameter**: Change from `inventory_item_id` to `invoice_item_id`
2. **Service Logic**: Add find/create inventory_item step
3. **Frontend**: Already sending correct `invoice_item.id` ✅

## Testing

After fix, test:
1. Search for "chip" → finds invoice items
2. Select item → creates/finds inventory_item
3. Save ingredient → links to menu_item_ingredients
4. View recipe → shows correct COGS from invoice prices
