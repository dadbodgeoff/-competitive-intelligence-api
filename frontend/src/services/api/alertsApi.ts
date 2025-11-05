import { apiClient } from './client';
import type { PriceAlertsResponse, SavingsAlertsResponse } from '@/types/alerts';

export const alertsApi = {
  getPriceIncreaseAlerts: async (): Promise<PriceAlertsResponse> => {
    const response = await apiClient.get('/api/v1/alerts/price-increases');
    return response.data;
  },

  getSavingsOpportunities: async (): Promise<SavingsAlertsResponse> => {
    const response = await apiClient.get('/api/v1/alerts/savings-opportunities');
    return response.data;
  },

  dismissAlert: async (alertKey: string, alertType: string): Promise<void> => {
    await apiClient.post('/api/v1/alerts/dismiss', {
      alert_key: alertKey,
      alert_type: alertType,
    });
  },

  updateThresholds: async (thresholds: {
    price_alert_threshold_7day?: number;
    price_alert_threshold_28day?: number;
    price_drop_alert_threshold_7day?: number;
    price_drop_alert_threshold_28day?: number;
  }): Promise<void> => {
    await apiClient.put('/api/v1/alerts/thresholds', thresholds);
  },
};
