import type { SchedulerMember } from '@/types/scheduling'

export function getMemberName(member: SchedulerMember) {
  if (member.user_id === 'unassigned') {
    return 'Unassigned shifts'
  }

  const meta = (member.auth_users?.raw_user_meta_data as Record<string, unknown> | undefined) ?? {}
  const first =
    member.auth_users?.first_name ??
    member.profile?.first_name ??
    (typeof meta.first_name === 'string' ? (meta.first_name as string) : undefined)
  const last =
    member.auth_users?.last_name ??
    member.profile?.last_name ??
    (typeof meta.last_name === 'string' ? (meta.last_name as string) : undefined)

  if (first || last) {
    return [first, last].filter(Boolean).join(' ')
  }

  if (member.auth_users?.email) {
    return member.auth_users.email.split('@')[0]
  }

  return 'Team member'
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}

export function formatCurrencyFromCents(value?: number | null) {
  return formatCurrency((value ?? 0) / 100)
}

export function formatHours(minutes?: number | null) {
  const mins = minutes ?? 0
  return `${(mins / 60).toFixed(2)}h`
}

