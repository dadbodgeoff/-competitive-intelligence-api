/**
 * Cost of Goods Dashboard Page - Modernized 2025
 * Overview of all menu items with cost tracking
 * Clean, compact design matching Invoice Dashboard
 */

import { AppShell } from '@/components/layout/AppShell'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCOGSOverview } from '@/hooks/useCOGSOverview'
import { COGSSummaryCards } from '@/components/cogs/COGSSummaryCards'
import { COGSTable } from '@/components/cogs/COGSTable'
import { DailySalesCallout } from '@/components/cogs/DailySalesCallout'
import {
  Loader2,
  RefreshCw,
  Upload,
  AlertCircle,
  DollarSign,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'


export function COGSDashboardPage() {
  const navigate = useNavigate()
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
  } = useCOGSOverview()

  if (loading) {
    return (
      <AppShell maxWidth="wide">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading cost data...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell maxWidth="wide">
        <Card className="bg-card-dark border-white/10">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Error Loading Data</h3>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <Button onClick={refetch} size="sm" className="bg-primary-500 hover:bg-primary-600">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  if (totalItems === 0) {
    return (
      <AppShell maxWidth="wide">
        <Card className="bg-card-dark border-white/10">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No Menu Found</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Upload your menu to start tracking cost of goods sold
                </p>
                <Button
                  onClick={() => navigate('/menu/upload')}
                  size="sm"
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload Menu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-4">
        {/* Header */}
        <ModulePageHeader
          icon={DollarSign}
          title="Cost of Goods"
          description="Track cost of goods sold and profitability across your menu"
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="border-white/10 text-white hover:bg-white/5 h-8 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/menu/dashboard')}
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5 h-8 text-xs"
              >
                View Menu
              </Button>
            </>
          }
        />

        {/* Daily Sales Tracking - Clean Top Bar */}
        <DailySalesCallout />

        {/* Summary Cards - Compact */}
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

        {/* Info Card for items without recipes - Compact */}
        {noRecipeItems > 0 && (
          <Card className="bg-card-dark border-white/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="text-slate-400">
                  <span className="text-white font-medium">{noRecipeItems} item{noRecipeItems !== 1 ? 's' : ''}</span> without recipes — 
                  Click "Build" to add ingredients and calculate true cost of goods sold.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}

export default COGSDashboardPage
