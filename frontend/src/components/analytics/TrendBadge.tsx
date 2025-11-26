/**
 * Trend Badge Component
 * Animated badges showing price trends
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/types/analytics';

interface TrendBadgeProps {
  value: number | null;
  threshold?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  animated?: boolean;
}

export function TrendBadge({ 
  value, 
  threshold = 5, 
  showIcon = true,
  size = 'md',
  animated = true,
}: TrendBadgeProps) {
  if (value === null || value === undefined) {
    return (
      <Badge variant="secondary" className="bg-white/10 text-slate-400 border-white/10">
        No Data
      </Badge>
    );
  }

  const isIncreasing = value > threshold;
  const isDecreasing = value < -threshold;
  const isStable = !isIncreasing && !isDecreasing;

  const getConfig = () => {
    if (isIncreasing) {
      return {
        icon: TrendingUp,
        className: 'bg-destructive/20 text-destructive border-red-500/30',
        prefix: '+',
      };
    }
    if (isDecreasing) {
      return {
        icon: TrendingDown,
        className: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
        prefix: '',
      };
    }
    return {
      icon: Minus,
      className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      prefix: '',
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  const content = (
    <Badge 
      className={cn(
        config.className,
        size === 'sm' && 'text-xs px-1.5 py-0.5',
        size === 'md' && 'text-sm px-2 py-1'
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {isStable ? 'Stable ' : config.prefix}
      {formatPercent(Math.abs(value))}
    </Badge>
  );

  if (!animated) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.div>
  );
}
