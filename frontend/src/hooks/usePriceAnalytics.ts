/**
 * Price Analytics Hooks - Source of Truth Pattern
 * All data from invoice_items table only
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api/analyticsApi';
import type {
  SavingsOpportunitiesResponse,
  PriceAnomaliesResponse,
  VendorPerformanceResponse,
  DashboardSummaryResponse,
} from '@/types/analytics';

/**
 * Get list of all items with price tracking
 */
export function useItemsList(
  daysBack = 90
): UseQueryResult<any> {
  return useQuery({
    queryKey: ['itemsList', daysBack],
    queryFn: () => analyticsApi.getItemsList(daysBack),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get price comparison for an item by description
 */
export function usePriceComparison(
  itemDescription: string | undefined,
  daysBack = 90,
  enabled = true
): UseQueryResult<any> {
  return useQuery({
    queryKey: ['priceComparison', itemDescription, daysBack],
    queryFn: () => analyticsApi.getPriceComparison(itemDescription!, daysBack),
    enabled: enabled && !!itemDescription,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get price trends for an item by description
 */
export function usePriceTrends(
  itemDescription: string | undefined,
  days = 90,
  enabled = true
): UseQueryResult<any> {
  return useQuery({
    queryKey: ['priceTrends', itemDescription, days],
    queryFn: () => analyticsApi.getPriceTrends(itemDescription!, days),
    enabled: enabled && !!itemDescription,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get savings opportunities
 */
export function useSavingsOpportunities(
  minSavingsPercent = 5.0,
  daysBack = 90
): UseQueryResult<SavingsOpportunitiesResponse> {
  return useQuery({
    queryKey: ['savingsOpportunities', minSavingsPercent, daysBack],
    queryFn: () => analyticsApi.getSavingsOpportunities(minSavingsPercent, daysBack),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get vendor performance by vendor name
 */
export function useVendorPerformance(
  vendorName: string | undefined,
  daysBack = 90,
  enabled = true
): UseQueryResult<VendorPerformanceResponse> {
  return useQuery({
    queryKey: ['vendorPerformance', vendorName, daysBack],
    queryFn: () => analyticsApi.getVendorPerformance(vendorName!, daysBack),
    enabled: enabled && !!vendorName,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get price anomalies
 */
export function usePriceAnomalies(
  daysBack = 90,
  minChangePercent = 20.0
): UseQueryResult<PriceAnomaliesResponse> {
  return useQuery({
    queryKey: ['priceAnomalies', daysBack, minChangePercent],
    queryFn: () => analyticsApi.getPriceAnomalies(daysBack, minChangePercent),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get dashboard summary
 */
export function useDashboardSummary(
  daysBack = 90
): UseQueryResult<DashboardSummaryResponse> {
  return useQuery({
    queryKey: ['dashboardSummary', daysBack],
    queryFn: () => analyticsApi.getDashboardSummary(daysBack),
    staleTime: 5 * 60 * 1000,
  });
}
