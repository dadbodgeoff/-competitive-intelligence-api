import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action buttons on the right */
  actions?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, actions, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          size === 'sm' && 'mb-3',
          size === 'md' && 'mb-4',
          size === 'lg' && 'mb-6',
          className
        )}
        {...props}
      >
        <div className="min-w-0">
          <h2
            className={cn(
              'font-semibold text-white',
              size === 'sm' && 'text-base',
              size === 'md' && 'text-lg',
              size === 'lg' && 'text-xl'
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                'text-slate-400 mt-1',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-sm'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };
export type { SectionHeaderProps };
