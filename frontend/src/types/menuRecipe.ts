/**
 * Menu Recipe Types
 * Matches backend API responses for plate costing system
 */

export interface InventoryItemSearchResult {
  id: string;
  name: string;
  description: string;
  pack_size: string | null;
  pack_price: number;
  calculated_unit_cost: number;
  base_unit: string;
  unit_of_measure: string;
  last_purchase_price: number;
  last_purchase_date: string | null;
  warnings: string[];
  source: string;
  // Fuzzy matching fields
  similarity_score?: number;
  match_confidence?: {
    action: 'auto_match' | 'review' | 'create_new';
    confidence: 'high' | 'medium' | 'low';
    needs_review: boolean;
  };
  // Legacy fields for backward compatibility
  category?: string | null;
  average_unit_cost?: number;
  current_quantity?: number;
}

export interface MenuItemIngredient {
  id: string;
  invoice_item_id: string;  // Direct link to invoice_items (source of truth)
  invoice_item_description: string;  // From invoice_items.description
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

export interface MenuItemPrice {
  id: string;
  size: string | null;
  price: number;
}

export interface MenuItemRecipe {
  menu_item: {
    id: string;
    name: string;
    prices: MenuItemPrice[];
  };
  ingredients: MenuItemIngredient[];
  total_cogs: number;
  menu_price: number;
  gross_profit: number;
  food_cost_percent: number;
  warnings?: string[];
}

export interface AddIngredientRequest {
  invoice_item_id: string;  // Direct link to invoice_items (source of truth)
  menu_item_price_id: string | null;
  quantity_per_serving: number;
  unit_of_measure: string;
  notes?: string;
}

export interface UpdateIngredientRequest {
  quantity_per_serving?: number;
  notes?: string;
}

// API Response types
export interface SearchInventoryResponse {
  success: boolean;
  results: InventoryItemSearchResult[];
  count: number;
}

export interface RecipeResponse {
  success: boolean;
  menu_item: {
    id: string;
    name: string;
    prices: MenuItemPrice[];
  };
  ingredients: MenuItemIngredient[];
  total_cogs: number;
  menu_price: number;
  gross_profit: number;
  food_cost_percent: number;
}

export interface AddIngredientResponse {
  success: boolean;
  ingredient_id: string;
  message: string;
}

export interface UpdateIngredientResponse {
  success: boolean;
  message: string;
}

export interface DeleteIngredientResponse {
  success: boolean;
  message: string;
}
