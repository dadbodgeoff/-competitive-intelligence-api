import { cva } from "class-variance-authority"

export const cardVariants = cva(
  "rounded-lg border text-card-foreground shadow-md transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-gradient-to-br from-slate-850 to-slate-900 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg",
        elevated: "border-white/10 bg-gradient-to-br from-slate-850 to-slate-900 shadow-xl",
        interactive: "border-white/10 bg-gradient-to-br from-slate-850 to-slate-900 cursor-pointer hover:border-primary-500/30 hover:-translate-y-1 hover:shadow-primary",
        flat: "border-white/10 bg-slate-850",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
