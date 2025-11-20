export interface SchedulingSettings {
  account_id: string
  week_start_day: number
  timezone: string
  auto_publish: boolean
  default_shift_length_minutes: number
}

export interface SchedulingShiftAssignment {
  shift_id: string
  member_user_id: string
  wage_override?: number | null
  wage_type_override?: string | null
  created_at: string
  updated_at: string
}

export interface SchedulingShiftLiveSession {
  id: string
  account_id: string
  shift_id: string
  member_user_id: string
  started_at: string
  last_heartbeat_at: string
  started_rate_cents?: number | null
  started_rate_type?: string | null
  started_rate_currency?: string | null
}

export interface SchedulingShiftClockEntry {
  id: string
  account_id: string
  shift_id: string
  member_user_id: string
  clock_in_at: string
  clock_out_at?: string | null
  clock_in_source: string
  clock_out_source?: string | null
  clock_in_note?: string | null
  clock_out_note?: string | null
  effective_rate_cents: number
  effective_rate_type: string
  effective_rate_currency: string
  total_minutes?: number | null
  break_minutes?: number | null
}

export interface SchedulingShift {
  id: string
  account_id: string
  week_id: string
  day_id: string
  shift_type: string
  role_label?: string | null
  start_time: string
  end_time: string
  break_minutes?: number | null
  wage_type?: string | null
  wage_rate?: number | null
  wage_currency?: string | null
  notes?: string | null
  assigned_member_id?: string | null
  assignments?: SchedulingShiftAssignment[]
  live_sessions?: SchedulingShiftLiveSession[]
  latest_entry?: SchedulingShiftClockEntry | null
  scheduled_minutes?: number | null
  scheduled_cost_cents?: number | null
}

export interface SchedulingDay {
  id: string
  account_id: string
  week_id: string
  schedule_date: string
  expected_sales?: number | null
  expected_guest_count?: number | null
  notes?: string | null
  shifts?: SchedulingShift[]
}

export interface SchedulingWeek {
  id: string
  account_id: string
  week_start_date: string
  week_end_date: string
  status: string
  expected_sales_total?: number | null
  expected_guest_count?: number | null
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
  days?: SchedulingDay[]
}

export interface SchedulingWeeksResponse {
  weeks: SchedulingWeek[]
}

export interface SchedulingWeekResponse {
  week: SchedulingWeek
}

export interface SchedulingDayResponse {
  day: SchedulingDay
}

export interface SchedulingShiftResponse {
  shift: SchedulingShift
}

export interface SchedulingShiftAssignmentResponse {
  assignment: SchedulingShiftAssignment
}

export interface SchedulingSettingsResponse {
  settings: SchedulingSettings
}

export interface SchedulingClockInResponse {
  session: SchedulingShiftLiveSession
}

export interface SchedulingClockOutResponse {
  entry: SchedulingShiftClockEntry
}

export interface LaborDaySummary {
  id: string
  account_id: string
  week_id: string
  day_id: string
  schedule_date: string
  scheduled_minutes: number
  scheduled_cost_cents: number
  actual_minutes: number
  actual_cost_cents: number
  variance_minutes: number
  variance_cost_cents: number
  completed_minutes?: number | null
  completed_cost_cents?: number | null
  in_progress_minutes?: number | null
  in_progress_cost_cents?: number | null
}

export interface LaborWeekSummary {
  id: string
  account_id: string
  week_id: string
  week_start_date: string
  scheduled_minutes: number
  scheduled_cost_cents: number
  actual_minutes: number
  actual_cost_cents: number
  variance_minutes: number
  variance_cost_cents: number
  completed_minutes?: number | null
  completed_cost_cents?: number | null
  in_progress_minutes?: number | null
  in_progress_cost_cents?: number | null
}

export interface TimesheetResponse {
  week: LaborWeekSummary | null
  days: LaborDaySummary[]
}

export interface SchedulerMember {
  user_id: string
  role: string
  status: string
  auth_users?: {
    id: string
    email: string
    first_name?: string | null
    last_name?: string | null
    raw_user_meta_data?: Record<string, unknown> | null
  } | null
  profile?: {
    id: string
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
  } | null
  compensation?: {
    rate_cents: number
    currency: string
    rate_type: string
    effective_at?: string
  } | null
}

export interface SchedulerTotals {
  scheduled_minutes?: number | null
  scheduled_labor_cents?: number | null
  expected_sales_total?: number | null
  labor_percent?: number | null
  actual_minutes?: number | null
  actual_cost_cents?: number | null
  actual_labor_percent?: number | null
  in_progress_minutes?: number | null
  in_progress_cost_cents?: number | null
  completed_minutes?: number | null
  completed_cost_cents?: number | null
  variance_minutes?: number | null
  variance_cost_cents?: number | null
}

export interface SchedulerGridResponse {
  week: SchedulingWeek
  members: SchedulerMember[]
  totals: SchedulerTotals
}

export interface TimeClockPinResponse {
  status: 'clocked_in' | 'clocked_out'
  account_id: string
  member_user_id: string
  member_name: string
  shift_id: string
  session_id?: string
  entry_id?: string
  occurred_at: string
  message: string
}

