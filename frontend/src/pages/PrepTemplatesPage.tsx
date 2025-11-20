import { useState } from 'react'
import { format } from 'date-fns'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeading } from '@/components/layout/PageHeading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  usePrepTemplates,
  useCreatePrepTemplate,
  useDeletePrepTemplate,
  usePrepTemplate,
  useCreatePrepTemplateItem,
  useDeletePrepTemplateItem,
  useImportMenuItems,
} from '@/hooks/usePrep'
import type { PrepTemplate, PrepTemplateItem } from '@/types/prep'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export function PrepTemplatesPage() {
  const { data: templatesData, refetch: refetchTemplates } = usePrepTemplates()
  const { toast } = useToast()
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const createTemplateMutation = useCreatePrepTemplate()
  const deleteTemplateMutation = useDeletePrepTemplate()

  const templates = templatesData?.templates ?? []

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? undefined

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <PageHeading>Prep Templates</PageHeading>
            <p className="text-slate-400 max-w-2xl">
              Create default prep lists that can be cloned for any day. Templates can pull in menu items or custom prep
              tasks such as sauces, dough, or mise en place.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">New template</Button>
            </DialogTrigger>
            <DialogContent className="bg-card-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Create prep template</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={newTemplateName}
                    onChange={(event) => setNewTemplateName(event.target.value)}
                    placeholder="Nightly prep"
                    className="bg-slate-900 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={newTemplateDescription}
                    onChange={(event) => setNewTemplateDescription(event.target.value)}
                    placeholder="Describe when this prep list should be used"
                    className="bg-slate-900 border-white/10 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!newTemplateName.trim()) return
                    try {
                      const response = await createTemplateMutation.mutateAsync({
                        name: newTemplateName.trim(),
                        description: newTemplateDescription || undefined,
                      })
                      setSelectedTemplateId(response.template.id)
                      setNewTemplateName('')
                      setNewTemplateDescription('')
                      setCreateDialogOpen(false)
                      await refetchTemplates()
                      toast({ title: 'Template created' })
                    } catch (error) {
                      toast({
                        title: 'Failed to create template',
                        description: error instanceof Error ? error.message : 'Unknown error',
                        variant: 'destructive',
                      })
                    }
                  }}
                >
                  Create template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid gap-6 md:grid-cols-[320px,1fr]">
          <Card className="bg-card-dark border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScrollArea className="h-[420px] pr-2">
                <div className="space-y-2">
                  {templates.length ? (
                    templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`w-full text-left px-3 py-2 rounded-md border ${
                          selectedTemplate?.id === template.id
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                            : 'bg-slate-950/70 border-white/10 text-slate-200 hover:border-white/30'
                        }`}
                      >
                        <div className="font-semibold">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">{template.description}</div>
                        )}
                        <div className="text-[11px] text-slate-500 mt-2">
                          Updated {format(new Date(template.updated_at), 'MMM d, yyyy')}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-12">
                      No templates yet. Create your first prep template.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-card-dark border-white/10 min-h-[500px]">
            {selectedTemplate ? (
              <TemplateDetail
                template={selectedTemplate}
                onRemoved={() => {
                  deleteTemplateMutation.mutate(selectedTemplate.id, {
                    onSuccess: () => {
                      refetchTemplates()
                      toast({ title: 'Template removed' })
                    },
                    onError: (error) => {
                      toast({
                        title: 'Failed to delete template',
                        description: error instanceof Error ? error.message : 'Unknown error',
                        variant: 'destructive',
                      })
                    },
                  })
                }}
              />
            ) : (
              <CardContent className="text-center text-slate-400 py-12">
                Select a template to view or edit its items.
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

function TemplateDetail({ template, onRemoved }: { template: PrepTemplate; onRemoved: () => void }) {
  const { data: templateDetail, refetch } = usePrepTemplate(template.id)
  const { toast } = useToast()
  const [newItemName, setNewItemName] = useState('')
  const [newItemPar, setNewItemPar] = useState('0')
  const [newItemOnHand, setNewItemOnHand] = useState('0')
  const [menuImportIds, setMenuImportIds] = useState('')

  const addItemMutation = useCreatePrepTemplateItem(template.id)
  const deleteItemMutation = useDeletePrepTemplateItem(template.id)
  const importMenuItemsMutation = useImportMenuItems(template.id)

  const items: PrepTemplateItem[] = templateDetail?.template.items ?? []

  const handleAdd = async () => {
    const name = newItemName.trim()
    if (!name) return
    try {
      await addItemMutation.mutateAsync({
        name,
        default_par: Number(newItemPar) || 0,
        default_on_hand: Number(newItemOnHand) || 0,
      })
      setNewItemName('')
      setNewItemPar('0')
      setNewItemOnHand('0')
      refetch()
    } catch (error) {
      toast({
        title: 'Failed to add item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">{template.name}</CardTitle>
          {template.description && <p className="text-sm text-slate-400">{template.description}</p>}
        </div>
        <Button variant="outline" onClick={onRemoved}>
          Delete template
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-12 gap-3 items-end bg-obsidian/60 border border-white/10 p-4 rounded-lg">
          <div className="md:col-span-5 space-y-1">
            <Label>Item</Label>
            <Input
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Prep item name"
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label>Default par</Label>
            <Input
              type="number"
              min={0}
              value={newItemPar}
              onChange={(event) => setNewItemPar(event.target.value)}
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label>Default on hand</Label>
            <Input
              type="number"
              min={0}
              value={newItemOnHand}
              onChange={(event) => setNewItemOnHand(event.target.value)}
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <Button className="w-full" onClick={handleAdd}>
              Add item
            </Button>
          </div>
        </div>
        <div className="grid md:grid-cols-12 gap-3 items-end bg-slate-950/60 border border-white/10 p-4 rounded-lg">
          <div className="md:col-span-9 space-y-1">
            <Label>Import menu item IDs</Label>
            <Input
              value={menuImportIds}
              onChange={(event) => setMenuImportIds(event.target.value)}
              placeholder="Comma separated menu item IDs"
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                const ids = menuImportIds
                  .split(',')
                  .map((id) => id.trim())
                  .filter(Boolean)
                if (!ids.length) {
                  toast({
                    title: 'No IDs provided',
                    description: 'Enter one or more menu item IDs separated by commas.',
                    variant: 'destructive',
                  })
                  return
                }
                try {
                  await importMenuItemsMutation.mutateAsync(ids)
                  toast({ title: 'Menu items imported', description: `${ids.length} items added.` })
                  setMenuImportIds('')
                  refetch()
                } catch (error) {
                  toast({
                    title: 'Failed to import menu items',
                    description: error instanceof Error ? error.message : 'Unknown error',
                    variant: 'destructive',
                  })
                }
              }}
            >
              Import menu items
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-300">Item</TableHead>
              <TableHead className="text-slate-300 text-right">Default par</TableHead>
              <TableHead className="text-slate-300 text-right">Default on hand</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-white">{item.name}</TableCell>
                  <TableCell className="text-right text-slate-300">
                    {item.default_par.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    {item.default_on_hand.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await deleteItemMutation.mutateAsync(item.id)
                          refetch()
                        } catch (error) {
                          toast({
                            title: 'Failed to remove item',
                            description: error instanceof Error ? error.message : 'Unknown error',
                            variant: 'destructive',
                          })
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                  No items yet. Add an item to this template.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </>
  )
}

