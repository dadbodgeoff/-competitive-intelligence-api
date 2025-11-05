import { UseFormReturn, FieldValues } from "react-hook-form"

/**
 * Form-related type definitions
 */

export type FormMethods<T extends FieldValues> = UseFormReturn<T>

export interface BaseFormProps<T extends FieldValues> {
  onSubmit: (data: T) => void | Promise<void>
  defaultValues?: Partial<T>
  isLoading?: boolean
  className?: string
}

export interface FormFieldConfig {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
}

export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'

export interface FormFieldProps extends FormFieldConfig {
  type?: FormFieldType
}
