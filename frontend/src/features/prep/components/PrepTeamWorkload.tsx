import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { PrepDayItem } from '@/types/prep'

interface TeamMember {
  id: string
  name: string
}

interface PrepTeamWorkloadProps {
  items: PrepDayItem[]
  members: TeamMember[]
  onAssign?: (itemId: string, userId: string) => void
  className?: string
}

interface MemberWorkload {
  member: TeamMember | null
  items: PrepDayItem[]
  completed: number
  total: number
  totalToPrep: number
  estimatedMinutes: number
}

export function PrepTeamWorkload({
  items,
  members,
  // onAssign - reserved for future drag-to-assign feature
  className,
}: PrepTeamWorkloadProps) {
  const workloads = useMemo(() => {
    const memberMap = new Map<string | null, MemberWorkload>()
    
    // Initialize with all members
    members.forEach(member => {
      memberMap.set(member.id, {
        member,
        items: [],
        completed: 0,
        total: 0,
        totalToPrep: 0,
        estimatedMinutes: 0,
      })
    })
    
    // Add unassigned bucket
    memberMap.set(null, {
      member: null,
      items: [],
      completed: 0,
      total: 0,
      totalToPrep: 0,
      estimatedMinutes: 0,
    })
    
    // Distribute items
    items.forEach(item => {
      const key = item.assigned_user_id || null
      const workload = memberMap.get(key) || memberMap.get(null)!
      
      workload.items.push(item)
      workload.total++
      workload.totalToPrep += item.total_to_prep ?? Math.max(0, item.par_amount - item.on_hand_amount)
      
      if (item.completed_at) {
        workload.completed++
      }
      
      // Rough estimate: 2 min per unit to prep
      workload.estimatedMinutes += Math.ceil((item.total_to_prep ?? 0) * 0.5)
    })
    
    return Array.from(memberMap.values()).sort((a, b) => {
      // Unassigned last
      if (!a.member) return 1
      if (!b.member) return -1
      // Then by total items descending
      return b.total - a.total
    })
  }, [items, members])
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  const getProgressColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-slate-600'
    const pct = (completed / total) * 100
    if (pct === 100) return 'bg-emerald-500'
    if (pct >= 50) return 'bg-amber-500'
    return 'bg-orange-500'
  }

  return (
    <Card className={cn('bg-slate-900/80 border-white/10', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary-400" />
          Team Workload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workloads.map((workload) => {
            const isUnassigned = !workload.member
            const progress = workload.total > 0 ? (workload.completed / workload.total) * 100 : 0
            const isComplete = workload.completed === workload.total && workload.total > 0
            
            return (
              <div
                key={workload.member?.id || 'unassigned'}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  isUnassigned
                    ? 'bg-slate-800/30 border-dashed border-white/10'
                    : 'bg-slate-800/50 border-white/10 hover:border-white/20',
                  isComplete && 'border-emerald-500/30 bg-emerald-500/5'
                )}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  {isUnassigned ? (
                    <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-slate-400" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn(
                        'text-sm font-medium',
                        isComplete
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-primary-500/20 text-primary-300'
                      )}>
                        {getInitials(workload.member!.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium truncate',
                      isUnassigned ? 'text-slate-400' : 'text-white'
                    )}>
                      {isUnassigned ? 'Unassigned' : workload.member!.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {workload.total} item{workload.total !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {isComplete && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className={cn(
                      'font-medium',
                      isComplete ? 'text-emerald-400' : 'text-slate-300'
                    )}>
                      {workload.completed}/{workload.total}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-slate-700"
                    // @ts-ignore - custom indicator class
                    indicatorClassName={getProgressColor(workload.completed, workload.total)}
                  />
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="font-medium text-amber-400">{workload.totalToPrep}</span>
                    <span>to prep</span>
                  </div>
                  {workload.estimatedMinutes > 0 && !isComplete && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>~{workload.estimatedMinutes}m</span>
                    </div>
                  )}
                </div>
                
                {/* Unassigned items indicator */}
                {isUnassigned && workload.total > 0 && (
                  <Badge
                    variant="outline"
                    className="mt-3 w-full justify-center text-amber-400 border-amber-500/30 bg-amber-500/10"
                  >
                    Needs assignment
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No items to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
