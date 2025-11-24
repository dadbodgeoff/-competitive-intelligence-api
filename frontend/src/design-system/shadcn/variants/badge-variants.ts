import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        "confidence-high": "bg-primary-500/15 text-primary-400 border-primary-500/30",
        "confidence-medium": "bg-primary-600/15 text-primary-400 border-primary-600/30",
        "confidence-low": "bg-slate-500/15 text-slate-400 border-slate-500/30",
        opportunity: "bg-primary-500/15 text-primary-400 border-primary-500/30",
        threat: "bg-red-500/15 text-red-400 border-red-500/30",
        watch: "bg-primary-600/15 text-primary-400 border-primary-600/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
