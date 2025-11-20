import { apiClient, safeRequest } from './client'
import { parseResponse } from './validation'
import {
  dailySalesResponseSchema,
  menuSalesSummarySchema,
  recordDailySalesResponseSchema,
} from './schemas'
import type {
  DailySalesResponse,
  MenuSalesSummary,
  RecordDailySalesResponse,
} from '@/types/menuSales'

export interface RecordDailySalesPayload {
  sale_date: string
  entries: Array<{
    menu_item_id: string
    menu_item_price_id?: string | null
    quantity_sold: number
    metadata?: Record<string, unknown>
  }>
}

export async function recordDailySales(payload: RecordDailySalesPayload) {
  const result = await safeRequest<RecordDailySalesResponse>(() =>
    apiClient.post('/api/v1/menu/sales/daily', payload),
  )

  return parseResponse(
    result,
    recordDailySalesResponseSchema,
    'Failed to record daily sales',
  )
}

export async function getDailySales(saleDate: string) {
  const result = await safeRequest<DailySalesResponse>(() =>
    apiClient.get('/api/v1/menu/sales/daily', {
      params: { sale_date: saleDate },
    }),
  )

  return parseResponse(result, dailySalesResponseSchema, 'Failed to load daily sales')
}

export async function getSalesSummary(params?: { startDate?: string; endDate?: string }) {
  const result = await safeRequest<MenuSalesSummary>(() =>
    apiClient.get('/api/v1/menu/sales/summary', {
      params: {
        start_date: params?.startDate,
        end_date: params?.endDate,
      },
    }),
  )

  return parseResponse(result, menuSalesSummarySchema, 'Failed to load sales summary')
}

