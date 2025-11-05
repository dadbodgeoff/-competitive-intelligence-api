import * as React from "react"
import { useFormContext, Controller } from "react-hook-form"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  className?: string
  children: (field: any) => React.ReactNode
}

export function FormField({
  name,
  label,
  description,
  required,
  className,
  children,
}: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => <>{children(field)}</>}
      />
      
      {description && !error && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-400">{error.message as string}</p>
      )}
    </div>
  )
}
