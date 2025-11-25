import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title: string;
  /** Optional description/subtitle */
  description?: string;
  /** Optional badge/tag element */
  badge?: React.ReactNode;
  /** Optional icon on the left */
  icon?: React.ReactNode;
  /** Optional right-side content (actions, metadata) */
  trailing?: React.ReactNode;
  /** Show chevron arrow on hover */
  showArrow?: boolean;
  /** Selected/active state */
  isSelected?: boolean;
  /** Clickable card */
  onClick?: () => void;
  /** Compact variant for denser lists */
  variant?: 'default' | 'compact';
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  (
    {
      className,
      title,
      description,
      badge,
      icon,
      trailing,
      showArrow = true,
      isSelected = false,
      onClick,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const isClickable = !!onClick;

    const cardContent = (
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={cn(
              'flex-shrink-0 flex items-center justify-center',
              'w-10 h-10 rounded-lg',
              'bg-white/[0.04] text-slate-400',
              'group-hover:bg-white/[0.06] group-hover:text-slate-300',
              'transition-colors duration-200',
              isSelected && 'bg-primary-500/10 text-primary-400'
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3
              className={cn(
                'font-medium text-white truncate',
                variant === 'compact' ? 'text-sm' : 'text-base'
              )}
            >
              {title}
            </h3>
            {badge}
          </div>
          {description && (
            <p
              className={cn(
                'text-slate-400 truncate',
                variant === 'compact' ? 'text-xs' : 'text-sm'
              )}
            >
              {description}
            </p>
          )}
        </div>

        {trailing && <div className="flex-shrink-0">{trailing}</div>}

        {showArrow && isClickable && (
          <ChevronRight
            className={cn(
              'w-5 h-5 text-slate-600 flex-shrink-0',
              'opacity-0 -translate-x-1',
              'group-hover:opacity-100 group-hover:translate-x-0',
              'transition-all duration-200'
            )}
          />
        )}
      </div>
    );

    const sharedClassName = cn(
      'group relative w-full text-left',
      'rounded-lg border transition-all duration-200',
      variant === 'compact' ? 'px-4 py-3' : 'px-5 py-4',
      'bg-card border-white/[0.06]',
      isClickable && [
        'hover:bg-white/[0.03] hover:border-white/[0.12]',
        'hover:shadow-lg hover:shadow-black/20',
      ],
      isSelected && [
        'border-primary-500/50 bg-primary-500/[0.08]',
        'shadow-md shadow-primary-500/10',
      ],
      isClickable && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      className
    );

    if (isClickable) {
      return (
        <button type="button" onClick={onClick} className={sharedClassName}>
          {cardContent}
        </button>
      );
    }

    return (
      <div ref={ref} className={sharedClassName} {...props}>
        {cardContent}
      </div>
    );
  }
);

ContentCard.displayName = 'ContentCard';

export { ContentCard };
export type { ContentCardProps };
