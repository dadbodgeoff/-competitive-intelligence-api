import { useEffect, useMemo, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeading } from '@/components/layout/PageHeading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShiftFormState {
  id?: string
  start_time: string
  end_time: string
  break_minutes: string
  role_label: string
  notes: string
  assigned_member_id?: string | null
}

const defaultShiftForm: ShiftFormState = {
  start_time: '09:00',
  end_time: '17:00',
  break_minutes: '0',
  role_label: '',
  notes: '',
  assigned_member_id: undefined,
}

const unassignedMember: SchedulerMember = {
  user_id: 'unassigned',
  role: 'Unassigned',
  status: 'active',
  auth_users: null,
  compensation: null,
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}

function formatCurrencyFromCents(value?: number | null) {
  return formatCurrency((value ?? 0) / 100)
}

function formatHours(minutes?: number | null) {
  const mins = minutes ?? 0
  return `${(mins / 60).toFixed(2)}h`
}

function getMemberName(member: SchedulerMember) {
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

  const [selectedWeekId, setSelectedWeekId] = useState<string | undefined>(weeks[0]?.id)
  const [weekStartDay, setWeekStartDay] = useState<number | null>(null)
  const [newWeekStart, setNewWeekStart] = useState('')
  const [userChangedWeekStart, setUserChangedWeekStart] = useState(false)
  const [newWeekSales, setNewWeekSales] = useState('')
  const [newWeekNotes, setNewWeekNotes] = useState('')

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

  const totals = gridData?.totals
  const scheduledLaborLabel = formatCurrencyFromCents(totals?.scheduled_labor_cents)
  const scheduledHoursLabel = formatHours(totals?.scheduled_minutes ?? 0)
  const actualLaborLabel = formatCurrencyFromCents(totals?.actual_cost_cents)
  const actualHoursLabel = formatHours(totals?.actual_minutes ?? 0)
  const liveLaborLabel = formatCurrencyFromCents(totals?.in_progress_cost_cents)
  const liveHoursLabel = formatHours(totals?.in_progress_minutes ?? 0)
  const forecastSalesLabel = formatCurrency(totals?.expected_sales_total ?? 0)
  const laborPercentValue =
    totals?.actual_labor_percent != null
      ? totals.actual_labor_percent
      : totals?.labor_percent != null
      ? totals.labor_percent
      : null
  const laborPercentDescriptor =
    totals?.actual_labor_percent != null ? 'Actual labor %' : 'Scheduled labor %'
  const laborPercentLabel = laborPercentValue != null ? `${laborPercentValue.toFixed(1)}%` : 'N/A'

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
      shift_type: 'scheduled',
      start_time: `${formState.start_time}:00`,
      end_time: `${formState.end_time}:00`,
      break_minutes: Number(formState.break_minutes || 0),
      role_label: formState.role_label || undefined,
      notes: formState.notes || undefined,
    }

    try {
      if (dialogMode === 'create') {
        const created = await createShiftMutation.mutateAsync(payload)
        if (formState.assigned_member_id && created.shift.id) {
          await assignShiftMutation.mutateAsync({
            shiftId: created.shift.id,
            payload: { member_user_id: formState.assigned_member_id },
          })
        }
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
    try {
      const response = await createWeekMutation.mutateAsync({
        week_start_date: newWeekStart,
        expected_sales_total: newWeekSales ? Number(newWeekSales) : undefined,
        notes: newWeekNotes || undefined,
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

  const renderShift = (shift: any) => {
    const assigned = members.find((member) => member.user_id === shift.assigned_member_id)
    const scheduledMinutes = shift.scheduled_minutes ?? 0
    const scheduledCost = shift.scheduled_cost_cents ?? 0

    return (
      <div
        key={shift.id}
        className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-100 space-y-1"
      >
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>
            {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
          </span>
          {assigned?.compensation?.rate_cents && (
            <span className="text-xs text-emerald-200">
              ${(assigned.compensation.rate_cents / 100).toFixed(2)}/h
            </span>
          )}
        </div>
        {shift.role_label && <p className="text-xs text-emerald-200">{shift.role_label}</p>}
        <div className="flex items-center justify-between text-xs text-emerald-300">
          <span>{formatHours(scheduledMinutes)}</span>
          <span>{formatCurrency((scheduledCost ?? 0) / 100)}</span>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white" onClick={() => openEditDialog(shift)}>
            Edit
          </Button>
          {shift.assigned_member_id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-200 hover:text-white"
              onClick={() => handleUnassign(shift.id, shift.assigned_member_id)}
            >
              Unassign
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderCell = (memberId: string | null, dayId: string) => {
    const shifts = (gridData?.week.days ?? [])
      .filter((day) => day.id === dayId)
      .flatMap((day) => day.shifts ?? [])
      .filter((shift) => (memberId ? shift.assigned_member_id === memberId : !shift.assigned_member_id))

    return (
      <div className="space-y-2">
        {shifts.map((shift) => renderShift(shift))}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed text-slate-300 hover:text-white"
          onClick={() => openCreateDialog(dayId, memberId)}
        >
          Add shift
        </Button>
      </div>
    )
  }

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

        <Card className="bg-card-dark border-white/10">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Schedule preferences</CardTitle>
              <p className="text-sm text-slate-400">
                Pick the day your scheduling weeks begin. When you create a new week, it will span the next six days
                starting from that date.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label htmlFor="week-start-day">Week starts on</Label>
                <select
                  id="week-start-day"
                  value={weekStartDay ?? ''}
                  onChange={(event) => {
                    const value = event.target.value
                    setWeekStartDay(value === '' ? null : Number(value))
                  }}
                  disabled={settingsLoading || updateSettingsMutation.isPending}
                  className="w-48 rounded-md border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="" disabled>
                    {settingsLoading ? 'Loading…' : 'Select a weekday'}
                  </option>
                  {WEEKDAY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="btn-primary"
                onClick={handleSaveSettings}
                disabled={settingsLoading || updateSettingsMutation.isPending || weekStartDay === null}
              >
                Save preferences
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card-dark border-white/10">
          <CardHeader>
            <CardTitle>Create new week</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2 space-y-1">
              <Label>Week start date</Label>
              <Input
                type="date"
                value={newWeekStart}
                onChange={(event) => {
                  setNewWeekStart(event.target.value)
                  setUserChangedWeekStart(true)
                }}
                className="bg-obsidian border-white/10 text-white"
              />
              {selectedWeekStartDate && selectedWeekEndDate && (
                <p className="text-xs text-slate-500">
                  Week will run {format(selectedWeekStartDate, 'EEE, MMM d')} –{' '}
                  {format(selectedWeekEndDate, 'EEE, MMM d')}
                </p>
              )}
              {weekStartMismatch && preferenceLabel && selectedWeekStartDate && (
                <p className="text-xs text-amber-400">
                  Heads up: your saved preference is {preferenceLabel}, but this week starts on{' '}
                  {format(selectedWeekStartDate, 'EEEE')}.
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Expected sales (optional)</Label>
              <Input
                type="number"
                min={0}
                value={newWeekSales}
                onChange={(event) => setNewWeekSales(event.target.value)}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label>Notes (optional)</Label>
              <Textarea
                rows={2}
                value={newWeekNotes}
                onChange={(event) => setNewWeekNotes(event.target.value)}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
            <div className="md:col-span-5 flex justify-end">
              <Button className="btn-primary" onClick={handleCreateWeek} disabled={createWeekMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Create week
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-dark border-white/10">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Select week</CardTitle>
              <p className="text-sm text-slate-400">
                Choose a weekly roster to review assignments and labor totals. Data refreshes automatically after edits.
              </p>
            </div>
            <select
              value={selectedWeekId ?? ''}
              onChange={(event) => {
                const value = event.target.value
                setSelectedWeekId(value || undefined)
              }}
              className="w-64 rounded-md border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>
                {weeksLoading ? 'Loading…' : 'Select a week…'}
              </option>
              {weeks.map((week) => (
                <option key={week.id} value={week.id}>
                  {format(parseISO(week.week_start_date), 'MMM d')} – {format(parseISO(week.week_end_date), 'MMM d, yyyy')}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
            {gridFetching && !gridData ? (
              tableSkeleton
            ) : !gridData ? (
              <p className="text-sm text-slate-400">Select a week to view the scheduler grid.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                  <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
                    Scheduled labor: {scheduledLaborLabel} • {scheduledHoursLabel}
                  </Badge>
                  <Badge variant="outline" className="border-purple-400/40 bg-purple-500/10 text-purple-100">
                    Actual labor: {actualLaborLabel} • {actualHoursLabel}
                  </Badge>
                  <Badge variant="outline" className="border-amber-400/40 bg-amber-500/10 text-amber-100">
                    Live labor: {liveLaborLabel} • {liveHoursLabel}
                  </Badge>
                  <Badge variant="outline" className="border-sky-400/40 bg-sky-500/10 text-sky-100">
                    Forecast sales: {forecastSalesLabel}
                  </Badge>
                  <Badge variant="outline" className="border-cyan-400/40 bg-cyan-500/10 text-cyan-100">
                    {laborPercentDescriptor}: {laborPercentLabel}
                  </Badge>
                </div>

                <ScrollArea className="w-full">
                  <Table className="w-full min-w-[960px] border border-white/10">
                    <TableHeader>
                      <TableRow className="bg-white/5 text-sm uppercase tracking-wide text-slate-300">
                        <TableHead className="w-64">Team member</TableHead>
                        {days.map((day) => (
                          <TableHead key={day.id} className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span>{format(parseISO(day.schedule_date), 'EEE')}</span>
                              <span className="text-xs text-slate-500">
                                {format(parseISO(day.schedule_date), 'MMM d')}
                              </span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.user_id} className="border-white/10">
                          <TableCell className="align-top">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  'h-10 w-10 rounded-full border flex items-center justify-center',
                                  member.user_id === 'unassigned'
                                    ? 'border-slate-500/50 bg-slate-500/10 text-slate-200'
                                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
                                )}
                              >
                                <Users className="h-4 w-4" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-semibold text-white">{getMemberName(member)}</div>
                                {member.compensation?.rate_cents && (
                                  <div className="text-xs text-slate-400">
                                    ${(member.compensation.rate_cents / 100).toFixed(2)} / {member.compensation.rate_type}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          {days.map((day) => (
                            <TableCell key={`${member.user_id}-${day.id}`} className="align-top">
                              {renderCell(member.user_id === 'unassigned' ? null : member.user_id, day.id)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {gridFetching && (
                  <p className="text-xs text-slate-500">Refreshing latest labor totals…</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(next) => !next && setDialogOpen(false)}>
        <DialogContent className="bg-card-dark border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Create shift' : 'Edit shift'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Start time</Label>
              <Input
                type="time"
                value={formState.start_time}
                onChange={(event) => setFormState({ ...formState, start_time: event.target.value })}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label>End time</Label>
              <Input
                type="time"
                value={formState.end_time}
                onChange={(event) => setFormState({ ...formState, end_time: event.target.value })}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label>Break minutes</Label>
              <Input
                type="number"
                min={0}
                value={formState.break_minutes}
                onChange={(event) => setFormState({ ...formState, break_minutes: event.target.value })}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label>Role label</Label>
              <Input
                placeholder="Server, bartender, expo…"
                value={formState.role_label}
                onChange={(event) => setFormState({ ...formState, role_label: event.target.value })}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label>Assign teammate</Label>
              <select
                value={formState.assigned_member_id ?? ''}
                onChange={(event) =>
                  setFormState({ ...formState, assigned_member_id: event.target.value || undefined })
                }
                className="w-full rounded-md border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Unassigned</option>
                {members
                  .filter((member) => member.user_id !== 'unassigned')
                  .map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {getMemberName(member)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={formState.notes}
                onChange={(event) => setFormState({ ...formState, notes: event.target.value })}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveShift} className="btn-primary">
              {dialogMode === 'create' ? 'Create shift' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}

