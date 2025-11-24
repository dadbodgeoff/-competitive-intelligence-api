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
    opportunity: 'bg-primary-500/10 border-primary-500/30 text-primary-400',
    threat: 'bg-red-500/10 border-red-500/30 text-red-400',
    watch: 'bg-primary-600/10 border-primary-600/30 text-primary-400',
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
    high: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
    medium: 'bg-primary-600/15 text-primary-400 border-primary-600/30',
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
    success: 'bg-primary-500/10 border-primary-500/30 text-primary-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-primary-600/10 border-primary-600/30 text-primary-400',
    info: 'bg-accent-500/10 border-accent-500/30 text-accent-400',
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
  if (rating >= 4.5) return 'bg-primary-100 text-primary-800 dark:bg-primary-500/15 dark:text-primary-400';
  if (rating >= 4.0) return 'bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-400';
  if (rating >= 3.5) return 'bg-primary-100 text-primary-800 dark:bg-primary-600/15 dark:text-primary-400';
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
