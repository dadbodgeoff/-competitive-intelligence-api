import * as React from 'react';
import { cn } from '@/lib/utils';

interface ListContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between items */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /** Dividers between items */
  divided?: boolean;
  /** Stagger animation on mount */
  animated?: boolean;
}

const ListContainer = React.forwardRef<HTMLDivElement, ListContainerProps>(
  ({ className, gap = 'sm', divided = false, animated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          // Gap
          gap === 'none' && 'gap-0',
          gap === 'sm' && 'gap-2',
          gap === 'md' && 'gap-3',
          gap === 'lg' && 'gap-4',
          // Dividers
          divided && 'divide-y divide-white/[0.06]',
          // Animation
          animated && 'stagger-fade-in',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ListContainer.displayName = 'ListContainer';

// Empty state component for lists
interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-6 text-center',
          'rounded-lg border border-dashed border-white/[0.08]',
          'bg-white/[0.02]',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4 text-slate-500">
            {icon}
          </div>
        )}
        <h3 className="text-base font-medium text-slate-300 mb-1">{title}</h3>
        {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { ListContainer, EmptyState };
export type { ListContainerProps, EmptyStateProps };
