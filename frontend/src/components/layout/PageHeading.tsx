import { cn } from '@/lib/utils'
import type { PropsWithChildren } from 'react'

interface PageHeadingProps {
  className?: string
}

export function PageHeading({ children, className }: PropsWithChildren<PageHeadingProps>) {
  return (
    <h1 className={cn('text-3xl md:text-4xl font-bold text-white mb-2', className)}>
      {children}
    </h1>
  )
}


