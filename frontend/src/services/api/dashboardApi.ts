/**
 * Dashboard API Client
 * Aggregates data from multiple endpoints for dashboard display
 */

import { apiClient, safeRequest } from './client';
import { parseResponse } from './validation';
import { z } from 'zod';

export interface DashboardKPIData {
  negativeAlerts: number;
  positiveAlerts: number;
  recentInvoicesCount: number;
  menuItemsCount: number;
}

export interface RecentlyOrderedItem {
  item_description: string;
  vendor_name: string;
  last_price: number;
  last_ordered: string;
  trend: 'up' | 'down' | 'stable';
  price_change_percent?: number;
}

export interface PriceAnomaly {
  item_description: string;
  old_price: number;
  new_price: number;
  change_percent: number;
  vendor_name: string;
  date: string;
}

export interface SavingsOpportunity {
  item_description: string;
  current_vendor: string;
  current_price: number;
  cheaper_vendor: string;
  cheaper_price: number;
  potential_savings: number;
  savings_percent: number;
}

const anomaliesSchema = z
  .object({
    anomalies: z
      .array(
        z
          .object({
            description: z.string().optional(),
            last_paid_vendor: z.string().optional(),
            last_paid_price: z.number().optional(),
            last_paid_date: z.string().optional(),
            price_change_7day_percent: z.number().optional(),
            price_change_28day_percent: z.number().optional(),
          })
          .passthrough()
      )
      .optional(),
    total_anomalies: z.number().optional(),
    success: z.boolean().optional(),
  })
  .passthrough();

const opportunitiesSchema = z
  .object({
    opportunities: z
      .array(
        z
          .object({
            item_description: z.string().optional(),
            current_vendor: z.string().optional(),
            current_price: z.number().optional(),
            cheaper_vendor: z.string().optional(),
            cheaper_price: z.number().optional(),
            potential_savings: z.number().optional(),
            savings_percent: z.number().optional(),
          })
          .passthrough()
      )
      .optional(),
    total_opportunities: z.number().optional(),
    success: z.boolean().optional(),
  })
  .passthrough();

const invoiceListSchema = z
  .object({
    success: z.boolean().optional(),
    data: z.array(z.record(z.any())).optional(),
    pagination: z.object({
      total_count: z.number(),
      page: z.number().optional(),
      per_page: z.number().optional(),
      total_pages: z.number().optional(),
      has_next: z.boolean().optional(),
      has_prev: z.boolean().optional(),
    }),
  })
  .passthrough();

const menuListSchema = z
  .object({
    success: z.boolean().optional(),
    data: z
      .array(
        z
          .object({
            parse_metadata: z
              .union([z.record(z.any()), z.null()])
              .optional(),
            items_saved: z.number().optional(),
            items_count: z.number().optional(),
          })
          .passthrough()
      )
      .optional(),
    pagination: z
      .object({
        total_count: z.number().optional(),
        page: z.number().optional(),
        per_page: z.number().optional(),
        total_pages: z.number().optional(),
        has_next: z.boolean().optional(),
        has_prev: z.boolean().optional(),
      })
      .optional(),
  })
  .passthrough();

const itemsListSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            description: z.string().optional(),
            last_paid_vendor: z.string().optional(),
            last_paid_price: z.number().optional(),
            last_paid_date: z.string().optional(),
            price_change_7day_percent: z.number().optional(),
            price_change_28day_percent: z.number().optional(),
          })
          .passthrough()
      )
      .optional(),
    total_items: z.number().optional(),
    success: z.boolean().optional(),
  })
  .passthrough();

