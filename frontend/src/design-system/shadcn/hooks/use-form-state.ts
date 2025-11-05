import { useState, useCallback } from "react"

export interface FormState {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  error: string | null
}

export function useFormState() {
  const [state, setState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    error: null,
  })

  const setSubmitting = useCallback(() => {
    setState({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      error: null,
    })
  }, [])

  const setSuccess = useCallback(() => {
    setState({
      isSubmitting: false,
      isSuccess: true,
      isError: false,
      error: null,
    })
  }, [])

  const setError = useCallback((error: string) => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      isError: true,
      error,
    })
  }, [])

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      isError: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    setSubmitting,
    setSuccess,
    setError,
    reset,
  }
}
