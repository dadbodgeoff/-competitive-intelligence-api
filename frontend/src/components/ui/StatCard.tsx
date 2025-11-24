/**
 * StatCard Component
 * Enterprise-standard stat/metric display card
 * Enforces 320px min width, 180px min height, 24px padding, 12px border-radius
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'accent' | 'success'
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  ...props
}: StatCardProps) {
  const variantStyles = {
    default: 'border-white/10',
    primary: 'border-white/10 bg-primary-500/5',
    accent: 'border-accent-500/30 bg-accent-500/5',
    success: 'border-success-500/30 bg-success-500/5',
  }

  return (
    <div
      className={cn(
        // Enterprise standards: 320px min width, 180px min height, 24px padding, 12px radius
        "min-w-[320px] min-h-[180px] rounded-xl p-6",
        "bg-card-dark border",
        "flex flex-col justify-between",
        "transition-all duration-200",
        "hover:border-opacity-30 hover:shadow-lg",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-lg",
            variant === 'primary' && "bg-primary-500/10 text-primary-500",
            variant === 'accent' && "bg-accent-500/10 text-accent-400",
            variant === 'success' && "bg-success-500/10 text-success-400",
            variant === 'default' && "bg-white/5 text-slate-400"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.isPositive ? "text-success-400" : "text-destructive"
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
