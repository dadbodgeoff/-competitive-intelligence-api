import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
  canCopyFromWeek: boolean
  copySourceLabel: string | null
  copyShifts: boolean
  copyForecasts: boolean
  onToggleCopyShifts: (value: boolean) => void
  onToggleCopyForecasts: (value: boolean) => void
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
  canCopyFromWeek,
  copySourceLabel,
  copyShifts,
  copyForecasts,
  onToggleCopyShifts,
  onToggleCopyForecasts,
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
        <div className="md:col-span-5 rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="space-y-1">
            <Label>Reuse selected week</Label>
            <p className="text-xs text-slate-400">
              {canCopyFromWeek && copySourceLabel
                ? `Copy from ${copySourceLabel}`
                : 'Select a week to enable copying the last schedule'}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <Checkbox
                id="copy-shifts"
                checked={copyShifts}
                disabled={!canCopyFromWeek}
                onCheckedChange={(checked) => onToggleCopyShifts(Boolean(checked))}
              />
              <span>Copy shifts & assignments</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <Checkbox
                id="copy-forecast"
                checked={copyForecasts}
                disabled={!canCopyFromWeek}
                onCheckedChange={(checked) => onToggleCopyForecasts(Boolean(checked))}
              />
              <span>Copy forecasts & notes</span>
            </label>
          </div>
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

