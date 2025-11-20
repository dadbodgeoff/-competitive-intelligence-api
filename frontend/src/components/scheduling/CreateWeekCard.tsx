import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

interface CreateWeekCardProps {
  newWeekStart: string
  newWeekSales: string
  newWeekNotes: string
  onWeekStartChange: (value: string) => void
  onSalesChange: (value: string) => void
  onNotesChange: (value: string) => void
  onCreateWeek: () => void
  creating: boolean
  selectedWeekStartDate: Date | null
  selectedWeekEndDate: Date | null
  weekStartMismatch: boolean
  preferenceLabel: string | null
}

export function CreateWeekCard({
  newWeekStart,
  newWeekSales,
  newWeekNotes,
  onWeekStartChange,
  onSalesChange,
  onNotesChange,
  onCreateWeek,
  creating,
  selectedWeekStartDate,
  selectedWeekEndDate,
  weekStartMismatch,
  preferenceLabel,
}: CreateWeekCardProps) {
  return (
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
            onChange={(event) => onWeekStartChange(event.target.value)}
            className="bg-obsidian border-white/10 text-white"
          />
          {selectedWeekStartDate && selectedWeekEndDate && (
            <p className="text-xs text-slate-500">
              Week will run {format(selectedWeekStartDate, 'EEE, MMM d')} – {format(selectedWeekEndDate, 'EEE, MMM d')}
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
            onChange={(event) => onSalesChange(event.target.value)}
            className="bg-obsidian border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label>Notes (optional)</Label>
          <Textarea
            rows={2}
            value={newWeekNotes}
            onChange={(event) => onNotesChange(event.target.value)}
            className="bg-obsidian border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-5 flex justify-end">
          <Button className="btn-primary" onClick={onCreateWeek} disabled={creating}>
            <Plus className="h-4 w-4 mr-2" />
            Create week
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

