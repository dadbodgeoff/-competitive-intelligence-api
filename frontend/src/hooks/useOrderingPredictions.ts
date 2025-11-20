import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { detectDeliveryPatterns, getDeliveryPatterns, getOrderingPredictions } from '@/services/api/orderingApi'
import type { DeliveryPatternResponse, OrderingPredictionsResponse } from '@/types/ordering'

const QUERY_KEY = ['ordering', 'predictions']
const PATTERN_KEY = ['ordering', 'delivery-patterns']

interface OrderingPredictionsParams {
  itemIds?: string[]
}

export function useOrderingPredictions(
  params?: OrderingPredictionsParams,
  options?: Omit<UseQueryOptions<OrderingPredictionsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<OrderingPredictionsResponse>({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => getOrderingPredictions(params),
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useDeliveryPatterns(
  options?: Omit<UseQueryOptions<DeliveryPatternResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DeliveryPatternResponse>({
    queryKey: PATTERN_KEY,
    queryFn: () => getDeliveryPatterns(),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useDetectDeliveryPatterns() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => detectDeliveryPatterns(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATTERN_KEY })
    },
  })
}

