/**
 * Design System - Invoice Status Badge Component
 * RestaurantIQ Platform
 */

import { cn } from '../utils';

export type InvoiceStatus = 'parsed' | 'reviewed' | 'approved' | 'completed' | 'error' | 'pending' | 'processing';

export interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const statusConfig: Record<InvoiceStatus, { label: string; classes: string }> = {
    parsed: {
      label: 'Parsed',
      classes: 'bg-accent-500/10 text-accent-400 border-accent-500/30',
    },
    reviewed: {
      label: 'Reviewed',
      classes: 'bg-primary-500/10 text-primary-500 border-primary-600/30',
    },
    approved: {
      label: 'Approved',
      classes: 'bg-primary-500/10 text-primary-500 border-white/10',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-primary-500/10 text-primary-500 border-white/10',
    },
    pending: {
      label: 'Pending',
      classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    },
    processing: {
      label: 'Processing',
      classes: 'bg-accent-500/10 text-accent-400 border-accent-500/30',
    },
    error: {
      label: 'Error',
      classes: 'bg-destructive/10 text-destructive border-red-500/30',
    },
  };

  // Safety check: if status is undefined or invalid, default to pending
  const config = status && statusConfig[status] ? statusConfig[status] : statusConfig.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
