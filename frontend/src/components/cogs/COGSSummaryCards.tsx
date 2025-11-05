/**
 * COGS Summary Cards
 * Display key metrics at a glance
 */

import { InvoiceCard, InvoiceCardContent } from '@/design-system/components';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface COGSSummaryCardsProps {
  totalItems: number;
  itemsWithRecipes: number;
  averageMargin: number;
  averageFoodCostPercent: number;
  dangerItems: number;
  noRecipeItems: number;
}

export function COGSSummaryCards({
  totalItems,
  itemsWithRecipes,
  averageMargin,
  averageFoodCostPercent,
  dangerItems,
  noRecipeItems,
}: COGSSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Items */}
      <InvoiceCard>
        <InvoiceCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Items with COGS</p>
              <p className="text-2xl font-bold text-white">
                {itemsWithRecipes}
                <span className="text-sm text-slate-400 font-normal ml-1">/ {totalItems}</span>
              </p>
            </div>
          </div>
        </InvoiceCardContent>
      </InvoiceCard>

      {/* Average Margin */}
      <InvoiceCard>
        <InvoiceCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg Margin</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">
                ${averageMargin.toFixed(2)}
              </p>
            </div>
          </div>
        </InvoiceCardContent>
      </InvoiceCard>

      {/* Average Food Cost % */}
      <InvoiceCard>
        <InvoiceCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                averageFoodCostPercent < 30
                  ? 'bg-emerald-500/10'
                  : averageFoodCostPercent < 35
                  ? 'bg-orange-500/10'
                  : 'bg-red-500/10'
              }`}
            >
              <CheckCircle
                className={`h-5 w-5 ${
                  averageFoodCostPercent < 30
                    ? 'text-emerald-400'
                    : averageFoodCostPercent < 35
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg Food Cost</p>
              <p className="text-2xl font-bold text-white font-mono">
                {averageFoodCostPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </InvoiceCardContent>
      </InvoiceCard>

      {/* Items Needing Attention */}
      <InvoiceCard>
        <InvoiceCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Need Attention</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">{noRecipeItems + dangerItems}</p>
                <p className="text-xs text-slate-500">
                  ({noRecipeItems} no recipe, {dangerItems} high cost)
                </p>
              </div>
            </div>
          </div>
        </InvoiceCardContent>
      </InvoiceCard>
    </div>
  );
}
