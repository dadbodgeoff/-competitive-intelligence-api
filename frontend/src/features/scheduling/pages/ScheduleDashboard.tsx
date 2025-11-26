/**
 * ScheduleDashboard Page
 * Modern, 2025-standard scheduling dashboard
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useSchedulingSettings,
  useSchedulingWeeks,
  useSchedulerGrid,
  useCreateSchedulingWeek,
  useCreateSchedulingShift,
  useUpdateSchedulingShift,
  useAssignSchedulingShift,
  useUnassignSchedulingShift,
  useUpdateSchedulingSettings,
  useClockInShift,
  useClockOutShift,
  useHeartbeatShift,
} from '@/hooks/useScheduling'
import {
  ScheduleHeader,
  WeekNavigator,
  LaborMetricsBar,
  ScheduleGrid,
  CreateWeekSheet,
  ShiftEditorSheet,
  SettingsSheet,
  type CreateWeekData,
  type ShiftFormData,
  type SettingsFormData,
} from '../components'
import type { SchedulingShift, SchedulerMember } from '@/types/scheduling'

// Unassigned member placeholder
const unassignedMember: SchedulerMember = {
  user_id: 'unassigned',
  role: 'Unassigned',
  status: 'active',
  auth_users: null,
  compensation: null,
}

export function ScheduleDashboard() {
  const { toast } = useToast()
  
  // Data fetching
  const { data: settingsData, isLoading: settingsLoading } = useSchedulingSettings()
  const { data: weeksData, isLoading: weeksLoading } = useSchedulingWeeks({ includeDays: false, limit: 12 })
  
  // State
  const [selectedWeekId, setSelectedWeekId] = useState<string | undefined>()
  const [createWeekOpen, setCreateWeekOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shiftEditorOpen, setShiftEditorOpen] = useState(false)
  const [shiftEditorMode, setShiftEditorMode] = useState<'create' | 'edit'>('create')
  const [editingShift, setEditingShift] = useState<SchedulingShift | null>(null)
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [_editingMemberId, setEditingMemberId] = useState<string | null>(null)
  
  // Grid data for selected week
  const { data: gridData, refetch: refetchGrid, isFetching: gridFetching } = useSchedulerGrid(selectedWeekId)
  
  // Mutations
  const createWeekMutation = useCreateSchedulingWeek()
  const createShiftMutation = useCreateSchedulingShift()
  const updateShiftMutation = useUpdateSchedulingShift()
  const assignShiftMutation = useAssignSchedulingShift()
  const unassignShiftMutation = useUnassignSchedulingShift()
  const updateSettingsMutation = useUpdateSchedulingSettings()
  const clockInMutation = useClockInShift()
  const clockOutMutation = useClockOutShift()
  const heartbeatMutation = useHeartbeatShift()
  
  // Derived data
  const weeks = weeksData?.weeks ?? []
  const settings = settingsData?.settings
  
  // Auto-select first week
  useMemo(() => {
    if (!selectedWeekId && weeks.length > 0) {
      setSelectedWeekId(weeks[0].id)
    }
  }, [weeks, selectedWeekId])
  
  // Sort days by date
  const days = useMemo(() => {
    const rawDays = gridData?.week.days ?? []
    return [...rawDays].sort((a, b) => a.schedule_date.localeCompare(b.schedule_date))
  }, [gridData?.week.days])
  
  // Members list with unassigned
  const members: SchedulerMember[] = useMemo(() => {
    const roster = gridData?.members ?? []
    return [unassignedMember, ...roster]
  }, [gridData?.members])
  
  // Count live shifts and get their IDs for heartbeat
  const { liveShiftsCount, liveShiftIds } = useMemo(() => {
    let count = 0
    const ids: string[] = []
    for (const day of days) {
      for (const shift of day.shifts ?? []) {
        if ((shift.live_sessions?.length ?? 0) > 0) {
          count++
          ids.push(shift.id)
        }
      }
    }
    return { liveShiftsCount: count, liveShiftIds: ids }
  }, [days])
  
  // Auto-refresh when there are live shifts (every 30 seconds)
  useEffect(() => {
    if (liveShiftsCount > 0 && selectedWeekId) {
      // Refresh grid data every 30 seconds when shifts are live
      const refreshInterval = setInterval(() => {
        refetchGrid()
      }, 30000)
      
      return () => clearInterval(refreshInterval)
    }
  }, [liveShiftsCount, selectedWeekId, refetchGrid])
  
  // Send heartbeats for live shifts (every 60 seconds)
  // Use ref to avoid re-creating interval when mutation changes
  const heartbeatMutateRef = useRef(heartbeatMutation.mutate)
  heartbeatMutateRef.current = heartbeatMutation.mutate
  
  useEffect(() => {
    if (liveShiftIds.length > 0) {
      const heartbeatInterval = setInterval(() => {
        for (const shiftId of liveShiftIds) {
          heartbeatMutateRef.current(shiftId)
        }
      }, 60000)
      
      return () => clearInterval(heartbeatInterval)
    }
  }, [liveShiftIds])
  
  // Handlers
  const handleCreateWeek = useCallback(async (data: CreateWeekData) => {
    try {
      const response = await createWeekMutation.mutateAsync({
        week_start_date: data.week_start_date,
        expected_sales_total: data.expected_sales_total,
        notes: data.notes,
        copy_from_week_id: data.copy_from_week_id,
        copy_shifts: data.copy_shifts,
        copy_forecasts: data.copy_forecasts,
      })
      toast({ title: 'Week created', description: 'Your new scheduling week is ready.' })
      setSelectedWeekId(response.week.id)
      setCreateWeekOpen(false)
    } catch (error) {
      toast({
        title: 'Failed to create week',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }, [createWeekMutation, toast])
  
  const handleUpdateSettings = useCallback(async (data: SettingsFormData) => {
    try {
      await updateSettingsMutation.mutateAsync(data)
      toast({ title: 'Settings saved' })
      setSettingsOpen(false)
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }, [updateSettingsMutation, toast])
  
  const handleOpenCreateShift = useCallback((dayId: string, memberId: string | null | undefined) => {
    setShiftEditorMode('create')
    setEditingShift(null)
    setEditingDayId(dayId)
    setEditingMemberId(memberId ?? null)
    setShiftEditorOpen(true)
  }, [])
  
  const handleOpenEditShift = useCallback((shift: SchedulingShift) => {
    setShiftEditorMode('edit')
    setEditingShift(shift)
    setEditingDayId(shift.day_id)
    setEditingMemberId(shift.assigned_member_id ?? null)
    setShiftEditorOpen(true)
  }, [])
  
  const handleSaveShift = useCallback(async (data: ShiftFormData) => {
    try {
      if (shiftEditorMode === 'create') {
        await createShiftMutation.mutateAsync({
          day_id: data.day_id,
          week_id: data.week_id,
          shift_type: data.shift_type,
          start_time: data.start_time,
          end_time: data.end_time,
          break_minutes: data.break_minutes,
          role_label: data.role_label,
          notes: data.notes,
          assigned_member_id: data.assigned_member_id,
        })
        toast({ title: 'Shift created' })
      } else if (data.id) {
        // Update shift
        await updateShiftMutation.mutateAsync({
          shiftId: data.id,
          payload: {
            start_time: data.start_time,
            end_time: data.end_time,
            break_minutes: data.break_minutes,
            role_label: data.role_label,
            notes: data.notes,
          },
        })
        
        // Handle assignment changes
        const previousMemberId = editingShift?.assigned_member_id
        const newMemberId = data.assigned_member_id
        
        if (previousMemberId !== newMemberId) {
          if (newMemberId) {
            await assignShiftMutation.mutateAsync({
              shiftId: data.id,
              payload: { member_user_id: newMemberId },
            })
          } else if (previousMemberId) {
            await unassignShiftMutation.mutateAsync({
              shiftId: data.id,
              memberUserId: previousMemberId,
            })
          }
        }
        
        toast({ title: 'Shift updated' })
      }
      
      await refetchGrid()
      setShiftEditorOpen(false)
    } catch (error) {
      toast({
        title: 'Failed to save shift',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }, [
    shiftEditorMode,
    editingShift,
    createShiftMutation,
    updateShiftMutation,
    assignShiftMutation,
    unassignShiftMutation,
    refetchGrid,
    toast,
  ])
  
  const handleUnassignShift = useCallback(async (shiftId: string, memberId: string) => {
    try {
      await unassignShiftMutation.mutateAsync({ shiftId, memberUserId: memberId })
      await refetchGrid()
      toast({ title: 'Shift unassigned' })
    } catch (error) {
      toast({
        title: 'Failed to unassign',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }, [unassignShiftMutation, refetchGrid, toast])
  
  const handleClockIn = useCallback(async (shiftId: string) => {
    try {
      await clockInMutation.mutateAsync({ shiftId, source: 'dashboard' })
      await refetchGrid()
      toast({ title: 'Clocked in', description: 'Shift started successfully.' })
    } catch (error) {
      toast({
        title: 'Failed to clock in',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }, [clockInMutation, refetchGrid, toast])
  
  const handleClockOut = useCallback(async (shiftId: string) => {
    try {
      await clockOutMutation.mutateAsync({ shiftId, source: 'dashboard' })
      await refetchGrid()
      toast({ title: 'Clocked out', description: 'Shift ended successfully.' })
    } catch (error) {
      toast({
        title: 'Failed to clock out',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }, [clockOutMutation, refetchGrid, toast])
  
  const isSavingShift =
    createShiftMutation.isPending ||
    updateShiftMutation.isPending ||
    assignShiftMutation.isPending ||
    unassignShiftMutation.isPending

  // Show skeleton immediately on initial load
  const isInitialLoading = weeksLoading && !weeksData

  if (isInitialLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          {/* Header Skeleton */}
          <div className="rounded-xl border border-white/10 bg-card-dark p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-white/10" />
                <Skeleton className="h-4 w-48 bg-white/10" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 bg-white/10" />
                <Skeleton className="h-8 w-24 bg-white/10" />
              </div>
            </div>
          </div>
          
          {/* Week Navigator Skeleton */}
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-32 rounded-lg bg-white/10 flex-shrink-0" />
            ))}
          </div>
          
          {/* Labor Metrics Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-white/10" />
            ))}
          </div>
          
          {/* Grid Skeleton */}
          <div className="rounded-xl border border-white/10 bg-card-dark overflow-hidden">
            <div className="flex border-b border-white/10">
              <Skeleton className="w-[180px] h-12 bg-white/5" />
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 h-12 bg-white/5 border-l border-white/5" />
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex border-b border-white/5">
                <Skeleton className="w-[180px] h-24 bg-white/[0.02]" />
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="flex-1 h-24 bg-white/[0.02] border-l border-white/5" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <ScheduleHeader
          weekStatus={gridData?.week.status as 'draft' | 'published' | 'archived'}
          liveShiftsCount={liveShiftsCount}
          onCreateWeek={() => setCreateWeekOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        
        {/* Week Navigator */}
        <WeekNavigator
          weeks={weeks}
          selectedWeekId={selectedWeekId}
          onSelectWeek={setSelectedWeekId}
          isLoading={weeksLoading}
        />
        
        {/* Labor Metrics */}
        <LaborMetricsBar
          totals={gridData?.totals}
          isLoading={gridFetching && !gridData}
        />
        
        {/* Schedule Grid */}
        <ScheduleGrid
          days={days}
          members={members}
          isLoading={gridFetching && !gridData}
          onCreateShift={handleOpenCreateShift}
          onEditShift={handleOpenEditShift}
          onUnassignShift={handleUnassignShift}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
        />
      </div>
      
      {/* Create Week Sheet */}
      <CreateWeekSheet
        open={createWeekOpen}
        onClose={() => setCreateWeekOpen(false)}
        onSubmit={handleCreateWeek}
        isSubmitting={createWeekMutation.isPending}
        weekStartDay={settings?.week_start_day}
        existingWeeks={weeks}
        selectedWeekId={selectedWeekId}
      />
      
      {/* Settings Sheet */}
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSubmit={handleUpdateSettings}
        isSubmitting={updateSettingsMutation.isPending}
        isLoading={settingsLoading}
      />
      
      {/* Shift Editor Sheet */}
      <ShiftEditorSheet
        open={shiftEditorOpen}
        mode={shiftEditorMode}
        shift={editingShift}
        dayId={editingDayId ?? undefined}
        weekId={selectedWeekId}
        members={members}
        onClose={() => setShiftEditorOpen(false)}
        onSubmit={handleSaveShift}
        isSubmitting={isSavingShift}
      />
    </AppShell>
  )
}

