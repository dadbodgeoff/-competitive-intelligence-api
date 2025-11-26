/**
 * CreateWeekSheet Component
 * Modern side sheet for creating new scheduling weeks
 */

import { useState, useEffect } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { Calendar, Copy, DollarSign, FileText, Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { SchedulingWeek } from '@/types/scheduling'

interface CreateWeekSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateWeekData) => Promise<void>
  isSubmitting?: boolean
  weekStartDay?: number
  existingWeeks?: SchedulingWeek[]
  selectedWeekId?: string
}

export interface CreateWeekData {
  week_start_date: string
  expected_sales_total?: number
  notes?: string
  copy_from_week_id?: string
  copy_shifts?: boolean
  copy_forecasts?: boolean
}

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function CreateWeekSheet({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  weekStartDay = 0,
  existingWeeks = [],
  selectedWeekId,
}: CreateWeekSheetProps) {
  const [weekStart, setWeekStart] = useState('')
  const [expectedSales, setExpectedSales] = useState('')
  const [notes, setNotes] = useState('')
  const [copyShifts, setCopyShifts] = useState(false)
  const [copyForecasts, setCopyForecasts] = useState(false)

  // Calculate suggested start date based on week start day preference
  useEffect(() => {
    if (!open) return
    
    const today = new Date()
    const todayWeekday = (today.getDay() + 6) % 7 // Convert to Monday=0
    const delta = (weekStartDay - todayWeekday + 7) % 7
    const suggestedStart = addDays(today, delta === 0 ? 7 : delta)
    setWeekStart(format(suggestedStart, 'yyyy-MM-dd'))
  }, [open, weekStartDay])

  const handleSubmit = async () => {
    const data: CreateWeekData = {
      week_start_date: weekStart,
      expected_sales_total: expectedSales ? Number(expectedSales) : undefined,
      notes: notes || undefined,
    }

    if (selectedWeekId && (copyShifts || copyForecasts)) {
      data.copy_from_week_id = selectedWeekId
      data.copy_shifts = copyShifts
      data.copy_forecasts = copyForecasts
    }

    await onSubmit(data)
    
    // Reset form
    setExpectedSales('')
    setNotes('')
    setCopyShifts(false)
    setCopyForecasts(false)
  }

  const selectedWeekStartDate = weekStart ? parseISO(weekStart) : null
  const selectedWeekEndDate = selectedWeekStartDate ? addDays(selectedWeekStartDate, 6) : null
  const selectedWeekday = selectedWeekStartDate ? (selectedWeekStartDate.getDay() + 6) % 7 : null
  const weekStartMismatch = selectedWeekday !== null && selectedWeekday !== weekStartDay

  const copySourceWeek = existingWeeks.find((w) => w.id === selectedWeekId)
  const copySourceLabel = copySourceWeek
    ? `${format(parseISO(copySourceWeek.week_start_date), 'MMM d')} - ${format(parseISO(copySourceWeek.week_end_date), 'MMM d')}`
    : null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="bg-card-dark border-white/10 w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-primary-400" />
            Create New Week
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Set up a new scheduling week for your team. You can optionally copy shifts from a previous week.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Week Start Date */}
          <div className="space-y-2">
            <Label className="text-slate-300">Week Start Date</Label>
            <Input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="bg-obsidian border-white/10 text-white"
            />
            {selectedWeekStartDate && selectedWeekEndDate && (
              <p className="text-xs text-slate-500">
                Week: {format(selectedWeekStartDate, 'EEE, MMM d')} – {format(selectedWeekEndDate, 'EEE, MMM d, yyyy')}
              </p>
            )}
            {weekStartMismatch && (
              <p className="text-xs text-amber-400">
                ⚠️ Your preference is {WEEKDAY_NAMES[weekStartDay]}, but this starts on {selectedWeekStartDate && format(selectedWeekStartDate, 'EEEE')}
              </p>
            )}
          </div>

          {/* Expected Sales */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              Expected Sales (optional)
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g., 50000"
              value={expectedSales}
              onChange={(e) => setExpectedSales(e.target.value)}
              className="bg-obsidian border-white/10 text-white"
            />
            <p className="text-xs text-slate-500">
              Used to calculate labor percentage targets
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              Notes (optional)
            </Label>
            <Textarea
              rows={3}
              placeholder="Any special events, holidays, or notes for this week..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-obsidian border-white/10 text-white resize-none"
            />
          </div>

          {/* Copy from previous week */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-primary-400" />
              <Label className="text-slate-300 font-medium">Copy from Previous Week</Label>
            </div>
            
            {selectedWeekId && copySourceLabel ? (
              <>
                <p className="text-xs text-slate-400">
                  Copy data from: <span className="text-white">{copySourceLabel}</span>
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={copyShifts}
                      onCheckedChange={(checked) => setCopyShifts(Boolean(checked))}
                    />
                    <div>
                      <span className="text-sm text-slate-200">Copy shifts & assignments</span>
                      <p className="text-xs text-slate-500">Duplicate all shifts with their assigned team members</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={copyForecasts}
                      onCheckedChange={(checked) => setCopyForecasts(Boolean(checked))}
                    />
                    <div>
                      <span className="text-sm text-slate-200">Copy forecasts & notes</span>
                      <p className="text-xs text-slate-500">Duplicate daily sales forecasts and notes</p>
                    </div>
                  </label>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Select a week in the schedule to enable copying
              </p>
            )}
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!weekStart || isSubmitting}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Week'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
