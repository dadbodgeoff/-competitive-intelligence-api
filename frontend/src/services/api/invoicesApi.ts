import { apiClient, safeRequest } from './client'
import { streamSse, type SseConnection } from '@/lib/sse'
import type { InvoiceListResponse } from '@/types/invoices'

type SafeResult<T> = Awaited<ReturnType<typeof safeRequest<T>>>

function ensureSuccess<T>(result: SafeResult<T>, fallbackMessage: string): T {
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? fallbackMessage)
  }
  return result.data
}

export interface GetInvoicesParams {
  page?: number
  perPage?: number
}

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 20

export async function getInvoices({ page = DEFAULT_PAGE, perPage = DEFAULT_PER_PAGE }: GetInvoicesParams = {}) {
  const result = await safeRequest<InvoiceListResponse>(() =>
    apiClient.get('/api/v1/invoices/', {
      params: {
        page,
        per_page: perPage,
      },
    })
  )

  return ensureSuccess(result, 'Failed to fetch invoices')
}

export interface InvoiceUploadResponse {
  file_url: string
}

export async function uploadInvoiceFile(formData: FormData) {
  const result = await safeRequest<InvoiceUploadResponse>(() =>
    apiClient.post('/api/v1/invoices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  )

  return ensureSuccess(result, 'Failed to upload invoice')
}

export interface GuestInvoiceUploadResponse {
  session_id: string
}

export async function uploadGuestInvoice(formData: FormData) {
  const result = await safeRequest<GuestInvoiceUploadResponse>(() =>
    apiClient.post('/api/v1/invoices/guest-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: false,
    })
  )

  return ensureSuccess(result, 'Failed to upload guest invoice')
}

export interface SaveInvoicePayload {
  invoice_data: unknown
  parse_metadata: unknown
  file_url: string
  status?: string
}

export interface SaveInvoiceResponse {
  invoice_id: string
  items_saved?: number
  success?: boolean
  [key: string]: unknown
}

export async function saveInvoice(payload: SaveInvoicePayload) {
  const result = await safeRequest<SaveInvoiceResponse>(() =>
    apiClient.post('/api/v1/invoices/save', payload)
  )

  return ensureSuccess(result, 'Failed to save invoice')
}

export interface SaveStreamPayload extends SaveInvoicePayload {
  session_id?: string
}

export interface InvoiceSaveStreamHandlers {
  onEvent: (payload: any, eventName: string) => void
  onError?: (error: Error) => void
  onOpen?: () => void
  onClose?: () => void
}

export function startInvoiceSaveStream(payload: SaveStreamPayload, handlers: InvoiceSaveStreamHandlers): SseConnection {
  const { onEvent, onError, onOpen, onClose } = handlers

  return streamSse({
    url: `${apiClient.defaults.baseURL ?? ''}/api/v1/invoices/save-stream`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    onEvent: ({ event, data }) => {
      onEvent(data, event)
    },
    onError,
    onOpen,
    onClose,
  })
}

