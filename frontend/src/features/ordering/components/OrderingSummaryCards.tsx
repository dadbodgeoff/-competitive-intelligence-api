/**
 * Ordering Summary Cards
 * KPI cards for the ordering dashboard
 */

import { Package, Truck, Building2, AlertTriangle, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/analytics'

interface OrderingSummaryCardsProps {
  totalItems: number
  uniqueVendors: number
  deliveriesThisWeek: number
  lowConfidenceItems: number
  nextDeliveryDate: Date | null
  avgConfidence: number
  isLoading?: boolean
}

export function OrderingSummaryCards({
  totalItems,
  uniqueVendors,
  // deliveriesThisWeek - reserved for future use
  lowConfidenceItems,
  nextDeliveryDate,
  avgConfidence,
  isLoading,
}: OrderingSummaryCardsProps) {
  const formatNextDelivery = (date: Date | null) => {
    if (!date) return 'No deliveries'
    const today = new Date()
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days`
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        title="Items to Order"
        value={totalItems}
        subtitle="Across all deliveries"
        icon={Package}
        iconColor="text-primary-400"
        isLoading={isLoading}
        tooltip="Total unique items with forecasted orders"
        delay={0}
        compact
      />
      <StatCard
        title="Active Vendors"
        value={uniqueVendors}
        subtitle="With upcoming deliveries"
        icon={Building2}
        iconColor="text-success-400"
        isLoading={isLoading}
        tooltip="Vendors with detected delivery patterns"
        delay={1}
        compact
      />
      <StatCard
        title="Next Delivery"
        value={formatNextDelivery(nextDeliveryDate)}
        subtitle={nextDeliveryDate?.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) || 'Upload invoices to detect'}
        icon={Truck}
        iconColor="text-accent-400"
        isLoading={isLoading}
        tooltip="Your next scheduled delivery window"
        delay={2}
        compact
      />
      <StatCard
        title="Pattern Confidence"
        value={`${Math.round(avgConfidence * 100)}%`}
        subtitle={lowConfidenceItems > 0 ? `${lowConfidenceItems} items need attention` : 'All patterns reliable'}
        icon={lowConfidenceItems > 0 ? AlertTriangle : TrendingUp}
        iconColor={lowConfidenceItems > 0 ? 'text-amber-400' : 'text-success-400'}
        isLoading={isLoading}
        tooltip="Average confidence in delivery pattern predictions"
        delay={3}
        compact
      />
    </div>
  )
}
