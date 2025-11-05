/**
 * Ingredient List Component
 * Display and edit linked ingredients with inline editing
 */

import { useState } from 'react';
import { cn } from '@/design-system';
import { InvoiceCard, InvoiceCardHeader, InvoiceCardContent } from '@/design-system/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';
import { Edit2, Trash2, Check, X, Plus, Package } from 'lucide-react';
import type { MenuItemIngredient } from '@/types/menuRecipe';

interface IngredientListProps {
  ingredients: MenuItemIngredient[];
  onEdit: (ingredientId: string, quantity: number, notes?: string) => Promise<void>;
  onDelete: (ingredientId: string) => Promise<void>;
  onAddClick: () => void;
  saving: boolean;
}

export function IngredientList({
  ingredients,
  onEdit,
  onDelete,
  onAddClick,
  saving,
}: IngredientListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const startEdit = (ingredient: MenuItemIngredient) => {
    setEditingId(ingredient.id);
    setEditQuantity(ingredient.quantity_per_serving.toString());
    setEditNotes(ingredient.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
    setEditNotes('');
  };

  const saveEdit = async (ingredientId: string) => {
    const quantity = parseFloat(editQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      return;
    }

    await onEdit(ingredientId, quantity, editNotes || undefined);
    cancelEdit();
  };

  const handleDelete = async (ingredientId: string) => {
    if (confirm('Remove this ingredient from the recipe?')) {
      await onDelete(ingredientId);
    }
  };

  return (
    <InvoiceCard variant="elevated">
      <InvoiceCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">
              Ingredients ({ingredients.length})
            </h3>
          </div>
          <Button
            onClick={onAddClick}
            disabled={saving}
            className="btn-primary shadow-emerald"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
      </InvoiceCardHeader>
      <InvoiceCardContent>
        {ingredients.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No ingredients yet</h4>
            <p className="text-slate-400 mb-2">
              Add ingredients to calculate the true cost of this menu item
            </p>
            <p className="text-xs text-slate-500 mb-6">
              💰 Costs are pulled from your latest invoice prices automatically
            </p>
            <Button onClick={onAddClick} className="btn-primary shadow-emerald">
              <Plus className="h-4 w-4 mr-2" />
              Add First Ingredient
            </Button>
          </div>
        ) : (
          // Ingredient list
          <div className="space-y-3">
            {ingredients.map((ingredient) => {
              const isEditing = editingId === ingredient.id;

              return (
                <div
                  key={ingredient.id}
                  className={cn(
                    'border border-white/10 rounded-lg p-4 transition-colors',
                    isEditing ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-obsidian/50'
                  )}
                >
                  {isEditing ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 mb-1 block">
                            Quantity per serving
                          </label>
                          <div className="flex gap-3 items-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="input-field flex-1"
                              placeholder="1.0"
                            />
                            <span className="text-slate-400">×</span>
                            <Input
                              value={ingredient.unit_of_measure}
                              disabled
                              className="input-field w-24 bg-slate-800/50"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          Notes (optional)
                        </label>
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="input-field text-sm"
                          placeholder="Add notes..."
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(ingredient.id)}
                          disabled={saving}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">
                            {ingredient.invoice_item_description}
                          </h4>
                          <div className="flex items-center gap-2 text-sm flex-wrap">
                            <span className="text-slate-300 font-mono font-semibold">
                              {ingredient.quantity_per_serving} {ingredient.unit_of_measure}
                            </span>
                            <span className="text-slate-500">×</span>
                            <span className="text-slate-400">
                              ${(ingredient.calculated_unit_cost || 0).toFixed(2)}/{ingredient.base_unit || ingredient.unit_of_measure}
                            </span>
                            <span className="text-slate-500">=</span>
                            <span className="text-emerald-400 font-semibold font-mono text-base">
                              ${(ingredient.line_cost || 0).toFixed(2)}
                            </span>
                          </div>
                          {ingredient.last_purchase_date && (
                            <p className="text-xs text-slate-500 mt-1">
                              💰 Last paid: {new Date(ingredient.last_purchase_date).toLocaleDateString()} (from invoice)
                            </p>
                          )}
                          {ingredient.notes && (
                            <p className="text-sm text-slate-400 mt-2 italic">
                              {ingredient.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(ingredient)}
                            disabled={saving}
                            className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(ingredient.id)}
                            disabled={saving}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </InvoiceCardContent>
    </InvoiceCard>
  );
}
