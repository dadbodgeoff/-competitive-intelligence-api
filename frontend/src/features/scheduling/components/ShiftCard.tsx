/**
 * ShiftCard Component
 * Modern shift display card with role-based colors and live indicators
 */

import { Clock, User, MoreVertical, Edit2, UserMinus, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { SchedulingShift, SchedulerMember } from '@/types/scheduling'

interface ShiftCardProps {
  shift: SchedulingShift
  member?: SchedulerMember | null
  onEdit: () => void
  onUnassign?: () => void
  onClockIn?: () => void
  onClockOut?: () => void
}

const roleColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  front_of_house: {
    bg: 'bg-gradient-to-br from-primary-500/15 to-primary-600/5',
    border: 'border-primary-500/40',
    text: 'text-primary-300',
    accent: 'bg-primary-500',
  },
  back_of_house: {
    bg: 'bg-gradient-to-br from-accent-500/15 to-accent-600/5',
    border: 'border-accent-500/40',
    text: 'text-accent-300',
    accent: 'bg-accent-500',
  },
  management: {
    bg: 'bg-gradient-to-br from-amber-500/15 to-amber-600/5',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    accent: 'bg-amber-500',
  },
  other: {
    bg: 'bg-gradient-to-br from-slate-500/15 to-slate-600/5',
    border: 'border-slate-500/40',
    text: 'text-slate-300',
    accent: 'bg-slate-500',
  },
  unscheduled: {
    bg: 'bg-gradient-to-br from-rose-500/15 to-rose-600/5',
    border: 'border-rose-500/40',
    text: 'text-rose-300',
    accent: 'bg-rose-500',
  },
}

function formatTime(time: string): string {
  // Convert HH:MM:SS to 12-hour format
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatHours(minutes: number): string {
  const hours = minutes / 60
  return `${hours.toFixed(1)}h`
}

function getMemberName(member?: SchedulerMember | null): string {
  if (!member) return 'Unassigned'
  
  const meta = member.auth_users?.raw_user_meta_data as Record<string, unknown> | undefined
  const first = member.auth_users?.first_name ?? member.profile?.first_name ?? (meta?.first_name as string)
  const last = member.auth_users?.last_name ?? member.profile?.last_name ?? (meta?.last_name as string)
  
  if (first || last) {
    return [first, last].filter(Boolean).join(' ')
  }
  
  if (member.auth_users?.email) {
    return member.auth_users.email.split('@')[0]
  }
  
  return 'Team Member'
}

export function ShiftCard({
  shift,
  member,
  onEdit,
  onUnassign,
  onClockIn,
  onClockOut,
}: ShiftCardProps) {
  const colors = roleColors[shift.shift_type] || roleColors.other
  const isLive = (shift.live_sessions?.length ?? 0) > 0
  const scheduledMinutes = shift.scheduled_minutes ?? 0
  const scheduledCost = shift.scheduled_cost_cents ?? 0
  const hourlyRate = member?.compensation?.rate_cents

  return (
    <div
      className={cn(
        'group relative rounded-xl border p-2.5 transition-all duration-200',
        'hover:shadow-xl hover:shadow-black/20 hover:scale-[1.02] hover:border-white/20',
        'backdrop-blur-sm',
        colors.bg,
        colors.border,
        isLive && 'ring-2 ring-primary-500/60'
      )}
    >
      {/* Color accent bar */}
      <div className={cn('absolute top-0 left-3 right-3 h-0.5 rounded-full opacity-60', colors.accent)} />
      
      {/* Live indicator */}
      {isLive && (
        <div className="absolute -top-1.5 -right-1.5">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-card-dark" />
          </span>
        </div>
      )}

      {/* Header: Time range */}
      <div className="flex items-center justify-between mb-1.5 mt-1">
        <span className="text-sm font-bold text-white tracking-tight">
          {formatTime(shift.start_time)} – {formatTime(shift.end_time)}
        </span>
        
        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
            >
              <MoreVertical className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card-dark border-white/10">
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5 mr-2" />
              Edit Shift
            </DropdownMenuItem>
            {shift.assigned_member_id && onUnassign && (
              <DropdownMenuItem onClick={onUnassign}>
                <UserMinus className="h-3.5 w-3.5 mr-2" />
                Unassign
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/10" />
            {!isLive && onClockIn && (
              <DropdownMenuItem onClick={onClockIn}>
                <Play className="h-3.5 w-3.5 mr-2" />
                Clock In
              </DropdownMenuItem>
            )}
            {isLive && onClockOut && (
              <DropdownMenuItem onClick={onClockOut}>
                <Square className="h-3.5 w-3.5 mr-2" />
                Clock Out
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Member info with avatar */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold',
          member ? 'bg-white/15 text-white' : 'bg-slate-600/50 text-slate-400'
        )}>
          {member ? (
            getMemberName(member).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          ) : (
            <User className="h-2.5 w-2.5" />
          )}
        </div>
        <span className="text-xs text-slate-300 truncate font-medium">
          {getMemberName(member)}
        </span>
      </div>

      {/* Stats row - cleaner layout */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {formatHours(scheduledMinutes)}
        </span>
        <span className="text-slate-600">•</span>
        <span className="font-medium text-slate-300">{formatCurrency(scheduledCost)}</span>
        {hourlyRate && (
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">${(hourlyRate / 100).toFixed(0)}/hr</span>
          </>
        )}
      </div>

      {/* Break indicator - more subtle */}
      {(shift.break_minutes ?? 0) > 0 && (
        <p className="text-[10px] text-slate-500 mt-1.5 pl-0.5">
          {shift.break_minutes}m break
        </p>
      )}
    </div>
  )
}
