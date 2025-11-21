import { useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeading } from '@/components/layout/PageHeading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeliveryPatterns, useDetectDeliveryPatterns, useOrderingPredictions } from '@/hooks/useOrderingPredictions'
import { Loader2, RefreshCw, Sparkles } from 'lucide-react'
import type { OrderingPrediction } from '@/types/ordering'

const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function OrderingPredictionsPage() {
  const {
    data,
    isLoading,
    isFetching,
  } = useOrderingPredictions(
    {},
    {
      refetchOnMount: true,
    }
  )

  const patternsQuery = useDeliveryPatterns()
  const detectPatterns = useDetectDeliveryPatterns()

  const predictions = data?.predictions ?? []
  const deliveryGroups = useMemo(() => buildDeliveryGroups(predictions), [predictions])
  const deliveryPatterns = patternsQuery.data?.patterns ?? []

  const isEmpty = !isLoading && predictions.length === 0

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <PageHeading>Predictive Ordering</PageHeading>
            <p className="text-slate-400 max-w-2xl">
              Forecasted order quantities powered by your invoice history. This module is in early access while
              the data pipeline lands—expect rapid iterations here.
            </p>
          </div>
        </header>

        <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-100">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Delivery-aware forecasting</AlertTitle>
          <AlertDescription>
            Forecasts now align to each vendor&apos;s delivery cadence. We&apos;ll surface the next four delivery
            windows (when available) along with how confident we are in that schedule.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-card-dark border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Delivery windows
                {isFetching && (
                  <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Refreshing
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((placeholder) => (
                    <div key={placeholder} className="rounded-lg border border-white/5 p-4 space-y-3">
                      <Skeleton className="h-4 w-1/3 bg-white/5" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((row) => (
                          <div key={row} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-1/4 bg-white/5" />
                            <Skeleton className="h-4 w-16 bg-white/5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : isEmpty ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-lg font-semibold text-white">Forecasts are warming up</p>
                  <p className="text-slate-400">
                    We’ll start surfacing reorder guidance as soon as the normalization + scheduling jobs complete.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {deliveryGroups.map((group) => (
                    <div key={group.key} className="rounded-xl border border-white/5 bg-obsidian/80 shadow-inner">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Order #{group.orderIndex + 1}
                          </p>
                          <p className="text-lg font-semibold text-white">
                            {group.date ? formatDateLabel(group.date) : group.label}
                          </p>
                          {group.leadTimeHint && (
                            <p className="text-xs text-slate-400">{group.leadTimeHint}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="border-emerald-500/60 text-emerald-300">
                          {group.items.length > 0
                            ? `${group.items.length} item${group.items.length === 1 ? '' : 's'}`
                            : 'Forecast pending'}
                        </Badge>
                      </div>
                      {group.items.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-slate-500">
                          We’re still learning this delivery window. Upload another invoice to unlock suggestions.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {group.items.map((prediction) => {
                            const weeklyAverage =
                              prediction.weekly_usage_units ??
                              prediction.avg_weekly_usage ??
                              prediction.avg_quantity_7d
                            const fallbackBadge = shouldHighlightFallback(prediction.window_used)
                            const confidenceLabel = formatConfidence(prediction.delivery_pattern_confidence)
                            return (
                              <div
                                key={`${prediction.normalized_ingredient_id}-${prediction.delivery_date ?? prediction.forecast_date}-${prediction.vendor_name ?? 'vendor'}`}
                                className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                              >
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <p className="text-white font-medium">
                                      {prediction.item_name ??
                                        prediction.canonical_name ??
                                        prediction.normalized_item_id}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {prediction.vendor_name ? `Vendor ${prediction.vendor_name}` : 'Vendor TBD'}
                                      {prediction.base_unit && ` • ${prediction.base_unit}`}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                    <span>Ordered {formatOrderCount(prediction.orders_last_28d)} in last 28d</span>
                                    {weeklyAverage != null && (
                                      <span>Avg usage / wk {formatQuantity(weeklyAverage, prediction.base_unit)}</span>
                                    )}
                                    {fallbackBadge && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-amber-500/20 text-amber-100 border-amber-400/40"
                                      >
                                        90d fallback
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                                    <span>
                                      Last ordered:{' '}
                                      <span className="text-slate-300">
                                        {formatDateLabel(prediction.last_ordered_at)}
                                      </span>
                                    </span>
                                    {confidenceLabel && <span>{confidenceLabel}</span>}
                                  </div>
                                  {prediction.suggested_boxes ? (
                                    <p className="text-sm text-emerald-300 font-medium">
                                      Order {prediction.suggested_boxes}{' '}
                                      {prediction.pack_label?.toLowerCase() ?? 'cases'} (
                                      {formatQuantity(prediction.forecast_quantity, prediction.base_unit)})
                                    </p>
                                  ) : null}
                                </div>
                                <div className="text-right">
                                  <p className="text-emerald-400 text-lg font-semibold">
                                    {formatQuantity(prediction.forecast_quantity, prediction.base_unit)}
                                  </p>
                                  {prediction.lower_bound != null && prediction.upper_bound != null && (
                                    <p className="text-xs text-slate-400">
                                      Range {formatQuantity(prediction.lower_bound, prediction.base_unit)} –{' '}
                                      {formatQuantity(prediction.upper_bound, prediction.base_unit)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card-dark border-white/10">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Vendor delivery patterns</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={() => detectPatterns.mutate()}
                disabled={detectPatterns.isPending}
              >
                {detectPatterns.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="sr-only">Refreshing</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Refresh patterns</span>
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {patternsQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((placeholder) => (
                    <div key={placeholder} className="space-y-2 rounded-lg border border-white/5 p-3">
                      <Skeleton className="h-4 w-1/2 bg-white/5" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-14 bg-white/5" />
                        <Skeleton className="h-5 w-14 bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : deliveryPatterns.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No delivery cadence detected yet. Upload another invoice or refresh after the background job runs.
                </p>
              ) : (
                <div className="space-y-3">
                  {deliveryPatterns.map((pattern) => (
                    <div key={pattern.vendor_name} className="rounded-lg border border-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{pattern.vendor_name}</p>
                        <span className="text-xs text-emerald-300">
                          {(pattern.confidence_score * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {formatWeekdays(pattern.delivery_weekdays).map((weekday) => (
                          <Badge
                            key={`${pattern.vendor_name}-${weekday}`}
                            variant="secondary"
                            className="bg-white/10 text-white"
                          >
                            {weekday}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Last detected {new Date(pattern.last_detected_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

type DeliveryGroup = {
  key: string
  label: string
  date?: Date
  items: OrderingPrediction[]
  leadTimeHint?: string
  orderIndex: number
}

function buildDeliveryGroups(predictions: OrderingPrediction[]): DeliveryGroup[] {
  const hasOrderIndex = predictions.some((prediction) => typeof prediction.order_index === 'number')
  if (!hasOrderIndex) {
    return groupPredictionsByDeliveryDate(predictions).map((group, index) => ({
      ...group,
      orderIndex: index,
    }))
  }

  const buckets: DeliveryGroup[] = Array.from({ length: 4 }, (_, index) => ({
    key: `order-${index}`,
    label: `Order #${index + 1}`,
    orderIndex: index,
    items: [],
  }))

  predictions.forEach((prediction) => {
    const rawIndex = typeof prediction.order_index === 'number' ? prediction.order_index : 0
    const bucketIndex = Math.min(Math.max(Math.floor(rawIndex), 0), buckets.length - 1)
    const bucket = buckets[bucketIndex]
    bucket.items.push(prediction)

    const deliveryKey = prediction.delivery_date ?? prediction.forecast_date
    if (deliveryKey) {
      const deliveryDate = new Date(deliveryKey)
      if (!bucket.date || deliveryDate < bucket.date) {
        bucket.date = deliveryDate
      }
    }

    const leadTimeHint = formatLeadTime(prediction.lead_time_days)
    if (!bucket.leadTimeHint && leadTimeHint) {
      bucket.leadTimeHint = leadTimeHint
    }
  })

  return buckets.map((bucket) => ({
    ...bucket,
    label:
      bucket.date != null
        ? bucket.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
        : bucket.label,
    items: sortPredictionItems(bucket.items),
  }))
}

function groupPredictionsByDeliveryDate(predictions: OrderingPrediction[]) {
  const groups = new Map<
    string,
    { key: string; label: string; date: Date; items: OrderingPrediction[]; leadTimeHint?: string }
  >()

  predictions.forEach((prediction) => {
    const deliveryKey = prediction.delivery_date ?? prediction.forecast_date
    if (!deliveryKey) return
    const group = groups.get(deliveryKey)
    const deliveryDate = new Date(deliveryKey)
    const label =
      prediction.delivery_window_label ??
      deliveryDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    const leadTimeHint = formatLeadTime(prediction.lead_time_days)

    if (!group) {
      groups.set(deliveryKey, {
        key: deliveryKey,
        label,
        date: deliveryDate,
        leadTimeHint,
        items: [prediction],
      })
    } else {
      group.items.push(prediction)
      group.leadTimeHint = group.leadTimeHint ?? leadTimeHint
    }
  })

  return Array.from(groups.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((group) => ({
      ...group,
      items: sortPredictionItems(group.items),
    }))
}

function sortPredictionItems(items: OrderingPrediction[]) {
  return [...items].sort((a, b) => {
    const vendorCompare = (a.vendor_name || '').localeCompare(b.vendor_name || '')
    if (vendorCompare !== 0) return vendorCompare
    return (a.item_name || a.canonical_name || a.normalized_item_id).localeCompare(
      b.item_name || b.canonical_name || b.normalized_item_id
    )
  })
}

function formatWeekdays(weekdays: number[]) {
  return weekdays
    .map((day) => WEEKDAY_LABELS[day % 7] ?? `Day ${day}`)
    .filter((value, index, self) => self.indexOf(value) === index)
}

function formatQuantity(value?: number | null, unit?: string) {
  if (value == null || Number.isNaN(value)) return '—'
  const absValue = Math.abs(value)
  const formatted = absValue >= 100 ? value.toFixed(0) : value.toFixed(2)
  return `${formatted} ${unit ?? ''}`.trim()
}

function formatDateLabel(value?: string | Date | null) {
  if (!value) return '—'
  try {
    const dateValue = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(dateValue.getTime())) {
      return typeof value === 'string' ? value : '—'
    }
    return dateValue.toLocaleDateString()
  } catch {
    return typeof value === 'string' ? value : '—'
  }
}

function formatOrderCount(value?: number | null) {
  if (value == null) return '—'
  return `${value}×`
}

function shouldHighlightFallback(windowUsed?: string | null) {
  if (!windowUsed) return false
  return windowUsed.toLowerCase().includes('90')
}

function formatLeadTime(days?: number | null) {
  if (typeof days !== 'number') return undefined
  const absolute = Math.abs(days)
  return `${days} day${absolute === 1 ? '' : 's'} lead time`
}

function formatConfidence(value?: number | null) {
  if (value == null) return undefined
  const numeric = value <= 1 ? value * 100 : value
  return `Pattern confidence ${numeric.toFixed(0)}%`
}
