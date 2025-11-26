/**
 * COGS Calculator Component - Modernized 2025
 * Displays cost breakdown and profitability metrics with visual indicators
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  DollarSign,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

interface COGSCalculatorProps {
  totalCogs: number
  menuPrice: number
  grossProfit: number
  foodCostPercent: number
}

export function COGSCalculator({
  totalCogs,
  menuPrice,
  grossProfit,
  foodCostPercent,
}: COGSCalculatorProps) {
  // Determine health status
  const isHealthy = foodCostPercent < 30
  const isWarning = foodCostPercent >= 30 && foodCostPercent < 35
  const isDanger = foodCostPercent >= 35
  const hasData = totalCogs > 0

  return (
    <Card className="bg-slate-900/80 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary-400" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="space-y-3">
          <MetricRow
            label="Total COGS"
            value={totalCogs}
            prefix="$"
            color="text-amber-400"
          />
          <MetricRow
            label="Menu Price"
            value={menuPrice}
            prefix="$"
            color="text-primary-400"
          />
          <div className="h-px bg-white/10" />
          <MetricRow
            label="Gross Profit"
            value={grossProfit}
            prefix="$"
            color="text-emerald-400"
            highlight
          />
          <MetricRow
            label="Food Cost %"
            value={foodCostPercent}
            suffix="%"
            color={cn(
              isHealthy && 'text-emerald-400',
              isWarning && 'text-amber-400',
              isDanger && 'text-red-400',
              !hasData && 'text-slate-400'
            )}
            highlight
          />
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Food Cost Target</span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              &lt;30%
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative">
            {/* Target marker at 30% */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-slate-600 z-10"
              style={{ left: '60%' }}
            />
            {/* Progress bar */}
            <div
              className={cn(
                'h-full transition-all duration-700 ease-out rounded-full',
                isHealthy && 'bg-gradient-to-r from-emerald-600 to-emerald-400',
                isWarning && 'bg-gradient-to-r from-amber-600 to-amber-400',
                isDanger && 'bg-gradient-to-r from-red-600 to-red-400',
                !hasData && 'bg-slate-700'
              )}
              style={{ width: `${Math.min(foodCostPercent, 50) * 2}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>0%</span>
            <span>30%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-2">
          {!hasData ? (
            <div className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-white/5">
              <p className="font-medium text-white mb-1 flex items-center gap-2">
                <span className="text-lg">👈</span>
                Add ingredients to calculate COGS
              </p>
              <p className="text-xs">
                Costs are automatically pulled from your latest invoice prices
              </p>
            </div>
          ) : (
            <div className={cn(
              'rounded-lg p-3 border',
              isHealthy && 'bg-emerald-500/5 border-emerald-500/20',
              isWarning && 'bg-amber-500/5 border-amber-500/20',
              isDanger && 'bg-red-500/5 border-red-500/20',
            )}>
              <div className="flex items-start gap-2">
                {isHealthy && <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />}
                {isWarning && <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />}
                {isDanger && <TrendingDown className="h-4 w-4 text-red-400 mt-0.5" />}
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    isHealthy && 'text-emerald-400',
                    isWarning && 'text-amber-400',
                    isDanger && 'text-red-400',
                  )}>
                    {isHealthy && 'Healthy Margin'}
                    {isWarning && 'Above Target'}
                    {isDanger && 'High Food Cost'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHealthy && 'Food cost is below 30% target'}
                    {isWarning && 'Consider reviewing ingredient costs'}
                    {isDanger && 'Review pricing or reduce ingredient costs'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profit Breakdown */}
        {hasData && menuPrice > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-2">Profit Breakdown</p>
            <div className="flex h-4 rounded-full overflow-hidden bg-slate-800">
              <div 
                className="bg-amber-500/80 transition-all duration-500"
                style={{ width: `${(totalCogs / menuPrice) * 100}%` }}
                title={`COGS: $${totalCogs.toFixed(2)}`}
              />
              <div 
                className="bg-emerald-500/80 transition-all duration-500"
                style={{ width: `${(grossProfit / menuPrice) * 100}%` }}
                title={`Profit: $${grossProfit.toFixed(2)}`}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-amber-400">COGS {((totalCogs / menuPrice) * 100).toFixed(0)}%</span>
              <span className="text-emerald-400">Profit {((grossProfit / menuPrice) * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Metric Row Component
interface MetricRowProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  color?: string
  highlight?: boolean
}

function MetricRow({ label, value, prefix = '', suffix = '', color = 'text-white', highlight }: MetricRowProps) {
  return (
    <div className={cn(
      'flex justify-between items-center',
      highlight && 'py-1'
    )}>
      <span className="text-sm text-slate-400">{label}</span>
      <span className={cn(
        'font-mono font-bold',
        highlight ? 'text-xl' : 'text-lg',
        color
      )}>
        {prefix}{value.toFixed(2)}{suffix}
      </span>
    </div>
  )
}
