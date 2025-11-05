export interface PriceAlert {
  alert_key: string;
  item_description: string;
  vendor_name: string;
  change_percent: number;
  expected_price: number;
  actual_price: number;
  trigger: string;
  date: string;
  triggers?: string[];
  change_percent_28d?: number;
  expected_price_28d?: number;
}

export interface SavingsAlert {
  alert_key: string;
  item_description: string;
  vendor_name: string;
  savings_percent: number;
  expected_price: number;
  actual_price: number;
  savings_amount: number;
  trigger: string;
  date: string;
}

export interface AlertThresholds {
  increase_7day: number;
  increase_28day: number;
  decrease_7day: number;
  decrease_28day: number;
}

export interface PriceAlertsResponse {
  alerts: PriceAlert[];
  total_count: number;
  thresholds: AlertThresholds;
}

export interface SavingsAlertsResponse {
  alerts: SavingsAlert[];
  total_count: number;
  thresholds: AlertThresholds;
}
