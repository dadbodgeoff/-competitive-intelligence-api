/**
 * Price Analytics API Client
 * Handles all price analytics and vendor comparison API calls
 */

import { apiClient } from './client';
import type {
  SavingsOpportunitiesResponse,
  PriceAnomaliesResponse,
  VendorPerformanceResponse,
  DashboardSummaryResponse,
} from '@/types/analytics';

export const analyticsApi = {
  /**
   * Get list of all items with price tracking metrics
   */
  async getItemsList(daysBack = 90): Promise<any> {
    const response = await apiClient.get(
      `/api/v1/analytics/items-list?days_back=${daysBack}`
    );
    return response.data;
  },

  /**
   * Get price comparison across vendors for specific item (by description)
   */
  async getPriceComparison(
    itemDescription: string,
    daysBack = 90
  ): Promise<any> {
    const response = await apiClient.get(
      `/api/v1/analytics/price-comparison?item_description=${encodeURIComponent(itemDescription)}&days_back=${daysBack}`
    );
    return response.data;
  },

  /**
   * Get price trends for charting (by description)
   */
  async getPriceTrends(itemDescription: string, days = 90): Promise<any> {
    const response = await apiClient.get(
      `/api/v1/analytics/price-trends?item_description=${encodeURIComponent(itemDescription)}&days=${days}`
    );
    return response.data;
  },

  /**
   * Find savings opportunities by switching vendors
   */
  async getSavingsOpportunities(
    minSavingsPercent = 5.0,
    daysBack = 90
  ): Promise<SavingsOpportunitiesResponse> {
    const response = await apiClient.get(
      `/api/v1/analytics/savings-opportunities?min_savings_percent=${minSavingsPercent}&days_back=${daysBack}`
    );
    return response.data;
  },

  /**
   * Get vendor performance metrics (by vendor name)
   */
  async getVendorPerformance(
    vendorName: string,
    daysBack = 90
  ): Promise<VendorPerformanceResponse> {
    const response = await apiClient.get(
      `/api/v1/analytics/vendor-performance?vendor_name=${encodeURIComponent(vendorName)}&days_back=${daysBack}`
    );
    return response.data;
  },

  /**
   * Detect price anomalies (unusual spikes/drops)
   */
  async getPriceAnomalies(
    daysBack = 90,
    minChangePercent = 20.0
  ): Promise<PriceAnomaliesResponse> {
    const response = await apiClient.get(
      `/api/v1/analytics/price-anomalies?days_back=${daysBack}&min_change_percent=${minChangePercent}`
    );
    return response.data;
  },

  /**
   * Get dashboard summary metrics
   */
  async getDashboardSummary(daysBack = 90): Promise<DashboardSummaryResponse> {
    const response = await apiClient.get(
      `/api/v1/analytics/dashboard-summary?days_back=${daysBack}`
    );
    return response.data;
  },

  /**
   * Get purchase history for a specific item
   */
  async getItemPurchaseHistory(itemDescription: string): Promise<any> {
    const response = await apiClient.get(
      `/api/v1/analytics/item-history?item_description=${encodeURIComponent(itemDescription)}`
    );
    return response.data;
  },
};
