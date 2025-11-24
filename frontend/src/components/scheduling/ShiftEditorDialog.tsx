import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SchedulerMember } from '@/types/scheduling'
import { getMemberName } from './utils'

export interface ShiftFormState {
  id?: string
  start_time: string
  end_time: string
  break_minutes: string
  role_label: string
  notes: string
  assigned_member_id?: string | null
}

export const defaultShiftForm: ShiftFormState = {
  start_time: '09:00',
  end_time: '17:00',
  break_minutes: '0',
  role_label: '',
  notes: '',
  assigned_member_id: undefined,
}

interface ShiftEditorDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formState: ShiftFormState
  members: SchedulerMember[]
  onChange: (updates: Partial<ShiftFormState>) => void
  onClose: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function ShiftEditorDialog({
  open,
  mode,
  formState,
  members,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
}: ShiftEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="bg-card-dark border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create shift' : 'Edit shift'}</DialogTitle>
          <DialogDescription>
            Set the shift window, optional break, and assign a teammate. Fields marked optional can be left blank.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Start time</Label>
            <Input
              type="time"
              value={formState.start_time}
              onChange={(event) => onChange({ start_time: event.target.value })}
              className="bg-obsidian border-white/10 text-white"
            />
          </div>
          <div className="space-y-1">
            <Label>End time</Label>
            <Input
              type="time"
              value={formState.end_time}
              onChange={(event) => onChange({ end_time: event.target.value })}
              className="bg-obsidian border-white/10 text-white"
            />
          </div>
          <div className="space-y-1">
            <Label>Break minutes</Label>
            <Input
              type="number"
              min={0}
              value={formState.break_minutes}
              onChange={(event) => onChange({ break_minutes: event.target.value })}
              className="bg-obsidian border-white/10 text-white"
            />
          </div>
          <div className="space-y-1">
            <Label>Role label</Label>
            <Input
              placeholder="Server, bartender, expo…"
              value={formState.role_label}
              onChange={(event) => onChange({ role_label: event.target.value })}
              className="bg-obsidian border-white/10 text-white"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label>Assign teammate</Label>
            <select
              value={formState.assigned_member_id ?? ''}
              onChange={(event) => onChange({ assigned_member_id: event.target.value || undefined })}
              className="w-full rounded-md border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Unassigned</option>
              {members
                .filter((member) => member.user_id !== 'unassigned')
                .map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {getMemberName(member)}
                  </option>
                ))}
            </select>
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={formState.notes}
              onChange={(event) => onChange({ notes: event.target.value })}
              className="bg-obsidian border-white/10 text-white"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="btn-primary" disabled={isSubmitting}>
            {mode === 'create' ? 'Create shift' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

