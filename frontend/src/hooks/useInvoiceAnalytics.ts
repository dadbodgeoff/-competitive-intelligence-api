/**
 * Invoice Analytics Hooks
 * React Query hooks for invoice dashboard data
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  invoiceAnalyticsApi,
  type InvoiceDashboardSummary,
  type SpendingByVendorResponse,
  type WeeklyTrendResponse,
  type RecentInvoicesResponse,
  type InvoicesByVendorResponse,
  type InvoiceInsightsResponse,
  type CombinedDashboardResponse,
} from '@/services/api/invoiceAnalyticsApi';

/**
 * Combined dashboard hook - fetches all data in single request
 * Reduces 4 API calls to 1 for faster page load
 */
export function useInvoiceDashboardCombined(
  daysBack = 90,
  weeks = 8,
  recentLimit = 10
): UseQueryResult<CombinedDashboardResponse> {
  return useQuery({
    queryKey: ['invoiceDashboardCombined', daysBack, weeks, recentLimit],
    queryFn: () => invoiceAnalyticsApi.getDashboardCombined(daysBack, weeks, recentLimit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get invoice dashboard summary
 */
export function useInvoiceDashboardSummary(
  daysBack = 90
): UseQueryResult<InvoiceDashboardSummary> {
  return useQuery({
    queryKey: ['invoiceDashboardSummary', daysBack],
    queryFn: () => invoiceAnalyticsApi.getDashboardSummary(daysBack),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get spending by vendor
 */
export function useSpendingByVendor(
  daysBack = 90
): UseQueryResult<SpendingByVendorResponse> {
  return useQuery({
    queryKey: ['spendingByVendor', daysBack],
    queryFn: () => invoiceAnalyticsApi.getSpendingByVendor(daysBack),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get weekly spending trend
 */
export function useWeeklySpendingTrend(
  weeks = 8
): UseQueryResult<WeeklyTrendResponse> {
  return useQuery({
    queryKey: ['weeklySpendingTrend', weeks],
    queryFn: () => invoiceAnalyticsApi.getWeeklyTrend(weeks),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get recent invoices
 */
export function useRecentInvoices(
  limit = 10
): UseQueryResult<RecentInvoicesResponse> {
  return useQuery({
    queryKey: ['recentInvoices', limit],
    queryFn: () => invoiceAnalyticsApi.getRecentInvoices(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get invoices grouped by vendor
 */
export function useInvoicesByVendor(
  daysBack = 90
): UseQueryResult<InvoicesByVendorResponse> {
  return useQuery({
    queryKey: ['invoicesByVendor', daysBack],
    queryFn: () => invoiceAnalyticsApi.getInvoicesByVendor(daysBack),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get invoice insights
 */
export function useInvoiceInsights(
  invoiceId: string | undefined,
  enabled = true
): UseQueryResult<InvoiceInsightsResponse> {
  return useQuery({
    queryKey: ['invoiceInsights', invoiceId],
    queryFn: () => invoiceAnalyticsApi.getInvoiceInsights(invoiceId!),
    enabled: enabled && !!invoiceId,
    staleTime: 5 * 60 * 1000,
  });
}
