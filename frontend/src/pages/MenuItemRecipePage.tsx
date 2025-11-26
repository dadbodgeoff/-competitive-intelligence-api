/**
 * Menu Item Recipe Page - Modernized 2025
 * Complete recipe builder interface for plate costing
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeading } from '@/components/layout/PageHeading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ArrowLeft,
  RefreshCw,
  ChefHat,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useRecipeBuilder } from '@/hooks/useRecipeBuilder'
import { COGSCalculator } from '@/components/menu/COGSCalculator'
import { IngredientList } from '@/components/menu/IngredientList'
import { IngredientSearchModal } from '@/components/menu/IngredientSearchModal'
import { cn } from '@/lib/utils'

export function MenuItemRecipePage() {
  const { menuItemId } = useParams<{ menuItemId: string }>()
  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)

  const {
    recipe,
    loading,
    saving,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    refreshRecipe,
  } = useRecipeBuilder(menuItemId!)

  if (loading) {
    return (
      <AppShell maxWidth="wide">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading recipe...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!recipe) {
    return (
      <AppShell maxWidth="wide">
        <Card className="bg-slate-900/80 border-white/10">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Recipe not found</h2>
              <p className="text-slate-400 mb-6">
                This menu item may have been deleted or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/cogs')} className="bg-primary-600 hover:bg-primary-500">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to COGS Tracker
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  // Determine health status
  const foodCostPercent = recipe.food_cost_percent
  const healthStatus = 
    foodCostPercent < 30 ? 'healthy' :
    foodCostPercent < 35 ? 'warning' : 'danger'

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        {/* Header */}
        <header>
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cogs')}
              className="text-slate-400 hover:text-white -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              COGS Tracker
            </Button>
            <span className="text-slate-600">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/menu/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              Menu
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <PageHeading className="flex items-center gap-3">
                <ChefHat className="h-7 w-7 text-primary-400" />
                {recipe.menu_item.name}
              </PageHeading>
              <p className="text-slate-400 mt-1">
                Build your recipe and calculate true cost of goods sold
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshRecipe}
                disabled={saving}
                className="border-white/10 text-slate-300 hover:bg-white/5"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', saving && 'animate-spin')} />
                Refresh
              </Button>
              
              {/* Health Status Badge */}
              {recipe.ingredients.length > 0 && (
                <Badge className={cn(
                  'px-3 py-1',
                  healthStatus === 'healthy' && 'bg-emerald-500/10 text-emerald-400 border-0',
                  healthStatus === 'warning' && 'bg-amber-500/10 text-amber-400 border-0',
                  healthStatus === 'danger' && 'bg-red-500/10 text-red-400 border-0',
                )}>
                  {healthStatus === 'healthy' && <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                  {healthStatus === 'warning' && <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />}
                  {healthStatus === 'danger' && <AlertCircle className="h-3.5 w-3.5 mr-1.5" />}
                  {foodCostPercent.toFixed(1)}% Food Cost
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat
            icon={DollarSign}
            label="Menu Price"
            value={recipe.menu_price}
            prefix="$"
            color="text-primary-400"
          />
          <QuickStat
            icon={DollarSign}
            label="Total COGS"
            value={recipe.total_cogs}
            prefix="$"
            color="text-amber-400"
          />
          <QuickStat
            icon={TrendingUp}
            label="Gross Profit"
            value={recipe.gross_profit}
            prefix="$"
            color="text-emerald-400"
          />
          <QuickStat
            icon={ChefHat}
            label="Ingredients"
            value={recipe.ingredients.length}
            color="text-slate-300"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - COGS Calculator */}
          <div className="lg:col-span-1">
            <COGSCalculator
              totalCogs={recipe.total_cogs}
              menuPrice={recipe.menu_price}
              grossProfit={recipe.gross_profit}
              foodCostPercent={recipe.food_cost_percent}
            />
            
            {/* Warnings Card */}
            {recipe.warnings && recipe.warnings.length > 0 && (
              <Card className="mt-4 bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-400 text-sm mb-2">Recipe Warnings</p>
                      <ul className="space-y-1">
                        {recipe.warnings.map((warning, idx) => (
                          <li key={idx} className="text-xs text-slate-400">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Ingredients */}
          <div className="lg:col-span-2">
            <IngredientList
              ingredients={recipe.ingredients}
              onEdit={async (ingredientId, quantity, notes) => {
                await updateIngredient(ingredientId, {
                  quantity_per_serving: quantity,
                  notes,
                })
              }}
              onDelete={deleteIngredient}
              onAddClick={() => setShowAddModal(true)}
              saving={saving}
            />
          </div>
        </div>

        {/* Add Ingredient Modal */}
        <IngredientSearchModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={async (request) => {
            await addIngredient(request)
            setShowAddModal(false)
          }}
          menuItemPriceId={recipe.menu_item.prices[0]?.id}
        />
      </div>
    </AppShell>
  )
}

// Quick Stat Component
interface QuickStatProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  prefix?: string
  color?: string
}

function QuickStat({ icon: Icon, label, value, prefix = '', color = 'text-white' }: QuickStatProps) {
  return (
    <Card className="bg-slate-900/80 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon className={cn('h-4 w-4', color)} />
          </div>
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={cn('text-lg font-bold font-mono', color)}>
              {prefix}{typeof value === 'number' ? value.toFixed(2) : value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MenuItemRecipePage
