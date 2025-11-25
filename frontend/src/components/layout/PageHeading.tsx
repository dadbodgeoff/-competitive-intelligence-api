import { cn } from '@/lib/utils'
import type { PropsWithChildren } from 'react'

interface PageHeadingProps {
  className?: string
}

/**
 * PageHeading - Enterprise Brand Standard
 * Uses exact 32px/38px typography from brand guidelines
 */
export function PageHeading({ children, className }: PropsWithChildren<PageHeadingProps>) {
  return (
    <h1 
      className={cn(
        'text-[32px] font-bold leading-[38px] mb-2',
        className
      )}
      style={{ color: '#E0E0E0' }}
    >
      {children}
    </h1>
  )
}


