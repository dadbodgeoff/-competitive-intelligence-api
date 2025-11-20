import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SchedulerMember, SchedulingDay, SchedulingShift, SchedulerTotals } from '@/types/scheduling'
import { Users } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCurrencyFromCents, formatHours, formatCurrency, getMemberName } from './utils'

interface SchedulerGridViewProps {
  days: SchedulingDay[]
  members: SchedulerMember[]
  totals?: SchedulerTotals
  gridFetching: boolean
  onCreateShift: (dayId: string, memberId: string | null) => void
  onEditShift: (shift: SchedulingShift) => void
  onUnassignShift: (shiftId: string, memberId: string) => void
}

export function SchedulerGridView({
  days,
  members,
  totals,
  gridFetching,
  onCreateShift,
  onEditShift,
  onUnassignShift,
}: SchedulerGridViewProps) {
  const scheduledLaborLabel = formatCurrencyFromCents(totals?.scheduled_labor_cents)
  const scheduledHoursLabel = formatHours(totals?.scheduled_minutes ?? 0)
  const actualLaborLabel = formatCurrencyFromCents(totals?.actual_cost_cents)
  const actualHoursLabel = formatHours(totals?.actual_minutes ?? 0)
  const liveLaborLabel = formatCurrencyFromCents(totals?.in_progress_cost_cents)
  const liveHoursLabel = formatHours(totals?.in_progress_minutes ?? 0)
  const forecastSalesLabel = formatCurrency(totals?.expected_sales_total ?? 0)
  const laborPercentValue =
    totals?.actual_labor_percent != null
      ? totals.actual_labor_percent
      : totals?.labor_percent != null
      ? totals.labor_percent
      : null
  const laborPercentDescriptor =
    totals?.actual_labor_percent != null ? 'Actual labor %' : 'Scheduled labor %'
  const laborPercentLabel = laborPercentValue != null ? `${laborPercentValue.toFixed(1)}%` : 'N/A'

  const renderShift = (shift: SchedulingShift) => {
    const assigned = members.find((member) => member.user_id === shift.assigned_member_id)
    const scheduledMinutes = shift.scheduled_minutes ?? 0
    const scheduledCost = shift.scheduled_cost_cents ?? 0

    return (
      <div
        key={shift.id}
        className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-100 space-y-1"
      >
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>
            {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
          </span>
          {assigned?.compensation?.rate_cents && (
            <span className="text-xs text-emerald-200">
              ${(assigned.compensation.rate_cents / 100).toFixed(2)}/h
            </span>
          )}
        </div>
        {shift.role_label && <p className="text-xs text-emerald-200">{shift.role_label}</p>}
        <div className="flex items-center justify-between text-xs text-emerald-300">
          <span>{formatHours(scheduledMinutes)}</span>
          <span>{formatCurrency((scheduledCost ?? 0) / 100)}</span>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white" onClick={() => onEditShift(shift)}>
            Edit
          </Button>
          {shift.assigned_member_id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-200 hover:text-white"
              onClick={() => onUnassignShift(shift.id, shift.assigned_member_id!)}
            >
              Unassign
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderCell = (memberId: string | null, dayId: string) => {
    const day = days.find((d) => d.id === dayId)
    const shifts = (day?.shifts ?? []).filter((shift) =>
      memberId ? shift.assigned_member_id === memberId : !shift.assigned_member_id
    )

    return (
      <div className="space-y-2">
        {shifts.map((shift) => renderShift(shift))}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed text-slate-300 hover:text-white"
          onClick={() => onCreateShift(dayId, memberId)}
        >
          Add shift
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
        <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
          Scheduled labor: {scheduledLaborLabel} • {scheduledHoursLabel}
        </Badge>
        <Badge variant="outline" className="border-purple-400/40 bg-purple-500/10 text-purple-100">
          Actual labor: {actualLaborLabel} • {actualHoursLabel}
        </Badge>
        <Badge variant="outline" className="border-amber-400/40 bg-amber-500/10 text-amber-100">
          Live labor: {liveLaborLabel} • {liveHoursLabel}
        </Badge>
        <Badge variant="outline" className="border-sky-400/40 bg-sky-500/10 text-sky-100">
          Forecast sales: {forecastSalesLabel}
        </Badge>
        <Badge variant="outline" className="border-cyan-400/40 bg-cyan-500/10 text-cyan-100">
          {laborPercentDescriptor}: {laborPercentLabel}
        </Badge>
      </div>

      <ScrollArea className="w-full">
        <Table className="w-full min-w-[960px] border border-white/10">
          <TableHeader>
            <TableRow className="bg-white/5 text-sm uppercase tracking-wide text-slate-300">
              <TableHead className="w-64">Team member</TableHead>
              {days.map((day) => (
                <TableHead key={day.id} className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>{format(parseISO(day.schedule_date), 'EEE')}</span>
                    <span className="text-xs text-slate-500">{format(parseISO(day.schedule_date), 'MMM d')}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.user_id} className="border-white/10">
                <TableCell className="align-top">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full border flex items-center justify-center',
                        member.user_id === 'unassigned'
                          ? 'border-slate-500/50 bg-slate-500/10 text-slate-200'
                          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                      )}
                    >
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-white">{getMemberName(member)}</div>
                      {member.compensation?.rate_cents && (
                        <div className="text-xs text-slate-400">
                          ${(member.compensation.rate_cents / 100).toFixed(2)} / {member.compensation.rate_type}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                {days.map((day) => (
                  <TableCell key={`${member.user_id}-${day.id}`} className="align-top">
                    {renderCell(member.user_id === 'unassigned' ? null : member.user_id, day.id)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {gridFetching && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-white/10" />
          <p className="text-xs text-slate-500">Refreshing latest labor totals…</p>
        </div>
      )}
    </div>
  )
}

