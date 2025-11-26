import { apiClient, safeRequest } from './client'
import { parseResponse } from './validation'
import { deliveryPatternResponseSchema, orderingPredictionsResponseSchema } from './schemas'
import type { DeliveryPatternResponse, OrderingPredictionsResponse } from '@/types/ordering'

export interface OrderingPredictionsParams {
  itemIds?: string[]
  limit?: number
  offset?: number
  fromDate?: string
  toDate?: string
}

export async function getOrderingPredictions(params?: OrderingPredictionsParams) {
  const queryParams: Record<string, string | string[] | number | undefined> = {}

  if (params?.itemIds?.length) {
    queryParams.item = params.itemIds
  }
  if (params?.limit !== undefined) {
    queryParams.limit = params.limit
  }
  if (params?.offset !== undefined) {
    queryParams.offset = params.offset
  }
  if (params?.fromDate) {
    queryParams.from_date = params.fromDate
  }
  if (params?.toDate) {
    queryParams.to_date = params.toDate
  }

  const result = await safeRequest<OrderingPredictionsResponse>(() =>
    apiClient.get('/api/v1/ordering/predictions', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      paramsSerializer: (query) => {
        const parts: string[] = []
        for (const [key, value] of Object.entries(query)) {
          if (value === undefined) continue
          if (Array.isArray(value)) {
            for (const v of value) {
              parts.push(`${key}=${encodeURIComponent(v)}`)
            }
          } else {
            parts.push(`${key}=${encodeURIComponent(String(value))}`)
          }
        }
        return parts.join('&')
      },
    })
  )

  return parseResponse(result, orderingPredictionsResponseSchema, 'Failed to load ordering predictions')
}

export async function getDeliveryPatterns() {
  const result = await safeRequest<DeliveryPatternResponse>(() => apiClient.get('/api/v1/ordering/delivery-patterns'))
  return parseResponse(result, deliveryPatternResponseSchema, 'Failed to load delivery patterns')
}

export async function detectDeliveryPatterns() {
  const result = await safeRequest<DeliveryPatternResponse>(() =>
    apiClient.post('/api/v1/ordering/delivery-patterns/detect')
  )
  return parseResponse(result, deliveryPatternResponseSchema, 'Failed to refresh delivery patterns')
}

