/**
 * Menu Review Table Component
 * RestaurantIQ Platform
 * 
 * Editable table for reviewing and correcting parsed menu items
 */

import { useState } from 'react';
import { cn } from '@/design-system';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '../ui/textarea';
import { Trash2, Plus, Edit2, Check, X, ChevronDown, ChevronRight, UtensilsCrossed } from 'lucide-react';

interface MenuItemPrice {
  size: string | null;
  price: number;
}

interface MenuItem {
  id?: string;  // Menu item ID from database
  name: string;
  description?: string;
  prices: MenuItemPrice[];  // Changed from single price to array
  category?: string;
  dietary_tags?: string[];
  available?: boolean;
}

interface MenuCategory {
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface MenuReviewTableProps {
  categories: MenuCategory[];
  onUpdateItem: (categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: any) => void;
  onDeleteItem: (categoryIndex: number, itemIndex: number) => void;
  onAddItem: (categoryIndex: number) => void;
  onUpdateCategory: (categoryIndex: number, field: keyof MenuCategory, value: any) => void;
  onAddCategory: () => void;
  onDeleteCategory: (categoryIndex: number) => void;
  readonly?: boolean;
  className?: string;
  onBuildRecipe?: (itemName: string) => void;
}

export function MenuReviewTable({
  categories,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onUpdateCategory,
  onAddCategory,
  onDeleteCategory,
  readonly = false,
  className,
  onBuildRecipe,
}: MenuReviewTableProps) {
  const [editingItem, setEditingItem] = useState<{ categoryIndex: number; itemIndex: number } | null>(null);
  const [editValues, setEditValues] = useState<Partial<MenuItem>>({});
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [categoryEditValue, setCategoryEditValue] = useState('');
  // Initialize with all categories collapsed
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(() => 
    new Set(categories.map((_, index) => index))
  );

  const startEditingItem = (categoryIndex: number, itemIndex: number) => {
    setEditingItem({ categoryIndex, itemIndex });
    setEditValues(categories[categoryIndex].items[itemIndex]);
  };

  const cancelEditingItem = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const saveEditingItem = () => {
    if (editingItem === null) return;
    
    Object.entries(editValues).forEach(([field, value]) => {
      onUpdateItem(editingItem.categoryIndex, editingItem.itemIndex, field as keyof MenuItem, value);
    });
    
    setEditingItem(null);
    setEditValues({});
  };

  const startEditingCategory = (categoryIndex: number) => {
    setEditingCategory(categoryIndex);
    setCategoryEditValue(categories[categoryIndex].name);
  };

  const saveEditingCategory = () => {
    if (editingCategory === null) return;
    onUpdateCategory(editingCategory, 'name', categoryEditValue);
    setEditingCategory(null);
    setCategoryEditValue('');
  };

  const toggleCategory = (categoryIndex: number) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryIndex)) {
      newCollapsed.delete(categoryIndex);
    } else {
      newCollapsed.add(categoryIndex);
    }
    setCollapsedCategories(newCollapsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryIndex: number, itemIndex: number) => {
    if (e.key === 'Enter' && editingItem?.categoryIndex === categoryIndex && editingItem?.itemIndex === itemIndex) {
      saveEditingItem();
    } else if (e.key === 'Escape' && editingItem?.categoryIndex === categoryIndex && editingItem?.itemIndex === itemIndex) {
      cancelEditingItem();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {categories.map((category, categoryIndex) => {
        const isCollapsed = collapsedCategories.has(categoryIndex);
        const isEditingCat = editingCategory === categoryIndex;
        
        return (
          <div key={categoryIndex} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between bg-card-dark/50 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategory(categoryIndex)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  aria-label={isCollapsed ? 'Expand category' : 'Collapse category'}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {isEditingCat ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={categoryEditValue}
                      onChange={(e) => setCategoryEditValue(e.target.value)}
                      className="h-8 input-field"
                      autoFocus
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') saveEditingCategory();
                        if (e.key === 'Escape') setEditingCategory(null);
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={saveEditingCategory}
                      className="h-8 w-8 p-0 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 border border-white/10"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCategory(null)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <Badge className="bg-accent-500/10 text-accent-400 border-accent-500/30">
                      {category.items.length} items
                    </Badge>
                  </>
                )}
              </div>
              
              {!readonly && !isEditingCat && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditingCategory(categoryIndex)}
                    className="h-8 text-accent-400 hover:text-accent-300 hover:bg-accent-500/10"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteCategory(categoryIndex)}
                    className="h-8 text-destructive hover:text-red-300 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Category Items */}
            {!isCollapsed && (
              <div className="rounded-lg border border-white/10 bg-obsidian/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-400 font-semibold min-w-[200px]">Item Name</TableHead>
                        <TableHead className="text-slate-400 font-semibold min-w-[250px]">Description</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-right">Price</TableHead>
                        <TableHead className="text-slate-400 font-semibold">Available</TableHead>
                        <TableHead className="text-slate-400 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.items.map((item, itemIndex) => {
                        const isEditing = editingItem?.categoryIndex === categoryIndex && editingItem?.itemIndex === itemIndex;
                        
                        return (
                          <TableRow
                            key={itemIndex}
                            className={cn(
                              'border-white/10 transition-colors',
                              isEditing ? 'bg-accent-500/5' : 'hover:bg-white/5'
                            )}
                            onKeyDown={(e) => handleKeyDown(e, categoryIndex, itemIndex)}
                          >
                            <TableCell className="text-white font-medium">
                              {isEditing ? (
                                <Input
                                  value={editValues.name || ''}
                                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                  className="h-8 input-field"
                                  aria-label="Item name"
                                />
                              ) : (
                                item.name
                              )}
                            </TableCell>
                            
                            <TableCell className="text-slate-300">
                              {isEditing ? (
                                <Textarea
                                  value={editValues.description || ''}
                                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                  className="min-h-[60px] input-field text-sm"
                                  aria-label="Description"
                                />
                              ) : (
                                <span className="text-sm line-clamp-2">{item.description || '-'}</span>
                              )}
                            </TableCell>
                            
                            <TableCell className="text-right text-primary-500 font-mono font-semibold">
                              {isEditing ? (
                                <div className="space-y-1 text-xs">
                                  {(editValues.prices || item.prices || []).map((priceItem, priceIdx) => (
                                    <div key={priceIdx} className="flex gap-1 items-center justify-end">
                                      <Input
                                        value={priceItem.size || ''}
                                        onChange={(e) => {
                                          const newPrices = [...(editValues.prices || item.prices || [])];
                                          newPrices[priceIdx] = { ...newPrices[priceIdx], size: e.target.value || null };
                                          setEditValues({ ...editValues, prices: newPrices });
                                        }}
                                        placeholder="Size"
                                        className="h-7 w-16 input-field text-xs"
                                      />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={priceItem.price || 0}
                                        onChange={(e) => {
                                          const newPrices = [...(editValues.prices || item.prices || [])];
                                          newPrices[priceIdx] = { ...newPrices[priceIdx], price: parseFloat(e.target.value) };
                                          setEditValues({ ...editValues, prices: newPrices });
                                        }}
                                        className="h-7 w-20 input-field text-right text-xs"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {(item.prices || []).map((priceItem, priceIdx) => (
                                    <div key={priceIdx} className="text-sm whitespace-nowrap">
                                      {priceItem.size ? (
                                        <span className="text-slate-400 text-xs mr-2">{priceItem.size}:</span>
                                      ) : null}
                                      <span>${priceItem.price.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editValues.available ?? true}
                                  onChange={(e) => setEditValues({ ...editValues, available: e.target.checked })}
                                  className="h-4 w-4"
                                  aria-label="Available"
                                />
                              ) : (
                                <Badge className={cn(
                                  'border font-medium',
                                  item.available !== false
                                    ? 'bg-primary-500/10 text-primary-500 border-white/10'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                )}>
                                  {item.available !== false ? 'Yes' : 'No'}
                                </Badge>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              {!readonly ? (
                                isEditing ? (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={saveEditingItem}
                                      className={cn(
                                        'h-8 w-8 p-0',
                                        'bg-primary-500/10 hover:bg-primary-500/20',
                                        'text-primary-500 border border-white/10'
                                      )}
                                      aria-label="Save changes"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={cancelEditingItem}
                                      className={cn(
                                        'h-8 w-8 p-0',
                                        'text-slate-400 hover:text-white hover:bg-white/5'
                                      )}
                                      aria-label="Cancel editing"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditingItem(categoryIndex, itemIndex)}
                                      className={cn(
                                        'h-8 w-8 p-0',
                                        'text-accent-400 hover:text-accent-300 hover:bg-accent-500/10'
                                      )}
                                      aria-label={`Edit item ${itemIndex + 1}`}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onDeleteItem(categoryIndex, itemIndex)}
                                      className={cn(
                                        'h-8 w-8 p-0',
                                        'text-destructive hover:text-red-300 hover:bg-destructive/10'
                                      )}
                                      aria-label={`Delete item ${itemIndex + 1}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              ) : (
                                onBuildRecipe && (
                                  <Button
                                    size="sm"
                                    onClick={() => onBuildRecipe(item.name)}
                                    className="btn-secondary text-xs"
                                  >
                                    <UtensilsCrossed className="h-3 w-3 mr-1" />
                                    View COGS
                                  </Button>
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {!readonly && (
                  <div className="p-3 border-t border-white/10">
                    <Button
                      onClick={() => onAddItem(categoryIndex)}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'w-full border-white/10 text-primary-500',
                        'hover:bg-primary-500/10 hover:border-white/10'
                      )}
                      aria-label={`Add item to ${category.name}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item to {category.name}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!readonly && (
        <Button
          onClick={onAddCategory}
          variant="outline"
          className={cn(
            'w-full border-white/10 text-accent-400',
            'hover:bg-accent-500/10 hover:border-accent-500/30'
          )}
          aria-label="Add new category"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      )}
    </div>
  );
}
