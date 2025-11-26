/**
 * COGS Summary Cards - Modernized 2025
 * Compact display of key metrics matching Invoice Dashboard style
 */

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  PieChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface COGSSummaryCardsProps {
  totalItems: number
  itemsWithRecipes: number
  averageMargin: number
  averageFoodCostPercent: number
  dangerItems: number
  noRecipeItems: number
}

export function COGSSummaryCards({
  totalItems,
  itemsWithRecipes,
  averageMargin,
  averageFoodCostPercent,
  dangerItems,
  noRecipeItems,
}: COGSSummaryCardsProps) {
  const coveragePercent = totalItems > 0 ? (itemsWithRecipes / totalItems) * 100 : 0
  const needsAttention = noRecipeItems + dangerItems

  // Determine food cost health
  const foodCostStatus = 
    averageFoodCostPercent < 30 ? 'healthy' :
    averageFoodCostPercent < 35 ? 'warning' : 'danger'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Recipe Coverage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        <Card className="bg-card-dark border-white/10">
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-300">Coverage</CardTitle>
              <PieChart className="h-3.5 w-3.5 text-primary-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">{itemsWithRecipes}</span>
              <span className="text-xs text-slate-400">/ {totalItems} items</span>
            </div>
            <Progress 
              value={coveragePercent} 
              className="h-1 bg-white/5 mt-2"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {coveragePercent.toFixed(0)}% of menu has COGS data
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Average Margin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-card-dark border-white/10">
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-300">Avg Margin</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 text-success-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <p className="text-xl font-bold text-success-400 font-mono">
              ${averageMargin.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Per item gross profit
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Average Food Cost % */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="bg-card-dark border-white/10">
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-300">Food Cost</CardTitle>
              {foodCostStatus === 'healthy' && <CheckCircle className="h-3.5 w-3.5 text-success-400" />}
              {foodCostStatus === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
              {foodCostStatus === 'danger' && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <p className={cn(
              'text-xl font-bold font-mono',
              foodCostStatus === 'healthy' && 'text-success-400',
              foodCostStatus === 'warning' && 'text-amber-400',
              foodCostStatus === 'danger' && 'text-destructive',
            )}>
              {averageFoodCostPercent.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Target: &lt;30%
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Items Needing Attention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-card-dark border-white/10">
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-slate-300">Attention</CardTitle>
              <AlertCircle className={cn(
                'h-3.5 w-3.5',
                needsAttention > 0 ? 'text-amber-400' : 'text-slate-500'
              )} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <p className={cn(
              'text-xl font-bold',
              needsAttention > 0 ? 'text-amber-400' : 'text-slate-400'
            )}>
              {needsAttention}
            </p>
            <p className={cn(
              'text-[10px] mt-0.5',
              needsAttention === 0 ? 'text-success-400' : 'text-destructive'
            )}>
              {needsAttention === 0 ? 'All items healthy!' : `${noRecipeItems} no recipe`}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
