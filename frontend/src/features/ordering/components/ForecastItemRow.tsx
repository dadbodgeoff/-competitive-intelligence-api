/**
 * Forecast Item Row
 * Individual item within a delivery window
 */

import { motion } from 'framer-motion'
import { Package, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderingPrediction } from '@/types/ordering'

interface ForecastItemRowProps {
  prediction: OrderingPrediction
  index: number
}

export function ForecastItemRow({ prediction, index }: ForecastItemRowProps) {
  const itemName = prediction.item_name || prediction.canonical_name || prediction.normalized_item_id
  const weeklyUsage = prediction.weekly_usage_units ?? prediction.avg_weekly_usage ?? prediction.avg_quantity_7d
  const isLowConfidence = (prediction.delivery_pattern_confidence ?? 1) < 0.6
  const is90dFallback = prediction.window_used?.toLowerCase().includes('90')

  const formatQuantity = (value?: number | null, unit?: string) => {
    if (value == null || Number.isNaN(value)) return '—'
    const formatted = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1)
    return `${formatted} ${unit ?? ''}`.trim()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'group flex items-center justify-between gap-4 px-4 py-3',
        'hover:bg-white/[0.02] transition-colors',
        'border-b border-white/5 last:border-b-0'
      )}
    >
      {/* Left: Item info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Package className="h-4 w-4 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{itemName}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">
              {prediction.vendor_name || 'Vendor TBD'}
            </span>
            {prediction.base_unit && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-500">{prediction.base_unit}</span>
              </>
            )}
            {prediction.orders_last_28d != null && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-500">
                  {prediction.orders_last_28d}× in 28d
                </span>
              </>
            )}
          </div>
          
          {/* Usage and confidence row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {weeklyUsage != null && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <TrendingUp className="h-3 w-3" />
                {formatQuantity(weeklyUsage, prediction.base_unit)}/wk
              </span>
            )}
            {prediction.last_ordered_at && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                Last: {new Date(prediction.last_ordered_at).toLocaleDateString()}
              </span>
            )}
            {is90dFallback && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-300 border-amber-500/30">
                90d data
              </Badge>
            )}
            {isLowConfidence && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/20 text-red-300 border-red-500/30">
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                Low confidence
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quantity */}
      <div className="text-right flex-shrink-0">
        {prediction.suggested_boxes ? (
          <div>
            <p className="text-lg font-bold text-primary-400">
              {prediction.suggested_boxes} {prediction.pack_label?.toLowerCase() || 'cases'}
            </p>
            <p className="text-xs text-slate-400">
              {formatQuantity(prediction.forecast_quantity, prediction.base_unit)}
            </p>
          </div>
        ) : (
          <p className="text-lg font-bold text-primary-400">
            {formatQuantity(prediction.forecast_quantity, prediction.base_unit)}
          </p>
        )}
        {prediction.lower_bound != null && prediction.upper_bound != null && (
          <p className="text-[10px] text-slate-500 mt-0.5">
            Range: {formatQuantity(prediction.lower_bound)} – {formatQuantity(prediction.upper_bound)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
