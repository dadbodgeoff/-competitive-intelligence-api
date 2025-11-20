import { apiClient, safeRequest } from './client'
import { streamSse, type SseConnection } from '@/lib/sse'

type SafeResult<T> = Awaited<ReturnType<typeof safeRequest<T>>>

function ensureSuccess<T>(result: SafeResult<T>, fallbackMessage: string): T {
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? fallbackMessage)
  }
  return result.data
}

export interface MenuUploadResponse {
  file_url: string
}

export async function uploadMenuFile(formData: FormData) {
  const result = await safeRequest<MenuUploadResponse>(() =>
    apiClient.post('/api/v1/menu/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  )

  return ensureSuccess(result, 'Failed to upload menu')
}

export interface SaveMenuPayload {
  menu_data: unknown
  parse_metadata: unknown
  file_url: string
}

export interface SaveMenuResponse {
  menu_id: string
  success?: boolean
  [key: string]: unknown
}

export async function saveMenu(payload: SaveMenuPayload) {
  const result = await safeRequest<SaveMenuResponse>(() =>
    apiClient.post('/api/v1/menu/save', payload)
  )

  return ensureSuccess(result, 'Failed to save menu')
}

export interface MenuParseStreamHandlers {
  onEvent: (event: { event: string; data: any }) => void
  onError?: (error: Error) => void
  onOpen?: () => void
  onClose?: () => void
}

export interface MenuParseStreamPayload {
  file_url: string
  restaurant_name_hint?: string
}

export function startMenuParseStream(payload: MenuParseStreamPayload, handlers: MenuParseStreamHandlers): SseConnection {
  const { onEvent, onError, onOpen, onClose } = handlers

  const params = new URLSearchParams({ file_url: payload.file_url })
  if (payload.restaurant_name_hint) {
    params.set('restaurant_name_hint', payload.restaurant_name_hint)
  }

  return streamSse({
    url: `${apiClient.defaults.baseURL ?? ''}/api/v1/menu/parse-stream?${params.toString()}`,
    method: 'GET',
    onEvent,
    onError,
    onOpen,
    onClose,
  })
}
