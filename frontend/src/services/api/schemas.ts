import { z } from 'zod';

export const alertThresholdsSchema = z.object({
  increase_7day: z.number(),
  increase_28day: z.number(),
  decrease_7day: z.number(),
  decrease_28day: z.number(),
});

export const priceAlertSchema = z.object({
  alert_key: z.string(),
  item_description: z.string(),
  vendor_name: z.string(),
  change_percent: z.number(),
  expected_price: z.number(),
  actual_price: z.number(),
  trigger: z.string(),
  date: z.string(),
  triggers: z.array(z.string()).optional(),
  change_percent_28d: z.number().optional(),
  expected_price_28d: z.number().optional(),
});

export const priceAlertsResponseSchema = z.object({
  alerts: z.array(priceAlertSchema),
  total_count: z.number(),
  thresholds: alertThresholdsSchema,
});

export const savingsAlertSchema = z.object({
  alert_key: z.string(),
  item_description: z.string(),
  vendor_name: z.string(),
  savings_percent: z.number(),
  expected_price: z.number(),
  actual_price: z.number(),
  savings_amount: z.number(),
  trigger: z.string(),
  date: z.string(),
});

export const savingsAlertsResponseSchema = z.object({
  alerts: z.array(savingsAlertSchema),
  total_count: z.number(),
  thresholds: alertThresholdsSchema,
});

export const savingsOpportunitySchema = z.object({
  item_description: z.string(),
  current_vendor: z.string(),
  current_price: z.number(),
  best_vendor: z.string(),
  best_price: z.number(),
  savings_amount: z.number(),
  savings_percent: z.number(),
});

export const savingsOpportunitiesResponseSchema = z.object({
  opportunities: z.array(savingsOpportunitySchema),
  total_opportunities: z.number(),
  estimated_total_monthly_savings: z.number().optional(),
});

export const priceAnomalySchema = z.object({
  item_description: z.string(),
  vendor_name: z.string(),
  date: z.string(),
  current_price: z.number(),
  expected_price: z.number(),
  change_percent: z.number(),
  anomaly_type: z.enum(['spike', 'drop']),
});

export const priceAnomaliesResponseSchema = z.object({
  anomalies: z.array(priceAnomalySchema),
  total_anomalies: z.number(),
});

export const priceComparisonVendorSchema = z.object({
  vendor_name: z.string(),
  current_price: z.number(),
  avg_price: z.number(),
  min_price: z.number(),
  max_price: z.number(),
  purchase_count: z.number(),
  last_purchase_date: z.string(),
});

export const priceComparisonResponseSchema = z.object({
  item_description: z.string(),
  vendors: z.array(priceComparisonVendorSchema),
  vendor_count: z.number(),
  best_vendor: priceComparisonVendorSchema.nullable().optional(),
  message: z.string().optional(),
});

export const priceTrendPointSchema = z.object({
  date: z.string(),
  price: z.number(),
  vendor_name: z.string(),
  quantity: z.number(),
});

export const priceTrendsResponseSchema = z.object({
  item_description: z.string(),
  trends: z.array(priceTrendPointSchema),
  data_points: z.number(),
});

export const itemsListEntrySchema = z.object({
  description: z.string(),
  last_paid_price: z.number(),
  last_paid_date: z.string(),
  last_paid_vendor: z.string(),
  avg_price_7day: z.number().nullable(),
  avg_price_28day: z.number().nullable(),
  avg_price_90day: z.number(),
  avg_price_all: z.number(),
  price_change_7day_percent: z.number().nullable(),
  price_change_28day_percent: z.number().nullable(),
  min_price: z.number(),
  max_price: z.number(),
  purchase_count: z.number(),
  purchases_last_7days: z.number(),
  purchases_last_28days: z.number(),
});

export const itemsListResponseSchema = z.object({
  items: z.array(itemsListEntrySchema),
  total_items: z.number(),
});

export const itemPurchaseEntrySchema = z.object({
  date: z.string(),
  vendor: z.string(),
  price: z.number(),
  quantity: z.number(),
  invoice_number: z.string(),
});

export const itemPurchaseHistoryResponseSchema = z.object({
  success: z.boolean(),
  item_description: z.string(),
  purchases: z.array(itemPurchaseEntrySchema),
  total_purchases: z.number(),
});