export const dashboardApi = {
  /**
   * Get count of negative price alerts (anomalies)
   */
  async getNegativeAlertsCount(): Promise<number> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/price-anomalies', {
        params: { days_back: 30, min_change_percent: 10 },
      })
    );
    try {
      const parsed = parseResponse(result, anomaliesSchema, 'Failed to fetch negative alerts');
      if (typeof parsed.total_anomalies === 'number') {
        return parsed.total_anomalies;
      }
      return parsed.anomalies?.length ?? 0;
    } catch (error) {
      console.error('Failed to parse negative alerts response', error);
      return 0;
    }
  },

  /**
   * Get negative alerts details
   */
  async getNegativeAlerts(): Promise<PriceAnomaly[]> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/price-anomalies', {
        params: { days_back: 30, min_change_percent: 10 },
      })
    );
    try {
      const parsed = parseResponse(result, anomaliesSchema, 'Failed to fetch negative alerts');
    return (
      parsed.anomalies?.map((item) => ({
        item_description: item.description ?? 'Unknown Item',
        old_price: 0,
        new_price: item.last_paid_price ?? 0,
        change_percent:
          item.price_change_7day_percent ?? item.price_change_28day_percent ?? 0,
        vendor_name: item.last_paid_vendor ?? 'Unknown Vendor',
        date: item.last_paid_date ?? new Date().toISOString(),
      })) ?? []
    );
    } catch (error) {
      console.error('Failed to parse negative alerts response', error);
      return [];
    }
  },

  /**
   * Get count of positive alerts (savings opportunities)
   */
  async getPositiveAlertsCount(): Promise<number> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/savings-opportunities', {
        params: { min_savings_percent: 5, days_back: 30 },
      })
    );
    try {
      const parsed = parseResponse(result, opportunitiesSchema, 'Failed to fetch savings opportunities');
      if (typeof parsed.total_opportunities === 'number') {
        return parsed.total_opportunities;
      }
      return parsed.opportunities?.length ?? 0;
    } catch (error) {
      console.error('Failed to parse positive alerts response', error);
      return 0;
    }
  },

  /**
   * Get positive alerts details
   */
  async getPositiveAlerts(): Promise<SavingsOpportunity[]> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/savings-opportunities', {
        params: { min_savings_percent: 5, days_back: 30 },
      })
    );
    try {
      const parsed = parseResponse(result, opportunitiesSchema, 'Failed to fetch savings opportunities');
    return (
      parsed.opportunities?.map((item) => ({
        item_description: item.item_description ?? 'Unknown Item',
        current_vendor: item.current_vendor ?? 'Unknown Vendor',
        current_price: item.current_price ?? 0,
        cheaper_vendor: item.cheaper_vendor ?? 'Unknown Vendor',
        cheaper_price: item.cheaper_price ?? 0,
        potential_savings: item.potential_savings ?? 0,
        savings_percent: item.savings_percent ?? 0,
      })) ?? []
    );
    } catch (error) {
      console.error('Failed to parse positive alerts response', error);
      return [];
    }
  },

  /**
   * Get count of recent invoices (last 7 days)
   */
  async getRecentInvoicesCount(): Promise<number> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/invoices', {
        params: { page: 1, per_page: 10 },
      })
    );
    try {
      const parsed = parseResponse(result, invoiceListSchema, 'Failed to fetch invoices');
      if (parsed.pagination?.total_count !== undefined) {
        return parsed.pagination.total_count;
      }
      return Array.isArray(parsed.data) ? parsed.data.length : 0;
    } catch (error) {
      console.error('Failed to parse invoices pagination response', error);
      return 0;
    }
  },

  /**
   * Get count of menu items
   */
  async getMenuItemsCount(): Promise<number> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/menu/list', {
        params: { page: 1, per_page: 10 },
      })
    );
    try {
      const parsed = parseResponse(result, menuListSchema, 'Failed to fetch menus');
      const menus = parsed.data ?? [];

      const derivedCount = menus.reduce((total, menu) => {
        const metadata = menu.parse_metadata as
          | { items_saved?: number; items_count?: number; total_items?: number }
          | null
          | undefined;
        const menuLevelCount =
          menu.items_count ??
          menu.items_saved ??
          (metadata && (metadata.items_saved ?? metadata.items_count ?? metadata.total_items));
        if (typeof menuLevelCount === 'number' && Number.isFinite(menuLevelCount)) {
          return total + menuLevelCount;
        }
        return total;
      }, 0);

      if (derivedCount > 0) {
        return derivedCount;
      }

      if (parsed.pagination?.total_count !== undefined) {
        return parsed.pagination.total_count;
      }

      return menus.length;
    } catch (error) {
      console.error('Failed to parse menu list response', error);
      return 0;
    }
  },

  /**
   * Get all KPI data in parallel
   */
  async getKPIData(): Promise<DashboardKPIData> {
    const [negativeAlerts, positiveAlerts, recentInvoicesCount, menuItemsCount] =
      await Promise.all([
        this.getNegativeAlertsCount(),
        this.getPositiveAlertsCount(),
        this.getRecentInvoicesCount(),
        this.getMenuItemsCount(),
      ]);

    return {
      negativeAlerts,
      positiveAlerts,
      recentInvoicesCount,
      menuItemsCount,
    };
  },

  /**
   * Get recently ordered items with pagination
   */
  async getRecentlyOrderedItems(
    page: number = 0,
    limit: number = 10
  ): Promise<{ items: RecentlyOrderedItem[]; total: number }> {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/analytics/items-list', {
        params: { days_back: 90 },
      })
    );
    let allItems: z.infer<typeof itemsListSchema>['items'];
    try {
      const parsed = parseResponse(result, itemsListSchema, 'Failed to fetch recently ordered items');
      allItems = parsed.items ?? [];
    } catch (error) {
      console.error('Failed to parse items list response', error);
      return { items: [], total: 0 };
    }

    const sortedItems = (allItems ?? []).sort((a, b) => {
      const dateA = new Date(a.last_paid_date ?? 0);
      const dateB = new Date(b.last_paid_date ?? 0);
      return dateB.getTime() - dateA.getTime();
    });

    const mappedItems: RecentlyOrderedItem[] = sortedItems.map((item) => {
      let trend: 'up' | 'down' | 'stable' = 'stable';
      const priceChange = item.price_change_7day_percent ?? item.price_change_28day_percent;
      if (priceChange !== undefined && priceChange !== null) {
        if (priceChange > 5) trend = 'up';
        else if (priceChange < -5) trend = 'down';
      }

      return {
        item_description: item.description ?? 'Unknown Item',
        vendor_name: item.last_paid_vendor ?? 'Unknown Vendor',
        last_price: item.last_paid_price ?? 0,
        last_ordered: item.last_paid_date ?? new Date().toISOString(),
        trend,
        price_change_percent: priceChange ?? 0,
      };
    });

    const start = page * limit;
    const pagedItems = mappedItems.slice(start, start + limit);

    return { items: pagedItems, total: mappedItems.length };
  },
};
