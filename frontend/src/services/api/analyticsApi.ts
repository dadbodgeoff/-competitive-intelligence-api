/**
 * Price Analytics API Client
 * Handles all price analytics and vendor comparison API calls
 */

import { apiClient, safeRequest } from './client';
import {
  dashboardSummaryResponseSchema,
  itemPurchaseHistoryResponseSchema,
  itemsListResponseSchema,
  priceAnomaliesResponseSchema,
  priceComparisonResponseSchema,
  priceTrendsResponseSchema,
  savingsOpportunitiesResponseSchema,
  vendorPerformanceResponseSchema,
} from './schemas';
import { parseResponse } from './validation';
import type {
  DashboardSummaryResponse,
  ItemPurchaseHistoryResponse,
  ItemsListResponse,
  PriceAnomaliesResponse,
  PriceComparisonResponse,
  PriceTrendsResponse,
  SavingsOpportunitiesResponse,
  VendorPerformanceResponse,
} from '@/types/analytics';

export const analyticsApi = {
  /**
   * Get list of all items with price tracking metrics
   */
  async getItemsList(daysBack = 90): Promise<ItemsListResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/items-list', {
        params: { days_back: daysBack },
      })
    );
    return parseResponse(result, itemsListResponseSchema, 'Failed to fetch items list');
  },

  /**
   * Get price comparison across vendors for specific item (by description)
   */
  async getPriceComparison(
    itemDescription: string,
    daysBack = 90
  ): Promise<PriceComparisonResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/price-comparison', {
        params: {
          item_description: itemDescription,
          days_back: daysBack,
        },
      })
    );
    return parseResponse(result, priceComparisonResponseSchema, 'Failed to fetch price comparison');
  },

  /**
   * Get price trends for charting (by description)
   */
  async getPriceTrends(itemDescription: string, days = 90): Promise<PriceTrendsResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/price-trends', {
        params: {
          item_description: itemDescription,
          days,
        },
      })
    );
    return parseResponse(result, priceTrendsResponseSchema, 'Failed to fetch price trends');
  },

  /**
   * Find savings opportunities by switching vendors
   */
  async getSavingsOpportunities(
    minSavingsPercent = 5.0,
    daysBack = 90
  ): Promise<SavingsOpportunitiesResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/savings-opportunities', {
        params: {
          min_savings_percent: minSavingsPercent,
          days_back: daysBack,
        },
      })
    );
    return parseResponse(result, savingsOpportunitiesResponseSchema, 'Failed to fetch savings opportunities');
  },

  /**
   * Get vendor performance metrics (by vendor name)
   */
  async getVendorPerformance(
    vendorName: string,
    daysBack = 90
  ): Promise<VendorPerformanceResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/vendor-performance', {
        params: {
          vendor_name: vendorName,
          days_back: daysBack,
        },
      })
    );
    return parseResponse(result, vendorPerformanceResponseSchema, 'Failed to fetch vendor performance');
  },

  /**
   * Detect price anomalies (unusual spikes/drops)
   */
  async getPriceAnomalies(
    daysBack = 90,
    minChangePercent = 20.0
  ): Promise<PriceAnomaliesResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/price-anomalies', {
        params: {
          days_back: daysBack,
          min_change_percent: minChangePercent,
        },
      })
    );
    return parseResponse(result, priceAnomaliesResponseSchema, 'Failed to fetch price anomalies');
  },

  /**
   * Get dashboard summary metrics
   */
  async getDashboardSummary(daysBack = 90): Promise<DashboardSummaryResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/dashboard-summary', {
        params: { days_back: daysBack },
      })
    );
    return parseResponse(result, dashboardSummaryResponseSchema, 'Failed to fetch dashboard summary');
  },

  /**
   * Get purchase history for a specific item
   */
  async getItemPurchaseHistory(itemDescription: string): Promise<ItemPurchaseHistoryResponse> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/item-history', {
        params: { item_description: itemDescription },
      })
    );
    return parseResponse(result, itemPurchaseHistoryResponseSchema, 'Failed to fetch item history');
  },
};
