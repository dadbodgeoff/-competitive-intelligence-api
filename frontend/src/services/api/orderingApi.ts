import { apiClient, safeRequest } from './client'
import { parseResponse } from './validation'
import { deliveryPatternResponseSchema, orderingPredictionsResponseSchema } from './schemas'
import type { DeliveryPatternResponse, OrderingPredictionsResponse } from '@/types/ordering'

export async function getOrderingPredictions(params?: { itemIds?: string[] }) {
  const result = await safeRequest<OrderingPredictionsResponse>(() =>
    apiClient.get('/api/v1/ordering/predictions', {
      params: params?.itemIds ? { item: params.itemIds } : undefined,
      paramsSerializer: (query) => {
        const values = query.item
        if (!values) return ''
        return (Array.isArray(values) ? values : [values])
          .map((value) => `item=${encodeURIComponent(value)}`)
          .join('&')
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

