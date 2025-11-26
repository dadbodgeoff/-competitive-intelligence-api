/**
 * ScheduleHeader Component
 * Modern page header with title, actions, and status indicators
 */

import { Calendar, Settings, Download, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ScheduleHeaderProps {
  weekStatus?: 'draft' | 'published' | 'archived'
  liveShiftsCount?: number
  onCreateWeek: () => void
  onOpenSettings: () => void
  onExport?: (format: 'pdf' | 'csv') => void
}

export function ScheduleHeader({
  weekStatus = 'draft',
  liveShiftsCount = 0,
  onCreateWeek,
  onOpenSettings,
  onExport,
}: ScheduleHeaderProps) {
  const statusConfig = {
    draft: { label: 'Draft', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    published: { label: 'Published', className: 'bg-success-500/20 text-success-400 border-success-500/30' },
    archived: { label: 'Archived', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  }

  const status = statusConfig[weekStatus]

  return (
    <ModulePageHeader
      icon={Calendar}
      title="Team Schedule"
      description="Plan shifts, track labor costs, and manage your team's time"
      badge={
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      }
      statusIndicators={
        liveShiftsCount > 0 ? (
          <Badge variant="outline" className="bg-primary-500/20 text-primary-400 border-primary-500/30 animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            {liveShiftsCount} Active {liveShiftsCount === 1 ? 'Shift' : 'Shifts'}
          </Badge>
        ) : undefined
      }
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 h-8 text-xs"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </Button>

          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 h-8 text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card-dark border-white/10">
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button onClick={onCreateWeek} className="bg-primary-500 hover:bg-primary-600 text-white h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Week
          </Button>
        </>
      }
    />
  )
}
