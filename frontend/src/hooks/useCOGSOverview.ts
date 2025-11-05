/**
 * COGS Overview Hook
 * Fetches all menu items and their recipes for dashboard view
 * Optimized with fast initial load and lazy recipe fetching
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { menuRecipeApi } from '@/services/api/menuRecipeApi';
import { useToast } from '@/hooks/use-toast';
import type { MenuItemRecipe } from '@/types/menuRecipe';

export interface MenuItem {
  id: string;
  name: string;
  category?: string;
  prices: Array<{ id?: string; size: string | null; price: number }>;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export function useCOGSOverview() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [recipes, setRecipes] = useState<Map<string, MenuItemRecipe>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fast initial load - menu with items
  const fetchMenuSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load menu with all items
      const response = await apiClient.get('/api/v1/menu/current');
      const data = response.data;

      if (!data.success || !data.menu) {
        setCategories([]);
        setLoading(false);
        return;
      }

      // Set categories with items
      const cats = (data.categories || []).map((cat: any) => ({
        name: cat.name,
        items: (cat.items || []).map((item: any) => ({
          ...item,
          category: cat.name,
        })),
      }));

      setCategories(cats);
      setLoading(false);

      // Now load recipes in background
      fetchAllRecipes(cats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load menu data';
      setError(errorMessage);
      setLoading(false);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load all recipes in background using BATCH endpoint
  const fetchAllRecipes = async (cats: MenuCategory[]) => {
    try {
      setLoadingRecipes(true);

      // Flatten all items
      const allItems: MenuItem[] = [];
      for (const category of cats) {
        allItems.push(...category.items);
      }

      if (allItems.length === 0) {
        setLoadingRecipes(false);
        return;
      }

      // Use BATCH endpoint - 83 requests -> 1 request!
      const menuIds = allItems.map(item => item.id).join(',');
      
      try {
        const response = await apiClient.get(`/api/v1/menu/items/batch/recipes?menu_ids=${menuIds}`);
        const data = response.data;

        if (data.success && data.recipes) {
          // Convert object to Map
          const recipeMap = new Map<string, MenuItemRecipe>();
          
          Object.entries(data.recipes).forEach(([itemId, recipe]: [string, any]) => {
            recipeMap.set(itemId, recipe);
          });

          setRecipes(recipeMap);
        }
      } catch (err) {
        console.error('Batch recipe fetch failed, falling back to individual requests:', err);
        
        // Fallback: Load recipes individually (old behavior)
        const recipePromises = allItems.map(async (item) => {
          try {
            const recipe = await menuRecipeApi.getRecipe(item.id);
            return { itemId: item.id, recipe };
          } catch (err) {
            return { itemId: item.id, recipe: null };
          }
        });

        const recipeResults = await Promise.all(recipePromises);

        // Build recipe map
        const recipeMap = new Map<string, MenuItemRecipe>();
        for (const result of recipeResults) {
          if (result.recipe) {
            recipeMap.set(result.itemId, result.recipe);
          }
        }

        setRecipes(recipeMap);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  useEffect(() => {
    fetchMenuSummary();
  }, [fetchMenuSummary]);

  // Compute metrics
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const itemsWithRecipes = recipes.size;
  const noRecipeItems = totalItems - itemsWithRecipes;

  let totalMargin = 0;
  let totalFoodCost = 0;
  let healthyItems = 0;
  let warningItems = 0;
  let dangerItems = 0;

  recipes.forEach((recipe) => {
    totalMargin += recipe.gross_profit;
    totalFoodCost += recipe.food_cost_percent;

    if (recipe.food_cost_percent < 30) {
      healthyItems++;
    } else if (recipe.food_cost_percent < 35) {
      warningItems++;
    } else {
      dangerItems++;
    }
  });

  const averageMargin = itemsWithRecipes > 0 ? totalMargin / itemsWithRecipes : 0;
  const averageFoodCostPercent = itemsWithRecipes > 0 ? totalFoodCost / itemsWithRecipes : 0;

  return {
    categories,
    recipes,
    loading,
    loadingRecipes,
    error,
    refetch: fetchMenuSummary,
    // Metrics
    totalItems,
    itemsWithRecipes,
    averageMargin,
    averageFoodCostPercent,
    healthyItems,
    warningItems,
    dangerItems,
    noRecipeItems,
  };
}
