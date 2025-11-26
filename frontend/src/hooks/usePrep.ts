import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPrepTemplates,
  getPrepTemplate,
  createPrepTemplate,
  updatePrepTemplate,
  deletePrepTemplate,
  addPrepTemplateItem,
  updatePrepTemplateItem,
  deletePrepTemplateItem,
  importMenuItemsToTemplate,
  getPrepDays,
  createPrepDay,
  getPrepDay,
  updatePrepDay,
  addPrepDayItem,
  updatePrepDayItem,
  deletePrepDayItem,
  assignPrepDayItem,
  completePrepDayItem,
  reopenPrepDayItem,
} from '@/services/api/prepApi'
import type {
  PrepTemplatesResponse,
  PrepTemplateResponse,
  PrepDayListResponse,
  PrepDayResponse,
} from '@/types/prep'

const TEMPLATE_KEY = ['prep', 'templates']
const TEMPLATE_DETAIL_KEY = (id: string) => [...TEMPLATE_KEY, id]
const DAY_LIST_KEY = ['prep', 'days']
const DAY_DETAIL_KEY = (id: string) => [...DAY_LIST_KEY, id]

/**
 * Standard error handler for mutations
 * Logs errors in development and can be extended for error tracking
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleMutationError(error: Error, context?: string) {
  if (import.meta.env.DEV) {
    console.error(`[Prep${context ? ` - ${context}` : ''}]`, error.message)
  }
}

export function usePrepTemplates() {
  return useQuery<PrepTemplatesResponse>({
    queryKey: TEMPLATE_KEY,
    queryFn: () => getPrepTemplates(),
    staleTime: 60 * 1000,
  })
}

export function usePrepTemplate(templateId?: string) {
  return useQuery<PrepTemplateResponse>({
    queryKey: templateId ? TEMPLATE_DETAIL_KEY(templateId) : TEMPLATE_KEY,
    queryFn: () => {
      if (!templateId) {
        return Promise.reject(new Error('Template id is required'))
      }
      return getPrepTemplate(templateId)
    },
    enabled: Boolean(templateId),
  })
}

export function useCreatePrepTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPrepTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'createTemplate'),
  })
}

export function useUpdatePrepTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: string; payload: { name?: string; description?: string | null } }) =>
      updatePrepTemplate(templateId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEY })
      queryClient.invalidateQueries({ queryKey: TEMPLATE_DETAIL_KEY(variables.templateId) })
    },
    onError: (error: Error) => handleMutationError(error, 'updateTemplate'),
  })
}

export function useDeletePrepTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePrepTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'deleteTemplate'),
  })
}

export function useCreatePrepTemplateItem(templateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof addPrepTemplateItem>[1]) => addPrepTemplateItem(templateId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_DETAIL_KEY(templateId) })
    },
    onError: (error: Error) => handleMutationError(error, 'createTemplateItem'),
  })
}

export function useUpdatePrepTemplateItem(templateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updatePrepTemplateItem>[1] }) =>
      updatePrepTemplateItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_DETAIL_KEY(templateId) })
    },
    onError: (error: Error) => handleMutationError(error, 'updateTemplateItem'),
  })
}

export function useDeletePrepTemplateItem(templateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePrepTemplateItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_DETAIL_KEY(templateId) })
    },
    onError: (error: Error) => handleMutationError(error, 'deleteTemplateItem'),
  })
}

export function useImportMenuItems(templateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (menu_item_ids: string[]) => importMenuItemsToTemplate(templateId, menu_item_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_DETAIL_KEY(templateId) })
    },
    onError: (error: Error) => handleMutationError(error, 'importMenuItems'),
  })
}

export function usePrepDays(params?: { start?: string; end?: string; status?: string }) {
  return useQuery<PrepDayListResponse>({
    queryKey: [...DAY_LIST_KEY, params],
    queryFn: () => getPrepDays(params),
    staleTime: 30 * 1000,
  })
}

export function usePrepDay(prepDayId?: string) {
  return useQuery<PrepDayResponse>({
    queryKey: prepDayId ? DAY_DETAIL_KEY(prepDayId) : DAY_LIST_KEY,
    queryFn: () => {
      if (!prepDayId) {
        return Promise.reject(new Error('Prep day id is required'))
      }
      return getPrepDay(prepDayId)
    },
    enabled: Boolean(prepDayId),
    staleTime: 10 * 1000,
  })
}

export function useCreatePrepDay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPrepDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_LIST_KEY })
    },
    onError: (error: Error) => handleMutationError(error, 'createPrepDay'),
  })
}

export function useUpdatePrepDay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ prepDayId, payload }: { prepDayId: string; payload: Parameters<typeof updatePrepDay>[1] }) =>
      updatePrepDay(prepDayId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DAY_LIST_KEY })
      queryClient.invalidateQueries({ queryKey: DAY_DETAIL_KEY(variables.prepDayId) })
    },
    onError: (error: Error) => handleMutationError(error, 'updatePrepDay'),
  })
}

export function useAddPrepDayItem(prepDayId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof addPrepDayItem>[1]) => addPrepDayItem(prepDayId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_DETAIL_KEY(prepDayId) })
    },
    onError: (error: Error) => handleMutationError(error, 'addPrepDayItem'),
  })
}

export function useUpdatePrepDayItem(prepDayId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: Parameters<typeof updatePrepDayItem>[1] }) =>
      updatePrepDayItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_LIST_KEY })
      queryClient.invalidateQueries({ queryKey: DAY_DETAIL_KEY(prepDayId) })
    },
    onError: (error: Error) => handleMutationError(error, 'updatePrepDayItem'),
  })
}

export function useDeletePrepDayItem(prepDayId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePrepDayItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_DETAIL_KEY(prepDayId) })
    },
    onError: (error: Error) => handleMutationError(error, 'deletePrepDayItem'),
  })
}

export function useAssignPrepDayItem(prepDayId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, assigned_user_id }: { itemId: string; assigned_user_id: string }) =>
      assignPrepDayItem(itemId, assigned_user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_DETAIL_KEY(prepDayId) })
    },
    onError: (error: Error) => handleMutationError(error, 'assignPrepDayItem'),
  })
}

export function useCompletePrepDayItem(prepDayId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, completion_note }: { itemId: string; completion_note?: string | null }) =>
      completePrepDayItem(itemId, { completion_note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_DETAIL_KEY(prepDayId) })
    },
    onError: (error: Error) => handleMutationError(error, 'completePrepDayItem'),
  })
}

export function useReopenPrepDayItem(prepDayId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reopenPrepDayItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_DETAIL_KEY(prepDayId) })
    },
    onError: (error: Error) => handleMutationError(error, 'reopenPrepDayItem'),
  })
}

