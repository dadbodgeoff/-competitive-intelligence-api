import { apiClient, safeRequest } from './client'
import { parseResponse } from './validation'
import {
  schedulingSettingsResponseSchema,
  schedulingWeeksResponseSchema,
  schedulingWeekResponseSchema,
  schedulingDayResponseSchema,
  schedulingShiftResponseSchema,
  schedulingShiftAssignmentResponseSchema,
  schedulingClockInResponseSchema,
  schedulingClockOutResponseSchema,
  timesheetResponseSchema,
  schedulerGridResponseSchema,
  timeClockPinResponseSchema,
} from './schemas'
import type {
  SchedulingSettingsResponse,
  SchedulingWeeksResponse,
  SchedulingWeekResponse,
  SchedulingDayResponse,
  SchedulingShiftResponse,
  SchedulingShiftAssignmentResponse,
  SchedulingClockInResponse,
  SchedulingClockOutResponse,
  TimesheetResponse,
  SchedulerGridResponse,
  TimeClockPinResponse,
} from '@/types/scheduling'

export async function getSchedulingSettings() {
  const result = await safeRequest<SchedulingSettingsResponse>(() => apiClient.get('/api/v1/scheduling/settings'))
  return parseResponse(result, schedulingSettingsResponseSchema, 'Failed to load scheduling settings')
}

export async function updateSchedulingSettings(payload: {
  week_start_day: number
  timezone: string
  auto_publish: boolean
  default_shift_length_minutes: number
}) {
  const result = await safeRequest<SchedulingSettingsResponse>(() =>
    apiClient.put('/api/v1/scheduling/settings', payload)
  )
  return parseResponse(result, schedulingSettingsResponseSchema, 'Failed to update scheduling settings')
}

export async function getSchedulingWeeks(params?: { limit?: number; status?: string; includeDays?: boolean }) {
  const result = await safeRequest<SchedulingWeeksResponse>(() =>
    apiClient.get('/api/v1/scheduling/weeks', {
      params: {
        limit: params?.limit,
        status: params?.status,
        include_days: params?.includeDays ?? true,
      },
    })
  )
  return parseResponse(result, schedulingWeeksResponseSchema, 'Failed to load scheduling weeks')
}

export async function createSchedulingWeek(payload: {
  week_start_date: string
  expected_sales_total?: number
  expected_guest_count?: number
  day_forecasts?: Array<{ date: string; expected_sales?: number; expected_guest_count?: number }>
  notes?: string
}) {
  const result = await safeRequest<SchedulingWeekResponse>(() =>
    apiClient.post('/api/v1/scheduling/weeks', payload)
  )
  return parseResponse(result, schedulingWeekResponseSchema, 'Failed to create scheduling week')
}

export async function updateSchedulingWeek(
  weekId: string,
  payload: {
    status?: string
    expected_sales_total?: number
    expected_guest_count?: number
    notes?: string
  }
) {
  const result = await safeRequest<SchedulingWeekResponse>(() =>
    apiClient.patch(`/api/v1/scheduling/weeks/${weekId}`, payload)
  )
  return parseResponse(result, schedulingWeekResponseSchema, 'Failed to update scheduling week')
}

export async function updateSchedulingDayForecast(
  dayId: string,
  payload: { expected_sales?: number; expected_guest_count?: number; notes?: string }
) {
  const result = await safeRequest<SchedulingDayResponse>(() =>
    apiClient.put(`/api/v1/scheduling/days/${dayId}/forecast`, payload)
  )
  return parseResponse(result, schedulingDayResponseSchema, 'Failed to update day forecast')
}

export async function createSchedulingShift(payload: {
  day_id: string
  week_id: string
  shift_type: string
  start_time: string
  end_time: string
  role_label?: string
  break_minutes?: number
  wage_type?: string
  wage_rate?: number
  wage_currency?: string
  notes?: string
}) {
  const result = await safeRequest<SchedulingShiftResponse>(() =>
    apiClient.post('/api/v1/scheduling/shifts', payload)
  )
  return parseResponse(result, schedulingShiftResponseSchema, 'Failed to create shift')
}

export async function updateSchedulingShift(
  shiftId: string,
  payload: {
    shift_type?: string
    start_time?: string
    end_time?: string
    break_minutes?: number
    role_label?: string
    notes?: string
  }
) {
  const result = await safeRequest<SchedulingShiftResponse>(() =>
    apiClient.put(`/api/v1/scheduling/shifts/${shiftId}`, payload)
  )
  return parseResponse(result, schedulingShiftResponseSchema, 'Failed to update shift')
}

export async function assignSchedulingShift(
  shiftId: string,
  payload: { member_user_id: string; wage_override?: number; wage_type_override?: string }
) {
  const result = await safeRequest<SchedulingShiftAssignmentResponse>(() =>
    apiClient.post(`/api/v1/scheduling/shifts/${shiftId}/assign`, payload)
  )
  return parseResponse(result, schedulingShiftAssignmentResponseSchema, 'Failed to assign shift')
}

export async function unassignSchedulingShift(shiftId: string, memberUserId: string) {
  const result = await safeRequest<void>(() =>
    apiClient.delete(`/api/v1/scheduling/shifts/${shiftId}/assign/${memberUserId}`)
  )
  // DELETE returns empty body; interpret success via status
  if (!result.success && result.error) {
    throw new Error(result.error.message)
  }
}

export async function clockInShift(shiftId: string, payload: { source?: string } = {}) {
  const result = await safeRequest<SchedulingClockInResponse>(() =>
    apiClient.post(`/api/v1/scheduling/shifts/${shiftId}/clock-in`, payload)
  )
  return parseResponse(result, schedulingClockInResponseSchema, 'Failed to clock in to shift')
}

export async function clockOutShift(
  shiftId: string,
  payload: { source?: string; note?: string; break_minutes?: number } = {}
) {
  const result = await safeRequest<SchedulingClockOutResponse>(() =>
    apiClient.post(`/api/v1/scheduling/shifts/${shiftId}/clock-out`, payload)
  )
  return parseResponse(result, schedulingClockOutResponseSchema, 'Failed to clock out of shift')
}

export async function heartbeatShift(shiftId: string) {
  const result = await safeRequest(() => apiClient.post(`/api/v1/scheduling/shifts/${shiftId}/heartbeat`, {}))
  if (!result.success && result.error) {
    throw new Error(result.error.message)
  }
}

export async function getTimesheet(weekId: string) {
  const result = await safeRequest<TimesheetResponse>(() =>
    apiClient.get(`/api/v1/scheduling/weeks/${weekId}/timesheet`)
  )
  return parseResponse(result, timesheetResponseSchema, 'Failed to load timesheet')
}

export async function getSchedulerGrid(weekId: string) {
  const result = await safeRequest<SchedulerGridResponse>(() =>
    apiClient.get(`/api/v1/scheduling/weeks/${weekId}/grid`)
  )
  return parseResponse(result, schedulerGridResponseSchema, 'Failed to load schedule grid')
}

export async function clockWithPin(pin: string) {
  const result = await safeRequest<TimeClockPinResponse>(() =>
    apiClient.post('/api/v1/scheduling/timeclock/pin', { pin })
  )
  return parseResponse(result, timeClockPinResponseSchema, 'Failed to update time clock')
}

