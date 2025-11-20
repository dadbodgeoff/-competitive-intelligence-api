/**
 * Invoice Review Table Component
 * RestaurantIQ Platform
 * 
 * Editable table for reviewing and correcting parsed invoice line items
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { formatQuantity, type PackConversionResult } from '@/utils/invoiceUnits';

interface LineItem {
  item_number?: string;
  description: string;
  quantity: number;
  pack_size?: string;
  unit_price: number;
  extended_price: number;
  category?: 'DRY' | 'REFRIGERATED' | 'FROZEN';
  converted_quantity?: number;
  converted_unit?: string;
  per_pack_quantity?: number;
  per_pack_unit?: string;
  conversion?: PackConversionResult;
}

export interface InvoiceReviewTableProps {
  lineItems: LineItem[];
  onUpdateItem: (index: number, field: keyof LineItem, value: any) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
  readonly?: boolean;
  className?: string;
}

export function InvoiceReviewTable({
  lineItems,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  readonly = false,
  className,
}: InvoiceReviewTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<LineItem>>({});

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValues(lineItems[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditValues({});
  };

  const saveEditing = () => {
    if (editingIndex === null) return;
    
    Object.entries(editValues).forEach(([field, value]) => {
      onUpdateItem(editingIndex, field as keyof LineItem, value);
    });
    
    setEditingIndex(null);
    setEditValues({});
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && editingIndex === index) {
      saveEditing();
    } else if (e.key === 'Escape' && editingIndex === index) {
      cancelEditing();
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'DRY':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'REFRIGERATED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'FROZEN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg border border-white/10 bg-obsidian/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-slate-400 font-semibold">Item #</TableHead>
                <TableHead className="text-slate-400 font-semibold min-w-[200px]">Description</TableHead>
                <TableHead className="text-slate-400 font-semibold">Qty</TableHead>
                <TableHead className="text-slate-400 font-semibold">Pack</TableHead>
                <TableHead className="text-slate-400 font-semibold text-right">Unit Price</TableHead>
                <TableHead className="text-slate-400 font-semibold text-right">Extended</TableHead>
                <TableHead className="text-slate-400 font-semibold">Category</TableHead>
                {!readonly && <TableHead className="text-slate-400 font-semibold">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item, index) => {
                const isEditing = editingIndex === index;
                
                return (
                  <TableRow
                    key={index}
                    className={cn(
                      'border-white/10 transition-colors',
                      isEditing ? 'bg-cyan-500/5' : 'hover:bg-white/5'
                    )}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  >
                    <TableCell className="text-slate-300 font-mono text-sm">
                      {isEditing ? (
                        <Input
                          value={editValues.item_number || ''}
                          onChange={(e) => setEditValues({ ...editValues, item_number: e.target.value })}
                          className="h-8 input-field"
                          aria-label="Item number"
                        />
                      ) : (
                        item.item_number || '-'
                      )}
                    </TableCell>
                    
                    <TableCell className="text-white">
                      {isEditing ? (
                        <Input
                          value={editValues.description || ''}
                          onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                          className="h-8 input-field"
                          aria-label="Description"
                        />
                      ) : (
                        <span className="line-clamp-2">{item.description}</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-slate-300">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.quantity || 0}
                          onChange={(e) => setEditValues({ ...editValues, quantity: parseFloat(e.target.value) })}
                          className="h-8 w-20 input-field"
                          aria-label="Quantity"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    
                    <TableCell className="text-slate-300 text-sm">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <Input
                            value={editValues.pack_size || ''}
                            onChange={(e) => setEditValues({ ...editValues, pack_size: e.target.value })}
                            className="h-8 w-28 input-field"
                            aria-label="Pack size"
                          />
                          {item.conversion?.hasConversion &&
                            item.converted_quantity != null &&
                            item.converted_unit && (
                              <div className="text-xs text-slate-500 font-mono">
                                ≈ {formatQuantity(item.converted_quantity, item.converted_unit)}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span>{item.pack_size ? item.pack_size : '-'}</span>
                          {item.conversion?.hasConversion &&
                            item.converted_quantity != null &&
                            item.converted_unit && (
                              <span className="text-xs text-slate-400 font-mono">
                                ≈ {formatQuantity(item.converted_quantity, item.converted_unit)}
                              </span>
                            )}
                          {item.conversion?.hasConversion &&
                            item.per_pack_quantity != null &&
                            item.per_pack_unit &&
                            (item.quantity ?? 0) > 1 && (
                              <span className="text-xs text-slate-500">
                                {formatQuantity(item.per_pack_quantity, item.per_pack_unit)} per pack
                              </span>
                            )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right text-slate-300 font-mono">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues.unit_price || 0}
                          onChange={(e) => setEditValues({ ...editValues, unit_price: parseFloat(e.target.value) })}
                          className="h-8 w-24 input-field text-right"
                          aria-label="Unit price"
                        />
                      ) : (
                        `$${item.unit_price.toFixed(2)}`
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right text-emerald-400 font-mono font-semibold">
                      ${item.extended_price.toFixed(2)}
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editValues.category || ''}
                          onValueChange={(value) => setEditValues({ ...editValues, category: value as any })}
                        >
                          <SelectTrigger className="h-8 w-32 input-field" aria-label="Category">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            <SelectItem value="DRY">DRY</SelectItem>
                            <SelectItem value="REFRIGERATED">REFRIGERATED</SelectItem>
                            <SelectItem value="FROZEN">FROZEN</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={cn('border font-medium', getCategoryColor(item.category))}>
                          {item.category || 'N/A'}
                        </Badge>
                      )}
                    </TableCell>
                    
                    {!readonly && (
                      <TableCell>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveEditing}
                              className={cn(
                                'h-8 w-8 p-0',
                                'bg-emerald-500/10 hover:bg-emerald-500/20',
                                'text-emerald-400 border border-emerald-500/30'
                              )}
                              aria-label="Save changes"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
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
                              onClick={() => startEditing(index)}
                              className={cn(
                                'h-8 w-8 p-0',
                                'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                              )}
                              aria-label={`Edit item ${index + 1}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteItem(index)}
                              className={cn(
                                'h-8 w-8 p-0',
                                'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                              )}
                              aria-label={`Delete item ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {!readonly && (
        <Button
          onClick={onAddItem}
          variant="outline"
          className={cn(
            'w-full border-white/10 text-emerald-400',
            'hover:bg-emerald-500/10 hover:border-emerald-500/30'
          )}
          aria-label="Add new line item"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>
      )}
    </div>
  );
}
