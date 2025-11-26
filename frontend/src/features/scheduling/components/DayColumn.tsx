/**
 * DayColumn Component
 * A single day column in the schedule grid with shifts
 */

import { Plus } from 'lucide-react'
import { format, parseISO, isToday, isWeekend } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ShiftCard } from './ShiftCard'
import type { SchedulingDay, SchedulingShift, SchedulerMember } from '@/types/scheduling'

interface DayColumnProps {
  day: SchedulingDay
  shifts: SchedulingShift[]
  members: SchedulerMember[]
  memberId?: string | null // Filter shifts by member, null = unassigned
  showHeader?: boolean // Only show date header once at top
  onCreateShift: (dayId: string, memberId: string | null | undefined) => void
  onEditShift: (shift: SchedulingShift) => void
  onUnassignShift: (shiftId: string, memberId: string) => void
  onClockIn?: (shiftId: string) => void
  onClockOut?: (shiftId: string) => void
}

export function DayColumn({
  day,
  shifts,
  members,
  memberId,
  showHeader = false,
  onCreateShift,
  onEditShift,
  onUnassignShift,
  onClockIn,
  onClockOut,
}: DayColumnProps) {
  const date = parseISO(day.schedule_date)
  const isCurrentDay = isToday(date)
  const isWeekendDay = isWeekend(date)
  
  // Filter shifts for this member
  const filteredShifts = shifts.filter((shift) => {
    if (memberId === null) {
      return !shift.assigned_member_id
    }
    return shift.assigned_member_id === memberId
  })

  // Get member lookup
  const getMember = (userId?: string | null) => {
    if (!userId) return null
    return members.find((m) => m.user_id === userId)
  }

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-w-[100px] border-r border-white/5 last:border-r-0',
        isCurrentDay && 'bg-primary-500/5',
        isWeekendDay && 'bg-white/[0.02]'
      )}
    >
      {/* Day header - only shown once at top */}
      {showHeader && (
        <div
          className={cn(
            'px-2 py-1.5 border-b border-white/10 bg-card-dark/95 text-center',
            isCurrentDay && 'bg-primary-500/10'
          )}
        >
          <p
            className={cn(
              'text-xs font-semibold',
              isCurrentDay ? 'text-primary-400' : 'text-white'
            )}
          >
            {format(date, 'EEE')}
          </p>
          <p className="text-[10px] text-slate-400">
            {format(date, 'MMM d')}
          </p>
        </div>
      )}

      {/* Shifts container */}
      <div className="flex-1 p-2 space-y-2 min-h-[100px]">
        {filteredShifts.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateShift(day.id, memberId)}
              className={cn(
                'w-full h-full min-h-[80px] rounded-xl',
                'border-2 border-dashed border-white/10',
                'text-slate-500 hover:text-primary-400',
                'hover:border-primary-500/40 hover:bg-primary-500/5',
                'transition-all duration-200 group/add'
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-full bg-white/5 group-hover/add:bg-primary-500/20 flex items-center justify-center transition-colors">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-xs">Add Shift</span>
              </div>
            </Button>
          </div>
        ) : (
          <>
            {filteredShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                member={getMember(shift.assigned_member_id)}
                onEdit={() => onEditShift(shift)}
                onUnassign={
                  shift.assigned_member_id
                    ? () => onUnassignShift(shift.id, shift.assigned_member_id!)
                    : undefined
                }
                onClockIn={
                  shift.assigned_member_id && onClockIn
                    ? () => onClockIn(shift.id)
                    : undefined
                }
                onClockOut={
                  shift.assigned_member_id && onClockOut
                    ? () => onClockOut(shift.id)
                    : undefined
                }
              />
            ))}
            
            {/* Add another shift button - more subtle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateShift(day.id, memberId)}
              className={cn(
                'w-full h-8 rounded-lg',
                'border border-dashed border-white/10',
                'text-slate-500 hover:text-primary-400',
                'hover:border-primary-500/30 hover:bg-primary-500/5',
                'transition-all duration-200'
              )}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
