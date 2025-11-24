import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconVariant = 
  | 'default' 
  | 'primary' 
  | 'accent' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'muted'
  | 'inherit';

interface IconProps extends Omit<LucideProps, 'size' | 'ref'> {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  animate?: 'spin' | 'pulse' | 'bounce' | 'none';
}

const sizeMap: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

const variantMap: Record<IconVariant, string> = {
  default: 'text-slate-400',
  primary: 'text-primary-500',
  accent: 'text-accent-500',
  success: 'text-success-500',
  warning: 'text-primary-600',
  error: 'text-red-500',
  muted: 'text-slate-500',
  inherit: '',
};

const animationMap = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  none: '',
};

/**
 * Icon component - Branded wrapper for Lucide React icons
 * 
 * @example
 * ```tsx
 * <Icon icon={Sparkles} size="md" variant="primary" />
 * <Icon icon={Loader2} size="lg" animate="spin" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  variant = 'default',
  className,
  animate = 'none',
  strokeWidth = 2,
  ...props
}) => {
  return (
    <IconComponent
      className={cn(
        sizeMap[size],
        variantMap[variant],
        animationMap[animate],
        'flex-shrink-0',
        className
      )}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

/**
 * IconButton - Icon wrapped in a button with proper touch targets
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  label: string; // For accessibility
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'default',
  label,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-lg',
        'transition-all duration-200',
        'hover:bg-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'touch-target-sm',
        className
      )}
      {...props}
    >
      <Icon icon={icon} size={size} variant={variant} />
    </button>
  );
};

/**
 * IconWithBadge - Icon with a notification badge
 */
interface IconWithBadgeProps {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  badgeCount?: number;
  showBadge?: boolean;
  className?: string;
}

export const IconWithBadge: React.FC<IconWithBadgeProps> = ({
  icon,
  size = 'md',
  variant = 'default',
  badgeCount,
  showBadge = false,
  className,
}) => {
  return (
    <div className={cn('relative inline-flex', className)}>
      <Icon icon={icon} size={size} variant={variant} />
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {badgeCount !== undefined && badgeCount > 0 ? (
            badgeCount > 9 ? '9+' : badgeCount
          ) : (
            <span className="h-2 w-2 rounded-full bg-white" />
          )}
        </span>
      )}
    </div>
  );
};

/**
 * StatusIcon - Icon with status indicator dot
 */
interface StatusIconProps {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  status: 'success' | 'warning' | 'error' | 'idle';
  className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  icon,
  size = 'md',
  variant = 'default',
  status,
  className,
}) => {
  const statusColors = {
    success: 'bg-success-500',
    warning: 'bg-primary-600',
    error: 'bg-red-500',
    idle: 'bg-slate-500',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <Icon icon={icon} size={size} variant={variant} />
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-slate-900',
          statusColors[status]
        )}
      />
    </div>
  );
};
