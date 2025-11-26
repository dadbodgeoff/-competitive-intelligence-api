/**
 * ShiftEditorSheet Component
 * Modern side sheet for creating/editing shifts
 */

import { useState, useEffect } from 'react'
import { Clock, User, Coffee, FileText, Save, Trash2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import type { SchedulerMember, SchedulingShift } from '@/types/scheduling'

interface ShiftEditorSheetProps {
  open: boolean
  mode: 'create' | 'edit'
  shift?: SchedulingShift | null
  dayId?: string
  weekId?: string
  members: SchedulerMember[]
  onClose: () => void
  onSubmit: (data: ShiftFormData) => Promise<void>
  onDelete?: () => Promise<void>
  isSubmitting?: boolean
}

export interface ShiftFormData {
  id?: string
  day_id: string
  week_id: string
  shift_type: string
  start_time: string
  end_time: string
  break_minutes: number
  role_label?: string
  notes?: string
  assigned_member_id?: string
}

const SHIFT_TYPES = [
  { value: 'front_of_house', label: 'Front of House', color: 'bg-primary-500/20 text-primary-400' },
  { value: 'back_of_house', label: 'Back of House', color: 'bg-accent-500/20 text-accent-400' },
  { value: 'management', label: 'Management', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'other', label: 'Other', color: 'bg-slate-500/20 text-slate-400' },
]

const COMMON_ROLES = [
  'Server', 'Bartender', 'Host', 'Busser', 'Food Runner',
  'Line Cook', 'Prep Cook', 'Dishwasher', 'Expo',
  'Manager', 'Supervisor', 'Shift Lead'
]

function getMemberName(member: SchedulerMember): string {
  if (member.user_id === 'unassigned') return 'Unassigned'
  
  const meta = member.auth_users?.raw_user_meta_data as Record<string, unknown> | undefined
  const first = member.auth_users?.first_name ?? member.profile?.first_name ?? (meta?.first_name as string)
  const last = member.auth_users?.last_name ?? member.profile?.last_name ?? (meta?.last_name as string)
  
  if (first || last) return [first, last].filter(Boolean).join(' ')
  if (member.auth_users?.email) return member.auth_users.email.split('@')[0]
  return 'Team Member'
}

export function ShiftEditorSheet({
  open,
  mode,
  shift,
  dayId,
  weekId,
  members,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting,
}: ShiftEditorSheetProps) {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [breakMinutes, setBreakMinutes] = useState('0')
  const [shiftType, setShiftType] = useState('other')
  const [roleLabel, setRoleLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [assignedMemberId, setAssignedMemberId] = useState<string>('')

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && shift) {
      setStartTime(shift.start_time.slice(0, 5))
      setEndTime(shift.end_time.slice(0, 5))
      setBreakMinutes(String(shift.break_minutes ?? 0))
      setShiftType(shift.shift_type)
      setRoleLabel(shift.role_label ?? '')
      setNotes(shift.notes ?? '')
      setAssignedMemberId(shift.assigned_member_id ?? '')
    } else {
      // Reset for create mode
      setStartTime('09:00')
      setEndTime('17:00')
      setBreakMinutes('0')
      setShiftType('other')
      setRoleLabel('')
      setNotes('')
      setAssignedMemberId('')
    }
  }, [mode, shift, open])

  const handleSubmit = async () => {
    if (!dayId || !weekId) return

    const data: ShiftFormData = {
      id: shift?.id,
      day_id: dayId,
      week_id: weekId,
      shift_type: shiftType,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      break_minutes: Number(breakMinutes) || 0,
      role_label: roleLabel || undefined,
      notes: notes || undefined,
      assigned_member_id: assignedMemberId || undefined,
    }

    await onSubmit(data)
  }

  // Calculate shift duration
  const calculateDuration = () => {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const totalMinutes = endMinutes - startMinutes - (Number(breakMinutes) || 0)
    if (totalMinutes <= 0) return null
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
  }

  const duration = calculateDuration()

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="bg-card-dark border-white/10 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5 text-primary-400" />
            {mode === 'create' ? 'Create Shift' : 'Edit Shift'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {mode === 'create'
              ? 'Add a new shift to the schedule'
              : 'Update shift details and assignment'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-obsidian border-white/10 text-white"
              />
            </div>
          </div>
          
          {duration && (
            <p className="text-sm text-slate-400">
              Duration: <span className="text-white font-medium">{duration}</span>
            </p>
          )}

          {/* Break Minutes */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Coffee className="h-4 w-4 text-slate-500" />
              Break (minutes)
            </Label>
            <Input
              type="number"
              min={0}
              max={120}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              className="bg-obsidian border-white/10 text-white w-32"
            />
          </div>

          {/* Shift Type */}
          <div className="space-y-2">
            <Label className="text-slate-300">Shift Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {SHIFT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setShiftType(type.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    shiftType === type.value
                      ? `${type.color} border-current`
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Label */}
          <div className="space-y-2">
            <Label className="text-slate-300">Role Label</Label>
            <Input
              placeholder="e.g., Server, Line Cook, Manager"
              value={roleLabel}
              onChange={(e) => setRoleLabel(e.target.value)}
              className="bg-obsidian border-white/10 text-white"
              list="common-roles"
            />
            <datalist id="common-roles">
              {COMMON_ROLES.map((role) => (
                <option key={role} value={role} />
              ))}
            </datalist>
          </div>

          {/* Assign Member */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Assign Team Member
            </Label>
            <select
              value={assignedMemberId}
              onChange={(e) => setAssignedMemberId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="">Unassigned</option>
              {members
                .filter((m) => m.user_id !== 'unassigned')
                .map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {getMemberName(member)}
                    {member.compensation?.rate_cents && (
                      ` ($${(member.compensation.rate_cents / 100).toFixed(2)}/hr)`
                    )}
                  </option>
                ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              Notes (optional)
            </Label>
            <Textarea
              rows={3}
              placeholder="Any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-obsidian border-white/10 text-white resize-none"
            />
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          {mode === 'edit' && onDelete && (
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={isSubmitting}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Shift' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
