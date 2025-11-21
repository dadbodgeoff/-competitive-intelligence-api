import { useEffect, useMemo, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeading } from '@/components/layout/PageHeading'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useSchedulingSettings,
  useSchedulingWeeks,
  useCreateSchedulingWeek,
  useSchedulerGrid,
  useCreateSchedulingShift,
  useUpdateSchedulingShift,
  useAssignSchedulingShift,
  useUnassignSchedulingShift,
  useUpdateSchedulingSettings,
} from '@/hooks/useScheduling'
import type { SchedulerMember } from '@/types/scheduling'
import { SchedulePreferencesCard } from '@/components/scheduling/SchedulePreferencesCard'
import { CreateWeekCard } from '@/components/scheduling/CreateWeekCard'
import { WeekSelectorCard } from '@/components/scheduling/WeekSelectorCard'
import { SchedulerGridView } from '@/components/scheduling/SchedulerGridView'
import { ShiftEditorDialog, ShiftFormState, defaultShiftForm } from '@/components/scheduling/ShiftEditorDialog'

const unassignedMember: SchedulerMember = {
  user_id: 'unassigned',
  role: 'Unassigned',
  status: 'active',
  auth_users: null,
  compensation: null,
}

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

export function SchedulingDashboardPage() {
  const { toast } = useToast()
  const { data: settingsData, isLoading: settingsLoading } = useSchedulingSettings()
  const updateSettingsMutation = useUpdateSchedulingSettings()
  const { data: weeksData, isLoading: weeksLoading } = useSchedulingWeeks({ includeDays: false, limit: 12 })
  const weeks = weeksData?.weeks ?? []

  const [selectedWeekId, setSelectedWeekId] = useState<string | undefined>(undefined)
  const [weekStartDay, setWeekStartDay] = useState<number | null>(null)
  const [newWeekStart, setNewWeekStart] = useState('')
  const [userChangedWeekStart, setUserChangedWeekStart] = useState(false)
  const [newWeekSales, setNewWeekSales] = useState('')
  const [newWeekNotes, setNewWeekNotes] = useState('')
  const [copyShiftsFromPrevious, setCopyShiftsFromPrevious] = useState(false)
  const [copyForecastsFromPrevious, setCopyForecastsFromPrevious] = useState(false)

  useEffect(() => {
    if (!selectedWeekId && weeks.length > 0) {
      setSelectedWeekId(weeks[0].id)
    }
  }, [weeks, selectedWeekId])

  useEffect(() => {
    if (settingsData?.settings) {
      setWeekStartDay(settingsData.settings.week_start_day)
    }
  }, [settingsData?.settings])

  useEffect(() => {
    if (weekStartDay === null) {
      return
    }
    if (userChangedWeekStart) {
      return
    }
    const today = new Date()
    const todayWeekday = (today.getDay() + 6) % 7
    const delta = (weekStartDay - todayWeekday + 7) % 7
    const initialStart = addDays(today, delta)
    const suggested = format(initialStart, 'yyyy-MM-dd')
    if (newWeekStart === suggested) {
      return
    }
    setNewWeekStart(suggested)
  }, [weekStartDay, userChangedWeekStart, newWeekStart])

  const { data: gridData, refetch: refetchGrid, isFetching: gridFetching } = useSchedulerGrid(selectedWeekId)
  const createWeekMutation = useCreateSchedulingWeek()
  const createShiftMutation = useCreateSchedulingShift()
  const updateShiftMutation = useUpdateSchedulingShift()
  const assignShiftMutation = useAssignSchedulingShift()
  const unassignShiftMutation = useUnassignSchedulingShift()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [dialogDayId, setDialogDayId] = useState<string | null>(null)
  const [dialogPreviousMember, setDialogPreviousMember] = useState<string | null>(null)
  const [formState, setFormState] = useState<ShiftFormState>(defaultShiftForm)

  const days = useMemo(() => {
    const rawDays = gridData?.week.days ?? []
    return [...rawDays].sort((a, b) => a.schedule_date.localeCompare(b.schedule_date))
  }, [gridData?.week.days])

  const members: SchedulerMember[] = useMemo(() => {
    const roster = gridData?.members ?? []
    return [unassignedMember, ...roster]
  }, [gridData?.members])

  const templateWeek = useMemo(
    () => weeks.find((week) => week.id === selectedWeekId),
    [weeks, selectedWeekId]
  )
  const copySourceLabel = templateWeek
    ? `${format(parseISO(templateWeek.week_start_date), 'MMM d')}`
    : null

  const tableSkeleton = (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48 rounded-md bg-white/10" />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-md bg-white/10" />
      ))}
    </div>
  )

  const openCreateDialog = (dayId: string, memberId: string | null) => {
    setDialogMode('create')
    setDialogDayId(dayId)
    setDialogPreviousMember(memberId)
    setFormState({ ...defaultShiftForm, assigned_member_id: memberId ?? undefined })
    setDialogOpen(true)
  }

  const selectedWeekStartDate = newWeekStart ? parseISO(newWeekStart) : null
  const selectedWeekEndDate = selectedWeekStartDate ? addDays(selectedWeekStartDate, 6) : null
  const selectedWeekday = selectedWeekStartDate ? (selectedWeekStartDate.getDay() + 6) % 7 : null
  const weekStartMismatch =
    selectedWeekday !== null && weekStartDay !== null && selectedWeekday !== weekStartDay
  const preferenceLabel = weekStartDay != null ? WEEKDAY_OPTIONS.find((option) => option.value === weekStartDay)?.label : null

  const openEditDialog = (shift: any) => {
    setDialogMode('edit')
    setDialogDayId(shift.day_id)
    setDialogPreviousMember(shift.assigned_member_id ?? null)
    setFormState({
      id: shift.id,
      start_time: shift.start_time.slice(0, 5),
      end_time: shift.end_time.slice(0, 5),
      break_minutes: String(shift.break_minutes ?? 0),
      role_label: shift.role_label ?? '',
      notes: shift.notes ?? '',
      assigned_member_id: shift.assigned_member_id ?? undefined,
    })
    setDialogOpen(true)
  }

  const handleSaveShift = async () => {
    if (!dialogDayId || !selectedWeekId) return

    const payload = {
      day_id: dialogDayId,
      week_id: selectedWeekId,
      shift_type: 'other',
      start_time: `${formState.start_time}:00`,
      end_time: `${formState.end_time}:00`,
      break_minutes: Number(formState.break_minutes || 0),
      role_label: formState.role_label || undefined,
      notes: formState.notes || undefined,
      assigned_member_id: formState.assigned_member_id || undefined,
    }

    try {
      if (dialogMode === 'create') {
        await createShiftMutation.mutateAsync(payload)
      } else if (dialogMode === 'edit' && formState.id) {
        await updateShiftMutation.mutateAsync({
          shiftId: formState.id,
          payload: {
            start_time: payload.start_time,
            end_time: payload.end_time,
            break_minutes: payload.break_minutes,
            role_label: payload.role_label,
            notes: payload.notes,
          },
        })

        const previous = dialogPreviousMember
        const next = formState.assigned_member_id ?? null

        if (previous !== next) {
          if (next) {
            await assignShiftMutation.mutateAsync({
              shiftId: formState.id,
              payload: { member_user_id: next },
            })
          } else if (previous) {
            await unassignShiftMutation.mutateAsync({ shiftId: formState.id, memberUserId: previous })
          }
        }
      }

      await refetchGrid()
      setDialogOpen(false)
      setFormState(defaultShiftForm)
    } catch (error) {
      toast({
        title: 'Unable to save shift',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  const handleUnassign = async (shiftId: string, memberId: string) => {
    try {
      await unassignShiftMutation.mutateAsync({ shiftId, memberUserId: memberId })
      await refetchGrid()
    } catch (error) {
      toast({
        title: 'Unable to unassign',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  const handleSaveSettings = async () => {
    if (weekStartDay === null) {
      toast({ title: 'Select a week start day', variant: 'destructive' })
      return
    }
    const settings = settingsData?.settings
    if (!settings) {
      toast({ title: 'Settings not loaded yet', variant: 'destructive' })
      return
    }

    try {
      await updateSettingsMutation.mutateAsync({
        week_start_day: weekStartDay,
        timezone: settings.timezone,
        auto_publish: settings.auto_publish,
        default_shift_length_minutes: settings.default_shift_length_minutes,
      })
      toast({ title: 'Schedule preferences updated' })
      setUserChangedWeekStart(false)
    } catch (error) {
      toast({
        title: 'Unable to update preferences',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  const handleCreateWeek = async () => {
    if (!newWeekStart) {
      toast({ title: 'Pick a start date', variant: 'destructive' })
      return
    }
    const canCopyFromSelected =
      Boolean(selectedWeekId) && (copyShiftsFromPrevious || copyForecastsFromPrevious)
    try {
      const response = await createWeekMutation.mutateAsync({
        week_start_date: newWeekStart,
        expected_sales_total: newWeekSales ? Number(newWeekSales) : undefined,
        notes: newWeekNotes || undefined,
        copy_from_week_id: canCopyFromSelected ? selectedWeekId : undefined,
        copy_shifts: canCopyFromSelected ? copyShiftsFromPrevious : undefined,
        copy_forecasts: canCopyFromSelected ? copyForecastsFromPrevious : undefined,
      })
      toast({ title: 'Week created', description: 'Scheduling week is ready.' })
      setNewWeekStart('')
      setNewWeekSales('')
      setNewWeekNotes('')
      setUserChangedWeekStart(false)
      setSelectedWeekId(response.week.id)
    } catch (error) {
      toast({
        title: 'Unable to create week',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  const handleWeekStartInputChange = (value: string) => {
    setNewWeekStart(value)
    setUserChangedWeekStart(true)
  }

  const handleShiftFormChange = (updates: Partial<ShiftFormState>) =>
    setFormState((prev) => ({ ...prev, ...updates }))

  const isSavingShift =
    createShiftMutation.isPending ||
    updateShiftMutation.isPending ||
    assignShiftMutation.isPending ||
    unassignShiftMutation.isPending

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <PageHeading>Weekly Scheduler</PageHeading>
            <p className="text-slate-400 max-w-3xl">
              Assign shifts by teammate and day, and track scheduled labor dollars against expected sales.
            </p>
          </div>
        </header>

        <SchedulePreferencesCard
          weekStartDay={weekStartDay}
          options={WEEKDAY_OPTIONS}
          loading={settingsLoading}
          saving={updateSettingsMutation.isPending}
          onWeekStartChange={setWeekStartDay}
          onSave={handleSaveSettings}
        />

        <CreateWeekCard
          newWeekStart={newWeekStart}
          newWeekSales={newWeekSales}
          newWeekNotes={newWeekNotes}
          onWeekStartChange={handleWeekStartInputChange}
          onSalesChange={setNewWeekSales}
          onNotesChange={setNewWeekNotes}
          onCreateWeek={handleCreateWeek}
          creating={createWeekMutation.isPending}
          selectedWeekStartDate={selectedWeekStartDate}
          selectedWeekEndDate={selectedWeekEndDate}
          weekStartMismatch={weekStartMismatch}
          preferenceLabel={preferenceLabel ?? null}
          canCopyFromWeek={Boolean(selectedWeekId)}
          copySourceLabel={copySourceLabel}
          copyShifts={copyShiftsFromPrevious}
          copyForecasts={copyForecastsFromPrevious}
          onToggleCopyShifts={(value) => setCopyShiftsFromPrevious(value)}
          onToggleCopyForecasts={(value) => setCopyForecastsFromPrevious(value)}
        />

        <WeekSelectorCard
          weeks={weeks}
          weeksLoading={weeksLoading}
          selectedWeekId={selectedWeekId}
          onSelectWeek={(value) => setSelectedWeekId(value)}
        >
          {gridFetching && !gridData ? (
            tableSkeleton
          ) : !gridData ? (
            <p className="text-sm text-slate-400">Select a week to view the scheduler grid.</p>
          ) : (
            <SchedulerGridView
              days={days}
              members={members}
              totals={gridData?.totals}
              gridFetching={gridFetching}
              onCreateShift={openCreateDialog}
              onEditShift={openEditDialog}
              onUnassignShift={handleUnassign}
            />
          )}
        </WeekSelectorCard>
      </div>

      <ShiftEditorDialog
        open={dialogOpen}
        mode={dialogMode}
        formState={formState}
        members={members}
        onChange={handleShiftFormChange}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSaveShift}
        isSubmitting={isSavingShift}
      />
    </AppShell>
  )
}

