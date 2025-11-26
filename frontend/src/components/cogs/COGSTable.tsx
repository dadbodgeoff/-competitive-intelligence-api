/**
 * COGS Table Component - Modernized 2025
 * Display all menu items with their COGS data
 * Features category grouping, inline actions, and skeleton loading
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Filter,
  DollarSign,
} from 'lucide-react'
import type { MenuItemRecipe } from '@/types/menuRecipe'
import { cn } from '@/lib/utils'

export interface MenuItem {
  id: string
  name: string
  category?: string
  prices: Array<{ id?: string; size: string | null; price: number }>
}

export interface MenuCategory {
  name: string
  items: MenuItem[]
}

interface COGSTableProps {
  categories: MenuCategory[]
  recipes: Map<string, MenuItemRecipe>
  loadingRecipes?: boolean
}

type SortField = 'name' | 'price' | 'cogs' | 'margin' | 'foodCost'
type SortDirection = 'asc' | 'desc'
type FilterStatus = 'all' | 'with-recipe' | 'no-recipe' | 'high-cost'

export function COGSTable({ categories, recipes, loadingRecipes }: COGSTableProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.name)) // Start expanded
  )

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  // Expand/collapse all
  const expandAll = () => setExpandedCategories(new Set(categories.map((cat) => cat.name)))
  const collapseAll = () => setExpandedCategories(new Set())

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    return categories.map((category) => {
      let items = [...category.items]

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            category.name.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      if (filterStatus === 'with-recipe') {
        items = items.filter((item) => recipes.has(item.id))
      } else if (filterStatus === 'no-recipe') {
        items = items.filter((item) => !recipes.has(item.id))
      } else if (filterStatus === 'high-cost') {
        items = items.filter((item) => {
          const recipe = recipes.get(item.id)
          return recipe && recipe.food_cost_percent >= 35
        })
      }

      // Sort items
      items.sort((a, b) => {
        const recipeA = recipes.get(a.id)
        const recipeB = recipes.get(b.id)

        let comparison = 0

        switch (sortField) {
          case 'name':
            comparison = (a.name || '').localeCompare(b.name || '')
            break
          case 'price':
            comparison = (a.prices[0]?.price || 0) - (b.prices[0]?.price || 0)
            break
          case 'cogs':
            comparison = (recipeA?.total_cogs || 0) - (recipeB?.total_cogs || 0)
            break
          case 'margin':
            comparison = (recipeA?.gross_profit || 0) - (recipeB?.gross_profit || 0)
            break
          case 'foodCost':
            comparison = (recipeA?.food_cost_percent || 999) - (recipeB?.food_cost_percent || 999)
            break
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })

      return { ...category, items }
    }).filter((cat) => cat.items.length > 0)
  }, [categories, recipes, searchQuery, sortField, sortDirection, filterStatus])

  const totalFilteredItems = filteredAndSortedCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary-400" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary-400" />
    )
  }

  const getHealthBadge = (recipe: MenuItemRecipe | undefined) => {
    if (!recipe) {
      return (
        <Badge variant="secondary" className="bg-slate-700/50 text-slate-400 border-0">
          <AlertCircle className="h-3 w-3 mr-1" />
          No Recipe
        </Badge>
      )
    }

    const foodCost = recipe.food_cost_percent

    if (foodCost < 30) {
      return (
        <Badge className="bg-emerald-500/10 text-success-400 border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Healthy
        </Badge>
      )
    } else if (foodCost < 35) {
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-0">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Warning
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500/10 text-destructive border-0">
          <AlertCircle className="h-3 w-3 mr-1" />
          High Cost
        </Badge>
      )
    }
  }

  const filterButtons: { value: FilterStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All' },
    { value: 'with-recipe', label: 'With Recipe' },
    { value: 'no-recipe', label: 'No Recipe' },
    { value: 'high-cost', label: 'High Cost' },
  ]

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader className="py-3 px-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary-400" />
                Menu Items ({totalFilteredItems})
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Click categories to expand • Click item to build/edit recipe
              </p>
            </div>
            {loadingRecipes && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="h-3 w-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            )}
          </div>

          {/* Filters Row - Compact */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                type="text"
                placeholder="Search items or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs bg-obsidian border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Filter Buttons - Compact */}
            <div className="flex items-center gap-0.5 bg-obsidian rounded-lg p-0.5 border border-white/10">
              {filterButtons.map((btn) => (
                <Button
                  key={btn.value}
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilterStatus(btn.value)}
                  className={cn(
                    'h-7 px-2.5 text-xs',
                    filterStatus === btn.value
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Expand/Collapse - Compact */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={expandAll}
              className="text-slate-400 hover:text-white h-6 text-xs px-2"
            >
              Expand All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={collapseAll}
              className="text-slate-400 hover:text-white h-6 text-xs px-2"
            >
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        {/* Categories */}
        <div className="space-y-2">
          {filteredAndSortedCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.name)
            const categoryRecipeCount = category.items.filter((item) =>
              recipes.has(item.id)
            ).length

            return (
              <div key={category.name} className="border border-white/10 rounded-lg overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between p-2.5 bg-obsidian hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <div className="text-left">
                      <h3 className="font-medium text-white text-sm">{category.name}</h3>
                      <p className="text-[10px] text-slate-500">
                        {category.items.length} items • {categoryRecipeCount} with recipes
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/5 text-slate-300 border-0 text-xs">
                    {category.items.length}
                  </Badge>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="text-left py-2 px-3">
                            <button
                              onClick={() => handleSort('name')}
                              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                              Item <SortIcon field="name" />
                            </button>
                          </th>
                          <th className="text-right py-2 px-3 w-24">
                            <button
                              onClick={() => handleSort('price')}
                              className="flex items-center gap-1.5 ml-auto text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                              Price <SortIcon field="price" />
                            </button>
                          </th>
                          <th className="text-right py-2 px-3 w-24">
                            <button
                              onClick={() => handleSort('cogs')}
                              className="flex items-center gap-1.5 ml-auto text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                              COGS <SortIcon field="cogs" />
                            </button>
                          </th>
                          <th className="text-right py-2 px-3 w-24">
                            <button
                              onClick={() => handleSort('margin')}
                              className="flex items-center gap-1.5 ml-auto text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                              Margin <SortIcon field="margin" />
                            </button>
                          </th>
                          <th className="text-right py-2 px-3 w-24">
                            <button
                              onClick={() => handleSort('foodCost')}
                              className="flex items-center gap-1.5 ml-auto text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                              Food % <SortIcon field="foodCost" />
                            </button>
                          </th>
                          <th className="text-center py-2 px-3 w-28">
                            <span className="text-xs font-medium text-slate-400">Status</span>
                          </th>
                          <th className="text-right py-2 px-3 w-20" />
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item) => {
                          const recipe = recipes.get(item.id)
                          const price = item.prices[0]?.price || 0

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                              onClick={() => navigate(`/cogs/items/${item.id}`)}
                            >
                              <td className="py-2.5 px-3">
                                <span className="font-medium text-white text-sm">{item.name}</span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="font-mono text-sm text-primary-400">
                                  ${price.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {loadingRecipes && !recipe ? (
                                  <Skeleton className="h-5 w-14 ml-auto bg-white/5" />
                                ) : (
                                  <span className="font-mono text-sm text-white">
                                    {recipe ? `$${recipe.total_cogs.toFixed(2)}` : '—'}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {loadingRecipes && !recipe ? (
                                  <Skeleton className="h-5 w-14 ml-auto bg-white/5" />
                                ) : (
                                  <span className="font-mono text-sm text-success-400">
                                    {recipe ? `$${recipe.gross_profit.toFixed(2)}` : '—'}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {loadingRecipes && !recipe ? (
                                  <Skeleton className="h-5 w-12 ml-auto bg-white/5" />
                                ) : (
                                  <span className={cn(
                                    'font-mono text-sm',
                                    recipe && recipe.food_cost_percent < 30 && 'text-success-400',
                                    recipe && recipe.food_cost_percent >= 30 && recipe.food_cost_percent < 35 && 'text-amber-400',
                                    recipe && recipe.food_cost_percent >= 35 && 'text-destructive',
                                    !recipe && 'text-slate-500'
                                  )}>
                                    {recipe ? `${recipe.food_cost_percent.toFixed(1)}%` : '—'}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {loadingRecipes && !recipe ? (
                                  <Skeleton className="h-6 w-20 mx-auto bg-white/5" />
                                ) : (
                                  getHealthBadge(recipe)
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/cogs/items/${item.id}`)
                                  }}
                                  className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 h-7 text-xs"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  {recipe ? 'Edit' : 'Build'}
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}

          {filteredAndSortedCategories.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No items match your filters</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setFilterStatus('all')
                }}
                className="mt-2 text-primary-400"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
