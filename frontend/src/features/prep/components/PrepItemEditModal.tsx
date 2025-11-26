import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit3, Loader2 } from 'lucide-react'
import type { PrepDayItem, PrepTemplateItem } from '@/types/prep'

const COMMON_UNITS = [
  { value: '', label: 'No unit' },
  { value: 'each', label: 'Each' },
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'cups', label: 'Cups' },
  { value: 'qt', label: 'Quarts' },
  { value: 'gal', label: 'Gallons' },
  { value: 'pans', label: 'Pans' },
  { value: 'trays', label: 'Trays' },
  { value: 'batches', label: 'Batches' },
]

interface PrepItemEditModalProps {
  item: PrepDayItem | PrepTemplateItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: {
    par_amount?: number
    on_hand_amount?: number
    default_par?: number
    default_on_hand?: number
    unit?: string | null
    notes?: string | null
    name?: string
  }) => Promise<void>
  mode: 'day' | 'template'
}

export function PrepItemEditModal({
  item,
  open,
  onOpenChange,
  onSave,
  mode,
}: PrepItemEditModalProps) {
  const [name, setName] = useState('')
  const [par, setPar] = useState('')
  const [onHand, setOnHand] = useState('')
  const [unit, setUnit] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setName(item.name || '')
      if (mode === 'day') {
        const dayItem = item as PrepDayItem
        setPar(String(dayItem.par_amount || 0))
        setOnHand(String(dayItem.on_hand_amount || 0))
        setUnit(dayItem.unit || '')
      } else {
        const templateItem = item as PrepTemplateItem
        setPar(String(templateItem.default_par || 0))
        setOnHand(String(templateItem.default_on_hand || 0))
        setUnit('')
      }
      setNotes(item.notes || '')
    }
  }, [item, mode])
  
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates: Record<string, unknown> = {}
      
      if (mode === 'day') {
        const dayItem = item as PrepDayItem
        if (Number(par) !== dayItem.par_amount) updates.par_amount = Number(par)
        if (Number(onHand) !== dayItem.on_hand_amount) updates.on_hand_amount = Number(onHand)
        if (unit !== (dayItem.unit || '')) updates.unit = unit || null
        if (notes !== (dayItem.notes || '')) updates.notes = notes || null
      } else {
        const templateItem = item as PrepTemplateItem
        if (name !== templateItem.name) updates.name = name
        if (Number(par) !== templateItem.default_par) updates.default_par = Number(par)
        if (Number(onHand) !== templateItem.default_on_hand) updates.default_on_hand = Number(onHand)
        if (notes !== (templateItem.notes || '')) updates.notes = notes || null
      }
      
      if (Object.keys(updates).length > 0) {
        await onSave(updates)
      }
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }
  
  const toPrep = Math.max(0, (Number(par) || 0) - (Number(onHand) || 0))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary-400" />
            Edit {mode === 'day' ? 'Prep' : 'Template'} Item
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {mode === 'day'
              ? 'Update the quantities and details for this prep item.'
              : 'Update the default values for this template item.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Name (only editable for template items) */}
          {mode === 'template' && (
            <div className="space-y-2">
              <Label className="text-slate-400">Item Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-white/10 text-white focus:border-primary-500/50"
              />
            </div>
          )}
          
          {mode === 'day' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
              <span className="text-white font-medium">{item?.name}</span>
            </div>
          )}
          
          {/* Par and On Hand */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">
                {mode === 'day' ? 'Par Amount' : 'Default Par'}
              </Label>
              <Input
                type="number"
                min={0}
                value={par}
                onChange={(e) => setPar(e.target.value)}
                className="bg-slate-950 border-white/10 text-white focus:border-primary-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">
                {mode === 'day' ? 'On Hand' : 'Default On Hand'}
              </Label>
              <Input
                type="number"
                min={0}
                value={onHand}
                onChange={(e) => setOnHand(e.target.value)}
                className="bg-slate-950 border-white/10 text-white focus:border-primary-500/50"
              />
            </div>
          </div>
          
          {/* To Prep calculation (day mode only) */}
          {mode === 'day' && (
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
              <span className="text-slate-400">To Prep:</span>
              <span className={cn(
                'text-xl font-bold',
                toPrep > 0 ? 'text-amber-400' : 'text-slate-500'
              )}>
                {toPrep}
              </span>
            </div>
          )}
          
          {/* Unit (day mode only) */}
          {mode === 'day' && (
            <div className="space-y-2">
              <Label className="text-slate-400">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {COMMON_UNITS.map(u => (
                    <SelectItem key={u.value} value={u.value} className="text-white">
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-400">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this item..."
              className="bg-slate-950 border-white/10 text-white placeholder:text-slate-500 min-h-[80px] focus:border-primary-500/50"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
