/**
 * Design System - Color Helper Utilities
 * Restaurant Competitive Intelligence Platform
 */

import {
  getInsightColor,
  getConfidenceColor,
  getSemanticColor,
  type InsightType,
  type ConfidenceLevel,
  type SemanticType,
} from '../tokens';

/**
 * Get Tailwind classes for insight type
 */
export function getInsightClasses(type: InsightType) {
  const colors = getInsightColor(type);
  
  const classMap = {
    opportunity: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    threat: 'bg-red-500/10 border-red-500/30 text-red-400',
    watch: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };
  
  return {
    classes: classMap[type],
    colors,
  };
}

/**
 * Get Tailwind classes for confidence level
 */
export function getConfidenceClasses(level: ConfidenceLevel) {
  const colors = getConfidenceColor(level);
  
  const classMap = {
    high: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };
  
  return {
    classes: classMap[level],
    colors,
  };
}

/**
 * Get Tailwind classes for semantic type
 */
export function getSemanticClasses(type: SemanticType) {
  const colors = getSemanticColor(type);
  
  const classMap = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    neutral: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  };
  
  return {
    classes: classMap[type],
    colors,
  };
}

/**
 * Get rating color classes (for star ratings)
 */
export function getRatingClasses(rating: number) {
  if (rating >= 4.5) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400';
  if (rating >= 4.0) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-400';
  if (rating >= 3.5) return 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400';
  return 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400';
}

/**
 * Get icon for insight type
 */
export function getInsightIcon(type: InsightType): string {
  const iconMap = {
    opportunity: '💡',
    threat: '⚠️',
    watch: '👀',
  };
  return iconMap[type];
}

/**
 * Get icon for semantic type
 */
export function getSemanticIcon(type: SemanticType): string {
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    neutral: '○',
  };
  return iconMap[type];
}
