/**
 * Menu Recipe API Client
 * Handles all recipe/ingredient API calls
 * Pattern: Follows inventoryApi.ts structure
 */

import { apiClient } from './client';
import type {
  SearchInventoryResponse,
  RecipeResponse,
  AddIngredientRequest,
  AddIngredientResponse,
  UpdateIngredientRequest,
  UpdateIngredientResponse,
  DeleteIngredientResponse,
  MenuItemRecipe,
} from '@/types/menuRecipe';

export const menuRecipeApi = {
  /**
   * Search inventory items for linking
   * GET /api/menu/search-inventory?q=burger&limit=20
   */
  async searchInventory(
    query: string,
    limit = 20
  ): Promise<SearchInventoryResponse> {
    const response = await apiClient.get<SearchInventoryResponse>(
      `/api/v1/menu/search-inventory?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get recipe for menu item
   * GET /api/menu/items/{menu_item_id}/recipe
   */
  async getRecipe(
    menuItemId: string,
    priceId?: string
  ): Promise<MenuItemRecipe> {
    const params = priceId ? `?price_id=${priceId}` : '';
    const response = await apiClient.get<RecipeResponse>(`/api/v1/menu/items/${menuItemId}/recipe${params}`);
    const data = response.data;
    return {
      menu_item: data.menu_item,
      ingredients: data.ingredients,
      total_cogs: data.total_cogs,
      menu_price: data.menu_price,
      gross_profit: data.gross_profit,
      food_cost_percent: data.food_cost_percent,
    };
  },

  /**
   * Add ingredient to menu item
   * POST /api/menu/items/{menu_item_id}/ingredients
   */
  async addIngredient(
    menuItemId: string,
    request: AddIngredientRequest
  ): Promise<AddIngredientResponse> {
    const response = await apiClient.post(
      `/api/v1/menu/items/${menuItemId}/ingredients`,
      request
    );
    return response.data;
  },

  /**
   * Update ingredient quantity/notes
   * PUT /api/menu/items/{menu_item_id}/ingredients/{ingredient_id}
   */
  async updateIngredient(
    menuItemId: string,
    ingredientId: string,
    request: UpdateIngredientRequest
  ): Promise<UpdateIngredientResponse> {
    const response = await apiClient.put(
      `/api/v1/menu/items/${menuItemId}/ingredients/${ingredientId}`,
      request
    );
    return response.data;
  },

  /**
   * Remove ingredient from menu item
   * DELETE /api/menu/items/{menu_item_id}/ingredients/{ingredient_id}
   */
  async deleteIngredient(
    menuItemId: string,
    ingredientId: string
  ): Promise<DeleteIngredientResponse> {
    const response = await apiClient.delete(
      `/api/v1/menu/items/${menuItemId}/ingredients/${ingredientId}`
    );
    return response.data;
  },
};
