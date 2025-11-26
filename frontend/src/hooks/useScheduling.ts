import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import {
  getSchedulingSettings,
  updateSchedulingSettings,
  getSchedulingWeeks,
  createSchedulingWeek,
  updateSchedulingWeek,
  updateSchedulingDayForecast,
  createSchedulingShift,
  updateSchedulingShift,
  assignSchedulingShift,
  unassignSchedulingShift,
  clockInShift,
  clockOutShift,
  heartbeatShift,
  getTimesheet,
  getSchedulerGrid,
} from '@/services/api/schedulingApi'
import type {
  SchedulingSettingsResponse,
  SchedulingWeeksResponse,
  SchedulingClockInResponse,
  SchedulingClockOutResponse,
  TimesheetResponse,
  SchedulerGridResponse,
} from '@/types/scheduling'

const SETTINGS_KEY = ['scheduling', 'settings']
const WEEKS_KEY = ['scheduling', 'weeks']

/**
 * Standard error handler for mutations
 * Logs errors in development and can be extended for error tracking
 */
function handleMutationError(error: Error, context?: string) {
  if (import.meta.env.DEV) {
    console.error(`[Scheduling${context ? ` - ${context}` : ''}]`, error.message)
  }
  // Error is re-thrown to be handled by the component's onError or error state
}

export function useSchedulingSettings(options?: UseQueryOptions<SchedulingSettingsResponse>) {
  return useQuery<SchedulingSettingsResponse>({
    queryKey: SETTINGS_KEY,
    queryFn: () => getSchedulingSettings(),
    staleTime: 5 * 60 * 1000, // Settings rarely change, cache for 5 minutes
    gcTime: 10 * 60 * 1000,
    ...options,
  })
}

export function useUpdateSchedulingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSchedulingSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'updateSettings'),
  })
}

export function useSchedulingWeeks(
  params?: { limit?: number; status?: string; includeDays?: boolean },
  options?: UseQueryOptions<SchedulingWeeksResponse>
) {
  return useQuery<SchedulingWeeksResponse>({
    queryKey: [...WEEKS_KEY, params],
    queryFn: () => getSchedulingWeeks(params),
    staleTime: 2 * 60 * 1000, // Cache weeks list for 2 minutes
    gcTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useCreateSchedulingWeek() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSchedulingWeek,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'createWeek'),
  })
}

export function useUpdateSchedulingWeek() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ weekId, payload }: { weekId: string; payload: Parameters<typeof updateSchedulingWeek>[1] }) =>
      updateSchedulingWeek(weekId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'updateWeek'),
  })
}

export function useUpdateSchedulingDayForecast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      dayId,
      payload,
    }: {
      dayId: string
      payload: Parameters<typeof updateSchedulingDayForecast>[1]
    }) => updateSchedulingDayForecast(dayId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'updateDayForecast'),
  })
}

export function useCreateSchedulingShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSchedulingShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'createShift'),
  })
}

export function useUpdateSchedulingShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      shiftId,
      payload,
    }: {
      shiftId: string
      payload: Parameters<typeof updateSchedulingShift>[1]
    }) => updateSchedulingShift(shiftId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'updateShift'),
  })
}

export function useAssignSchedulingShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      shiftId,
      payload,
    }: {
      shiftId: string
      payload: Parameters<typeof assignSchedulingShift>[1]
    }) => assignSchedulingShift(shiftId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'assignShift'),
  })
}

export function useUnassignSchedulingShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shiftId, memberUserId }: { shiftId: string; memberUserId: string }) =>
      unassignSchedulingShift(shiftId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'unassignShift'),
  })
}

export function useClockInShift() {
  const queryClient = useQueryClient()
  return useMutation<SchedulingClockInResponse, Error, { shiftId: string; source?: string }>({
    mutationFn: ({ shiftId, source }) => clockInShift(shiftId, { source }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'clockIn'),
  })
}

export function useClockOutShift() {
  const queryClient = useQueryClient()
  return useMutation<
    SchedulingClockOutResponse,
    Error,
    { shiftId: string; source?: string; note?: string; break_minutes?: number }
  >({
    mutationFn: ({ shiftId, source, note, break_minutes }) =>
      clockOutShift(shiftId, { source, note, break_minutes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEEKS_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'clockOut'),
  })
}

export function useHeartbeatShift() {
  return useMutation({
    mutationFn: (shiftId: string) => heartbeatShift(shiftId),
  })
}

export function useTimesheet(weekId?: string) {
  return useQuery<TimesheetResponse>({
    queryKey: ['scheduling', 'timesheet', weekId],
    queryFn: () => {
      if (!weekId) {
        return Promise.reject(new Error('Week ID is required for timesheet'))
      }
      return getTimesheet(weekId)
    },
    enabled: Boolean(weekId),
    staleTime: 30 * 1000,
  })
}

export function useSchedulerGrid(weekId?: string) {
  return useQuery<SchedulerGridResponse>({
    queryKey: ['scheduling', 'grid', weekId],
    queryFn: () => {
      if (!weekId) {
        return Promise.reject(new Error('Week ID is required for scheduler grid'))
      }
      return getSchedulerGrid(weekId)
    },
    enabled: Boolean(weekId),
    staleTime: 60 * 1000, // Cache grid for 1 minute
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData, // Show previous data while fetching
  })
}

