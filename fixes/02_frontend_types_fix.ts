/**
 * FIX 2: Frontend Types - frontend/src/types/menuRecipe.ts
 * Changes: Rename inventory_item_id to invoice_item_id throughout
 */

// ============================================================================
// CHANGE 1: AddIngredientRequest interface (Line ~69)
// ============================================================================

// REPLACE:
export interface AddIngredientRequest {
  inventory_item_id: string;  // ❌ WRONG
  menu_item_price_id: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  notes?: string;
}

// WITH:
export interface AddIngredientRequest {
  invoice_item_id: string;  // ✅ CORRECT - links to source of truth
  menu_item_price_id: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  notes?: string;
}

// ============================================================================
// CHANGE 2: MenuItemIngredient interface (Line ~31)
// ============================================================================

// REPLACE:
export interface MenuItemIngredient {
  id: string;
  inventory_item_id: string;  // ❌ WRONG
  inventory_item_name: string;  // ❌ WRONG
  pack_size: string | null;
  pack_price: number;
  calculated_unit_cost: number;
  base_unit: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  converted_quantity: number | null;
  converted_unit: string | null;
  line_cost: number;
  last_purchase_date: string | null;
  notes: string | null;
  warnings: string[];
}

// WITH:
export interface MenuItemIngredient {
  id: string;
  invoice_item_id: string;  // ✅ CORRECT - links to source of truth
  invoice_item_description: string;  // ✅ CORRECT - from invoice_items.description
  pack_size: string | null;
  pack_price: number;
  calculated_unit_cost: number;
  base_unit: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  converted_quantity: number | null;
  converted_unit: string | null;
  line_cost: number;
  last_purchase_date: string | null;
  notes: string | null;
  warnings: string[];
}

// ============================================================================
// Summary of Changes
// ============================================================================
/*
1. AddIngredientRequest: inventory_item_id → invoice_item_id
2. MenuItemIngredient: 
   - inventory_item_id → invoice_item_id
   - inventory_item_name → invoice_item_description
*/
