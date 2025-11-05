import * as React from "react"
import { useForm, FormProvider, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export interface FormWrapperProps<T extends z.ZodType<any, any>> {
  schema: T
  onSubmit: (data: z.infer<T>) => void | Promise<void>
  defaultValues?: Partial<z.infer<T>>
  children: (methods: UseFormReturn<z.infer<T>>) => React.ReactNode
  className?: string
}

export function FormWrapper<T extends z.ZodType<any, any>>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
}: FormWrapperProps<T>) {
  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children(methods)}
      </form>
    </FormProvider>
  )
}
