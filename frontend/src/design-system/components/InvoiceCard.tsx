/**
 * Design System - Invoice Card Component
 * RestaurantIQ Platform
 * 
 * Reusable card wrapper for invoice-related content
 */

import { cn } from '../utils';

export interface InvoiceCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
}

export function InvoiceCard({
  children,
  variant = 'default',
  className,
}: InvoiceCardProps) {
  const variants = {
    default: 'border-white/10',
    elevated: 'border-white/10 shadow-lg',
    interactive: 'border-white/10 hover:border-accent-500/30 hover:-translate-y-1 hover:shadow-lg cursor-pointer',
  };

  return (
    <div
      className={cn(
        'rounded-lg border transition-all duration-300',
        'bg-gradient-to-br from-slate-850 to-slate-900',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

export interface InvoiceCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function InvoiceCardHeader({ children, className }: InvoiceCardHeaderProps) {
  return (
    <div className={cn('p-6 pb-4', className)}>
      {children}
    </div>
  );
}

export interface InvoiceCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function InvoiceCardContent({ children, className }: InvoiceCardContentProps) {
  return (
    <div className={cn('px-6 pb-6', className)}>
      {children}
    </div>
  );
}

export interface InvoiceCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function InvoiceCardFooter({ children, className }: InvoiceCardFooterProps) {
  return (
    <div className={cn('px-6 py-3 bg-black/10 border-t border-white/5', className)}>
      {children}
    </div>
  );
}
