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
    const response = await apiClient.get(
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
  ): Promise<RecipeResponse> {
    const params = priceId ? `?price_id=${priceId}` : '';
    const response = await apiClient.get(`/api/v1/menu/items/${menuItemId}/recipe${params}`);
    return response.data;
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
