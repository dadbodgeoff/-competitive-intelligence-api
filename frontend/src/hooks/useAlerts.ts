import { useQuery, useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { alertsApi } from '@/services/api/alertsApi';
import type { PriceAlertsResponse, SavingsAlertsResponse } from '@/types/alerts';

type AlertType = 'price_increase' | 'savings_opportunity';

type ThresholdPayload = {
  price_alert_threshold_7day?: number;
  price_alert_threshold_28day?: number;
  price_drop_alert_threshold_7day?: number;
  price_drop_alert_threshold_28day?: number;
};

export function usePriceAlerts(options?: { enabled?: boolean }) {
  return useQuery<PriceAlertsResponse>({
    queryKey: ['alerts', 'price-increases'],
    queryFn: alertsApi.getPriceIncreaseAlerts,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useSavingsAlerts(options?: { enabled?: boolean }) {
  return useQuery<SavingsAlertsResponse>({
    queryKey: ['alerts', 'savings-opportunities'],
    queryFn: alertsApi.getSavingsOpportunities,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useDismissAlert(alertType: AlertType) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (alertKey: string) => alertsApi.dismissAlert(alertKey, alertType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useUpdateAlertThresholds(
  options?: UseMutationOptions<void, Error, ThresholdPayload, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ThresholdPayload, unknown>({
    mutationFn: (payload) => alertsApi.updateThresholds(payload),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: options?.onError,
    onSettled: (data, error, variables, context, mutation) => {
      options?.onSettled?.(data, error, variables, context, mutation);
    },
  });
}