export const vendorPerformanceSchema = z.object({
  vendor_id: z.string().optional(),
  vendor_name: z.string(),
  total_items: z.number(),
  total_purchases: z.number().optional(),
  competitive_items: z.number().optional(),
  expensive_items: z.number().optional(),
  average_price_rank: z.number().optional(),
  competitive_score: z.number().optional(),
  avg_price: z.number().optional(),
  price_volatility: z.number().optional(),
  total_spend: z.number().optional(),
  potential_savings: z.number().optional(),
  analysis_period_days: z.number().optional(),
});

export const vendorPerformanceResponseSchema = z.object({
  success: z.boolean().optional(),
  performance: vendorPerformanceSchema.optional(),
  vendor_name: z.string().optional(),
  total_items: z.number().optional(),
  total_purchases: z.number().optional(),
  avg_price: z.number().optional(),
  price_volatility: z.number().optional(),
  analysis_period_days: z.number().optional(),
  error: z.string().optional(),
});

export const dashboardSummaryResponseSchema = z.object({
  success: z.boolean().optional(),
  unique_items_tracked: z.number(),
  active_vendors: z.number(),
  total_purchases: z.number(),
  total_spend: z.number(),
  analysis_period_days: z.number(),
});

export const orderingPredictionSchema = z.object({
  normalized_ingredient_id: z.string(),
  normalized_item_id: z.string(),
  canonical_name: z.string().optional(),
  item_name: z.string().optional().default("Unknown Item"),
  vendor_name: z.string().optional(),
  forecast_date: z.string(),
  delivery_date: z.string().optional(),
  delivery_window_label: z.string().nullable().optional(),
  horizon_days: z.number(),
  lead_time_days: z.number().nullable().optional(),
  order_index: z.number().nullable().optional(),
  forecast_quantity: z.number(),
  lower_bound: z.number().nullable().optional(),
  upper_bound: z.number().nullable().optional(),
  base_unit: z.string().optional(),
  model_version: z.string().nullable().optional(),
  generated_at: z.string(),
  avg_weekly_usage: z.number().nullable().optional(),
  avg_quantity_7d: z.number().nullable().optional(),
  suggested_boxes: z.number().nullable().optional(),
  pack_label: z.string().nullable().optional(),
  last_ordered_at: z.string().nullable().optional(),
  units_per_delivery: z.number().nullable().optional(),
  deliveries_per_week: z.number().nullable().optional(),
  orders_last_28d: z.number().nullable().optional(),
  orders_last_90d: z.number().nullable().optional(),
  weekly_usage_units: z.number().nullable().optional(),
  window_used: z.string().nullable().optional(),
  delivery_pattern_confidence: z.number().nullable().optional(),
});

export const orderingPredictionsResponseSchema = z.object({
  predictions: z.array(orderingPredictionSchema),
});

export const deliveryPatternSchema = z.object({
  vendor_name: z.string(),
  delivery_weekdays: z.array(z.number()),
  confidence_score: z.number(),
  detection_method: z.string(),
  last_detected_at: z.string(),
  updated_at: z.string().optional(),
});

export const deliveryPatternResponseSchema = z.object({
  patterns: z.array(deliveryPatternSchema),
  refreshed: z.boolean().optional(),
});

export const schedulingSettingsSchema = z.object({
  account_id: z.string(),
  week_start_day: z.number(),
  timezone: z.string(),
  auto_publish: z.boolean(),
  default_shift_length_minutes: z.number(),
});

export const schedulingSettingsResponseSchema = z.object({
  settings: schedulingSettingsSchema,
});

export const schedulingShiftAssignmentSchema = z.object({
  shift_id: z.string(),
  account_id: z.string(),
  member_user_id: z.string(),
  wage_override: z.number().nullable().optional(),
  wage_type_override: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const schedulingShiftSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  week_id: z.string(),
  day_id: z.string(),
  shift_type: z.string(),
  role_label: z.string().nullable().optional(),
  start_time: z.string(),
  end_time: z.string(),
  break_minutes: z.number().nullable().optional(),
  wage_type: z.string().nullable().optional(),
  wage_rate: z.number().nullable().optional(),
  wage_currency: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  assigned_member_id: z.string().nullable().optional(),
  wage_override_cents: z.number().nullable().optional(),
  wage_override_currency: z.string().nullable().optional(),
  shift_notes: z.string().nullable().optional(),
  scheduled_minutes: z.number().nullable().optional(),
  scheduled_cost_cents: z.number().nullable().optional(),
  assignments: z.array(schedulingShiftAssignmentSchema).optional(),
});

