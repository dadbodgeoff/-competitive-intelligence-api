import { useEffect, useMemo, useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
  useUpdatePrepDay,
} from '@/hooks/usePrep'
import { fetchAccountSummary } from '@/services/api/accountApi'
import type { PrepDay, PrepDayItem } from '@/types/prep'
import { useToast } from '@/hooks/use-toast'
import {
  PrepProgressRing,
  PrepItemCard,
  PrepQuickEntry,
  PrepDayControls,
  PrepItemEditModal,
  PrepCompletionDialog,
  PrepTeamWorkload,
} from '@/features/prep/components'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ListFilter,
  Plus,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TabValue = 'all' | 'mine' | 'completed' | 'team'

export function PrepDashboardPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [editingItem, setEditingItem] = useState<PrepDayItem | null>(null)
  const [completingItem, setCompletingItem] = useState<PrepDayItem | null>(null)
  const { toast } = useToast()

  const { data: templatesData } = usePrepTemplates()
  const { data: accountSummary } = useQuery({
    queryKey: ['account', 'summary'],
    queryFn: fetchAccountSummary,
  })

  // Get current user ID from account summary (first member is typically current user)
  const currentUserId = accountSummary?.members?.[0]?.user_id

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
  const updateDayMutation = useUpdatePrepDay()

  useEffect(() => {
    if (!selectedTemplateId && templatesData?.templates?.length) {
      setSelectedTemplateId(templatesData.templates[0].id)
    }
  }, [templatesData?.templates, selectedTemplateId])

  const members = useMemo(() => {
    return accountSummary?.members?.map((member) => {
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
  }, [accountSummary])

  // Filter items based on active tab
  const allItems = prepDayDetail?.day?.items ?? []
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'mine':
        return allItems.filter(item => item.assigned_user_id === currentUserId)
      case 'completed':
        return allItems.filter(item => !!item.completed_at)
      case 'team':
        return allItems // Team view shows all
      default:
        return allItems.filter(item => !item.completed_at) // All shows incomplete
    }
  }, [allItems, activeTab, currentUserId])

  // Stats
  const completedCount = allItems.filter(item => !!item.completed_at).length
  const totalCount = allItems.length
  const myItemsCount = allItems.filter(item => item.assigned_user_id === currentUserId).length
  const totalToPrep = allItems.reduce((acc, item) => acc + (item.total_to_prep ?? 0), 0)

  // Suggestions for quick entry
  const itemSuggestions = useMemo(() => {
    const templateItems = templatesData?.templates
      ?.flatMap(t => t.items ?? [])
      .map(i => i.name) ?? []
    return [...new Set(templateItems)]
  }, [templatesData])

  // Handlers
  const handleCreateDay = async () => {
    try {
      await createPrepDayMutation.mutateAsync({
        prep_date: selectedDate,
        template_id: selectedTemplateId,
      })
      toast({ title: 'Prep list created', description: `Generated prep list for ${format(new Date(selectedDate), 'MMMM d')}` })
      refetchDays()
    } catch (error) {
      toast({
        title: 'Failed to create prep list',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleAddItem = async (values: { name: string; par: number; onHand: number; unit?: string }) => {
    if (!selectedPrepDayId) return
    try {
      await addItemMutation.mutateAsync({
        name: values.name,
        par_amount: values.par,
        on_hand_amount: values.onHand,
        unit: values.unit,
      })
      toast({ title: 'Item added' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to add item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async (itemId: string, note?: string) => {
    try {
      await completeItemMutation.mutateAsync({ itemId, completion_note: note })
      toast({ title: 'Item completed! 🎉' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to complete item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleReopen = async (itemId: string) => {
    try {
      await reopenItemMutation.mutateAsync(itemId)
      toast({ title: 'Item reopened' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to reopen item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleAssign = async (itemId: string, userId: string) => {
    try {
      await assignItemMutation.mutateAsync({ itemId, assigned_user_id: userId })
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

  const handleDelete = async (itemId: string) => {
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

  const handleEditSave = async (updates: Record<string, unknown>) => {
    if (!editingItem) return
    try {
      await updateItemMutation.mutateAsync({
        itemId: editingItem.id,
        payload: updates as Parameters<typeof updateItemMutation.mutateAsync>[0]['payload'],
      })
      toast({ title: 'Item updated' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to update item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (status: 'draft' | 'published') => {
    if (!selectedPrepDayId) return
    try {
      await updateDayMutation.mutateAsync({
        prepDayId: selectedPrepDayId,
        payload: { status },
      })
      toast({ title: `Status changed to ${status}` })
      refetchDayDetail()
      refetchDays()
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleLockToggle = async (lock: boolean) => {
    if (!selectedPrepDayId) return
    try {
      await updateDayMutation.mutateAsync({
        prepDayId: selectedPrepDayId,
        payload: { lock },
      })
      toast({ title: lock ? 'Prep list locked' : 'Prep list unlocked' })
      refetchDayDetail()
      refetchDays()
    } catch (error) {
      toast({
        title: 'Failed to update lock status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleNotesChange = async (notes: string) => {
    if (!selectedPrepDayId) return
    try {
      await updateDayMutation.mutateAsync({
        prepDayId: selectedPrepDayId,
        payload: { notes },
      })
      toast({ title: 'Notes saved' })
      refetchDayDetail()
    } catch (error) {
      toast({
        title: 'Failed to save notes',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate)
    const newDate = direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    setSelectedDate(format(newDate, 'yyyy-MM-dd'))
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <ModulePageHeader
          icon={ClipboardList}
          title="Daily Prep"
          description="Build prep lists, assign items, and track your team's progress."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate('prev')}
                className="text-slate-400 hover:text-white h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 w-40 h-8 text-xs bg-slate-900 border-white/10 text-white"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate('next')}
                className="text-slate-400 hover:text-white h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(today)}
                className={cn(
                  'h-8 text-xs',
                  selectedDate === today && 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                )}
              >
                Today
              </Button>
            </div>
          }
        />

        {/* Day controls (if day exists) */}
        {prepDayDetail?.day && (
          <PrepDayControls
            day={prepDayDetail.day}
            onStatusChange={handleStatusChange}
            onLockToggle={handleLockToggle}
            onNotesChange={handleNotesChange}
            isUpdating={updateDayMutation.isPending}
          />
        )}

        {/* Main content */}
        {selectedPrepDayId ? (
          <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            {/* Left column - Items */}
            <div className="space-y-6">
              {/* Progress and tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <PrepProgressRing
                  completed={completedCount}
                  total={totalCount}
                  estimatedMinutes={Math.ceil(totalToPrep * 0.5)}
                  size="md"
                />
                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1">
                  <TabsList className="bg-slate-900/80 border border-white/10">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary-500/20">
                      <ListFilter className="h-4 w-4 mr-1.5" />
                      To Do
                      <Badge variant="secondary" className="ml-1.5 bg-slate-700">
                        {totalCount - completedCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="mine" className="data-[state=active]:bg-primary-500/20">
                      <User className="h-4 w-4 mr-1.5" />
                      My Tasks
                      {myItemsCount > 0 && (
                        <Badge variant="secondary" className="ml-1.5 bg-slate-700">
                          {myItemsCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-500/20">
                      Done
                      <Badge variant="secondary" className="ml-1.5 bg-emerald-500/20 text-emerald-400">
                        {completedCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-primary-500/20">
                      <Users className="h-4 w-4 mr-1.5" />
                      Team
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Team workload view */}
              {activeTab === 'team' && (
                <PrepTeamWorkload
                  items={allItems}
                  members={members}
                  onAssign={handleAssign}
                />
              )}

              {/* Quick entry */}
              {activeTab !== 'team' && activeTab !== 'completed' && (
                <PrepQuickEntry
                  onAdd={handleAddItem}
                  isLoading={addItemMutation.isPending}
                  suggestions={itemSuggestions}
                />
              )}

              {/* Items list */}
              {activeTab !== 'team' && (
                <div className="space-y-3">
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <PrepItemCard
                        key={item.id}
                        item={item}
                        members={members}
                        onComplete={(id) => {
                          const targetItem = allItems.find(i => i.id === id)
                          if (targetItem) setCompletingItem(targetItem)
                        }}
                        onReopen={handleReopen}
                        onAssign={handleAssign}
                        onDelete={handleDelete}
                        onEdit={(item) => setEditingItem(item)}
                      />
                    ))
                  ) : (
                    <Card className="bg-slate-900/50 border-white/10">
                      <CardContent className="py-12 text-center">
                        <Sparkles className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400">
                          {activeTab === 'completed'
                            ? 'No completed items yet. Get prepping!'
                            : activeTab === 'mine'
                              ? 'No items assigned to you.'
                              : 'All items completed! Great work! 🎉'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Right column - Summary */}
            <div className="space-y-4">
              <Card className="bg-slate-900/80 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total items</span>
                    <span className="text-white font-medium">{totalCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-emerald-400 font-medium">{completedCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Remaining</span>
                    <span className="text-amber-400 font-medium">{totalCount - completedCount}</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total to prep</span>
                    <span className="text-primary-400 font-bold">{totalToPrep}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Template selector for regenerating */}
              <Card className="bg-slate-900/80 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="bg-slate-950 border-white/10 text-white">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary-500/30 text-primary-400 hover:bg-primary-500/10 hover:text-primary-300"
                    onClick={handleCreateDay}
                    disabled={createPrepDayMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add from Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* No prep day - Create one */
          <Card className="bg-slate-900/80 border-white/10">
            <CardContent className="py-16 text-center">
              <ClipboardList className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No prep list for {format(new Date(selectedDate), 'MMMM d')}
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create a prep list from a template to get started. You can customize it after creation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="w-60 bg-slate-950 border-white/10 text-white">
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
                <Button
                  onClick={handleCreateDay}
                  disabled={createPrepDayMutation.isPending}
                  className="bg-primary-600 hover:bg-primary-500"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Prep List
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit modal */}
      <PrepItemEditModal
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={handleEditSave}
        mode="day"
      />

      {/* Completion dialog */}
      <PrepCompletionDialog
        open={!!completingItem}
        onOpenChange={(open) => !open && setCompletingItem(null)}
        itemName={completingItem?.name ?? ''}
        onComplete={async (note) => {
          if (completingItem) {
            await handleComplete(completingItem.id, note)
          }
        }}
      />
    </AppShell>
  )
}
