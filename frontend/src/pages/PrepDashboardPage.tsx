import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeading } from '@/components/layout/PageHeading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Textarea } from '@/components/ui/textarea'

function formatNumber(value?: number | null) {
  if (value == null) return '0'
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value)
}

function calculateTotal(parAmount: number, onHandAmount: number) {
  const diff = parAmount - onHandAmount
  return diff > 0 ? diff : 0
}

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

function PrepDayDetail({
  day,
  members,
  totals,
  onAddItem,
  onParChange,
  onOnHandChange,
  onDeleteItem,
  onAssign,
  onComplete,
  onReopen,
}: {
  day?: PrepDay
  members: Array<{ id: string; name: string }>
  totals: { par: number; onHand: number; prep: number }
  onAddItem: (values: { name: string; par: number; onHand: number }) => void | Promise<void>
  onParChange: (item: PrepDayItem, newPar: number) => void
  onOnHandChange: (item: PrepDayItem, newOnHand: number) => void
  onDeleteItem: (itemId: string) => void
  onAssign: (itemId: string, assignedUserId: string) => void
  onComplete: (itemId: string) => void
  onReopen: (itemId: string) => void
}) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemPar, setNewItemPar] = useState('0')
  const [newItemOnHand, setNewItemOnHand] = useState('0')

  const handleAdd = async () => {
    const name = newItemName.trim()
    if (!name) return
    const par = Number(newItemPar) || 0
    const onHand = Number(newItemOnHand) || 0
    await onAddItem({ name, par, onHand })
    setNewItemName('')
    setNewItemPar('0')
    setNewItemOnHand('0')
  }

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-white">
              Prep list for {day ? format(parseISO(day.prep_date), 'EEEE, MMMM d') : 'Loading...'}
            </CardTitle>
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={day?.status === 'published' ? 'default' : 'outline'} className="capitalize">
                {day?.status ?? 'draft'}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-slate-200 flex gap-4">
            <span>Par: {formatNumber(totals.par)}</span>
            <span>On hand: {formatNumber(totals.onHand)}</span>
            <span>
              Total to prep:{' '}
              <span className="text-emerald-300 font-semibold">{formatNumber(totals.prep)}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-12 gap-3 items-end bg-obsidian/60 border border-white/10 p-4 rounded-lg">
          <div className="md:col-span-5 space-y-1">
            <Label className="text-slate-300">Item name</Label>
            <Input
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="E.g., 10oz dough balls"
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label className="text-slate-300">Par</Label>
            <Input
              type="number"
              min={0}
              value={newItemPar}
              onChange={(event) => setNewItemPar(event.target.value)}
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label className="text-slate-300">On hand</Label>
            <Input
              type="number"
              min={0}
              value={newItemOnHand}
              onChange={(event) => setNewItemOnHand(event.target.value)}
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <Button className="w-full" onClick={handleAdd}>
              Add item
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {day?.items?.length ? (
            <Accordion type="multiple" className="space-y-3">
              {day.items.map((item) => (
                <AccordionItem value={item.id} key={item.id} className="border border-white/10 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 bg-slate-900/70 text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3">
                      <div>
                        <p className="text-white font-semibold">{item.name}</p>
                        {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <span>Par: {formatNumber(item.par_amount)}</span>
                        <span>On hand: {formatNumber(item.on_hand_amount)}</span>
                        <span className="text-emerald-300 font-semibold">
                          To prep: {formatNumber(item.total_to_prep)}
                        </span>
                        {item.assigned_user_id ? (
                          <Badge className="bg-cyan-500/15 text-cyan-200 border-cyan-400/30">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unassigned</Badge>
                        )}
                        {item.completed_at && (
                          <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-400/30">Complete</Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-slate-950/70">
                    <ItemDetail
                      item={item}
                      members={members}
                      onParChange={onParChange}
                      onOnHandChange={onOnHandChange}
                      onDeleteItem={onDeleteItem}
                      onAssign={onAssign}
                      onComplete={onComplete}
                      onReopen={onReopen}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">
              No items yet. Add an item or generate from a template.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ItemDetail({
  item,
  members,
  onParChange,
  onOnHandChange,
  onDeleteItem,
  onAssign,
  onComplete,
  onReopen,
}: {
  item: PrepDayItem
  members: Array<{ id: string; name: string }>
  onParChange: (item: PrepDayItem, newPar: number) => void
  onOnHandChange: (item: PrepDayItem, newOnHand: number) => void
  onDeleteItem: (itemId: string) => void
  onAssign: (itemId: string, assignedUserId: string) => void
  onComplete: (itemId: string) => void
  onReopen: (itemId: string) => void
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="grid md:grid-cols-12 gap-3">
        <div className="md:col-span-3 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">Par amount</Label>
          <Input
            type="number"
            min={0}
            value={item.par_amount}
            onChange={(event) => onParChange(item, Number(event.target.value))}
            className="bg-slate-900 border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">On hand</Label>
          <Input
            type="number"
            min={0}
            value={item.on_hand_amount}
            onChange={(event) => onOnHandChange(item, Number(event.target.value))}
            className="bg-slate-900 border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">Total to prep</Label>
          <Input
            value={formatNumber(calculateTotal(item.par_amount, item.on_hand_amount))}
            readOnly
            className="bg-slate-900 border-white/10 text-emerald-200 font-semibold"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">Assign</Label>
          <Select
            value={item.assigned_user_id ?? ''}
            onValueChange={(value) => onAssign(item.id, value)}
          >
            <SelectTrigger className="bg-slate-900 border-white/10 text-white">
              <SelectValue placeholder="Assign teammate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-6 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">Notes</Label>
          <Textarea value={item.notes ?? ''} readOnly className="bg-slate-900 border-white/10 text-white" />
        </div>
        <div className="md:col-span-6 flex gap-2 justify-end">
          {item.completed_at ? (
            <Button variant="secondary" onClick={() => onReopen(item.id)}>
              Reopen
            </Button>
          ) : (
            <Button variant="default" onClick={() => onComplete(item.id)}>
              Mark complete
            </Button>
          )}
          <Button variant="destructive" onClick={() => onDeleteItem(item.id)}>
            Remove
          </Button>
        </div>
      </div>
      {item.completed_at && (
        <div className="text-xs text-emerald-300">
          Completed at {format(new Date(item.completed_at), 'PPpp')}
          {item.completion_note && <span className="block text-slate-300 mt-1">{item.completion_note}</span>}
        </div>
      )}
    </div>
  )
}

