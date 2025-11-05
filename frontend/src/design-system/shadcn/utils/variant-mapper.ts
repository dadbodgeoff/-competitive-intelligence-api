/**
 * Variant Mapper
 * Maps our design system variants to shadcn variants
 */

import type { InsightType, ConfidenceLevel } from '../../tokens';

export function mapInsightToVariant(type: InsightType): string {
  const variantMap: Record<InsightType, string> = {
    opportunity: 'opportunity',
    threat: 'threat',
    watch: 'watch',
  };
  return variantMap[type];
}

export function mapConfidenceToVariant(level: ConfidenceLevel): string {
  const variantMap: Record<ConfidenceLevel, string> = {
    high: 'confidence-high',
    medium: 'confidence-medium',
    low: 'confidence-low',
  };
  return variantMap[level];
}

export function mapSemanticToVariant(type: 'success' | 'error' | 'warning' | 'info'): string {
  const variantMap = {
    success: 'success',
    error: 'destructive',
    warning: 'warning',
    info: 'info',
  };
  return variantMap[type];
}