export const schedulingDaySchema = z.object({
  id: z.string(),
  account_id: z.string(),
  week_id: z.string(),
  schedule_date: z.string(),
  expected_sales: z.number().nullable().optional(),
  expected_guest_count: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  shifts: z.array(schedulingShiftSchema).optional(),
});

export const schedulingWeekSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  week_start_date: z.string(),
  week_end_date: z.string(),
  status: z.string(),
  expected_sales_total: z.number().nullable().optional(),
  expected_guest_count: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  days: z.array(schedulingDaySchema).optional(),
});

export const schedulingWeeksResponseSchema = z.object({
  weeks: z.array(schedulingWeekSchema),
});

export const schedulingWeekResponseSchema = z.object({
  week: schedulingWeekSchema,
});

export const schedulingDayResponseSchema = z.object({
  day: schedulingDaySchema,
});

export const schedulingShiftResponseSchema = z.object({
  shift: schedulingShiftSchema,
});

export const schedulingShiftAssignmentResponseSchema = z.object({
  assignment: schedulingShiftAssignmentSchema,
});

export const schedulingShiftLiveSessionSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  shift_id: z.string(),
  member_user_id: z.string(),
  started_at: z.string(),
  last_heartbeat_at: z.string(),
  started_rate_cents: z.number().nullable().optional(),
  started_rate_type: z.string().nullable().optional(),
  started_rate_currency: z.string().nullable().optional(),
});

export const schedulingClockInResponseSchema = z.object({
  session: schedulingShiftLiveSessionSchema,
});

export const schedulingShiftClockEntrySchema = z.object({
  id: z.string(),
  account_id: z.string(),
  shift_id: z.string(),
  member_user_id: z.string(),
  clock_in_at: z.string(),
  clock_out_at: z.string().nullable().optional(),
  clock_in_source: z.string(),
  clock_out_source: z.string().nullable().optional(),
  clock_in_note: z.string().nullable().optional(),
  clock_out_note: z.string().nullable().optional(),
  effective_rate_cents: z.number(),
  effective_rate_type: z.string(),
  effective_rate_currency: z.string(),
  total_minutes: z.number().nullable().optional(),
  break_minutes: z.number().nullable().optional(),
});

export const schedulingClockOutResponseSchema = z.object({
  entry: schedulingShiftClockEntrySchema,
});

export const timeClockPinResponseSchema = z.object({
  status: z.enum(['clocked_in', 'clocked_out']),
  account_id: z.string(),
  member_user_id: z.string(),
  member_name: z.string(),
  shift_id: z.string(),
  session_id: z.string().optional(),
  entry_id: z.string().optional(),
  occurred_at: z.string(),
  message: z.string(),
});

export const laborDaySummarySchema = z.object({
  id: z.string(),
  account_id: z.string(),
  week_id: z.string(),
  day_id: z.string(),
  schedule_date: z.string(),
  scheduled_minutes: z.number(),
  scheduled_cost_cents: z.number(),
  actual_minutes: z.number(),
  actual_cost_cents: z.number(),
  variance_minutes: z.number(),
  variance_cost_cents: z.number(),
  completed_minutes: z.number().nullable().optional(),
  completed_cost_cents: z.number().nullable().optional(),
  in_progress_minutes: z.number().nullable().optional(),
  in_progress_cost_cents: z.number().nullable().optional(),
});

export const laborWeekSummarySchema = z.object({
  id: z.string(),
  account_id: z.string(),
  week_id: z.string(),
  week_start_date: z.string(),
  scheduled_minutes: z.number(),
  scheduled_cost_cents: z.number(),
  actual_minutes: z.number(),
  actual_cost_cents: z.number(),
  variance_minutes: z.number(),
  variance_cost_cents: z.number(),
  completed_minutes: z.number().nullable().optional(),
  completed_cost_cents: z.number().nullable().optional(),
  in_progress_minutes: z.number().nullable().optional(),
  in_progress_cost_cents: z.number().nullable().optional(),
});

export const timesheetResponseSchema = z.object({
  week: laborWeekSummarySchema.nullable(),
  days: z.array(laborDaySummarySchema),
});

