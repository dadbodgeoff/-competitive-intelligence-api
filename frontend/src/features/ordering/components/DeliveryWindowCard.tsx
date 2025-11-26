/**
 * Delivery Window Card
 * Displays a single delivery window with its items
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Truck, Package, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ForecastItemRow } from './ForecastItemRow'
import type { OrderingPrediction } from '@/types/ordering'

interface DeliveryWindowCardProps {
  orderIndex: number
  date: Date | null
  label: string
  items: OrderingPrediction[]
  leadTimeHint?: string
  isExpanded?: boolean
  onToggle?: () => void
}

export function DeliveryWindowCard({
  orderIndex,
  date,
  label,
  items,
  leadTimeHint,
  isExpanded: controlledExpanded,
  onToggle,
}: DeliveryWindowCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(orderIndex === 0)
  const isExpanded = controlledExpanded ?? internalExpanded
  const handleToggle = onToggle ?? (() => setInternalExpanded(!internalExpanded))

  const totalItems = items.length
  const uniqueVendors = new Set(items.map((i) => i.vendor_name).filter(Boolean)).size

  // Group items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    const vendor = item.vendor_name || 'Unknown Vendor'
    if (!acc[vendor]) acc[vendor] = []
    acc[vendor].push(item)
    return acc
  }, {} as Record<string, OrderingPrediction[]>)

  const formatDate = (d: Date | null) => {
    if (!d) return label
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysUntil = (d: Date | null) => {
    if (!d) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(d)
    target.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff < 0) return 'Past'
    return `${diff} days`
  }

  const daysUntil = getDaysUntil(date)
  const isToday = daysUntil === 'Today'
  const isTomorrow = daysUntil === 'Tomorrow'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: orderIndex * 0.1 }}
    >
      <Card
        className={cn(
          'bg-card-dark border-white/10 overflow-hidden transition-all duration-200',
          isToday && 'border-primary-500/50 ring-1 ring-primary-500/20',
          isTomorrow && 'border-accent-500/30'
        )}
      >
        {/* Header - Always visible */}
        <CardHeader
          className="cursor-pointer hover:bg-white/[0.02] transition-colors"
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  isToday ? 'bg-primary-500/20' : 'bg-white/5'
                )}
              >
                <Truck className={cn('h-5 w-5', isToday ? 'text-primary-400' : 'text-slate-400')} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Delivery #{orderIndex + 1}
                  </p>
                  {isToday && (
                    <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 text-[10px] px-1.5">
                      Today
                    </Badge>
                  )}
                  {isTomorrow && (
                    <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/30 text-[10px] px-1.5">
                      Tomorrow
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-semibold text-white">{formatDate(date)}</p>
                {leadTimeHint && <p className="text-xs text-slate-500">{leadTimeHint}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <Badge variant="outline" className="border-white/10 text-slate-300">
                  <Package className="h-3 w-3 mr-1" />
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </Badge>
                {uniqueVendors > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {uniqueVendors} vendor{uniqueVendors !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Content - Expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0">
                {totalItems === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">No items forecasted for this window</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload more invoices to improve predictions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(itemsByVendor).map(([vendor, vendorItems]) => (
                      <div key={vendor} className="rounded-lg border border-white/5 overflow-hidden">
                        <div className="bg-white/[0.02] px-4 py-2 border-b border-white/5">
                          <p className="text-sm font-medium text-slate-300">{vendor}</p>
                          <p className="text-xs text-slate-500">{vendorItems.length} items</p>
                        </div>
                        <div>
                          {vendorItems.map((item, idx) => (
                            <ForecastItemRow
                              key={`${item.normalized_ingredient_id}-${item.forecast_date}`}
                              prediction={item}
                              index={idx}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
