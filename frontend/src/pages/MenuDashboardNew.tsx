/**
 * Menu Dashboard - Modernized
 * Focus: Menu content management (items, categories, prices)
 * COGS tracking is handled by the separate COGS module
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/analytics';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api/client';
import { parseDeleteError } from '@/utils/errorMessages';
import { cn } from '@/lib/utils';
import {
  UtensilsCrossed,
  Upload,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  DollarSign,
  LayoutGrid,
  List,
  Trash2,
  Tag,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// Types
interface MenuItemPrice {
  id?: string;
  size: string | null;
  price: number;
}

interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  prices: MenuItemPrice[];
  available?: boolean;
}

interface MenuCategory {
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuData {
  id: string;
  restaurant_name: string;
  menu_version: number;
  status: string;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'grid' | 'list';
type TabValue = 'all' | 'available' | 'unavailable';

export function MenuDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Fetch menu data
  const { data: menuData, isLoading, refetch } = useQuery({
    queryKey: ['current-menu'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/menu/current');
      return response.data;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Process menu data
  const menu: MenuData | null = menuData?.menu || null;
  const categories: MenuCategory[] = useMemo(() => {
    if (!menuData?.categories) return [];
    return menuData.categories.map((cat: any) => ({
      ...cat,
      items: cat.items || [],
    }));
  }, [menuData]);

  // Show success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      toast({ title: 'Success', description: location.state.message });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Stats
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const totalCategories = categories.length;
  const avgPrice = useMemo(() => {
    if (totalItems === 0) return 0;
    const total = categories.reduce((sum, cat) =>
      sum + cat.items.reduce((s, item) => {
        const itemAvg = item.prices.length > 0
          ? item.prices.reduce((acc, p) => acc + p.price, 0) / item.prices.length
          : 0;
        return s + itemAvg;
      }, 0), 0);
    return total / totalItems;
  }, [categories, totalItems]);

  const priceRange = useMemo(() => {
    const allPrices = categories.flatMap(cat =>
      cat.items.flatMap(item => item.prices.map(p => p.price))
    );
    if (allPrices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...allPrices), max: Math.max(...allPrices) };
  }, [categories]);

  // Filter items
  const filteredCategories = useMemo(() => {
    return categories.map(cat => {
      let items = [...cat.items];

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          cat.name.toLowerCase().includes(query)
        );
      }

      // Tab filter
      if (activeTab === 'available') {
        items = items.filter(item => item.available !== false);
      } else if (activeTab === 'unavailable') {
        items = items.filter(item => item.available === false);
      }

      return { ...cat, items };
    }).filter(cat => cat.items.length > 0);
  }, [categories, searchQuery, activeTab]);

  // Handlers
  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const expandAll = () => setExpandedCategories(new Set(categories.map(c => c.name)));
  const collapseAll = () => setExpandedCategories(new Set());

  const handleDelete = async () => {
    if (!menu) return;
    if (!confirm('Are you sure you want to delete this menu? This action cannot be undone.')) return;

    try {
      setDeleting(true);
      await apiClient.delete(`/api/v1/menu/${menu.id}`);
      toast({ title: 'Menu deleted', description: 'Menu has been deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['current-menu'] });
    } catch (error) {
      const errorDetails = parseDeleteError(error, 'menu');
      toast({ title: errorDetails.title, description: errorDetails.description, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      </AppShell>
    );
  }

  // Empty state
  if (!menu) {
    return (
      <AppShell>
        <div className="space-y-4">
          <ModulePageHeader
            icon={UtensilsCrossed}
            title="Menu Management"
            description="Upload and manage your restaurant menu"
            actions={
              <Button size="sm" onClick={() => navigate('/menu/upload')} className="bg-primary-600 hover:bg-primary-500 h-8 text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Menu
              </Button>
            }
          />

          <Card className="bg-card-dark border-white/10">
            <CardContent className="py-16 text-center">
              <UtensilsCrossed className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Menu Found</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Upload your restaurant menu to get started. We'll automatically extract all items, categories, and prices.
              </p>
              <Button onClick={() => navigate('/menu/upload')} className="bg-primary-600 hover:bg-primary-500">
                <Upload className="h-4 w-4 mr-2" />
                Upload Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <ModulePageHeader
          icon={UtensilsCrossed}
          title={menu.restaurant_name}
          description={`Version ${menu.menu_version} • Updated ${format(new Date(menu.updated_at), 'MMM d, yyyy')}`}
          badge={
            <Badge className="bg-primary-500/10 text-primary-400 border-primary-500/30">
              Active
            </Badge>
          }
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10 text-slate-300 hover:bg-white/5 h-8 text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/cogs')} className="border-white/10 text-slate-300 hover:bg-white/5 h-8 text-xs">
                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                Cost of Goods
              </Button>
              <Button size="sm" onClick={() => navigate('/menu/upload')} className="bg-primary-600 hover:bg-primary-500 h-8 text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload New
              </Button>
            </>
          }
        />

        {/* Stats Cards - Enterprise Standard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Categories"
            value={totalCategories}
            subtitle="Menu sections"
            icon={Tag}
            iconColor="text-primary-400"
            delay={0}
            compact
          />
          <StatCard
            title="Menu Items"
            value={totalItems}
            subtitle="Total dishes"
            icon={UtensilsCrossed}
            iconColor="text-primary-400"
            delay={1}
            compact
          />
          <StatCard
            title="Avg Price"
            value={`$${avgPrice.toFixed(2)}`}
            subtitle="Per item"
            icon={TrendingUp}
            iconColor="text-primary-400"
            delay={2}
            compact
          />
          <StatCard
            title="Price Range"
            value={`$${priceRange.min.toFixed(0)} - $${priceRange.max.toFixed(0)}`}
            subtitle="Min to max"
            icon={BarChart3}
            iconColor="text-primary-400"
            delay={3}
            compact
          />
        </div>

        {/* Filters & Controls */}
        <Card className="bg-card-dark border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search items, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-obsidian border-white/10 text-white"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                <TabsList className="bg-obsidian border border-white/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary-500/20">
                    All ({totalItems})
                  </TabsTrigger>
                  <TabsTrigger value="available" className="data-[state=active]:bg-primary-500/20">
                    Available
                  </TabsTrigger>
                  <TabsTrigger value="unavailable" className="data-[state=active]:bg-slate-500/20">
                    Unavailable
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* View toggle */}
              <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(viewMode === 'grid' && 'bg-white/10')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(viewMode === 'list' && 'bg-white/10')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Expand/Collapse */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={expandAll} className="border-white/10 text-slate-400">
                  Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll} className="border-white/10 text-slate-400">
                  Collapse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <MenuCategorySection
                key={category.name}
                category={category}
                isExpanded={expandedCategories.has(category.name)}
                onToggle={() => toggleCategory(category.name)}
                viewMode={viewMode}
                onViewCOGS={(itemId) => navigate(`/cogs/items/${itemId}`)}
              />
            ))
          ) : (
            <Card className="bg-card-dark border-white/10">
              <CardContent className="py-12 text-center">
                <Search className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No items match your search</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <Card className="bg-card-dark border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-400">
                  <p className="font-medium text-white mb-1">Menu Management</p>
                  <p>To update your menu, upload a new version. Historical data is preserved for analytics.</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="border-red-500/30 text-destructive hover:bg-destructive/10"
              >
                {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

// Category Section Component
interface MenuCategorySectionProps {
  category: MenuCategory;
  isExpanded: boolean;
  onToggle: () => void;
  viewMode: ViewMode;
  onViewCOGS: (itemId: string) => void;
}

function MenuCategorySection({ category, isExpanded, onToggle, viewMode, onViewCOGS }: MenuCategorySectionProps) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-900/50">
      {/* Category Header - Compact */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
          <h3 className="text-base font-medium text-white">{category.name}</h3>
        </div>
        <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-1 rounded">
          {category.items.length} items
        </span>
      </button>

      {/* Items */}
      {isExpanded && (
        <div className={cn(
          'px-4 pb-4 pt-2 border-t border-white/5',
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'
        )}>
          {category.items.map((item, idx) => (
            <MenuItemCard
              key={item.id || idx}
              item={item}
              viewMode={viewMode}
              onViewCOGS={() => item.id && onViewCOGS(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  viewMode: ViewMode;
  onViewCOGS: () => void;
}

function MenuItemCard({ item, viewMode, onViewCOGS }: MenuItemCardProps) {
  const primaryPrice = item.prices[0]?.price || 0;
  const hasMultiplePrices = item.prices.length > 1;

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian/50 border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{item.name}</span>
            {item.available === false && (
              <Badge variant="outline" className="text-xs border-slate-500/30 text-slate-400">
                Unavailable
              </Badge>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-slate-400 truncate mt-0.5">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-right">
            <span className="font-mono font-semibold text-primary-400">${primaryPrice.toFixed(2)}</span>
            {hasMultiplePrices && (
              <span className="text-xs text-slate-500 ml-1">+{item.prices.length - 1}</span>
            )}
          </div>
          {item.id && (
            <Button variant="ghost" size="sm" onClick={onViewCOGS} className="text-slate-400 hover:text-white">
              <DollarSign className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="p-4 rounded-lg bg-obsidian/50 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-white">{item.name}</h4>
        {item.available === false && (
          <Badge variant="outline" className="text-xs border-slate-500/30 text-slate-400">
            Off
          </Badge>
        )}
      </div>
      
      {item.description && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{item.description}</p>
      )}

      {/* Prices */}
      <div className="space-y-1 mb-3">
        {item.prices.map((price, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-slate-400">{price.size || 'Regular'}</span>
            <span className="font-mono text-primary-400">${price.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {item.id && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewCOGS}
          className="w-full border-white/10 text-slate-300 hover:bg-white/5"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          View Cost of Goods
        </Button>
      )}
    </div>
  );
}

export default MenuDashboard;



