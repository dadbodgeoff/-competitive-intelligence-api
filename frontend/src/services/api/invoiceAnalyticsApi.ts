/**
 * Invoice Analytics API Client
 * Handles all invoice dashboard and analytics API calls
 */

import { apiClient, safeRequest } from './client';

// Types
export interface InvoiceDashboardSummary {
  total_spend: number;
  invoice_count: number;
  vendor_count: number;
  avg_order_value: number;
  spend_change_percent: number;
  invoice_change: number;
  items_tracked: number;
  days_analyzed: number;
}

export interface VendorSpending {
  vendor_name: string;
  total_spend: number;
  invoice_count: number;
  percent: number;
}

export interface SpendingByVendorResponse {
  vendors: VendorSpending[];
  total_vendors: number;
  days_analyzed: number;
}

export interface WeeklyTrendPoint {
  week_start: string;
  total_spend: number;
  invoice_count: number;
}

export interface WeeklyTrendResponse {
  trend: WeeklyTrendPoint[];
  weeks_analyzed: number;
  data_points: number;
}

export interface RecentInvoice {
  id: string;
  invoice_number: string;
  vendor_name: string;
  invoice_date: string;
  total: number;
  status: string;
  created_at: string;
}

export interface RecentInvoicesResponse {
  invoices: RecentInvoice[];
  count: number;
}

export interface VendorInvoice {
  id: string;
  invoice_number: string;
  date: string;
  total: number;
  status: string;
  item_count: number;
}

export interface VendorWithInvoices {
  vendor_name: string;
  total_spend: number;
  invoice_count: number;
  avg_order: number;
  invoices: VendorInvoice[];
}

export interface InvoicesByVendorResponse {
  vendors: VendorWithInvoices[];
  total_vendors: number;
  days_analyzed: number;
}

export interface InvoiceInsightItem {
  description: string;
  current_price: number;
  avg_price: number;
  min_price: number;
  price_change_percent: number;
  is_alert: boolean;
  potential_savings: number;
}

export interface InvoiceInsightsResponse {
  success: boolean;
  invoice_id: string;
  items: InvoiceInsightItem[];
  alerts: number;
  potential_savings: number;
}

// Combined dashboard response type
export interface CombinedDashboardResponse {
  summary: InvoiceDashboardSummary;
  vendors: SpendingByVendorResponse;
  trend: WeeklyTrendResponse;
  recent: RecentInvoicesResponse;
}

// Helper function
function ensureSuccess<T>(result: { success: boolean; data?: T; error?: { message: string } }, fallbackMessage: string): T {
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? fallbackMessage);
  }
  return result.data;
}

// API functions
export const invoiceAnalyticsApi = {
  /**
   * Get all dashboard data in a single request (optimized)
   */
  async getDashboardCombined(
    daysBack = 90,
    weeks = 8,
    recentLimit = 10
  ): Promise<CombinedDashboardResponse> {
    const result = await safeRequest<CombinedDashboardResponse>(() =>
      apiClient.get('/api/v1/invoice-analytics/dashboard-combined', {
        params: { days_back: daysBack, weeks, recent_limit: recentLimit },
      })
    );
    return ensureSuccess(result, 'Failed to fetch dashboard data');
  },

  /**
   * Get invoice dashboard summary metrics
   */
  async getDashboardSummary(daysBack = 90): Promise<InvoiceDashboardSummary> {
    const result = await safeRequest<InvoiceDashboardSummary>(() =>
      apiClient.get('/api/v1/invoice-analytics/dashboard-summary', {
        params: { days_back: daysBack },
      })
    );
    return ensureSuccess(result, 'Failed to fetch dashboard summary');
  },

  /**
   * Get spending breakdown by vendor
   */
  async getSpendingByVendor(daysBack = 90): Promise<SpendingByVendorResponse> {
    const result = await safeRequest<SpendingByVendorResponse>(() =>
      apiClient.get('/api/v1/invoice-analytics/spending-by-vendor', {
        params: { days_back: daysBack },
      })
    );
    return ensureSuccess(result, 'Failed to fetch vendor spending');
  },

  /**
   * Get weekly spending trend
   */
  async getWeeklyTrend(weeks = 8): Promise<WeeklyTrendResponse> {
    const result = await safeRequest<WeeklyTrendResponse>(() =>
      apiClient.get('/api/v1/invoice-analytics/weekly-trend', {
        params: { weeks },
      })
    );
    return ensureSuccess(result, 'Failed to fetch weekly trend');
  },

  /**
   * Get recent invoices
   */
  async getRecentInvoices(limit = 10): Promise<RecentInvoicesResponse> {
    const result = await safeRequest<RecentInvoicesResponse>(() =>
      apiClient.get('/api/v1/invoice-analytics/recent', {
        params: { limit },
      })
    );
    return ensureSuccess(result, 'Failed to fetch recent invoices');
  },

  /**
   * Get invoices grouped by vendor
   */
  async getInvoicesByVendor(daysBack = 90): Promise<InvoicesByVendorResponse> {
    const result = await safeRequest<InvoicesByVendorResponse>(() =>
      apiClient.get('/api/v1/invoice-analytics/by-vendor', {
        params: { days_back: daysBack },
      })
    );
    return ensureSuccess(result, 'Failed to fetch invoices by vendor');
  },

  /**
   * Get price insights for a specific invoice
   */
  async getInvoiceInsights(invoiceId: string): Promise<InvoiceInsightsResponse> {
    const result = await safeRequest<InvoiceInsightsResponse>(() =>
      apiClient.get(`/api/v1/invoice-analytics/${invoiceId}/insights`)
    );
    return ensureSuccess(result, 'Failed to fetch invoice insights');
  },
};
