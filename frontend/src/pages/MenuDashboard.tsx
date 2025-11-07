/**
 * Menu Dashboard Page
 * RestaurantIQ Platform
 * 
 * View and manage restaurant menus
 */

import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  InvoiceCard,
  InvoiceCardHeader,
  InvoiceCardContent,
} from '@/design-system/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api/client';
import { parseDeleteError } from '@/utils/errorMessages';

// Lazy load the heavy table component
const MenuReviewTable = lazy(() => 
  import('@/components/menu/MenuReviewTable').then(module => ({ default: module.MenuReviewTable }))
);
import {
  Upload,
  Loader2,
  RefreshCw,
  Calendar,
  UtensilsCrossed,
  Trash2,
  AlertCircle,
} from 'lucide-react';

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

export function MenuDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use React Query for menu data
  const { data: menuData, isLoading: loading, refetch } = useQuery({
    queryKey: ['current-menu'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/menu/current');
      return response.data;
    },
    refetchOnMount: 'always',  // Always fetch fresh data on mount
    refetchOnWindowFocus: true,
    staleTime: 0,  // Don't cache - always fetch fresh
  });

  const menu = menuData?.menu ? {
    ...menuData.menu,
    categories: (menuData.categories || []).map((cat: any) => ({
      ...cat,
      items: cat.items || []
    }))
  } : null;

  useEffect(() => {
    // Show success message if coming from upload
    if (location.state?.message) {
      toast({
        title: 'Success',
        description: location.state.message,
      });
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!menu) return;
    
    if (!confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await apiClient.delete(`/api/v1/menu/${menu.id}`);

      toast({
        title: 'Menu deleted',
        description: 'Menu has been deleted successfully',
      });

      // Invalidate the query to refetch
      queryClient.invalidateQueries({ queryKey: ['current-menu'] });
    } catch (error) {
      const errorDetails = parseDeleteError(error, 'menu');
      toast({
        title: errorDetails.title,
        description: errorDetails.description,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalItems = menu?.categories?.reduce((sum: number, cat: MenuCategory) => sum + (cat.items?.length || 0), 0) || 0;
  const avgPrice = totalItems > 0 && menu?.categories
    ? menu.categories.reduce((sum: number, cat: MenuCategory) => 
        sum + (cat.items || []).reduce((s: number, item: MenuItem) => {
          // Calculate average of all prices for this item
          const itemAvgPrice = (item.prices?.length || 0) > 0
            ? item.prices.reduce((acc: number, p: MenuItemPrice) => acc + p.price, 0) / item.prices.length
            : 0;
          return s + itemAvgPrice;
        }, 0), 0) / totalItems
    : 0;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Menu Dashboard</h1>
            <p className="text-slate-400">
              View and manage your restaurant menu
            </p>
          </div>
          <div className="flex gap-3">
            {menu && (
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="border-white/10 text-slate-300 hover:bg-white/5"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
            <Button
              onClick={() => navigate('/menu/upload')}
              className="btn-primary shadow-emerald"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Menu
            </Button>
          </div>
        </div>

        {/* No Menu State */}
        {!menu && (
          <InvoiceCard variant="elevated">
            <InvoiceCardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
                    <UtensilsCrossed className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Menu Found</h3>
                  <p className="text-slate-400 mb-6">
                    Upload your first menu to get started with menu management
                  </p>
                  <Button
                    onClick={() => navigate('/menu/upload')}
                    className="btn-primary shadow-emerald"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Menu
                  </Button>
                </div>
              </div>
            </InvoiceCardContent>
          </InvoiceCard>
        )}

        {/* Menu Display */}
        {menu && (
          <>
            {/* Menu Header */}
            <InvoiceCard variant="elevated">
              <InvoiceCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{menu.restaurant_name}</h2>
                    {menu.menu_type && (
                      <p className="text-slate-400">{menu.menu_type}</p>
                    )}
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Active
                  </Badge>
                </div>
              </InvoiceCardHeader>
              <InvoiceCardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <UtensilsCrossed className="h-4 w-4" />
                      <span>Categories</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {menu.categories.length}
                    </div>
                  </div>
                  
                  <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <UtensilsCrossed className="h-4 w-4" />
                      <span>Total Items</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {totalItems}
                    </div>
                  </div>
                  
                  <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <span>Avg Price</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      ${avgPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Updated</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {new Date(menu.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Menu
                      </>
                    )}
                  </Button>
                </div>
              </InvoiceCardContent>
            </InvoiceCard>

            {/* Menu Items - Lazy Loaded by Category */}
            <InvoiceCard variant="elevated">
              <InvoiceCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Menu Items ({totalItems})
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Click categories to expand and view items
                    </p>
                  </div>
                </div>
              </InvoiceCardHeader>
              <InvoiceCardContent>
                <Suspense fallback={
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-slate-800/50 rounded mb-2" />
                        <div className="h-32 bg-slate-800/30 rounded" />
                      </div>
                    ))}
                  </div>
                }>
                  <MenuReviewTable
                    categories={menu.categories}
                    onUpdateItem={(_categoryIndex: number, _itemIndex: number, _field: keyof MenuItem, _value: any) => {}}
                    onDeleteItem={(_categoryIndex: number, _itemIndex: number) => {}}
                    onAddItem={(_categoryIndex: number) => {}}
                    onUpdateCategory={(_categoryIndex: number, _field: keyof MenuCategory, _value: any) => {}}
                    onAddCategory={() => {}}
                    onDeleteCategory={(_categoryIndex: number) => {}}
                    readonly={true}
                    onBuildRecipe={(itemName: string) => {
                      // Find the menu item ID by name
                      for (const category of menu.categories) {
                        const item = category.items.find((i: MenuItem) => i.name === itemName);
                        if (item && item.id) {
                          // Navigate to recipe page
                          navigate(`/menu/items/${item.id}/recipe`);
                          break;
                        }
                      }
                    }}
                  />
                </Suspense>
              </InvoiceCardContent>
            </InvoiceCard>

            {/* Info Card */}
            <InvoiceCard>
              <InvoiceCardContent className="py-4">
                <div className="flex items-start gap-3 text-sm">
                  <AlertCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-400">
                    <p className="font-semibold text-white mb-1">Menu Management</p>
                    <p>
                      To update your menu, upload a new version. The system will replace the current menu
                      while preserving historical data for analytics.
                    </p>
                  </div>
                </div>
              </InvoiceCardContent>
            </InvoiceCard>
          </>
        )}
      </div>
    </AppShell>
  );
}

