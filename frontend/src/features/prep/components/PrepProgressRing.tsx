import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react'

interface PrepProgressRingProps {
  completed: number
  total: number
  estimatedMinutes?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showCelebration?: boolean
}

export function PrepProgressRing({
  completed,
  total,
  estimatedMinutes,
  className,
  size = 'md',
  showCelebration = true,
}: PrepProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const isComplete = completed === total && total > 0
  
  // Animate progress on mount and changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])
  
  // Celebration effect when 100% complete
  useEffect(() => {
    if (isComplete && showCelebration) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, showCelebration])
  
  const sizes = {
    sm: { ring: 80, stroke: 6, text: 'text-lg', subtext: 'text-xs' },
    md: { ring: 120, stroke: 8, text: 'text-2xl', subtext: 'text-sm' },
    lg: { ring: 160, stroke: 10, text: 'text-4xl', subtext: 'text-base' },
  }
  
  const { ring, stroke, text, subtext } = sizes[size]
  const radius = (ring - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedProgress / 100) * circumference
  
  // Color based on progress
  const getProgressColor = () => {
    if (isComplete) return 'stroke-emerald-500'
    if (percentage >= 75) return 'stroke-emerald-400'
    if (percentage >= 50) return 'stroke-amber-400'
    if (percentage >= 25) return 'stroke-orange-400'
    return 'stroke-red-400'
  }
  
  const getBackgroundGlow = () => {
    if (isComplete) return 'drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]'
    if (percentage >= 75) return 'drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'
    return ''
  }

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${50 + (Math.random() - 0.5) * 60}%`,
                top: '50%',
                backgroundColor: ['#C9A87C', '#E5D4C0', '#A8B1B9', '#8B7355'][i % 4],
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* SVG Ring */}
      <div className={cn('relative', getBackgroundGlow())}>
        <svg width={ring} height={ring} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-700/50"
          />
          {/* Progress circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className={cn(getProgressColor(), 'transition-all duration-1000 ease-out')}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <CheckCircle2 className={cn('text-emerald-500 animate-bounce-once', size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6')} />
          ) : (
            <span className={cn('font-bold text-white', text)}>{animatedProgress}%</span>
          )}
        </div>
      </div>
      
      {/* Stats below ring */}
      <div className="mt-3 text-center">
        <p className={cn('text-slate-300', subtext)}>
          <span className="text-white font-semibold">{completed}</span> of{' '}
          <span className="text-white font-semibold">{total}</span> items
        </p>
        
        {estimatedMinutes !== undefined && estimatedMinutes > 0 && !isComplete && (
          <p className={cn('text-slate-400 flex items-center justify-center gap-1 mt-1', subtext)}>
            <Clock className="h-3 w-3" />
            ~{estimatedMinutes} min remaining
          </p>
        )}
        
        {isComplete && (
          <p className={cn('text-emerald-400 flex items-center justify-center gap-1 mt-1 font-medium', subtext)}>
            <TrendingUp className="h-3 w-3" />
            All done!
          </p>
        )}
      </div>
    </div>
  )
}
