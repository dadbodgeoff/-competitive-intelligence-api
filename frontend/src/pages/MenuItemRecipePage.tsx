/**
 * Menu Item Recipe Page
 * Complete recipe builder interface for plate costing
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRecipeBuilder } from '@/hooks/useRecipeBuilder';
import { COGSCalculator } from '@/components/menu/COGSCalculator';
import { IngredientList } from '@/components/menu/IngredientList';
import { IngredientSearchModal } from '@/components/menu/IngredientSearchModal';

export function MenuItemRecipePage() {
  const { menuItemId } = useParams<{ menuItemId: string }>();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    recipe,
    loading,
    saving,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    refreshRecipe,
  } = useRecipeBuilder(menuItemId!);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!recipe) {
    return (
      <AppShell>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Recipe not found</h2>
          <Button onClick={() => navigate('/menu/dashboard')} className="btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="wide">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/menu/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Menu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cogs')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              COGS Tracker
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshRecipe}
              disabled={saving}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Recipe: {recipe.menu_item.name}
          </h1>
          <p className="text-slate-400">
            Build your recipe and calculate true cost of goods sold
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - COGS Calculator */}
          <div className="lg:col-span-1">
            <COGSCalculator
              totalCogs={recipe.total_cogs}
              menuPrice={recipe.menu_price}
              grossProfit={recipe.gross_profit}
              foodCostPercent={recipe.food_cost_percent}
            />
          </div>

          {/* Right column - Ingredients */}
          <div className="lg:col-span-2">
            <IngredientList
              ingredients={recipe.ingredients}
              onEdit={async (ingredientId, quantity, notes) => {
                await updateIngredient(ingredientId, {
                  quantity_per_serving: quantity,
                  notes,
                });
              }}
              onDelete={deleteIngredient}
              onAddClick={() => setShowAddModal(true)}
              saving={saving}
            />
          </div>
        </div>

        {/* Add Ingredient Modal */}
        <IngredientSearchModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={async (request) => {
            await addIngredient(request);
            setShowAddModal(false);
          }}
          menuItemPriceId={recipe.menu_item.prices[0]?.id}
        />
      </AppShell>
  );
}
