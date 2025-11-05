/**
 * FIX 3: Frontend Component - frontend/src/components/menu/IngredientSearchModal.tsx
 * Changes: Send invoice_item_id instead of inventory_item_id
 */

// ============================================================================
// CHANGE: handleAdd function (Line ~71)
// ============================================================================

// REPLACE:
await onAdd({
  inventory_item_id: selectedItem.id,  // ❌ WRONG FIELD NAME
  menu_item_price_id: menuItemPriceId || null,
  quantity_per_serving: quantityNum,
  unit_of_measure: unit,
  notes: notes || undefined,
});

// WITH:
await onAdd({
  invoice_item_id: selectedItem.id,  // ✅ CORRECT - this is invoice_items.id
  menu_item_price_id: menuItemPriceId || null,
  quantity_per_serving: quantityNum,
  unit_of_measure: unit,
  notes: notes || undefined,
});

// ============================================================================
// ALSO UPDATE: IngredientList.tsx (Line ~?)
// ============================================================================

// In frontend/src/components/menu/IngredientList.tsx
// REPLACE any references to:
{ingredient.inventory_item_name}

// WITH:
{ingredient.invoice_item_description}

// ============================================================================
// Summary of Changes
// ============================================================================
/*
1. IngredientSearchModal: Send invoice_item_id in onAdd()
2. IngredientList: Display invoice_item_description instead of inventory_item_name
*/
