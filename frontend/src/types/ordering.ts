export interface OrderingPrediction {
  normalized_ingredient_id: string
  normalized_item_id: string
  canonical_name?: string
  item_name?: string
  vendor_name?: string
  forecast_date: string
  delivery_date?: string
  delivery_window_label?: string | null
  horizon_days: number
  lead_time_days?: number | null
  order_index?: number | null
  forecast_quantity: number
  lower_bound?: number | null
  upper_bound?: number | null
  base_unit?: string
  model_version?: string | null
  generated_at: string
  avg_weekly_usage?: number | null
  avg_quantity_7d?: number | null
  suggested_boxes?: number | null
  pack_label?: string | null
  last_ordered_at?: string | null
  units_per_delivery?: number | null
  deliveries_per_week?: number | null
  orders_last_28d?: number | null
  orders_last_90d?: number | null
  weekly_usage_units?: number | null
  window_used?: string | null
  delivery_pattern_confidence?: number | null
}

export interface OrderingPredictionsResponse {
  predictions: OrderingPrediction[]
  total?: number
  limit?: number
  offset?: number
}

export interface DeliveryPattern {
  vendor_name: string
  delivery_weekdays: number[]
  confidence_score: number
  detection_method: string
  last_detected_at: string
  updated_at?: string
}

export interface DeliveryPatternResponse {
  patterns: DeliveryPattern[]
  refreshed?: boolean
}

