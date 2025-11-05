/**
 * Design System - Insight Card Component
 * RestaurantIQ Platform
 * 
 * Displays competitive insights with confidence-based styling
 */

import { useState } from 'react';
import { cn } from '../utils';
import type { InsightType, ConfidenceLevel } from '../tokens';

export interface InsightCardProps {
  title: string;
  description: string;
  type: InsightType;
  confidence: ConfidenceLevel;
  proofQuote?: string;
  competitorName?: string;
  mentionCount?: number;
  className?: string;
  onExpand?: () => void;
}

export function InsightCard({
  title,
  description,
  type,
  confidence,
  proofQuote,
  competitorName,
  mentionCount,
  className,
  onExpand,
}: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };

  // Type-based styling
  const typeStyles = {
    opportunity: 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5',
    threat: 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-600/5',
    watch: 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-600/5',
  };

  // Confidence-based border glow
  const confidenceGlow = {
    high: 'hover:shadow-emerald',
    medium: 'hover:shadow-lg',
    low: 'hover:shadow-md',
  };

  // Type icons
  const typeIcons = {
    opportunity: '💡',
    threat: '⚠️',
    watch: '👀',
  };

  // Confidence badges
  const confidenceBadges = {
    high: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border transition-all duration-300',
        'bg-gradient-to-br from-slate-850 to-slate-900',
        typeStyles[type],
        confidenceGlow[confidence],
        'hover:-translate-y-0.5 cursor-pointer',
        isExpanded && 'ring-2 ring-emerald-500/50',
        className
      )}
      onClick={handleToggle}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl" role="img" aria-label={type}>
              {typeIcons[type]}
            </span>
            <h3 className="text-lg font-semibold text-slate-100 leading-tight">
              {title}
            </h3>
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border',
              confidenceBadges[confidence]
            )}
          >
            {confidence}
          </span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && proofQuote && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4 animate-slide-up">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Evidence
            </h4>
            <blockquote className="relative pl-4 border-l-4 border-cyan-500 bg-black/20 p-3 rounded-r italic text-sm text-slate-300">
              "{proofQuote}"
            </blockquote>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            {competitorName && (
              <span>Source: <span className="text-slate-400">{competitorName}</span></span>
            )}
            {mentionCount && (
              <span className="flex items-center gap-1">
                <span className="text-cyan-400 font-semibold">{mentionCount}</span> mentions
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-black/10 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {type}
        </span>
        <button
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      {/* Glow effect for high confidence */}
      {confidence === 'high' && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
