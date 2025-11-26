/**
 * Ordering Dashboard
 * Modern predictive ordering interface with delivery windows and vendor patterns
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RefreshCw,
  Search,
  Download,
  Truck,
  Building2,
  Loader2,
  Sparkles,
} from 'lucide-react'
import {
  useDeliveryPatterns,
  useDetectDeliveryPatterns,
  useOrderingPredictions,
} from '@/hooks/useOrderingPredictions'
import { EmptyState } from '@/components/analytics'
import { OrderingSummaryCards } from '../components/OrderingSummaryCards'
import { DeliveryWindowCard } from '../components/DeliveryWindowCard'
import { VendorPatternCard } from '../components/VendorPatternCard'
import { useOrderingStats } from '../hooks/useOrderingStats'
import type { OrderingPrediction } from '@/types/ordering'

export function OrderingDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('deliveries')

  // Fetch data
  const { data: predictionsData, isLoading: predictionsLoading, isFetching } = useOrderingPredictions(
    {},
    { refetchOnMount: true }
  )
  const { data: patternsData, isLoading: patternsLoading } = useDeliveryPatterns()
  const detectPatterns = useDetectDeliveryPatterns()

  const predictions = predictionsData?.predictions ?? []
  const patterns = patternsData?.patterns ?? []

  // Compute stats
  const stats = useOrderingStats(predictions, patterns)

  // Get unique vendors for filter
  const uniqueVendors = useMemo(() => {
    const vendors = new Set<string>()
    predictions.forEach((p) => {
      if (p.vendor_name) vendors.add(p.vendor_name)
    })
    return Array.from(vendors).sort()
  }, [predictions])

  // Filter predictions
  const filteredPredictions = useMemo(() => {
    let filtered = predictions

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          (p.item_name?.toLowerCase().includes(term)) ||
          (p.canonical_name?.toLowerCase().includes(term)) ||
          (p.normalized_item_id?.toLowerCase().includes(term))
      )
    }

    if (vendorFilter !== 'all') {
      filtered = filtered.filter((p) => p.vendor_name === vendorFilter)
    }

    return filtered
  }, [predictions, searchTerm, vendorFilter])

  // Build delivery groups
  const deliveryGroups = useMemo(() => buildDeliveryGroups(filteredPredictions), [filteredPredictions])

  const isLoading = predictionsLoading || patternsLoading
  const isEmpty = !isLoading && predictions.length === 0

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-4">
        {/* Header */}
        <ModulePageHeader
          icon={Truck}
          title="Predictive Ordering"
          description="AI-powered order forecasts based on your invoice history and vendor delivery patterns"
          actions={
            <>
              <Button
                onClick={() => detectPatterns.mutate()}
                disabled={detectPatterns.isPending}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 h-8 text-xs"
              >
                {detectPatterns.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                )}
                Refresh Patterns
              </Button>
              <Button className="bg-primary-500 hover:bg-primary-600 text-white h-8 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export Orders
              </Button>
            </>
          }
        />

        {/* Summary Cards */}
        <OrderingSummaryCards
          totalItems={stats.totalItemsToOrder}
          uniqueVendors={stats.uniqueVendors}
          deliveriesThisWeek={stats.deliveriesThisWeek}
          lowConfidenceItems={stats.lowConfidenceItems}
          nextDeliveryDate={stats.nextDeliveryDate}
          avgConfidence={stats.avgConfidence}
          isLoading={isLoading}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-obsidian/50 border border-white/10">
              <TabsTrigger value="deliveries" className="data-[state=active]:bg-primary-500/20">
                <Truck className="h-4 w-4 mr-2" />
                Delivery Windows
              </TabsTrigger>
              <TabsTrigger value="vendors" className="data-[state=active]:bg-primary-500/20">
                <Building2 className="h-4 w-4 mr-2" />
                Vendor Patterns
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            {activeTab === 'deliveries' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-obsidian/70 border-white/10 text-white"
                  />
                </div>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-obsidian/70 border-white/10 text-white">
                    <SelectValue placeholder="All vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {uniqueVendors.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-card-dark border-white/10">
                    <CardHeader>
                      <Skeleton className="h-6 w-48 bg-white/5" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[1, 2, 3].map((j) => (
                          <Skeleton key={j} className="h-16 w-full bg-white/5" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isEmpty ? (
              <EmptyState
                variant="no-data"
                title="No Forecasts Yet"
                description="Upload invoices to start generating predictive orders. We'll analyze your purchase patterns and vendor delivery schedules."
                action={{
                  label: 'Upload Invoices',
                  onClick: () => (window.location.href = '/invoices/upload'),
                }}
              />
            ) : filteredPredictions.length === 0 ? (
              <EmptyState
                variant="no-results"
                title="No Matching Items"
                description="No items match your current filters. Try adjusting your search."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('')
                    setVendorFilter('all')
                  },
                }}
              />
            ) : (
              <div className="space-y-4">
                {isFetching && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-primary-400"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refreshing forecasts...
                  </motion.div>
                )}
                {deliveryGroups.map((group) => (
                  <DeliveryWindowCard
                    key={group.key}
                    orderIndex={group.orderIndex}
                    date={group.date}
                    label={group.label}
                    items={group.items}
                    leadTimeHint={group.leadTimeHint}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            {patternsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-card-dark border-white/10">
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-32 bg-white/5 mb-3" />
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                          <Skeleton key={j} className="h-8 flex-1 bg-white/5" />
                        ))}
                      </div>
                      <Skeleton className="h-2 w-full bg-white/5" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : patterns.length === 0 ? (
              <EmptyState
                variant="no-vendors"
                title="No Delivery Patterns Detected"
                description="We haven't detected any vendor delivery patterns yet. Upload more invoices or click 'Refresh Patterns' to analyze your data."
                action={{
                  label: 'Detect Patterns',
                  onClick: () => detectPatterns.mutate(),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patterns.map((pattern, index) => (
                  <VendorPatternCard key={pattern.vendor_name} pattern={pattern} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Banner */}
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-primary-500/5 border-primary-500/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary-300">
                      Delivery-Aware Forecasting
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Forecasts are aligned to each vendor's detected delivery schedule. We analyze your
                      invoice history to predict the next 4 delivery windows and suggest optimal order
                      quantities based on your usage patterns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}

// Helper function to build delivery groups
type DeliveryGroup = {
  key: string
  label: string
  date: Date | null
  items: OrderingPrediction[]
  leadTimeHint?: string
  orderIndex: number
}

function buildDeliveryGroups(predictions: OrderingPrediction[]): DeliveryGroup[] {
  const hasOrderIndex = predictions.some((p) => typeof p.order_index === 'number')

  if (!hasOrderIndex) {
    // Group by delivery date
    const groups = new Map<string, DeliveryGroup>()
    predictions.forEach((prediction) => {
      const key = prediction.delivery_date ?? prediction.forecast_date ?? 'unknown'
      if (!groups.has(key)) {
        const date = key !== 'unknown' ? new Date(key) : null
        groups.set(key, {
          key,
          label: date?.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) ?? 'Unknown',
          date,
          items: [],
          orderIndex: groups.size,
        })
      }
      groups.get(key)!.items.push(prediction)
    })
    return Array.from(groups.values()).sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date.getTime() - b.date.getTime()
    })
  }

  // Use order_index buckets
  const buckets: DeliveryGroup[] = Array.from({ length: 4 }, (_, i) => ({
    key: `order-${i}`,
    label: `Delivery #${i + 1}`,
    date: null,
    items: [],
    orderIndex: i,
  }))

  predictions.forEach((prediction) => {
    const idx = Math.min(Math.max(prediction.order_index ?? 0, 0), 3)
    buckets[idx].items.push(prediction)

    const deliveryDate = prediction.delivery_date ?? prediction.forecast_date
    if (deliveryDate) {
      const date = new Date(deliveryDate)
      if (!buckets[idx].date || date < buckets[idx].date!) {
        buckets[idx].date = date
        buckets[idx].label = date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      }
    }

    if (!buckets[idx].leadTimeHint && prediction.lead_time_days != null) {
      const days = prediction.lead_time_days
      buckets[idx].leadTimeHint = `${days} day${days === 1 ? '' : 's'} lead time`
    }
  })

  // Sort items within each bucket by vendor then name
  buckets.forEach((bucket) => {
    bucket.items.sort((a, b) => {
      const vendorCmp = (a.vendor_name ?? '').localeCompare(b.vendor_name ?? '')
      if (vendorCmp !== 0) return vendorCmp
      return (a.item_name ?? a.normalized_item_id).localeCompare(b.item_name ?? b.normalized_item_id)
    })
  })

  return buckets
}

