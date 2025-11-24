import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PrepDay, PrepDayItem } from '@/types/prep'

const formatNumber = (value?: number | null) => {
  if (value == null) return '0'
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value)
}

const calculateTotal = (parAmount: number, onHandAmount: number) => {
  const diff = parAmount - onHandAmount
  return diff > 0 ? diff : 0
}

export interface PrepDayDetailProps {
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
}

export function PrepDayDetail({
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
}: PrepDayDetailProps) {
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
              <span className="text-primary-300 font-semibold">{formatNumber(totals.prep)}</span>
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
              className="bg-obsidian border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label className="text-slate-300">Par</Label>
            <Input
              type="number"
              min={0}
              value={newItemPar}
              onChange={(event) => setNewItemPar(event.target.value)}
              className="bg-obsidian border-white/10 text-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label className="text-slate-300">On hand</Label>
            <Input
              type="number"
              min={0}
              value={newItemOnHand}
              onChange={(event) => setNewItemOnHand(event.target.value)}
              className="bg-obsidian border-white/10 text-white"
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
                  <AccordionTrigger className="px-4 bg-obsidian/70 text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3">
                      <div>
                        <p className="text-white font-semibold">{item.name}</p>
                        {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <span>Par: {formatNumber(item.par_amount)}</span>
                        <span>On hand: {formatNumber(item.on_hand_amount)}</span>
                        <span className="text-primary-300 font-semibold">
                          To prep: {formatNumber(item.total_to_prep)}
                        </span>
                        {item.assigned_user_id ? (
                          <Badge className="bg-accent-500/15 text-accent-200 border-accent-400/30">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unassigned</Badge>
                        )}
                        {item.completed_at && (
                          <Badge className="bg-primary-500/15 text-primary-200 border-primary-400/30">Complete</Badge>
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
            className="bg-obsidian border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">On hand</Label>
          <Input
            type="number"
            min={0}
            value={item.on_hand_amount}
            onChange={(event) => onOnHandChange(item, Number(event.target.value))}
            className="bg-obsidian border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">Total to prep</Label>
          <Input
            value={formatNumber(calculateTotal(item.par_amount, item.on_hand_amount))}
            readOnly
            className="bg-obsidian border-white/10 text-primary-200 font-semibold"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <Label className="text-slate-300 text-xs uppercase">Assign</Label>
          <Select value={item.assigned_user_id ?? ''} onValueChange={(value) => onAssign(item.id, value)}>
            <SelectTrigger className="bg-obsidian border-white/10 text-white">
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
          <Textarea value={item.notes ?? ''} readOnly className="bg-obsidian border-white/10 text-white" />
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
        <div className="text-xs text-primary-300">
          Completed at {format(new Date(item.completed_at), 'PPpp')}
          {item.completion_note && <span className="block text-slate-300 mt-1">{item.completion_note}</span>}
        </div>
      )}
    </div>
  )
}

