import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Check,
  GripVertical,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  User,
  Edit3,
} from 'lucide-react'
import type { PrepDayItem } from '@/types/prep'

interface PrepItemCardProps {
  item: PrepDayItem
  members: Array<{ id: string; name: string }>
  onComplete: (itemId: string) => void
  onReopen: (itemId: string) => void
  onAssign: (itemId: string, userId: string) => void
  onDelete: (itemId: string) => void
  onEdit: (item: PrepDayItem) => void
  onParChange?: (item: PrepDayItem, newPar: number) => void
  onOnHandChange?: (item: PrepDayItem, newOnHand: number) => void
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}

export function PrepItemCard({
  item,
  members,
  onComplete,
  onReopen,
  onAssign,
  onDelete,
  onEdit,
  isDragging,
  dragHandleProps,
}: PrepItemCardProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const isCompleted = !!item.completed_at
  const toPrep = item.total_to_prep ?? Math.max(0, item.par_amount - item.on_hand_amount)
  const assignedMember = members.find(m => m.id === item.assigned_user_id)
  
  // Swipe handlers for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCompleted) return
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || isCompleted) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    // Limit swipe distance
    const clampedDiff = Math.max(-100, Math.min(100, diff))
    setSwipeX(clampedDiff)
  }
  
  const handleTouchEnd = () => {
    if (!isSwiping) return
    setIsSwiping(false)
    
    // Swipe right to complete
    if (swipeX > 60) {
      onComplete(item.id)
    }
    // Swipe left to assign (show menu)
    // For now just reset
    
    setSwipeX(0)
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  const getPriorityColor = () => {
    if (toPrep > 30) return 'border-l-red-500'
    if (toPrep > 15) return 'border-l-amber-500'
    return 'border-l-emerald-500'
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe background indicators */}
      <div className="absolute inset-0 flex">
        <div className={cn(
          'flex-1 flex items-center justify-start pl-4 bg-emerald-600 transition-opacity',
          swipeX > 30 ? 'opacity-100' : 'opacity-0'
        )}>
          <Check className="h-6 w-6 text-white" />
          <span className="ml-2 text-white font-medium">Complete</span>
        </div>
        <div className={cn(
          'flex-1 flex items-center justify-end pr-4 bg-primary-600 transition-opacity',
          swipeX < -30 ? 'opacity-100' : 'opacity-0'
        )}>
          <span className="mr-2 text-white font-medium">Assign</span>
          <User className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {/* Main card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeX}px)` }}
        className={cn(
          'relative bg-slate-900/80 border border-white/10 rounded-lg p-4 transition-all',
          'border-l-4',
          getPriorityColor(),
          isCompleted && 'opacity-60 bg-slate-900/40',
          isDragging && 'shadow-2xl scale-[1.02] border-primary-500/50',
          !isSwiping && 'transition-transform duration-200'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 mt-1"
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}
          
          {/* Completion checkbox */}
          <button
            onClick={() => isCompleted ? onReopen(item.id) : onComplete(item.id)}
            className={cn(
              'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5',
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-500 hover:border-emerald-400 hover:bg-emerald-500/10'
            )}
          >
            {isCompleted && <Check className="h-4 w-4" />}
          </button>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-semibold text-white truncate',
                  isCompleted && 'line-through text-slate-400'
                )}>
                  {item.name}
                </h3>
                {item.notes && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.notes}</p>
                )}
              </div>
              
              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit item
                  </DropdownMenuItem>
                  {isCompleted ? (
                    <DropdownMenuItem onClick={() => onReopen(item.id)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reopen
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onComplete(item.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark complete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(item.id)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Par:</span>
                <span className="text-slate-300 font-medium">{item.par_amount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">On hand:</span>
                <span className="text-slate-300 font-medium">{item.on_hand_amount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">To prep:</span>
                <span className={cn(
                  'font-bold',
                  toPrep > 20 ? 'text-amber-400' : 'text-emerald-400'
                )}>
                  {toPrep}
                </span>
                {item.unit && <span className="text-slate-500">{item.unit}</span>}
              </div>
            </div>
            
            {/* Assignment & status row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {assignedMember ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary-500/20 text-primary-300 text-xs">
                        {getInitials(assignedMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-300">{assignedMember.name}</span>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-slate-400 hover:text-white">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        Assign
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {members.map(member => (
                        <DropdownMenuItem
                          key={member.id}
                          onClick={() => onAssign(item.id, member.id)}
                        >
                          <Avatar className="h-5 w-5 mr-2">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          {member.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {isCompleted && item.completed_at && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
