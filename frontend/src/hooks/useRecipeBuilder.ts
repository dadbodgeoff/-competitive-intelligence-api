/**
 * Recipe Builder Hook
 * Manages recipe state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { menuRecipeApi } from '@/services/api/menuRecipeApi';
import { useToast } from '@/hooks/use-toast';
import type {
  MenuItemRecipe,
  AddIngredientRequest,
  UpdateIngredientRequest,
} from '@/types/menuRecipe';

export function useRecipeBuilder(menuItemId: string, priceId?: string) {
  const [recipe, setRecipe] = useState<MenuItemRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load recipe
  const loadRecipe = useCallback(async () => {
    try {
      setLoading(true);
      const response = await menuRecipeApi.getRecipe(menuItemId, priceId);
      setRecipe(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load recipe',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [menuItemId, priceId, toast]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  // Add ingredient
  const addIngredient = useCallback(
    async (request: AddIngredientRequest) => {
      try {
        setSaving(true);
        await menuRecipeApi.addIngredient(menuItemId, request);
        await loadRecipe(); // Reload to get updated COGS
        toast({
          title: 'Success',
          description: 'Ingredient added successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to add ingredient',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [menuItemId, loadRecipe, toast]
  );

  // Update ingredient
  const updateIngredient = useCallback(
    async (ingredientId: string, request: UpdateIngredientRequest) => {
      try {
        setSaving(true);
        await menuRecipeApi.updateIngredient(menuItemId, ingredientId, request);
        await loadRecipe(); // Reload to get updated COGS
        toast({
          title: 'Success',
          description: 'Ingredient updated successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update ingredient',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [menuItemId, loadRecipe, toast]
  );

  // Delete ingredient
  const deleteIngredient = useCallback(
    async (ingredientId: string) => {
      try {
        setSaving(true);
        await menuRecipeApi.deleteIngredient(menuItemId, ingredientId);
        await loadRecipe(); // Reload to get updated COGS
        toast({
          title: 'Success',
          description: 'Ingredient removed successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to remove ingredient',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [menuItemId, loadRecipe, toast]
  );

  return {
    recipe,
    loading,
    saving,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    refreshRecipe: loadRecipe,
  };
}
