/**
 * LaborMetricsBar Component
 * Animated stat cards showing labor metrics at a glance
 */

import { motion } from 'framer-motion'
import { DollarSign, Clock, Users, TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SchedulerTotals } from '@/types/scheduling'

interface LaborMetricsBarProps {
  totals?: SchedulerTotals
  isLoading?: boolean
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'live'
  delay?: number
}

function MetricCard({ icon: Icon, label, value, subValue, variant = 'default', delay = 0 }: MetricCardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10',
    primary: 'bg-gradient-to-br from-primary-500/15 to-primary-600/5 border-primary-500/30',
    success: 'bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border-emerald-500/30',
    warning: 'bg-gradient-to-br from-amber-500/15 to-amber-600/5 border-amber-500/30',
    live: 'bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border-emerald-500/40 ring-2 ring-emerald-500/20',
  }

  const iconStyles = {
    default: 'text-slate-400 bg-white/5',
    primary: 'text-primary-400 bg-primary-500/20',
    success: 'text-emerald-400 bg-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/20',
    live: 'text-emerald-400 bg-emerald-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: 'easeOut' }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all shadow-lg shadow-black/10',
        'hover:scale-[1.02] hover:shadow-xl',
        variantStyles[variant]
      )}
    >
      <div className={cn('p-2 rounded-lg', iconStyles[variant])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-400 truncate uppercase tracking-wide font-medium">{label}</p>
        <p className="text-lg font-bold text-white tracking-tight">{value}</p>
        {subValue && (
          <p className="text-[10px] text-slate-500 mt-0.5">{subValue}</p>
        )}
      </div>
      {variant === 'live' && (
        <div className="ml-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>
      )}
    </motion.div>
  )
}

function formatCurrency(cents?: number | null): string {
  if (cents === null || cents === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatHours(minutes?: number | null): string {
  if (minutes === null || minutes === undefined) return '0h'
  const hours = minutes / 60
  return `${hours.toFixed(1)}h`
}

function formatPercent(value?: number | null): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}%`
}

export function LaborMetricsBar({ totals, isLoading }: LaborMetricsBarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-white/5 border border-white/10 animate-pulse"
          />
        ))}
      </div>
    )
  }

  const hasLiveShifts = (totals?.in_progress_minutes ?? 0) > 0
  const hasOvertime = (totals?.overtime?.total_overtime_minutes ?? 0) > 0
  const overtimeHours = (totals?.overtime?.total_overtime_minutes ?? 0) / 60

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard
          icon={DollarSign}
          label="Scheduled Labor"
          value={formatCurrency(totals?.scheduled_labor_cents)}
          subValue={formatHours(totals?.scheduled_minutes)}
          variant="primary"
          delay={0}
        />
        
        <MetricCard
          icon={Clock}
          label="Actual Labor"
          value={formatCurrency(totals?.total_with_overtime_cents ?? totals?.actual_cost_cents)}
          subValue={formatHours(totals?.actual_minutes)}
          variant="success"
          delay={1}
        />
        
        {hasLiveShifts && (
          <MetricCard
            icon={Activity}
            label="Live Now"
            value={formatCurrency(totals?.in_progress_cost_cents)}
            subValue={formatHours(totals?.in_progress_minutes)}
            variant="live"
            delay={2}
          />
        )}
        
        <MetricCard
          icon={TrendingUp}
          label="Forecast Sales"
          value={formatCurrency((totals?.expected_sales_total ?? 0) * 100)}
          subValue="Expected"
          variant="default"
          delay={hasLiveShifts ? 3 : 2}
        />
        
        <MetricCard
          icon={Users}
          label="Labor %"
          value={formatPercent(totals?.actual_labor_percent ?? totals?.labor_percent)}
          subValue={totals?.actual_labor_percent ? 'Actual' : 'Scheduled'}
          variant={
            (totals?.actual_labor_percent ?? totals?.labor_percent ?? 0) > 30
              ? 'warning'
              : 'default'
          }
          delay={hasLiveShifts ? 4 : 3}
        />
      </div>
      
      {/* Overtime Alert */}
      {hasOvertime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
        >
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">
              Overtime Alert: {overtimeHours.toFixed(1)}h over 40h threshold
            </p>
            <p className="text-xs text-amber-400/70">
              Regular: {formatCurrency(totals?.regular_cost_cents)} • 
              Overtime (1.5x): {formatCurrency(totals?.overtime_cost_cents)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-300">
              {formatCurrency(totals?.total_with_overtime_cents)}
            </p>
            <p className="text-xs text-amber-400/70">Total with OT</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
