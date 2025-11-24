import { cva } from "class-variance-authority"

export const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-red-500/30 bg-red-500/10 text-red-400 [&>svg]:text-red-400",
        success: "border-primary-500/30 bg-primary-500/10 text-primary-400 [&>svg]:text-primary-400",
        warning: "border-primary-600/30 bg-primary-600/10 text-primary-400 [&>svg]:text-primary-400",
        info: "border-accent-500/30 bg-accent-500/10 text-accent-400 [&>svg]:text-accent-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
