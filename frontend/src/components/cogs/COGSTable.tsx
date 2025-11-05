/**
 * COGS Table Component
 * Display all menu items with their COGS data
 * Supports category grouping with collapsed state
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceCard, InvoiceCardHeader, InvoiceCardContent } from '@/design-system/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import type { MenuItemRecipe } from '@/types/menuRecipe';

export interface MenuItem {
  id: string;
  name: string;
  category?: string;
  prices: Array<{ id?: string; size: string | null; price: number }>;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface COGSTableProps {
  categories: MenuCategory[];
  recipes: Map<string, MenuItemRecipe>;
  loadingRecipes?: boolean;
}

type SortField = 'name' | 'price' | 'cogs' | 'margin' | 'foodCost';
type SortDirection = 'asc' | 'desc';

export function COGSTable({ categories, recipes, loadingRecipes }: COGSTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-recipe' | 'no-recipe'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(categories.map((cat) => cat.name)));
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    return categories.map((category) => {
      let items = [...category.items];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            category.name.toLowerCase().includes(query)
        );
      }

      // Apply status filter
      if (filterStatus === 'with-recipe') {
        items = items.filter((item) => recipes.has(item.id));
      } else if (filterStatus === 'no-recipe') {
        items = items.filter((item) => !recipes.has(item.id));
      }

      // Sort items
      items.sort((a, b) => {
        const recipeA = recipes.get(a.id);
        const recipeB = recipes.get(b.id);

        let comparison = 0;

        switch (sortField) {
          case 'name':
            comparison = (a.name || '').localeCompare(b.name || '');
            break;
          case 'price':
            const priceA = a.prices[0]?.price || 0;
            const priceB = b.prices[0]?.price || 0;
            comparison = priceA - priceB;
            break;
          case 'cogs':
            const cogsA = recipeA?.total_cogs || 0;
            const cogsB = recipeB?.total_cogs || 0;
            comparison = cogsA - cogsB;
            break;
          case 'margin':
            const marginA = recipeA?.gross_profit || 0;
            const marginB = recipeB?.gross_profit || 0;
            comparison = marginA - marginB;
            break;
          case 'foodCost':
            const fcA = recipeA?.food_cost_percent || 999;
            const fcB = recipeB?.food_cost_percent || 999;
            comparison = fcA - fcB;
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });

      return {
        ...category,
        items,
      };
    }).filter((cat) => cat.items.length > 0); // Only show categories with matching items
  }, [categories, recipes, searchQuery, sortField, sortDirection, filterStatus]);

  const totalFilteredItems = filteredAndSortedCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-slate-500" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-cyan-400" />
    ) : (
      <ArrowDown className="h-4 w-4 text-cyan-400" />
    );
  };

  const getHealthBadge = (recipe: MenuItemRecipe | undefined) => {
    if (!recipe) {
      return (
        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          No Recipe
        </Badge>
      );
    }

    const foodCost = recipe.food_cost_percent;

    if (foodCost < 30) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Healthy
        </Badge>
      );
    } else if (foodCost < 35) {
      return (
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Warning
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          High Cost
        </Badge>
      );
    }
  };

  return (
    <InvoiceCard variant="elevated">
      <InvoiceCardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Menu Items ({totalFilteredItems})
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Click categories to expand and view items
              </p>
            </div>
            {loadingRecipes && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading recipes...</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search items or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={
                  filterStatus === 'all'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    : 'border-white/10 text-slate-400'
                }
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'with-recipe' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('with-recipe')}
                className={
                  filterStatus === 'with-recipe'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'border-white/10 text-slate-400'
                }
              >
                With Recipe
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'no-recipe' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('no-recipe')}
                className={
                  filterStatus === 'no-recipe'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : 'border-white/10 text-slate-400'
                }
              >
                No Recipe
              </Button>
            </div>
          </div>

          {/* Expand/Collapse All */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={expandAll}
              className="border-white/10 text-slate-400 hover:bg-white/5"
            >
              Expand All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={collapseAll}
              className="border-white/10 text-slate-400 hover:bg-white/5"
            >
              Collapse All
            </Button>
          </div>
        </div>
      </InvoiceCardHeader>

      <InvoiceCardContent>
        {/* Categories */}
        <div className="space-y-4">
          {filteredAndSortedCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.name);
            const categoryRecipeCount = category.items.filter((item) =>
              recipes.has(item.id)
            ).length;

            return (
              <div key={category.name} className="border border-white/10 rounded-lg overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between p-4 bg-obsidian/50 hover:bg-obsidian/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      <p className="text-sm text-slate-400">
                        {category.items.length} items • {categoryRecipeCount} with recipes
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                    {category.items.length}
                  </Badge>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-obsidian/30">
                          <th className="text-left py-3 px-4">
                            <button
                              onClick={() => handleSort('name')}
                              className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                            >
                              Item Name
                              <SortIcon field="name" />
                            </button>
                          </th>
                          <th className="text-right py-3 px-4">
                            <button
                              onClick={() => handleSort('price')}
                              className="flex items-center gap-2 ml-auto text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                            >
                              Price
                              <SortIcon field="price" />
                            </button>
                          </th>
                          <th className="text-right py-3 px-4">
                            <button
                              onClick={() => handleSort('cogs')}
                              className="flex items-center gap-2 ml-auto text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                            >
                              COGS
                              <SortIcon field="cogs" />
                            </button>
                          </th>
                          <th className="text-right py-3 px-4">
                            <button
                              onClick={() => handleSort('margin')}
                              className="flex items-center gap-2 ml-auto text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                            >
                              Margin
                              <SortIcon field="margin" />
                            </button>
                          </th>
                          <th className="text-right py-3 px-4">
                            <button
                              onClick={() => handleSort('foodCost')}
                              className="flex items-center gap-2 ml-auto text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                            >
                              Food Cost %
                              <SortIcon field="foodCost" />
                            </button>
                          </th>
                          <th className="text-center py-3 px-4">
                            <span className="text-sm font-semibold text-slate-300">Status</span>
                          </th>
                          <th className="text-right py-3 px-4">
                            <span className="text-sm font-semibold text-slate-300">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item) => {
                          const recipe = recipes.get(item.id);
                          const price = item.prices[0]?.price || 0;

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <span className="font-medium text-white">{item.name}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-mono text-emerald-400">
                                  ${price.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {loadingRecipes && !recipe ? (
                                  <div className="h-5 w-16 bg-slate-700/50 animate-pulse rounded ml-auto" />
                                ) : (
                                  <span className="font-mono text-white">
                                    {recipe ? `$${recipe.total_cogs.toFixed(2)}` : '-'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {loadingRecipes && !recipe ? (
                                  <div className="h-5 w-16 bg-slate-700/50 animate-pulse rounded ml-auto" />
                                ) : (
                                  <span className="font-mono text-cyan-400">
                                    {recipe ? `$${recipe.gross_profit.toFixed(2)}` : '-'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {loadingRecipes && !recipe ? (
                                  <div className="h-5 w-16 bg-slate-700/50 animate-pulse rounded ml-auto" />
                                ) : (
                                  <span className="font-mono text-white">
                                    {recipe ? `${recipe.food_cost_percent.toFixed(1)}%` : '-'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {loadingRecipes && !recipe ? (
                                  <div className="h-6 w-24 bg-slate-700/50 animate-pulse rounded mx-auto" />
                                ) : (
                                  getHealthBadge(recipe)
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/menu/items/${item.id}/recipe`)}
                                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  {recipe ? 'Edit' : 'Build'}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {filteredAndSortedCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No items found</p>
            </div>
          )}
        </div>
      </InvoiceCardContent>
    </InvoiceCard>
  );
}
