import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { SchedulingWeek } from '@/types/scheduling'
import { format, parseISO } from 'date-fns'

interface WeekSelectorCardProps {
  weeks: SchedulingWeek[]
  weeksLoading: boolean
  selectedWeekId?: string
  onSelectWeek: (weekId?: string) => void
  children: ReactNode
}

export function WeekSelectorCard({
  weeks,
  weeksLoading,
  selectedWeekId,
  onSelectWeek,
  children,
}: WeekSelectorCardProps) {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Select week</CardTitle>
          <p className="text-sm text-slate-400">
            Choose a weekly roster to review assignments and labor totals. Data refreshes automatically after edits.
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-slate-300">Week</Label>
          <select
            value={selectedWeekId ?? ''}
            onChange={(event) => {
              const value = event.target.value
              onSelectWeek(value || undefined)
            }}
            className="w-64 rounded-md border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="" disabled>
              {weeksLoading ? 'Loading…' : 'Select a week…'}
            </option>
            {weeks.map((week) => (
              <option key={week.id} value={week.id}>
                {format(parseISO(week.week_start_date), 'MMM d')} – {format(parseISO(week.week_end_date), 'MMM d, yyyy')}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

