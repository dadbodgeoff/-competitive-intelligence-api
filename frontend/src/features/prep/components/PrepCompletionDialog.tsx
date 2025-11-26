import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react'

interface PrepCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  onComplete: (note?: string) => Promise<void>
}

export function PrepCompletionDialog({
  open,
  onOpenChange,
  itemName,
  onComplete,
}: PrepCompletionDialogProps) {
  const [note, setNote] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await onComplete(note.trim() || undefined)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setNote('')
        onOpenChange(false)
      }, 1000)
    } finally {
      setIsCompleting(false)
    }
  }
  
  const handleQuickComplete = async () => {
    setIsCompleting(true)
    try {
      await onComplete()
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 800)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10">
        {showSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center animate-in zoom-in-50 duration-300">
            <div className="relative">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <PartyPopper className="h-6 w-6 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <p className="mt-4 text-lg font-medium text-white">Item Complete!</p>
            <p className="text-slate-400 text-sm">Great work! 🎉</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Complete Item
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Mark <span className="text-white font-medium">"{itemName}"</span> as complete.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Completion Note (optional)</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any notes about this prep item... (e.g., actual quantity made, issues encountered)"
                  className="bg-slate-950 border-white/10 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-slate-400"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleQuickComplete}
                disabled={isCompleting}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                Quick Complete
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete with Note
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
