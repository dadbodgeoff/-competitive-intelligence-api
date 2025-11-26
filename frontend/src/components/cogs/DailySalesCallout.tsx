/**
 * Daily Sales Callout Component
 * Clean professional top bar for the COGS Dashboard
 */

import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowRight,
  DollarSign,
  Loader2,
  TrendingUp,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDailySalesTracking } from '@/hooks/useDailySalesTracking'
import { cn } from '@/lib/utils'

export function DailySalesCallout() {
  const navigate = useNavigate()
  const { salesSummary, totalsForDate, summaryLoading, saleDate } = useDailySalesTracking()

  const dailyTotals = totalsForDate ?? {
    total_quantity: 0,
    total_cogs: 0,
    total_revenue: 0,
    total_gross_profit: 0,
  }

  const isToday = saleDate === format(new Date(), 'yyyy-MM-dd')

  return (
    <Card className="bg-card-dark border-white/10">
      <CardContent className="py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left side - Title and CTA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Sales Tracking</p>
                <p className="text-sm font-medium text-white">Track Your Food Spend in Real-Time</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/cogs/sales')}
              size="sm"
              className="bg-primary-500 hover:bg-primary-600 text-white h-8 text-xs"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Track Today's Sales
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {/* Right side - Quick stats inline */}
          <div className="flex items-center gap-4">
            {summaryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <>
                <QuickStat
                  label={isToday ? "Today's Spend" : format(new Date(saleDate), 'MMM d')}
                  value={dailyTotals.total_cogs}
                  prefix="$"
                  color="text-amber-400"
                />
                <QuickStat
                  label="Gross Profit"
                  value={dailyTotals.total_gross_profit}
                  prefix="$"
                  color={dailyTotals.total_gross_profit >= 0 ? 'text-success-400' : 'text-destructive'}
                />
                <QuickStat
                  label="14-Day Spend"
                  value={salesSummary?.totals.total_cogs ?? 0}
                  prefix="$"
                  color="text-primary-400"
                />
                <QuickStat
                  label="Items Sold (14d)"
                  value={salesSummary?.totals.total_quantity ?? 0}
                  color="text-slate-300"
                  decimals={0}
                />
              </>
            )}
          </div>
        </div>

        {/* Top cost drivers - compact inline */}
        {!summaryLoading && (salesSummary?.top_items ?? []).length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Top Cost Drivers (14 days)</span>
            <div className="flex flex-wrap gap-1.5">
              {(salesSummary?.top_items ?? []).slice(0, 3).map((item) => (
                <span
                  key={item.menu_item_id}
                  className="text-xs text-slate-300"
                >
                  {item.menu_item_name} <span className="text-amber-400 font-mono">${item.total_cogs.toFixed(0)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Quick Stat Component - Compact inline version
interface QuickStatProps {
  label: string
  value: number
  prefix?: string
  color?: string
  decimals?: number
}

function QuickStat({ label, value, prefix = '', color = 'text-white', decimals = 2 }: QuickStatProps) {
  return (
    <div className="text-right">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={cn('text-sm font-semibold font-mono', color)}>
        {prefix}{decimals === 0 ? value.toFixed(0) : value.toFixed(2)}
      </p>
    </div>
  )
}
