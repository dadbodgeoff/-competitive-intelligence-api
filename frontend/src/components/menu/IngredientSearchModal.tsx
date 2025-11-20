/**
 * Ingredient Search Modal
 * Search and link inventory items to menu items
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Package, X } from 'lucide-react';
import { useInventorySearch } from '@/hooks/useInventorySearch';
import type { InventoryItemSearchResult, AddIngredientRequest } from '@/types/menuRecipe';

interface IngredientSearchModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (request: AddIngredientRequest) => Promise<void>;
  menuItemPriceId?: string | null;
}

export function IngredientSearchModal({
  open,
  onClose,
  onAdd,
  menuItemPriceId,
}: IngredientSearchModalProps) {
  const { query, setQuery, results, loading, clearSearch } = useInventorySearch();
  const [selectedItem, setSelectedItem] = useState<InventoryItemSearchResult | null>(null);
  const [quantity, setQuantity] = useState('1.0');
  const [unit, setUnit] = useState('ea');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSelect = (item: InventoryItemSearchResult) => {
    setSelectedItem(item);
    // InventoryItemSearchResult only has unit_of_measure (base_unit and pack_size are on MenuItemIngredient)
    const baseUnit = item.unit_of_measure;
    setUnit(baseUnit);
  };

  const handleAdd = async () => {
    if (!selectedItem) return;

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return;
    }

    try {
      setAdding(true);
      await onAdd({
        invoice_item_id: selectedItem.id,  // Direct link to invoice_items (source of truth)
        menu_item_price_id: menuItemPriceId || null,
        quantity_per_serving: quantityNum,
        unit_of_measure: unit,
        notes: notes || undefined,
      });

      // Reset and close
      handleClose();
    } catch {
      // Error handled by parent
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setQuantity('1.0');
    setUnit('ea');
    setNotes('');
    clearSearch();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="ingredient-search-description">
        <DialogHeader>
          <DialogTitle className="text-white">Add Ingredient</DialogTitle>
        </DialogHeader>
        <p id="ingredient-search-description" className="sr-only">
          Search for ingredients from your invoice items to add to this menu item recipe
        </p>

        <div className="space-y-6">
          {/* Search */}
          {!selectedItem && (
            <div>
              <Label className="text-slate-300 mb-2">Search inventory</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for ingredients..."
                  className="input-field pl-10"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 animate-spin" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Type at least 2 characters to search
              </p>
            </div>
          )}

          {/* Search Results */}
          {!selectedItem && results.length > 0 && (
            <div>
              <Label className="text-slate-300 mb-2">Results ({results.length})</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left p-4 rounded-lg border border-white/10 bg-obsidian/50 hover:bg-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
                          <span className="font-mono">
                            ${(item.calculated_unit_cost || 0).toFixed(4)}/{item.base_unit}
                          </span>
                          {item.pack_size && (
                            <Badge className="bg-emerald-700/50 text-emerald-300 text-xs">
                              Pack: {item.pack_size}
                            </Badge>
                          )}
                          {item.pack_price && (
                            <span className="font-mono">${item.pack_price.toFixed(2)}/pack</span>
                          )}
                          {item.match_confidence && (
                            <Badge className={
                              item.match_confidence.confidence === 'high' 
                                ? 'bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30'
                                : item.match_confidence.confidence === 'medium'
                                ? 'bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/30'
                            }>
                              {item.match_confidence.confidence === 'high' ? '✓ ' : ''}
                              {Math.round((item.similarity_score || 0) * 100)}% match
                            </Badge>
                          )}
                        </div>
                        {item.last_purchase_date && (
                          <p className="text-xs text-slate-500 mt-1">
                            Last purchased: {new Date(item.last_purchase_date).toLocaleDateString()}
                          </p>
                        )}
                        {item.warnings && item.warnings.length > 0 && (
                          <p className="text-xs text-yellow-500 mt-1">
                            ⚠️ {item.warnings[0]}
                          </p>
                        )}
                      </div>
                      <Button size="sm" className="btn-secondary ml-4" onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item);
                      }}>
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!selectedItem && query.length >= 2 && !loading && results.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No inventory items found</p>
              <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
            </div>
          )}

          {/* Selected Item Form */}
          {selectedItem && (
            <div className="space-y-4">
              {/* Selected item display */}
              <div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{selectedItem.name}</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">
                        ${(selectedItem.calculated_unit_cost || 0).toFixed(4)}/{selectedItem.base_unit}
                      </p>
                      {selectedItem.pack_size && (
                        <p className="text-xs text-slate-500">
                          Pack: {selectedItem.pack_size} @ ${selectedItem.pack_price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quantity input */}
              <div>
                <Label className="text-slate-300 mb-2">Quantity per serving</Label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1.0"
                      className="input-field text-lg"
                      autoFocus
                    />
                  </div>
                  <span className="text-slate-400 text-lg">×</span>
                  <div className="w-32">
                    <Input
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="ea"
                      className="input-field"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  How much of this ingredient is used per serving? (e.g., 1.0 ea, 3.0 oz, 0.5 lb)
                </p>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-slate-300 mb-2">Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this ingredient..."
                  className="input-field"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAdd}
                  disabled={adding || !quantity || parseFloat(quantity) <= 0}
                  className="btn-primary shadow-emerald flex-1"
                >
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Ingredient'
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  disabled={adding}
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
