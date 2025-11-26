/**
 * WeekNavigator Component
 * Modern week selector with arrow navigation and visual date range
 */

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SchedulingWeek } from '@/types/scheduling'

interface WeekNavigatorProps {
  weeks: SchedulingWeek[]
  selectedWeekId?: string
  onSelectWeek: (weekId: string) => void
  isLoading?: boolean
}

export function WeekNavigator({
  weeks,
  selectedWeekId,
  onSelectWeek,
  isLoading,
}: WeekNavigatorProps) {
  const currentIndex = weeks.findIndex((w) => w.id === selectedWeekId)
  const selectedWeek = weeks[currentIndex]
  
  const canGoBack = currentIndex < weeks.length - 1
  const canGoForward = currentIndex > 0

  const handlePrevious = () => {
    if (canGoBack) {
      onSelectWeek(weeks[currentIndex + 1].id)
    }
  }

  const handleNext = () => {
    if (canGoForward) {
      onSelectWeek(weeks[currentIndex - 1].id)
    }
  }

  const formatWeekRange = (week: SchedulingWeek) => {
    const start = parseISO(week.week_start_date)
    const end = parseISO(week.week_end_date)
    
    // Same month
    if (format(start, 'MMM') === format(end, 'MMM')) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    }
    // Different months
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="h-10 w-10 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-6 w-48 rounded bg-white/5 animate-pulse" />
        <div className="h-10 w-10 rounded-lg bg-white/5 animate-pulse" />
      </div>
    )
  }

  if (!selectedWeek) {
    return (
      <div className="flex items-center justify-center gap-3 py-4 text-slate-400">
        <CalendarDays className="h-5 w-5" />
        <span>No weeks available. Create your first week to get started.</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Week Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        disabled={!canGoBack}
        className={cn(
          'h-10 w-10 rounded-lg transition-all',
          canGoBack
            ? 'text-slate-300 hover:text-white hover:bg-white/10'
            : 'text-slate-600 cursor-not-allowed'
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Week Display */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 min-w-[280px] justify-center">
        <CalendarDays className="h-5 w-5 text-primary-400" />
        <div className="text-center">
          <p className="text-white font-semibold">
            {formatWeekRange(selectedWeek)}
          </p>
          <p className="text-xs text-slate-400">
            Week {currentIndex + 1} of {weeks.length}
          </p>
        </div>
      </div>

      {/* Next Week Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={!canGoForward}
        className={cn(
          'h-10 w-10 rounded-lg transition-all',
          canGoForward
            ? 'text-slate-300 hover:text-white hover:bg-white/10'
            : 'text-slate-600 cursor-not-allowed'
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Week Dropdown for quick jump */}
      <select
        value={selectedWeekId}
        onChange={(e) => onSelectWeek(e.target.value)}
        className="ml-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer hover:bg-white/10 transition-colors"
      >
        {weeks.map((week) => (
          <option key={week.id} value={week.id} className="bg-obsidian">
            {format(parseISO(week.week_start_date), 'MMM d')} - {format(parseISO(week.week_end_date), 'MMM d')}
          </option>
        ))}
      </select>
    </div>
  )
}
