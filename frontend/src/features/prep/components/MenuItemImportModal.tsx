import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Package, Check, Loader2, ChefHat } from 'lucide-react'
import { apiClient } from '@/services/api/client'

interface MenuItem {
  id: string
  item_name: string
  category?: string
  price?: number
}

interface MenuItemImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (menuItemIds: string[]) => Promise<void>
  existingMenuItemIds?: string[]
}

export function MenuItemImportModal({
  open,
  onOpenChange,
  onImport,
  existingMenuItemIds = [],
}: MenuItemImportModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isImporting, setIsImporting] = useState(false)
  
  // Fetch menu items from current menu
  const { data: menuItemsData, isLoading } = useQuery({
    queryKey: ['menu-items-for-import'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ success: boolean; menu: any; categories: any[] }>('/api/v1/menu/current')
        if (!response.data.success || !response.data.categories) {
          return []
        }
        // Flatten all items from categories
        const allItems: MenuItem[] = []
        response.data.categories.forEach((cat: any) => {
          if (cat.items && Array.isArray(cat.items)) {
            cat.items.forEach((item: any) => {
              allItems.push({
                id: item.id,
                item_name: item.item_name || item.name,
                category: cat.name,
                price: item.prices?.[0]?.price,
              })
            })
          }
        })
        return allItems
      } catch {
        return []
      }
    },
    enabled: open,
  })
  
  const menuItems = menuItemsData || []
  
  // Filter and group by category
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return menuItems.filter(item =>
      item.item_name.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }, [menuItems, searchQuery])
  
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {}
    filteredItems.forEach(item => {
      const category = item.category || 'Uncategorized'
      if (!groups[category]) groups[category] = []
      groups[category].push(item)
    })
    return groups
  }, [filteredItems])
  
  const categories = Object.keys(groupedItems).sort()
  
  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }
  
  const toggleCategory = (category: string) => {
    const categoryItems = groupedItems[category] || []
    const categoryIds = categoryItems.map(i => i.id)
    const allSelected = categoryIds.every(id => selectedIds.has(id))
    
    const newSelected = new Set(selectedIds)
    if (allSelected) {
      categoryIds.forEach(id => newSelected.delete(id))
    } else {
      categoryIds.forEach(id => newSelected.add(id))
    }
    setSelectedIds(newSelected)
  }
  
  const handleImport = async () => {
    if (selectedIds.size === 0) return
    
    setIsImporting(true)
    try {
      await onImport(Array.from(selectedIds))
      setSelectedIds(new Set())
      onOpenChange(false)
    } finally {
      setIsImporting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[85vh] flex flex-col rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary-400" />
            Import from Menu
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Select menu items to add to your prep template. Items already in the template are disabled.
          </DialogDescription>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500/50"
          />
        </div>
        
        {/* Selection summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {filteredItems.length} items found
            {selectedIds.size > 0 && (
              <span className="text-primary-400 ml-2">
                • {selectedIds.size} selected
              </span>
            )}
          </span>
          {selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white h-7"
            >
              Clear selection
            </Button>
          )}
        </div>
        
        {/* Items list */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No menu items found
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {categories.map(category => {
                const items = groupedItems[category]
                const selectableItems = items.filter(i => !existingMenuItemIds.includes(i.id))
                const selectedInCategory = selectableItems.filter(i => selectedIds.has(i.id)).length
                const allSelected = selectableItems.length > 0 && selectedInCategory === selectableItems.length
                const someSelected = selectedInCategory > 0 && !allSelected
                
                return (
                  <div key={category}>
                    {/* Category header */}
                    <div className="flex items-center gap-3 mb-2 sticky top-0 bg-slate-900 py-1 z-10">
                      <Checkbox
                        checked={allSelected}
                        // @ts-ignore - indeterminate is valid
                        indeterminate={someSelected}
                        onCheckedChange={() => toggleCategory(category)}
                        disabled={selectableItems.length === 0}
                        className="border-white/30 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
                      />
                      <span className="font-medium text-white">{category}</span>
                      <Badge variant="outline" className="text-slate-400 border-white/10">
                        {items.length}
                      </Badge>
                    </div>
                    
                    {/* Items */}
                    <div className="space-y-1 ml-7">
                      {items.map(item => {
                        const isExisting = existingMenuItemIds.includes(item.id)
                        const isSelected = selectedIds.has(item.id)
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => !isExisting && toggleItem(item.id)}
                            disabled={isExisting}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                              isExisting
                                ? 'opacity-50 cursor-not-allowed bg-slate-950/30'
                                : isSelected
                                  ? 'bg-primary-500/10 border border-primary-500/30'
                                  : 'hover:bg-slate-950 border border-transparent'
                            )}
                          >
                            <Checkbox
                              checked={isSelected || isExisting}
                              disabled={isExisting}
                              className={cn(
                                'border-white/30',
                                isSelected && 'bg-primary-500 border-primary-500',
                                isExisting && 'bg-slate-500 border-slate-500'
                              )}
                            />
                            <span className={cn(
                              'flex-1 text-sm',
                              isExisting ? 'text-slate-500' : 'text-white'
                            )}>
                              {item.item_name}
                            </span>
                            {item.price && (
                              <span className="text-xs text-slate-500">
                                ${item.price.toFixed(2)}
                              </span>
                            )}
                            {isExisting && (
                              <Badge variant="outline" className="text-xs text-slate-400 border-slate-500/30 bg-slate-500/10">
                                <Check className="h-3 w-3 mr-1" />
                                Added
                              </Badge>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="border-t border-white/10 pt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.size === 0 || isImporting}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Import {selectedIds.size} Item{selectedIds.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
