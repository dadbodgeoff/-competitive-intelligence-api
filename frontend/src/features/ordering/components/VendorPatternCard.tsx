/**
 * Vendor Pattern Card
 * Displays detected delivery patterns for a vendor
 */

import { motion } from 'framer-motion'
import { Building2, Calendar, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { DeliveryPattern } from '@/types/ordering'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface VendorPatternCardProps {
  pattern: DeliveryPattern
  index: number
}

export function VendorPatternCard({ pattern, index }: VendorPatternCardProps) {
  const confidencePercent = Math.round(pattern.confidence_score * 100)
  const isHighConfidence = confidencePercent >= 80
  const isMediumConfidence = confidencePercent >= 60 && confidencePercent < 80

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-success-400" />
          </div>
          <div>
            <p className="font-medium text-white">{pattern.vendor_name}</p>
            <p className="text-xs text-slate-500">
              {pattern.detection_method === 'recent_window' ? 'Recent activity' : 'Historical pattern'}
            </p>
          </div>
        </div>
      </div>

      {/* Weekday indicators */}
      <div className="flex gap-1 mb-3">
        {WEEKDAY_LABELS.map((day, dayIndex) => {
          const isDeliveryDay = pattern.delivery_weekdays.includes(dayIndex)
          return (
            <div
              key={day}
              className={cn(
                'flex-1 py-1.5 rounded text-center text-xs font-medium transition-colors',
                isDeliveryDay
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-white/5 text-slate-500'
              )}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Delivery days list */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {pattern.delivery_weekdays.map((dayIndex) => (
          <Badge
            key={dayIndex}
            variant="secondary"
            className="bg-primary-500/10 text-primary-300 border-primary-500/20"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {WEEKDAY_FULL[dayIndex]}
          </Badge>
        ))}
      </div>

      {/* Confidence meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Pattern confidence</span>
          <span
            className={cn(
              'font-medium flex items-center gap-1',
              isHighConfidence && 'text-success-400',
              isMediumConfidence && 'text-amber-400',
              !isHighConfidence && !isMediumConfidence && 'text-red-400'
            )}
          >
            {isHighConfidence && <CheckCircle2 className="h-3 w-3" />}
            {confidencePercent}%
          </span>
        </div>
        <Progress
          value={confidencePercent}
          className={cn(
            'h-1.5',
            isHighConfidence && '[&>div]:bg-success-500',
            isMediumConfidence && '[&>div]:bg-amber-500',
            !isHighConfidence && !isMediumConfidence && '[&>div]:bg-red-500'
          )}
        />
      </div>

      {/* Last detected */}
      <p className="text-[10px] text-slate-500 mt-2">
        Last detected: {new Date(pattern.last_detected_at).toLocaleDateString()}
      </p>
    </motion.div>
  )
}
