import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  usePrepTemplates,
  useCreatePrepTemplate,
  useUpdatePrepTemplate,
  useDeletePrepTemplate,
  usePrepTemplate,
  useCreatePrepTemplateItem,
  useUpdatePrepTemplateItem,
  useDeletePrepTemplateItem,
  useImportMenuItems,
} from '@/hooks/usePrep'
import type { PrepTemplate, PrepTemplateItem } from '@/types/prep'
import { useToast } from '@/hooks/use-toast'
import { PrepItemEditModal } from '@/features/prep/components'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import {
  ClipboardList,
  Copy,
  Edit3,
  GripVertical,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  ChefHat,
  FileText,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  item_name: string
  category?: string
  price?: number
}

export function PrepTemplatesPage() {
  const { data: templatesData, isLoading: templatesLoading, refetch: refetchTemplates } = usePrepTemplates()
  const { toast } = useToast()
  
  // Create template state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  
  // Edit template state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PrepTemplate | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  
  // Selected template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')

  const createTemplateMutation = useCreatePrepTemplate()
  const updateTemplateMutation = useUpdatePrepTemplate()
  const deleteTemplateMutation = useDeletePrepTemplate()

  const templates = templatesData?.templates ?? []
  
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates
    const query = searchQuery.toLowerCase()
    return templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    )
  }, [templates, searchQuery])

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) ?? templates[0]

  const handleCreateTemplate = async () => {
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
      toast({ title: 'Template created', description: 'Start adding items to your new template.' })
    } catch (error) {
      toast({
        title: 'Failed to create template',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleEditTemplate = (template: PrepTemplate) => {
    setEditingTemplate(template)
    setEditName(template.name)
    setEditDescription(template.description || '')
    setEditDialogOpen(true)
  }

  const handleSaveTemplateEdit = async () => {
    if (!editingTemplate || !editName.trim()) return
    try {
      await updateTemplateMutation.mutateAsync({
        templateId: editingTemplate.id,
        payload: {
          name: editName.trim(),
          description: editDescription || null,
        },
      })
      setEditDialogOpen(false)
      setEditingTemplate(null)
      await refetchTemplates()
      toast({ title: 'Template updated' })
    } catch (error) {
      toast({
        title: 'Failed to update template',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(templateId)
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(undefined)
      }
      await refetchTemplates()
      toast({ title: 'Template deleted' })
    } catch (error) {
      toast({
        title: 'Failed to delete template',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleDuplicateTemplate = async (template: PrepTemplate) => {
    try {
      const response = await createTemplateMutation.mutateAsync({
        name: `${template.name} (Copy)`,
        description: template.description || undefined,
      })
      setSelectedTemplateId(response.template.id)
      await refetchTemplates()
      toast({ title: 'Template duplicated', description: 'Add items to your new template.' })
    } catch (error) {
      toast({
        title: 'Failed to duplicate template',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <ModulePageHeader
          icon={ClipboardList}
          title="Prep Templates"
          description="Create reusable prep list templates to quickly generate daily prep lists for your team."
          actions={
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary-500 hover:bg-primary-600 text-white h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  New Template
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-400" />
                  Create Prep Template
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Give your template a clear name so your team knows when to use it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-400">Template Name</Label>
                  <Input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Nightly Prep, Weekend Brunch"
                    className="bg-slate-950 border-white/10 text-white placeholder:text-slate-400/50 focus:border-primary-500/50 focus:ring-amber-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Description (optional)</Label>
                  <Textarea
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Describe when this template should be used..."
                    className="bg-slate-950 border-white/10 text-white placeholder:text-slate-400/50 focus:border-primary-500/50 focus:ring-amber-500/20 min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCreateDialogOpen(false)} className="text-slate-400">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={!newTemplateName.trim() || createTemplateMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  {createTemplateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          }
        />

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
          {/* Template list */}
          <Card className="bg-slate-900 border-white/10 rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-400/50 focus:border-primary-500/50"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                <div className="p-3 space-y-2">
                  {templatesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                        <Skeleton className="h-5 w-3/4 mb-2 bg-white/5" />
                        <Skeleton className="h-3 w-1/2 bg-white/5" />
                      </div>
                    ))
                  ) : filteredTemplates.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                      {filteredTemplates.map((template) => (
                        <motion.div
                          key={template.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={cn(
                            'group relative p-4 rounded-xl border cursor-pointer transition-all duration-200',
                            selectedTemplate?.id === template.id
                              ? 'bg-primary-500/10 border-primary-500/30 shadow-lg shadow-primary-500/5'
                              : 'bg-slate-950/50 border-white/5 hover:border-white/20 hover:bg-slate-950'
                          )}
                          onClick={() => setSelectedTemplateId(template.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <FileText className={cn(
                                  'h-4 w-4 flex-shrink-0',
                                  selectedTemplate?.id === template.id ? 'text-primary-400' : 'text-slate-400'
                                )} />
                                <h3 className="font-medium text-white truncate">{template.name}</h3>
                              </div>
                              {template.description && (
                                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 pl-6">
                                  {template.description}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400/60 mt-2 pl-6">
                                Updated {format(new Date(template.updated_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                <DropdownMenuItem onClick={() => handleEditTemplate(template)} className="text-white">
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)} className="text-white">
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="text-[#B75553] focus:text-[#B75553] focus:bg-[#B75553]/10"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
                        <ClipboardList className="h-6 w-6 text-primary-400" />
                      </div>
                      <p className="text-slate-400 text-sm">
                        {searchQuery ? 'No templates match your search.' : 'No templates yet.'}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCreateDialogOpen(true)}
                          className="mt-2 text-primary-400 hover:text-primary-300"
                        >
                          Create your first template
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Template detail */}
          {selectedTemplate ? (
            <TemplateDetail
              template={selectedTemplate}
              onEdit={() => handleEditTemplate(selectedTemplate)}
            />
          ) : (
            <Card className="bg-slate-900 border-white/10 rounded-xl">
              <CardContent className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-slate-400/50" />
                </div>
                <p className="text-slate-400">Select a template to view its items</p>
                <p className="text-slate-400/60 text-sm mt-1">Or create a new one to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit template dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary-400" />
              Edit Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Template Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-950 border-white/10 text-white focus:border-primary-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-slate-950 border-white/10 text-white focus:border-primary-500/50 min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplateEdit}
              disabled={!editName.trim() || updateTemplateMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              {updateTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}


// Template detail component with modern 2025 UX
function TemplateDetail({
  template,
  onEdit,
}: {
  template: PrepTemplate
  onEdit: () => void
}) {
  const { data: templateDetail, refetch, isLoading: detailLoading } = usePrepTemplate(template.id)
  const { toast } = useToast()
  
  const [newItemName, setNewItemName] = useState('')
  const [newItemPar, setNewItemPar] = useState('')
  const [newItemOnHand, setNewItemOnHand] = useState('')
  const [editingItem, setEditingItem] = useState<PrepTemplateItem | null>(null)
  const [menuSearchOpen, setMenuSearchOpen] = useState(false)
  const [menuSearchQuery, setMenuSearchQuery] = useState('')

  const addItemMutation = useCreatePrepTemplateItem(template.id)
  const updateItemMutation = useUpdatePrepTemplateItem(template.id)
  const deleteItemMutation = useDeletePrepTemplateItem(template.id)
  const importMenuItemsMutation = useImportMenuItems(template.id)

  const items: PrepTemplateItem[] = templateDetail?.template.items ?? []
  const existingMenuItemIds = items.map(i => i.menu_item_id).filter(Boolean) as string[]

  // Fetch menu items for search
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu-items-for-prep-import'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ success: boolean; menu: any; categories: any[] }>('/api/v1/menu/current')
        if (!response.data.success || !response.data.categories) {
          return []
        }
        // Flatten all items from categories
        const allItems: MenuItem[] = []
        response.data.categories.forEach((cat: any) => {
          if (cat.items && Array.isArray(cat.items)) {
            cat.items.forEach((item: any) => {
              allItems.push({
                id: item.id,
                item_name: item.item_name || item.name,
                category: cat.name,
                price: item.prices?.[0]?.price,
              })
            })
          }
        })
        return allItems
      } catch {
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const menuItems = menuData || []

  // Filter menu items based on search
  const filteredMenuItems = useMemo(() => {
    if (!menuSearchQuery.trim()) return menuItems.slice(0, 10)
    const query = menuSearchQuery.toLowerCase()
    return menuItems
      .filter(item => 
        item.item_name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
      .slice(0, 15)
  }, [menuItems, menuSearchQuery])

  const handleAddItem = async () => {
    const name = newItemName.trim()
    if (!name) return
    try {
      await addItemMutation.mutateAsync({
        name,
        default_par: Number(newItemPar) || 0,
        default_on_hand: Number(newItemOnHand) || 0,
      })
      setNewItemName('')
      setNewItemPar('')
      setNewItemOnHand('')
      refetch()
      toast({ title: 'Item added' })
    } catch (error) {
      toast({
        title: 'Failed to add item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItemMutation.mutateAsync(itemId)
      refetch()
      toast({ title: 'Item removed' })
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
      refetch()
      toast({ title: 'Item updated' })
    } catch (error) {
      toast({
        title: 'Failed to update item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleImportMenuItem = async (menuItem: MenuItem) => {
    if (existingMenuItemIds.includes(menuItem.id)) {
      toast({ title: 'Already added', description: 'This item is already in the template.' })
      return
    }
    try {
      await importMenuItemsMutation.mutateAsync([menuItem.id])
      refetch()
      setMenuSearchOpen(false)
      setMenuSearchQuery('')
      toast({ title: 'Item imported', description: `${menuItem.item_name} added to template.` })
    } catch (error) {
      toast({
        title: 'Failed to import item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="bg-slate-900 border-white/10 rounded-xl overflow-hidden">
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <FileText className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  {template.name}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onEdit} 
                    className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                {template.description && (
                  <p className="text-sm text-slate-400 mt-1">{template.description}</p>
                )}
              </div>
            </div>
          </div>
          <Badge className="bg-slate-950 text-slate-400 border-white/10">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Quick add form */}
        <div className="p-4 bg-slate-950 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-white">Quick Add Item</span>
          </div>
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12 sm:col-span-5">
              <Label className="text-slate-400 text-xs mb-1.5 block">Item Name</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter prep item name"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-400/50 focus:border-primary-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <div className="col-span-5 sm:col-span-2">
              <Label className="text-slate-400 text-xs mb-1.5 block">Default Par</Label>
              <Input
                type="number"
                min={0}
                value={newItemPar}
                onChange={(e) => setNewItemPar(e.target.value)}
                placeholder="0"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-400/50 focus:border-primary-500/50"
              />
            </div>
            <div className="col-span-5 sm:col-span-2">
              <Label className="text-slate-400 text-xs mb-1.5 block">On Hand</Label>
              <Input
                type="number"
                min={0}
                value={newItemOnHand}
                onChange={(e) => setNewItemOnHand(e.target.value)}
                placeholder="0"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-400/50 focus:border-primary-500/50"
              />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <Button
                onClick={handleAddItem}
                disabled={!newItemName.trim() || addItemMutation.isPending}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
              >
                {addItemMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Import from menu - Modern search-based approach */}
        <div className="relative">
          <Popover open={menuSearchOpen} onOpenChange={setMenuSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-dashed border-white/20 text-slate-400 hover:text-white hover:border-primary-500/30 hover:bg-primary-500/5 h-12 justify-start"
              >
                <ChefHat className="h-4 w-4 mr-2 text-primary-400" />
                <span>Search menu items to import...</span>
                {menuLoading && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[400px] p-0 bg-slate-900 border-white/10 rounded-xl shadow-2xl" 
              align="start"
              sideOffset={8}
            >
              <Command className="bg-transparent">
                <div className="flex items-center border-b border-white/10 px-3">
                  <Search className="h-4 w-4 text-slate-400 mr-2" />
                  <CommandInput
                    placeholder="Search your menu items..."
                    value={menuSearchQuery}
                    onValueChange={setMenuSearchQuery}
                    className="h-12 border-0 bg-transparent text-white placeholder:text-slate-400/50 focus:ring-0"
                  />
                </div>
                <CommandList className="max-h-[300px] overflow-auto">
                  {menuLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Loading menu items...</p>
                    </div>
                  ) : menuItems.length === 0 ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="h-6 w-6 text-slate-400/50 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No menu items found</p>
                      <p className="text-xs text-slate-400/60 mt-1">Upload a menu first to import items</p>
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <CommandEmpty className="py-8 text-center text-slate-400">
                      No items match "{menuSearchQuery}"
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredMenuItems.map((item) => {
                        const isExisting = existingMenuItemIds.includes(item.id)
                        return (
                          <CommandItem
                            key={item.id}
                            value={item.item_name}
                            onSelect={() => !isExisting && handleImportMenuItem(item)}
                            disabled={isExisting}
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg mx-1 my-0.5',
                              isExisting 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-primary-500/10 data-[selected]:bg-primary-500/10'
                            )}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                              isExisting ? 'bg-slate-500/20' : 'bg-primary-500/10'
                            )}>
                              {isExisting ? (
                                <Check className="h-4 w-4 text-slate-400" />
                              ) : (
                                <Package className="h-4 w-4 text-primary-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm font-medium truncate',
                                isExisting ? 'text-slate-400' : 'text-white'
                              )}>
                                {item.item_name}
                              </p>
                              <p className="text-xs text-slate-400/60 truncate">
                                {item.category}
                                {item.price && ` • $${item.price.toFixed(2)}`}
                              </p>
                            </div>
                            {isExisting && (
                              <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-500/30 bg-slate-500/10">
                                Added
                              </Badge>
                            )}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Items list */}
        <div className="space-y-2">
          {detailLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 bg-white/5" />
                  <Skeleton className="h-5 w-1/3 bg-white/5" />
                  <div className="flex-1" />
                  <Skeleton className="h-4 w-20 bg-white/5" />
                </div>
              </div>
            ))
          ) : items.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className="group flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <GripVertical className="h-4 w-4 text-slate-400/40 cursor-grab flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-slate-400/60 truncate mt-0.5">{item.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400/60 uppercase tracking-wide">Par</p>
                      <p className="text-white font-medium">{item.default_par}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400/60 uppercase tracking-wide">On Hand</p>
                      <p className="text-white font-medium">{item.default_on_hand}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-[#B75553] hover:bg-[#B75553]/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-7 w-7 text-slate-400/40" />
              </div>
              <p className="text-slate-400">No items in this template yet</p>
              <p className="text-slate-400/60 text-sm mt-1">
                Add items manually or search your menu to import
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit item modal */}
      <PrepItemEditModal
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={handleEditSave}
        mode="template"
      />
    </Card>
  )
}
