/**
 * Variant type definitions
 */

export type InsightVariant = "opportunity" | "threat" | "watch"
export type ConfidenceVariant = "high" | "medium" | "low"
export type SemanticVariant = "success" | "error" | "warning" | "info" | "neutral"

export type ComponentSize = "sm" | "md" | "lg" | "xl"
export type ComponentVariant = "default" | "outline" | "ghost" | "link"

export interface VariantConfig<T extends string> {
  variant: T
  className: string
  icon?: React.ComponentType
}
