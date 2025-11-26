/**
 * Ingredient List Component - Modernized 2025
 * Display and edit linked ingredients with inline editing
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Edit2,
  Trash2,
  Check,
  X,
  Plus,
  Package,
  AlertTriangle,
  DollarSign,
  Clock,
} from 'lucide-react'
import type { MenuItemIngredient } from '@/types/menuRecipe'

interface IngredientListProps {
  ingredients: MenuItemIngredient[]
  onEdit: (ingredientId: string, quantity: number, notes?: string) => Promise<void>
  onDelete: (ingredientId: string) => Promise<void>
  onAddClick: () => void
  saving: boolean
}

export function IngredientList({
  ingredients,
  onEdit,
  onDelete,
  onAddClick,
  saving,
}: IngredientListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const startEdit = (ingredient: MenuItemIngredient) => {
    setEditingId(ingredient.id)
    setEditQuantity(ingredient.quantity_per_serving.toString())
    setEditNotes(ingredient.notes || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuantity('')
    setEditNotes('')
  }

  const saveEdit = async (ingredientId: string) => {
    const quantity = parseFloat(editQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      return
    }

    await onEdit(ingredientId, quantity, editNotes || undefined)
    cancelEdit()
  }

  const handleDelete = async (ingredientId: string) => {
    if (confirm('Remove this ingredient from the recipe?')) {
      await onDelete(ingredientId)
    }
  }

  // Calculate total
  const totalCost = ingredients.reduce((sum, ing) => sum + (ing.line_cost || 0), 0)

  return (
    <Card className="bg-slate-900/80 border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-primary-400" />
              Ingredients ({ingredients.length})
            </CardTitle>
            {ingredients.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Total: <span className="text-amber-400 font-mono">${totalCost.toFixed(2)}</span>
              </p>
            )}
          </div>
          <Button
            onClick={onAddClick}
            disabled={saving}
            size="sm"
            className="bg-primary-600 hover:bg-primary-500"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Ingredient
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {ingredients.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
                <Package className="h-8 w-8 text-slate-500" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No ingredients yet</h4>
            <p className="text-slate-400 mb-2 max-w-sm mx-auto">
              Add ingredients to calculate the true cost of this menu item
            </p>
            <p className="text-xs text-slate-500 mb-6 flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" />
              Costs are pulled from your latest invoice prices automatically
            </p>
            <Button onClick={onAddClick} className="bg-primary-600 hover:bg-primary-500">
              <Plus className="h-4 w-4 mr-2" />
              Add First Ingredient
            </Button>
          </div>
        ) : (
          // Ingredient list
          <div className="space-y-2">
            {ingredients.map((ingredient) => {
              const isEditing = editingId === ingredient.id
              const hasWarnings = ingredient.warnings && ingredient.warnings.length > 0

              return (
                <div
                  key={ingredient.id}
                  className={cn(
                    'border rounded-lg p-3 transition-all',
                    isEditing 
                      ? 'bg-primary-500/5 border-primary-500/30' 
                      : 'bg-slate-950/50 border-white/10 hover:border-white/20'
                  )}
                >
                  {isEditing ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-white font-medium">
                        <Package className="h-4 w-4 text-slate-400" />
                        {ingredient.invoice_item_description}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">
                            Quantity per serving
                          </label>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="bg-slate-950 border-white/10 text-white"
                              placeholder="1.0"
                            />
                            <span className="text-slate-400 text-sm whitespace-nowrap">
                              {ingredient.unit_of_measure}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">
                            Notes (optional)
                          </label>
                          <Input
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="bg-slate-950 border-white/10 text-white"
                            placeholder="Add notes..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(ingredient.id)}
                          disabled={saving}
                          className="bg-emerald-600 hover:bg-emerald-500"
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white truncate">
                            {ingredient.invoice_item_description}
                          </h4>
                          {hasWarnings && (
                            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        
                        {/* Cost calculation display */}
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-0 font-mono">
                            {ingredient.quantity_per_serving} {ingredient.unit_of_measure}
                          </Badge>
                          <span className="text-slate-600">×</span>
                          <span className="text-slate-400 font-mono">
                            ${(ingredient.calculated_unit_cost || 0).toFixed(3)}/{ingredient.base_unit || ingredient.unit_of_measure}
                          </span>
                          <span className="text-slate-600">=</span>
                          <span className="text-amber-400 font-semibold font-mono">
                            ${(ingredient.line_cost || 0).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Last purchase info */}
                        {ingredient.last_purchase_date && (
                          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last invoice: {new Date(ingredient.last_purchase_date).toLocaleDateString()}
                          </p>
                        )}
                        
                        {/* Notes */}
                        {ingredient.notes && (
                          <p className="text-sm text-slate-400 mt-2 italic">
                            "{ingredient.notes}"
                          </p>
                        )}
                        
                        {/* Warnings */}
                        {hasWarnings && (
                          <div className="mt-2 text-xs text-amber-400/80">
                            {ingredient.warnings?.map((warning, idx) => (
                              <span key={idx} className="block">⚠ {warning}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(ingredient)}
                          disabled={saving}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
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
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
