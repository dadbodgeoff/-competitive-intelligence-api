import { VariantProps } from "class-variance-authority"
import { buttonVariants } from "../variants/button-variants"
import { badgeVariants } from "../variants/badge-variants"
import { cardVariants } from "../variants/card-variants"
import { alertVariants } from "../variants/alert-variants"

/**
 * Component prop types derived from variants
 */

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
export type ButtonSize = VariantProps<typeof buttonVariants>["size"]

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

export type CardVariant = VariantProps<typeof cardVariants>["variant"]

export type AlertVariant = VariantProps<typeof alertVariants>["variant"]

/**
 * Common component props
 */

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface InteractiveComponentProps extends BaseComponentProps {
  onClick?: () => void
  disabled?: boolean
}
