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
      classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    reviewed: {
      label: 'Reviewed',
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    approved: {
      label: 'Approved',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    pending: {
      label: 'Pending',
      classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    },
    processing: {
      label: 'Processing',
      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
    error: {
      label: 'Error',
      classes: 'bg-red-500/10 text-red-400 border-red-500/30',
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
