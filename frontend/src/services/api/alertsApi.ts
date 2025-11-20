import { apiClient, safeRequest } from './client';
import { priceAlertsResponseSchema, savingsAlertsResponseSchema } from './schemas';
import { parseResponse, ensureResponseSuccess } from './validation';
import type { PriceAlertsResponse, SavingsAlertsResponse } from '@/types/alerts';

export const alertsApi = {
  getPriceIncreaseAlerts: async (): Promise<PriceAlertsResponse> => {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/alerts/price-increases')
    );
    return parseResponse(result, priceAlertsResponseSchema, 'Failed to fetch price increase alerts');
  },

  getSavingsOpportunities: async (): Promise<SavingsAlertsResponse> => {
    const result = await safeRequest<unknown>(() =>
      apiClient.get('/api/v1/alerts/savings-opportunities')
    );
    return parseResponse(result, savingsAlertsResponseSchema, 'Failed to fetch savings opportunities');
  },

  dismissAlert: async (alertKey: string, alertType: string): Promise<void> => {
    const result = await safeRequest(() =>
      apiClient.post('/api/v1/alerts/dismiss', {
        alert_key: alertKey,
        alert_type: alertType,
      })
    );
    ensureResponseSuccess(result, 'Failed to dismiss alert');
  },

  updateThresholds: async (thresholds: {
    price_alert_threshold_7day?: number;
    price_alert_threshold_28day?: number;
    price_drop_alert_threshold_7day?: number;
    price_drop_alert_threshold_28day?: number;
  }): Promise<void> => {
    const result = await safeRequest(() =>
      apiClient.put('/api/v1/alerts/thresholds', thresholds)
    );
    ensureResponseSuccess(result, 'Failed to update alert thresholds');
  },
};
