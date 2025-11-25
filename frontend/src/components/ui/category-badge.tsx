import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const categoryBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/[0.06] text-slate-300 border border-white/[0.08]',
        primary: 'bg-primary-500/15 text-primary-400 border border-primary-500/25',
        accent: 'bg-accent-500/15 text-accent-400 border border-accent-500/25',
        success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
        danger: 'bg-red-500/15 text-red-400 border border-red-500/25',
        // Semantic colors for specific use cases
        pizza: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
        cafe: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
        bar: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
        social: 'bg-pink-500/15 text-pink-400 border border-pink-500/25',
        delivery: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
        event: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
        hiring: 'bg-teal-500/15 text-teal-400 border border-teal-500/25',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CategoryBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof categoryBadgeVariants> {
  /** Optional icon before the label */
  icon?: React.ReactNode;
  /** Optional count to display */
  count?: number;
}

const CategoryBadge = React.forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ className, variant, size, icon, count, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(categoryBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon}
        {children}
        {count !== undefined && (
          <span className="ml-1 opacity-70">{count}</span>
        )}
      </span>
    );
  }
);

CategoryBadge.displayName = 'CategoryBadge';

// Helper to auto-detect variant from category name
function getCategoryVariant(category: string): CategoryBadgeProps['variant'] {
  const lower = category.toLowerCase();
  if (lower.includes('pizza') || lower.includes('italian')) return 'pizza';
  if (lower.includes('cafe') || lower.includes('coffee')) return 'cafe';
  if (lower.includes('bar') || lower.includes('grill') || lower.includes('pub')) return 'bar';
  if (lower.includes('instagram') || lower.includes('social')) return 'social';
  if (lower.includes('delivery') || lower.includes('app')) return 'delivery';
  if (lower.includes('event') || lower.includes('promo')) return 'event';
  if (lower.includes('hiring') || lower.includes('job')) return 'hiring';
  return 'default';
}

export { CategoryBadge, categoryBadgeVariants, getCategoryVariant };
