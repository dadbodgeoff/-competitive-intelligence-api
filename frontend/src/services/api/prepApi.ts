import { apiClient, safeRequest } from './client'
import {
  prepTemplatesResponseSchema,
  prepTemplateResponseSchema,
  prepTemplateItemResponseSchema,
  prepDayListResponseSchema,
  prepDayResponseSchema,
  prepDayItemResponseSchema,
} from './schemas'
import {
  PrepTemplatesResponse,
  PrepTemplateResponse,
  PrepTemplateItemResponse,
  PrepDayListResponse,
  PrepDayResponse,
  PrepDayItemResponse,
} from '@/types/prep'
import { parseResponse } from './validation'

export async function getPrepTemplates() {
  const result = await safeRequest<PrepTemplatesResponse>(() => apiClient.get('/api/v1/prep/templates'))
  return parseResponse(result, prepTemplatesResponseSchema, 'Failed to fetch prep templates')
}

export async function getPrepTemplate(templateId: string) {
  const result = await safeRequest<PrepTemplateResponse>(() => apiClient.get(`/api/v1/prep/templates/${templateId}`))
  return parseResponse(result, prepTemplateResponseSchema, 'Failed to fetch prep template')
}

export async function createPrepTemplate(payload: { name: string; description?: string | null }) {
  const result = await safeRequest<PrepTemplateResponse>(() => apiClient.post('/api/v1/prep/templates', payload))
  return parseResponse(result, prepTemplateResponseSchema, 'Failed to create prep template')
}

export async function updatePrepTemplate(templateId: string, payload: { name?: string; description?: string | null }) {
  const result = await safeRequest<PrepTemplateResponse>(() =>
    apiClient.put(`/api/v1/prep/templates/${templateId}`, payload)
  )
  return parseResponse(result, prepTemplateResponseSchema, 'Failed to update prep template')
}

export async function deletePrepTemplate(templateId: string) {
  const result = await safeRequest(() => apiClient.delete(`/api/v1/prep/templates/${templateId}`))
  if (!result.success && result.error) {
    throw new Error(result.error.message)
  }
}

export async function addPrepTemplateItem(
  templateId: string,
  payload: {
    name: string
    menu_item_id?: string | null
    default_par?: number
    default_on_hand?: number
    notes?: string | null
    display_order?: number
  }
) {
  const result = await safeRequest<PrepTemplateItemResponse>(() =>
    apiClient.post(`/api/v1/prep/templates/${templateId}/items`, payload)
  )
  return parseResponse(result, prepTemplateItemResponseSchema, 'Failed to add prep template item')
}

export async function updatePrepTemplateItem(
  itemId: string,
  payload: {
    name?: string
    menu_item_id?: string | null
    default_par?: number
    default_on_hand?: number
    notes?: string | null
    display_order?: number
  }
) {
  const result = await safeRequest<PrepTemplateItemResponse>(() =>
    apiClient.put(`/api/v1/prep/template-items/${itemId}`, payload)
  )
  return parseResponse(result, prepTemplateItemResponseSchema, 'Failed to update prep template item')
}

export async function deletePrepTemplateItem(itemId: string) {
  const result = await safeRequest(() => apiClient.delete(`/api/v1/prep/template-items/${itemId}`))
  if (!result.success && result.error) {
    throw new Error(result.error.message)
  }
}

export async function importMenuItemsToTemplate(templateId: string, menu_item_ids: string[]) {
  const result = await safeRequest<{ items: PrepTemplateItemResponse['item'][] }>(() =>
    apiClient.post(`/api/v1/prep/templates/${templateId}/import-menu-items`, {
      menu_item_ids,
    })
  )
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? 'Failed to import menu items')
  }
  return result.data.items
}

export async function getPrepDays(params?: { start?: string; end?: string; status?: string }) {
  const result = await safeRequest<PrepDayListResponse>(() =>
    apiClient.get('/api/v1/prep/days', {
      params: {
        start: params?.start,
        end: params?.end,
        status: params?.status,
      },
    })
  )
  return parseResponse(result, prepDayListResponseSchema, 'Failed to fetch prep days')
}

export async function createPrepDay(payload: { prep_date: string; template_id?: string; status?: string }) {
  const result = await safeRequest<PrepDayResponse>(() => apiClient.post('/api/v1/prep/days', payload))
  return parseResponse(result, prepDayResponseSchema, 'Failed to create prep day')
}

export async function getPrepDay(prepDayId: string) {
  const result = await safeRequest<PrepDayResponse>(() => apiClient.get(`/api/v1/prep/days/${prepDayId}`))
  return parseResponse(result, prepDayResponseSchema, 'Failed to fetch prep day')
}

export async function updatePrepDay(
  prepDayId: string,
  payload: { status?: string; notes?: string | null; lock?: boolean }
) {
  const result = await safeRequest<PrepDayResponse>(() =>
    apiClient.put(`/api/v1/prep/days/${prepDayId}`, payload)
  )
  return parseResponse(result, prepDayResponseSchema, 'Failed to update prep day')
}

export async function addPrepDayItem(
  prepDayId: string,
  payload: {
    name: string
    par_amount: number
    on_hand_amount: number
    template_item_id?: string | null
    menu_item_id?: string | null
    unit?: string | null
    notes?: string | null
    display_order?: number
  }
) {
  const result = await safeRequest<PrepDayItemResponse>(() =>
    apiClient.post(`/api/v1/prep/days/${prepDayId}/items`, payload)
  )
  return parseResponse(result, prepDayItemResponseSchema, 'Failed to add prep day item')
}

export async function updatePrepDayItem(
  itemId: string,
  payload: {
    par_amount?: number
    on_hand_amount?: number
    unit?: string | null
    notes?: string | null
    display_order?: number
    assigned_user_id?: string | null
  }
) {
  const result = await safeRequest<PrepDayItemResponse>(() =>
    apiClient.put(`/api/v1/prep/day-items/${itemId}`, payload)
  )
  return parseResponse(result, prepDayItemResponseSchema, 'Failed to update prep day item')
}

export async function deletePrepDayItem(itemId: string) {
  const result = await safeRequest(() => apiClient.delete(`/api/v1/prep/day-items/${itemId}`))
  if (!result.success && result.error) {
    throw new Error(result.error.message)
  }
}

export async function assignPrepDayItem(itemId: string, assigned_user_id: string) {
  const result = await safeRequest<PrepDayItemResponse>(() =>
    apiClient.post(`/api/v1/prep/day-items/${itemId}/assign`, { assigned_user_id })
  )
  return parseResponse(result, prepDayItemResponseSchema, 'Failed to assign prep day item')
}

export async function completePrepDayItem(
  itemId: string,
  payload: { completion_note?: string | null; completed_at?: string | null } = {}
) {
  const result = await safeRequest<PrepDayItemResponse>(() =>
    apiClient.post(`/api/v1/prep/day-items/${itemId}/complete`, payload)
  )
  return parseResponse(result, prepDayItemResponseSchema, 'Failed to complete prep day item')
}

export async function reopenPrepDayItem(itemId: string) {
  const result = await safeRequest<PrepDayItemResponse>(() =>
    apiClient.post(`/api/v1/prep/day-items/${itemId}/reopen`, {})
  )
  return parseResponse(result, prepDayItemResponseSchema, 'Failed to reopen prep day item')
}

