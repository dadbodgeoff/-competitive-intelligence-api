/**
 * Filter Chips Component
 * Visual filter tags with remove functionality
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  color?: 'primary' | 'success' | 'destructive' | 'accent' | 'default';
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  success: 'bg-success-500/20 text-success-400 border-success-500/30',
  destructive: 'bg-destructive/20 text-destructive border-red-500/30',
  accent: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
  default: 'bg-white/10 text-slate-300 border-white/20',
};

export function FilterChips({ filters, onRemove, onClearAll, className }: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="text-xs text-slate-500 mr-1">Active filters:</span>
      
      <AnimatePresence mode="popLayout">
        {filters.map((filter) => (
          <motion.div
            key={filter.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
              colorClasses[filter.color || 'default']
            )}
          >
            <span className="text-slate-400">{filter.label}:</span>
            <span>{filter.value}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {filters.length > 1 && onClearAll && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClearAll}
          className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2"
        >
          Clear all
        </motion.button>
      )}
    </motion.div>
  );
}
