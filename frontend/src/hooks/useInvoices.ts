import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getInvoices, type GetInvoicesParams } from '@/services/api/invoicesApi'
import type { InvoiceListResponse } from '@/types/invoices'

const QUERY_KEY = ['invoices']

export function useInvoices(
  params?: GetInvoicesParams,
  options?: Omit<UseQueryOptions<InvoiceListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<InvoiceListResponse>({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => getInvoices(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  })
}