export const schedulerMemberSchema = z.object({
  user_id: z.string(),
  role: z.string(),
  status: z.string(),
  auth_users: z
    .object({
      id: z.string(),
      email: z.string(),
      first_name: z.string().nullable().optional(),
      last_name: z.string().nullable().optional(),
      raw_user_meta_data: z.record(z.any()).nullable().optional(),
    })
    .nullable()
    .optional(),
  compensation: z
    .object({
      rate_cents: z.number(),
      currency: z.string(),
      rate_type: z.string(),
      effective_at: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export const schedulerTotalsSchema = z.object({
  scheduled_minutes: z.number().nullable().optional(),
  scheduled_labor_cents: z.number().nullable().optional(),
  expected_sales_total: z.number().nullable().optional(),
  labor_percent: z.number().nullable().optional(),
  actual_minutes: z.number().nullable().optional(),
  actual_cost_cents: z.number().nullable().optional(),
  actual_labor_percent: z.number().nullable().optional(),
  in_progress_minutes: z.number().nullable().optional(),
  in_progress_cost_cents: z.number().nullable().optional(),
  completed_minutes: z.number().nullable().optional(),
  completed_cost_cents: z.number().nullable().optional(),
  variance_minutes: z.number().nullable().optional(),
  variance_cost_cents: z.number().nullable().optional(),
});

export const schedulerGridResponseSchema = z.object({
  week: schedulingWeekSchema,
  members: z.array(schedulerMemberSchema),
  totals: schedulerTotalsSchema,
});

export const prepTemplateItemSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  template_id: z.string(),
  name: z.string(),
  menu_item_id: z.string().nullable().optional(),
  default_par: z.number(),
  default_on_hand: z.number(),
  notes: z.string().nullable().optional(),
  display_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const prepTemplateSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(prepTemplateItemSchema).optional(),
});

export const prepTemplatesResponseSchema = z.object({
  templates: z.array(prepTemplateSchema),
});

export const prepTemplateResponseSchema = z.object({
  template: prepTemplateSchema,
});

export const prepTemplateItemResponseSchema = z.object({
  item: prepTemplateItemSchema,
});

export const prepDayItemSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  prep_day_id: z.string(),
  template_item_id: z.string().nullable().optional(),
  name: z.string(),
  menu_item_id: z.string().nullable().optional(),
  par_amount: z.number(),
  on_hand_amount: z.number(),
  total_to_prep: z.number(),
  unit: z.string().nullable().optional(),
  assigned_user_id: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  completion_note: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  display_order: z.number(),
  created_by: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const prepDaySchema = z.object({
  id: z.string(),
  account_id: z.string(),
  prep_date: z.string(),
  status: z.enum(['draft', 'published']),
  template_id: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  locked_by: z.string().nullable().optional(),
  locked_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(prepDayItemSchema).optional(),
});

export const prepDayListResponseSchema = z.object({
  days: z.array(prepDaySchema),
});

export const prepDayResponseSchema = z.object({
  day: prepDaySchema,
});

export const prepDayItemResponseSchema = z.object({
  item: prepDayItemSchema,
});

export const menuSalesRecordSchema = z.object({
  id: z.string(),
  menu_item_id: z.string(),
  menu_item_name: z.string().nullable().optional(),
  menu_item_price_id: z.string().nullable().optional(),
  size_label: z.string().nullable().optional(),
  quantity_sold: z.number(),
  unit_cogs_snapshot: z.number().nullable(),
  unit_menu_price_snapshot: z.number().nullable(),
  total_cogs_snapshot: z.number().nullable(),
  total_revenue_snapshot: z.number().nullable(),
  gross_profit_snapshot: z.number().nullable(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const menuSalesTotalsSchema = z.object({
  total_quantity: z.number(),
  total_cogs: z.number(),
  total_revenue: z.number(),
  total_gross_profit: z.number(),
});

export const dailySalesResponseSchema = z.object({
  entries: z.array(menuSalesRecordSchema),
});

export const recordDailySalesResponseSchema = z.object({
  records: z.array(menuSalesRecordSchema),
  summary: menuSalesTotalsSchema,
});

export const menuSalesSummarySchema = z.object({
  totals: menuSalesTotalsSchema,
  by_date: z.array(
    menuSalesTotalsSchema.extend({
      sale_date: z.string(),
    }),
  ),
  top_items: z.array(
    menuSalesTotalsSchema.extend({
      menu_item_id: z.string(),
      menu_item_name: z.string().optional(),
    }),
  ),
});