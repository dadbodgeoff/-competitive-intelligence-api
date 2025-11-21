import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeading } from '@/components/layout/PageHeading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  usePrepDays,
  usePrepDay,
  useCreatePrepDay,
  usePrepTemplates,
  useAddPrepDayItem,
  useDeletePrepDayItem,
  useAssignPrepDayItem,
  useCompletePrepDayItem,
  useReopenPrepDayItem,
  useUpdatePrepDayItem,
} from '@/hooks/usePrep'
import { fetchAccountSummary } from '@/services/api/accountApi'
import type { PrepDay, PrepDayItem } from '@/types/prep'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PrepDayDetail } from '@/components/prep/PrepDayDetail'

export function PrepDashboardPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const { toast } = useToast()

  const { data: templatesData } = usePrepTemplates()
  const { data: accountSummary } = useQuery({
    queryKey: ['account', 'summary'],
    queryFn: fetchAccountSummary,
  })

  const startRange = useMemo(() => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 7)
    return format(d, 'yyyy-MM-dd')
  }, [selectedDate])

  const endRange = useMemo(() => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 7)
    return format(d, 'yyyy-MM-dd')
  }, [selectedDate])

  const { data: prepDaysData, refetch: refetchDays } = usePrepDays({
    start: startRange,
    end: endRange,
  })

  const selectedPrepDay: PrepDay | undefined = prepDaysData?.days.find(
    (day) => day.prep_date === selectedDate
  )
  const selectedPrepDayId = selectedPrepDay?.id

  const { data: prepDayDetail, refetch: refetchDayDetail } = usePrepDay(selectedPrepDayId)

  const createPrepDayMutation = useCreatePrepDay()
  const addItemMutation = useAddPrepDayItem(selectedPrepDayId ?? '')
  const updateItemMutation = useUpdatePrepDayItem(selectedPrepDayId ?? '')
  const deleteItemMutation = useDeletePrepDayItem(selectedPrepDayId ?? '')
  const assignItemMutation = useAssignPrepDayItem(selectedPrepDayId ?? '')
  const completeItemMutation = useCompletePrepDayItem(selectedPrepDayId ?? '')
  const reopenItemMutation = useReopenPrepDayItem(selectedPrepDayId ?? '')

  useEffect(() => {
    if (!selectedTemplateId && templatesData?.templates?.length) {
      setSelectedTemplateId(templatesData.templates[0].id)
    }
  }, [templatesData?.templates, selectedTemplateId])

  const members =
    accountSummary?.members?.map((member) => {
      const first =
        member.auth_users?.first_name ??
        member.profile?.first_name ??
        (member.auth_users?.raw_user_meta_data as Record<string, unknown> | undefined)?.first_name ??
        ''
      const last =
        member.auth_users?.last_name ??
        member.profile?.last_name ??
        (member.auth_users?.raw_user_meta_data as Record<string, unknown> | undefined)?.last_name ??
        ''
      const displayName = [first, last].filter(Boolean).join(' ')
      return {
        id: member.user_id,
        name: displayName || member.auth_users?.email || member.user_id,
      }
    }) ?? []

  const handleCreateDay = async () => {
    try {
      await createPrepDayMutation.mutateAsync({
        prep_date: selectedDate,
        template_id: selectedTemplateId,
      })
      toast({ title: 'Prep list created', description: `Generated prep list for ${selectedDate}` })
      refetchDays()
    } catch (error) {
      toast({
        title: 'Failed to create prep list',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleAddItem = async (values: { name: string; par: number; onHand: number }) => {
    if (!selectedPrepDayId) return
    try {
      await addItemMutation.mutateAsync({
        name: values.name,
        par_amount: values.par,
        on_hand_amount: values.onHand,
      })
      toast({ title: 'Item added', description: `${values.name} added to prep list.` })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to add item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleParChange = async (item: PrepDayItem, newPar: number) => {
    try {
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        payload: { par_amount: newPar },
      })
    } catch (error) {
      toast({
        title: 'Failed to update par amount',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleOnHandChange = async (item: PrepDayItem, newOnHand: number) => {
    try {
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        payload: { on_hand_amount: newOnHand },
      })
    } catch (error) {
      toast({
        title: 'Failed to update on hand amount',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItemMutation.mutateAsync(itemId)
      toast({ title: 'Item removed' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to remove item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleAssign = async (itemId: string, assignedUserId: string) => {
    try {
      await assignItemMutation.mutateAsync({ itemId, assigned_user_id: assignedUserId })
      toast({ title: 'Assignment updated' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to assign item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async (itemId: string) => {
    try {
      await completeItemMutation.mutateAsync({ itemId })
      toast({ title: 'Marked complete' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to mark complete',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleReopen = async (itemId: string) => {
    try {
      await reopenItemMutation.mutateAsync(itemId)
      toast({ title: 'Reopened item' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to reopen item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const selectedDayItems = prepDayDetail?.day?.items ?? []
  const totalPar = selectedDayItems.reduce((acc, item) => acc + item.par_amount, 0)
  const totalOnHand = selectedDayItems.reduce((acc, item) => acc + item.on_hand_amount, 0)
  const totalPrep = selectedDayItems.reduce((acc, item) => acc + item.total_to_prep, 0)

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <PageHeading>Daily Prep Planner</PageHeading>
            <p className="text-slate-400">
              Build prep lists, assign items to teammates, and track tomorrow&apos;s readiness.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="prep-date" className="text-slate-300">
              Prep Date
            </Label>
            <Input
              id="prep-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="bg-obsidian border-white/10 text-white w-44"
            />
          </div>
        </header>

        <Card className="bg-card-dark border-white/10">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Templates</CardTitle>
            <div className="flex gap-3">
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="bg-obsidian border-white/10 text-white w-60">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {templatesData?.templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreateDay} disabled={createPrepDayMutation.isPending}>
                {selectedPrepDay ? 'Refresh Prep List' : 'Create Prep List'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-300">
              Prep lists generate for <strong>{format(new Date(selectedDate), 'EEEE, MMMM d')}</strong> and represent the
              work needed for tomorrow. Templates can be customized at any time.
            </p>
          </CardContent>
        </Card>

        {selectedPrepDayId ? (
          <PrepDayDetail
            day={prepDayDetail?.day}
            members={members}
            totals={{ par: totalPar, onHand: totalOnHand, prep: totalPrep }}
            onAddItem={handleAddItem}
            onParChange={handleParChange}
            onOnHandChange={handleOnHandChange}
            onDeleteItem={handleDeleteItem}
            onAssign={handleAssign}
            onComplete={handleComplete}
            onReopen={handleReopen}
          />
        ) : (
          <Card className="bg-card-dark border-white/10">
            <CardHeader>
              <CardTitle>No prep list yet</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Select a template and create a prep list to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
