import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Menu as MenuIcon, Search, ChevronDown, ChevronRight, Store } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface MenuItem {
  item_name: string
  description?: string
  category_name?: string
  competitor_name: string
  base_price?: number
  size_variants?: Array<{ size?: string; price: number }>
}

interface MenuItemsViewProps {
  items: MenuItem[]
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categories: (string | undefined)[]
}

export function MenuItemsView({
  items,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: MenuItemsViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))
  const [viewMode, setViewMode] = useState<'category' | 'competitor'>('category')

  // Group items by category or competitor
  const groupedItems = useMemo(() => {
    if (viewMode === 'competitor') {
      return items.reduce((acc, item) => {
        const key = item.competitor_name || 'Unknown'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {} as Record<string, MenuItem[]>)
    }
    return items.reduce((acc, item) => {
      const key = item.category_name || 'Uncategorized'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {} as Record<string, MenuItem[]>)
  }, [items, viewMode])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(groupedItems)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  return (
    <div className="space-y-4">
      {/* Compact Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-sm bg-obsidian/50 border-white/10 text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-8 bg-obsidian/50 border border-white/10 rounded-md px-2 text-white text-xs"
          >
            {categories.map((category) => (
              <option key={category ?? 'uncategorized'} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-obsidian/50 border border-white/10 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('category')}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                viewMode === 'category' 
                  ? "bg-accent-500/20 text-accent-400" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              By Category
            </button>
            <button
              onClick={() => setViewMode('competitor')}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                viewMode === 'competitor' 
                  ? "bg-accent-500/20 text-accent-400" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              By Competitor
            </button>
          </div>

          <button
            onClick={expandAll}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Collapse
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="bg-slate-500/5 border-slate-500/20">
          <CardContent className="p-6 text-center">
            <MenuIcon className="h-8 w-8 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No menu items found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedItems).map(([groupName, groupItems]) => (
            <CompactMenuGroup
              key={groupName}
              name={groupName}
              items={groupItems}
              isExpanded={expandedCategories.has(groupName)}
              onToggle={() => toggleCategory(groupName)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CompactMenuGroupProps {
  name: string
  items: MenuItem[]
  isExpanded: boolean
  onToggle: () => void
  viewMode: 'category' | 'competitor'
}

function CompactMenuGroup({ name, items, isExpanded, onToggle, viewMode }: CompactMenuGroupProps) {
  // Calculate price range for the group
  const prices = items
    .map(item => item.base_price || item.size_variants?.[0]?.price)
    .filter((p): p is number => p !== undefined)
  
  const minPrice = prices.length > 0 ? Math.min(...prices) : null
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-card-dark">
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
          {viewMode === 'competitor' && <Store className="h-3.5 w-3.5 text-accent-400" />}
          <span className="font-medium text-white text-sm">{name}</span>
          <Badge className="bg-slate-500/10 text-slate-400 border-0 text-xs px-1.5 py-0">
            {items.length}
          </Badge>
        </div>
        {minPrice !== null && (
          <span className="text-xs text-slate-400">
            ${minPrice.toFixed(2)} - ${maxPrice?.toFixed(2)}
          </span>
        )}
      </button>

      {/* Items Table */}
      {isExpanded && (
        <div className="border-t border-white/5">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-white/5">
                <th className="text-left px-3 py-1.5 font-medium">Item</th>
                {viewMode === 'category' && (
                  <th className="text-left px-3 py-1.5 font-medium w-32">Source</th>
                )}
                <th className="text-right px-3 py-1.5 font-medium w-24">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item, index) => (
                <CompactMenuRow 
                  key={`${item.item_name}-${index}`} 
                  item={item} 
                  showSource={viewMode === 'category'}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CompactMenuRow({ item, showSource }: { item: MenuItem; showSource: boolean }) {
  const price = item.base_price || item.size_variants?.[0]?.price
  const hasVariants = item.size_variants && item.size_variants.length > 1

  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{item.item_name}</div>
            {item.description && (
              <div className="text-xs text-slate-500 truncate max-w-md">{item.description}</div>
            )}
          </div>
        </div>
      </td>
      {showSource && (
        <td className="px-3 py-2">
          <span className="text-xs text-slate-400 truncate block">{item.competitor_name}</span>
        </td>
      )}
      <td className="px-3 py-2 text-right">
        {price !== undefined ? (
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-primary-500">${price.toFixed(2)}</span>
            {hasVariants && (
              <span className="text-[10px] text-slate-500">
                +{(item.size_variants?.length || 0) - 1} sizes
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
      </td>
    </tr>
  )
}
