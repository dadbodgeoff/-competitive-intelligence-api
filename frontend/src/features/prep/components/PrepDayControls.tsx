import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  ChevronDown,
  FileText,
  Lock,
  Unlock,
} from 'lucide-react'
import type { PrepDay } from '@/types/prep'

interface PrepDayControlsProps {
  day: PrepDay
  onStatusChange: (status: 'draft' | 'published') => Promise<void>
  onLockToggle: (lock: boolean) => Promise<void>
  onNotesChange: (notes: string) => Promise<void>
  isUpdating?: boolean
}

export function PrepDayControls({
  day,
  onStatusChange,
  onLockToggle,
  onNotesChange,
  isUpdating,
}: PrepDayControlsProps) {
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [notesValue, setNotesValue] = useState(day.notes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  
  const isLocked = !!day.locked_by
  const isPublished = day.status === 'published'
  
  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      await onNotesChange(notesValue)
      setShowNotesDialog(false)
    } finally {
      setIsSavingNotes(false)
    }
  }
  
  const handleStatusChange = async (newStatus: 'draft' | 'published') => {
    if (newStatus !== day.status) {
      await onStatusChange(newStatus)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date display */}
      <div className="flex items-center gap-2 text-slate-300">
        <Calendar className="h-4 w-4 text-slate-500" />
        <span className="font-medium">
          {format(parseISO(day.prep_date), 'EEEE, MMMM d, yyyy')}
        </span>
      </div>
      
      <div className="h-4 w-px bg-white/10 hidden sm:block" />
      
      {/* Status dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isUpdating || isLocked}
            className={cn(
              'h-8 gap-1.5',
              isPublished
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-amber-400 hover:text-amber-300'
            )}
          >
            <Badge
              variant="outline"
              className={cn(
                'capitalize font-medium',
                isPublished
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              )}
            >
              {day.status}
            </Badge>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => handleStatusChange('draft')}
            className={cn(day.status === 'draft' && 'bg-amber-500/10')}
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Draft</span>
            </div>
            <span className="ml-auto text-xs text-slate-500">Editable</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange('published')}
            className={cn(day.status === 'published' && 'bg-emerald-500/10')}
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Published</span>
            </div>
            <span className="ml-auto text-xs text-slate-500">Live</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Lock toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLockToggle(!isLocked)}
        disabled={isUpdating}
        className={cn(
          'h-8 gap-1.5',
          isLocked
            ? 'text-red-400 hover:text-red-300'
            : 'text-slate-400 hover:text-white'
        )}
      >
        {isLocked ? (
          <>
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Locked</span>
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            <span className="hidden sm:inline">Unlocked</span>
          </>
        )}
      </Button>
      
      {/* Notes button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setNotesValue(day.notes || '')
          setShowNotesDialog(true)
        }}
        className={cn(
          'h-8 gap-1.5',
          day.notes
            ? 'text-primary-400 hover:text-primary-300'
            : 'text-slate-400 hover:text-white'
        )}
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">
          {day.notes ? 'View Notes' : 'Add Notes'}
        </span>
      </Button>
      
      {/* Lock info */}
      {isLocked && day.locked_at && (
        <span className="text-xs text-slate-500">
          Locked {format(new Date(day.locked_at), 'MMM d, h:mm a')}
        </span>
      )}
      
      {/* Notes dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Prep Day Notes</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add notes for this prep day. These will be visible to all team members.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add notes about today's prep... (e.g., special events, inventory notes, reminders)"
            className="min-h-[150px] bg-slate-950 border-white/10 text-white placeholder:text-slate-500"
          />
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowNotesDialog(false)}
              className="text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="bg-primary-600 hover:bg-primary-500"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
