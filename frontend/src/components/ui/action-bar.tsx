import * as React from 'react';
import { cn } from '@/lib/utils';

interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left side content (usually tabs or filters) */
  left?: React.ReactNode;
  /** Right side content (usually action buttons) */
  right?: React.ReactNode;
  /** Sticky positioning */
  sticky?: boolean;
}

const ActionBar = React.forwardRef<HTMLDivElement, ActionBarProps>(
  ({ className, left, right, sticky = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-center justify-between gap-4',
          'py-3 px-1',
          sticky && [
            'sticky top-0 z-10',
            'bg-background/80 backdrop-blur-md',
            '-mx-1 px-1',
          ],
          className
        )}
        {...props}
      >
        {left && <div className="flex items-center gap-3">{left}</div>}
        {children}
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    );
  }
);

ActionBar.displayName = 'ActionBar';

export { ActionBar };
export type { ActionBarProps };
