import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const TabGroup = TabsPrimitive.Root;

const TabGroupList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    /** Visual style variant */
    variant?: 'pills' | 'underline' | 'boxed';
  }
>(({ className, variant = 'pills', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1',
      variant === 'pills' && [
        'p-1 rounded-lg',
        'bg-white/[0.04] border border-white/[0.06]',
      ],
      variant === 'underline' && [
        'border-b border-white/[0.08]',
        'gap-0',
      ],
      variant === 'boxed' && [
        'p-1.5 rounded-xl',
        'bg-obsidian-400/50 border border-white/[0.08]',
      ],
      className
    )}
    {...props}
  />
));
TabGroupList.displayName = 'TabGroupList';

interface TabGroupTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Optional count badge */
  count?: number;
  /** Optional icon */
  icon?: React.ReactNode;
}

const TabGroupTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabGroupTriggerProps
>(({ className, count, icon, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      'inline-flex items-center justify-center gap-2',
      'px-4 py-2 rounded-md',
      'text-sm font-medium',
      'transition-all duration-200',
      // Default state
      'text-slate-400',
      'hover:text-slate-200 hover:bg-white/[0.04]',
      // Active state
      'data-[state=active]:bg-primary-500/15',
      'data-[state=active]:text-primary-400',
      'data-[state=active]:shadow-sm',
      // Focus state
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      // Disabled state
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    {icon}
    {children}
    {count !== undefined && (
      <span
        className={cn(
          'ml-1 px-1.5 py-0.5 rounded text-xs font-medium',
          'bg-white/[0.08] text-slate-400',
          'group-data-[state=active]:bg-primary-500/20 group-data-[state=active]:text-primary-300'
        )}
      >
        {count}
      </span>
    )}
  </TabsPrimitive.Trigger>
));
TabGroupTrigger.displayName = 'TabGroupTrigger';

const TabGroupContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4',
      'focus:outline-none',
      'data-[state=inactive]:hidden',
      // Animation
      'data-[state=active]:animate-fade-in',
      className
    )}
    {...props}
  />
));
TabGroupContent.displayName = 'TabGroupContent';

export { TabGroup, TabGroupList, TabGroupTrigger, TabGroupContent };
