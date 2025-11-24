import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-primary-500/10 text-primary-500 hover:bg-primary-500/20",
        secondary:
          "border-accent-500/30 bg-accent-500/10 text-accent-400 hover:bg-accent-500/20",
        destructive:
          "border-red-500/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
        success:
          "border-success-500/30 bg-success-500/10 text-success-400 hover:bg-success-500/20",
        outline: "border-white/10 text-foreground hover:bg-white/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }