/**
 * Dashboard API Client
 * Aggregates data from multiple endpoints for dashboard display
 */

import { apiClient } from './client';

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

export const dashboardApi = {
  /**
   * Get count of negative price alerts (anomalies)
   */
  async getNegativeAlertsCount(): Promise<number> {
    try {
      const response = await apiClient.get(
        '/api/v1/analytics/price-anomalies?days_back=30&min_change_percent=10'
      );
      return response.data?.anomalies?.length || 0;
    } catch (error) {
      console.error('Failed to fetch negative alerts:', error);
      return 0;
    }
  },

  /**
   * Get negative alerts details
   */
  async getNegativeAlerts(): Promise<PriceAnomaly[]> {
    try {
      const response = await apiClient.get(
        '/api/v1/analytics/price-anomalies?days_back=30&min_change_percent=10'
      );
      return response.data?.anomalies || [];
    } catch (error) {
      console.error('Failed to fetch negative alerts:', error);
      return [];
    }
  },

  /**
   * Get count of positive alerts (savings opportunities)
   */
  async getPositiveAlertsCount(): Promise<number> {
    try {
      const response = await apiClient.get(
        '/api/v1/analytics/savings-opportunities?min_savings_percent=5&days_back=30'
      );
      return response.data?.opportunities?.length || 0;
    } catch (error) {
      console.error('Failed to fetch positive alerts:', error);
      return 0;
    }
  },

  /**
   * Get positive alerts details
   */
  async getPositiveAlerts(): Promise<SavingsOpportunity[]> {
    try {
      const response = await apiClient.get(
        '/api/v1/analytics/savings-opportunities?min_savings_percent=5&days_back=30'
      );
      return response.data?.opportunities || [];
    } catch (error) {
      console.error('Failed to fetch positive alerts:', error);
      return [];
    }
  },

  /**
   * Get count of recent invoices (last 7 days)
   */
  async getRecentInvoicesCount(): Promise<number> {
    try {
      // Only fetch first page with minimal data to get total count
      const response = await apiClient.get('/api/v1/invoices?page=1&per_page=10');
      
      // Use pagination metadata for total count
      return response.data?.pagination?.total_count || 0;
    } catch (error) {
      console.error('Failed to fetch recent invoices:', error);
      return 0;
    }
  },

  /**
   * Get count of menu items
   */
  async getMenuItemsCount(): Promise<number> {
    try {
      // Only fetch first page with minimal data to get total count
      const response = await apiClient.get('/api/v1/menu/list?page=1&per_page=10');
      const menus = response.data?.data || [];
      
      // Count total menu items across all menus
      let totalItems = 0;
      for (const menu of menus) {
        totalItems += menu.item_count || 0;
      }
      
      return totalItems;
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
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
    try {
      const response = await apiClient.get(
        `/api/v1/analytics/items-list?days_back=90`
      );
      
      const allItems = response.data?.items || [];
      
      // Sort by most recent first
      const sortedItems = allItems.sort((a: any, b: any) => {
        const dateA = new Date(a.last_paid_date || 0);
        const dateB = new Date(b.last_paid_date || 0);
        return dateB.getTime() - dateA.getTime();
      });

      // Map to our interface - using the correct field names from the API
      const mappedItems: RecentlyOrderedItem[] = sortedItems.map((item: any) => {
        // Determine trend based on price changes
        let trend: 'up' | 'down' | 'stable' = 'stable';
        const priceChange = item.price_change_7day_percent || item.price_change_28day_percent;
        if (priceChange) {
          if (priceChange > 5) trend = 'up';
          else if (priceChange < -5) trend = 'down';
        }

        return {
          item_description: item.description || 'Unknown Item',
          vendor_name: item.last_paid_vendor || 'Unknown Vendor',
          last_price: item.last_paid_price || 0,
          last_ordered: item.last_paid_date || new Date().toISOString(),
          trend,
          price_change_percent: priceChange || 0,
        };
      });

      // Paginate
      const start = page * limit;
      const end = start + limit;
      const paginatedItems = mappedItems.slice(start, end);

      return {
        items: paginatedItems,
        total: mappedItems.length,
      };
    } catch (error) {
      console.error('Failed to fetch recently ordered items:', error);
      return { items: [], total: 0 };
    }
  },
};
