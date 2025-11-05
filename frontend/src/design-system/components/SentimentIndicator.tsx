/**
 * Design System - Sentiment Indicator Component
 * RestaurantIQ Platform
 */

import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '../utils';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface SentimentIndicatorProps {
  sentiment: SentimentType;
  label?: string;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SentimentIndicator({
  sentiment,
  label,
  count,
  size = 'md',
  className,
}: SentimentIndicatorProps) {
  const sentimentConfig = {
    positive: {
      icon: ThumbsUp,
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      label: label || 'Positive',
    },
    neutral: {
      icon: Minus,
      color: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
      label: label || 'Neutral',
    },
    negative: {
      icon: ThumbsDown,
      color: 'text-red-400 bg-red-500/15 border-red-500/30',
      label: label || 'Negative',
    },
  };

  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1.5',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-2',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2.5',
      icon: 'w-5 h-5',
    },
  };

  const config = sentimentConfig[sentiment];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        config.color,
        sizes.container,
        className
      )}
    >
      <Icon className={sizes.icon} />
      <span>{config.label}</span>
      {count !== undefined && (
        <span className="ml-1 opacity-75">({count})</span>
      )}
    </div>
  );
}
