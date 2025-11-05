/**
 * COGS Calculator Component
 * Displays cost breakdown and profitability metrics
 */

import { InvoiceCard, InvoiceCardHeader, InvoiceCardContent } from '@/design-system/components';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/design-system';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface COGSCalculatorProps {
  totalCogs: number;
  menuPrice: number;
  grossProfit: number;
  foodCostPercent: number;
}

export function COGSCalculator({
  totalCogs,
  menuPrice,
  grossProfit,
  foodCostPercent,
}: COGSCalculatorProps) {
  // Determine health status
  const isHealthy = foodCostPercent < 30;
  const isWarning = foodCostPercent >= 30 && foodCostPercent < 35;
  const isDanger = foodCostPercent >= 35;

  return (
    <InvoiceCard variant="elevated">
      <InvoiceCardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
        </div>
      </InvoiceCardHeader>
      <InvoiceCardContent className="space-y-4">
        {/* Metrics */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total COGS</span>
            <span className="text-xl font-mono font-bold text-white">
              ${totalCogs.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Menu Price</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              ${menuPrice.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gross Profit</span>
              <span className="text-xl font-mono font-bold text-cyan-400">
                ${grossProfit.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Food Cost %</span>
            <span className="text-2xl font-mono font-bold text-white">
              {foodCostPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isHealthy && 'bg-emerald-500',
                isWarning && 'bg-orange-500',
                isDanger && 'bg-red-500'
              )}
              style={{ width: `${Math.min(foodCostPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>0%</span>
            <span>30%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="pt-2">
          {totalCogs === 0 ? (
            <div className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-white/10">
              <p className="font-semibold text-white mb-1">👈 Add ingredients to calculate COGS</p>
              <p className="text-xs">
                Costs are automatically pulled from your latest invoice prices
              </p>
            </div>
          ) : (
            <>
              {isHealthy && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Healthy margin (target: &lt;30%)
                </Badge>
              )}
              {isWarning && (
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Warning: Above 30% target
                </Badge>
              )}
              {isDanger && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  High cost: Review pricing
                </Badge>
              )}
            </>
          )}
        </div>
      </InvoiceCardContent>
    </InvoiceCard>
  );
}
