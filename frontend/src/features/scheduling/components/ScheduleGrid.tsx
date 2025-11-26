/**
 * ScheduleGrid Component
 * Modern schedule grid with member rows and day columns
 */

import { useMemo } from 'react'
// Removed ScrollArea - grid now expands naturally with employees
import { MemberRow } from './MemberRow'
import { DayColumn } from './DayColumn'
import { cn } from '@/lib/utils'
import type { SchedulingDay, SchedulingShift, SchedulerMember } from '@/types/scheduling'

interface ScheduleGridProps {
  days: SchedulingDay[]
  members: SchedulerMember[]
  isLoading?: boolean
  onCreateShift: (dayId: string, memberId: string | null | undefined) => void
  onEditShift: (shift: SchedulingShift) => void
  onUnassignShift: (shiftId: string, memberId: string) => void
  onClockIn?: (shiftId: string) => void
  onClockOut?: (shiftId: string) => void
}

// Unassigned member placeholder
const unassignedMember: SchedulerMember = {
  user_id: 'unassigned',
  role: 'Unassigned',
  status: 'active',
  auth_users: null,
  compensation: null,
}

export function ScheduleGrid({
  days,
  members,
  isLoading,
  onCreateShift,
  onEditShift,
  onUnassignShift,
  onClockIn,
  onClockOut,
}: ScheduleGridProps) {
  // Sort days by date
  const sortedDays = useMemo(() => {
    return [...days].sort((a, b) => a.schedule_date.localeCompare(b.schedule_date))
  }, [days])

  // Include unassigned row at the bottom
  const allMembers = useMemo(() => {
    return [...members.filter((m) => m.user_id !== 'unassigned'), unassignedMember]
  }, [members])

  // Calculate member totals for the week
  const memberTotals = useMemo(() => {
    const totals: Record<string, { shifts: number; minutes: number; cost: number }> = {}
    
    for (const day of days) {
      for (const shift of day.shifts ?? []) {
        const memberId = shift.assigned_member_id ?? 'unassigned'
        if (!totals[memberId]) {
          totals[memberId] = { shifts: 0, minutes: 0, cost: 0 }
        }
        totals[memberId].shifts += 1
        totals[memberId].minutes += shift.scheduled_minutes ?? 0
        totals[memberId].cost += shift.scheduled_cost_cents ?? 0
      }
    }
    
    return totals
  }, [days])

  // Get all shifts for a specific day
  const getShiftsForDay = (dayId: string): SchedulingShift[] => {
    const day = days.find((d) => d.id === dayId)
    return day?.shifts ?? []
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-card-dark overflow-hidden">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex border-b border-white/10">
            <div className="w-[180px] h-12 bg-white/5" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 h-12 bg-white/5 border-l border-white/5" />
            ))}
          </div>
          {/* Row skeletons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex border-b border-white/5">
              <div className="w-[180px] h-20 bg-white/[0.02]" />
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="flex-1 h-20 bg-white/[0.02] border-l border-white/5" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-card-dark p-8 text-center">
        <p className="text-slate-400">No schedule data available for this week.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-card-dark overflow-x-auto shadow-xl shadow-black/20">
      <div className="min-w-[1100px]">
        {/* Grid container */}
        <div className="flex flex-col">
          {/* Header row with day names */}
          <div className="flex border-b border-white/15 bg-gradient-to-r from-white/[0.03] to-transparent">
            {/* Empty corner cell */}
            <div className="w-[180px] min-w-[180px] px-3 py-3 border-r border-white/10 sticky left-0 z-30 bg-card-dark/95 backdrop-blur-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Member</p>
            </div>
            
            {/* Day headers - shown once here */}
            <div className="flex flex-1">
              {sortedDays.map((day) => {
                const date = new Date(day.schedule_date + 'T00:00:00')
                const isCurrentDay = new Date().toDateString() === date.toDateString()
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                
                return (
                  <div
                    key={day.id}
                    className={cn(
                      'flex-1 min-w-[120px] px-2 py-2.5 border-r border-white/5 last:border-r-0 text-center relative',
                      isCurrentDay && 'bg-primary-500/10'
                    )}
                  >
                    {/* Today indicator dot */}
                    {isCurrentDay && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary-400" />
                    )}
                    <p className={cn(
                      'text-sm font-bold tracking-tight',
                      isCurrentDay ? 'text-primary-400' : 'text-white'
                    )}>
                      {dayName}
                    </p>
                    <p className={cn(
                      'text-[11px] mt-0.5',
                      isCurrentDay ? 'text-primary-400/70' : 'text-slate-500'
                    )}>
                      {dateStr}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Member rows */}
          {allMembers.map((member, idx) => {
            const isUnassigned = member.user_id === 'unassigned'
            const totals = memberTotals[member.user_id]
            const isLastRow = idx === allMembers.length - 1
            
            return (
              <div
                key={member.user_id}
                className={cn(
                  'flex border-b border-white/5',
                  isLastRow && 'border-b-0',
                  isUnassigned && 'bg-slate-900/40'
                )}
              >
                {/* Member info cell */}
                <MemberRow
                  member={member}
                  isUnassigned={isUnassigned}
                  totalShifts={totals?.shifts}
                  totalHours={totals?.minutes ? totals.minutes / 60 : 0}
                  totalCost={totals?.cost}
                />
                
                {/* Day columns */}
                <div className="flex flex-1">
                  {sortedDays.map((day) => (
                    <DayColumn
                      key={`${member.user_id}-${day.id}`}
                      day={day}
                      shifts={getShiftsForDay(day.id)}
                      members={members}
                      memberId={isUnassigned ? null : member.user_id}
                      showHeader={false}
                      onCreateShift={onCreateShift}
                      onEditShift={onEditShift}
                      onUnassignShift={onUnassignShift}
                      onClockIn={onClockIn}
                      onClockOut={onClockOut}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
