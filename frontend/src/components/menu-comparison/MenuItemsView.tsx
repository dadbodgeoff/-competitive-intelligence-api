import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Menu as MenuIcon, Filter, Search } from 'lucide-react'

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
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-obsidian/50 border-white/10 text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-obsidian/50 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
          >
            {categories.map((category) => (
              <option key={category ?? 'uncategorized'} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="bg-slate-500/5 border-slate-500/20">
          <CardContent className="p-8 text-center">
            <MenuIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No menu items found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item, index) => (
            <MenuItemCard key={`${item.competitor_name}-${index}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">{item.item_name}</h3>
              {item.category_name && (
                <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/30 border text-xs">
                  {item.category_name}
                </Badge>
              )}
            </div>

            {item.description && <p className="text-slate-400 text-sm mb-3">{item.description}</p>}

            <div className="text-xs text-slate-500">From: {item.competitor_name}</div>
          </div>

          <div className="text-right">
            {item.size_variants && item.size_variants.length > 0 ? (
              <div className="space-y-1">
                {item.size_variants.map((variant, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-slate-400">{variant.size || 'Regular'}: </span>
                    <span className="text-emerald-400 font-semibold">${variant.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : item.base_price ? (
              <div className="text-lg font-semibold text-emerald-400">${item.base_price.toFixed(2)}</div>
            ) : (
              <div className="text-slate-500 text-sm">Price not available</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

