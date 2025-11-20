/**
 * COGS Dashboard Page
 * Overview of all menu items with cost tracking
 */

import { AppShell } from '@/components/layout/AppShell';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/button';
import { InvoiceCard, InvoiceCardContent } from '@/design-system/components';
import { useCOGSOverview } from '@/hooks/useCOGSOverview';
import { COGSSummaryCards } from '@/components/cogs/COGSSummaryCards';
import { COGSTable } from '@/components/cogs/COGSTable';
import { DailySalesPanel } from '@/components/cogs/DailySalesPanel';
import { Loader2, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function COGSDashboardPage() {
  const navigate = useNavigate();
  const {
    categories,
    recipes,
    loading,
    loadingRecipes,
    error,
    refetch,
    totalItems,
    itemsWithRecipes,
    averageMargin,
    averageFoodCostPercent,
    dangerItems,
    noRecipeItems,
  } = useCOGSOverview();

  if (loading) {
    return (
      <AppShell maxWidth="wide">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell maxWidth="wide">
        <InvoiceCard variant="elevated">
          <InvoiceCardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
                <p className="text-slate-400 mb-6">{error}</p>
                <Button onClick={refetch} className="btn-primary shadow-emerald">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </InvoiceCardContent>
        </InvoiceCard>
      </AppShell>
    );
  }

  if (totalItems === 0) {
    return (
      <AppShell maxWidth="wide">
        <InvoiceCard variant="elevated">
          <InvoiceCardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-slate-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">No Menu Found</h3>
                <p className="text-slate-400 mb-6">
                  Upload your menu to start tracking cost of goods sold
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
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <PageHeading>COGS Tracker</PageHeading>
            <p className="text-slate-400">
              Track cost of goods sold and profitability across your menu
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={refetch}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/menu/dashboard')}
              className="btn-secondary"
            >
              View Menu
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <COGSSummaryCards
          totalItems={totalItems}
          itemsWithRecipes={itemsWithRecipes}
          averageMargin={averageMargin}
          averageFoodCostPercent={averageFoodCostPercent}
          dangerItems={dangerItems}
          noRecipeItems={noRecipeItems}
        />

        {/* Items Table */}
        <COGSTable categories={categories} recipes={recipes} loadingRecipes={loadingRecipes} />

        {/* Daily Sales Tracking */}
        <DailySalesPanel categories={categories} recipes={recipes} />

        {/* Info Card */}
        {noRecipeItems > 0 && (
          <InvoiceCard>
            <InvoiceCardContent className="py-4">
              <div className="flex items-start gap-3 text-sm">
                <AlertCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-slate-400">
                  <p className="font-semibold text-white mb-1">
                    {noRecipeItems} item{noRecipeItems !== 1 ? 's' : ''} without recipes
                  </p>
                  <p>
                    Click "Build" to add ingredients and calculate true cost of goods sold.
                    Costs are automatically pulled from your latest invoice prices.
                  </p>
                </div>
              </div>
            </InvoiceCardContent>
          </InvoiceCard>
        )}
      </div>
    </AppShell>
  );
}
