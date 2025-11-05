import { cva } from "class-variance-authority"

export const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-red-500/30 bg-red-500/10 text-red-400 [&>svg]:text-red-400",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 [&>svg]:text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400 [&>svg]:text-amber-400",
        info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 [&>svg]:text-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
