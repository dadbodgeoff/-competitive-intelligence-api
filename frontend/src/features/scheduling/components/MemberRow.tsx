/**
 * MemberRow Component
 * Team member row with avatar and compensation info
 */

import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SchedulerMember } from '@/types/scheduling'

interface MemberRowProps {
  member: SchedulerMember
  isUnassigned?: boolean
  totalShifts?: number
  totalHours?: number
  totalCost?: number
}

function getMemberName(member: SchedulerMember): string {
  if (member.user_id === 'unassigned') {
    return 'Unassigned Shifts'
  }
  
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

function getInitials(member: SchedulerMember): string {
  if (member.user_id === 'unassigned') return '?'
  
  const name = getMemberName(member)
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function formatCurrency(cents?: number): string {
  if (!cents) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatHours(minutes?: number): string {
  if (!minutes) return '0h'
  return `${(minutes / 60).toFixed(1)}h`
}

export function MemberRow({
  member,
  isUnassigned = false,
  totalShifts = 0,
  totalHours = 0,
  totalCost = 0,
}: MemberRowProps) {
  const name = getMemberName(member)
  const initials = getInitials(member)
  const hourlyRate = member.compensation?.rate_cents

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-3 border-r border-white/10',
        'sticky left-0 z-20 w-[180px] min-w-[180px]',
        isUnassigned 
          ? 'bg-slate-900/80 backdrop-blur-sm' 
          : 'bg-card-dark/95 backdrop-blur-sm'
      )}
    >
      {/* Avatar with gradient ring */}
      <div
        className={cn(
          'h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg',
          isUnassigned
            ? 'bg-slate-700/60 text-slate-400 ring-2 ring-slate-600/50'
            : 'bg-gradient-to-br from-primary-500/30 to-primary-600/20 text-primary-200 ring-2 ring-primary-500/30'
        )}
      >
        {isUnassigned ? (
          <Users className="h-4 w-4" />
        ) : (
          initials
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-sm font-semibold text-white truncate leading-tight">{name}</p>
        
        {!isUnassigned && hourlyRate && (
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {member.role && <span className="capitalize text-slate-500">{member.role}</span>}
            {member.role && hourlyRate && <span className="text-slate-600 mx-1">•</span>}
            <span className="text-primary-400/80">${(hourlyRate / 100).toFixed(0)}/hr</span>
          </p>
        )}
        
        {/* Week totals - more visual */}
        {totalShifts > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
              {totalShifts} shifts
            </span>
            <span className="text-[10px] text-slate-500">
              {formatHours(totalHours * 60)}
            </span>
            <span className="text-[10px] font-medium text-emerald-400/80">
              {formatCurrency(totalCost)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
