import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface SaveComparisonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: { report_name: string; notes: string }
  onChange: (updates: Partial<{ report_name: string; notes: string }>) => void
  defaultReportName: string
  onSave: () => void
  isSaving: boolean
}

export function SaveComparisonDialog({
  open,
  onOpenChange,
  form,
  onChange,
  defaultReportName,
  onSave,
  isSaving,
}: SaveComparisonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card-dark border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Save Competitor Analysis</DialogTitle>
          <DialogDescription className="text-slate-400">
            Save this comparison to your account for future reference
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-200 mb-2 block">Report Name</label>
            <Input
              value={form.report_name}
              onChange={(e) => onChange({ report_name: e.target.value })}
              placeholder={defaultReportName}
              className="bg-obsidian/50 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200 mb-2 block">Notes (Optional)</label>
            <Textarea
              value={form.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Add any notes about this analysis..."
              className="bg-obsidian/50 border-white/10 text-white"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 text-slate-300 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="bg-primary-500 hover:bg-primary-500">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Analysis
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

