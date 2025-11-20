export interface MenuSalesRecord {
  id: string
  menu_item_id: string
  menu_item_name?: string | null
  menu_item_price_id?: string | null
  size_label?: string | null
  quantity_sold: number
  unit_cogs_snapshot: number | null
  unit_menu_price_snapshot: number | null
  total_cogs_snapshot: number | null
  total_revenue_snapshot: number | null
  gross_profit_snapshot: number | null
  metadata?: Record<string, unknown> | null
}

export interface MenuSalesSummaryTotals {
  total_quantity: number
  total_cogs: number
  total_revenue: number
  total_gross_profit: number
}

export interface MenuSalesSummaryByDate extends MenuSalesSummaryTotals {
  sale_date: string
}

export interface MenuSalesSummaryItem extends MenuSalesSummaryTotals {
  menu_item_id: string
  menu_item_name?: string
}

export interface MenuSalesSummary {
  totals: MenuSalesSummaryTotals
  by_date: MenuSalesSummaryByDate[]
  top_items: MenuSalesSummaryItem[]
}

export interface DailySalesResponse {
  entries: MenuSalesRecord[]
}

export interface RecordDailySalesResponse {
  records: MenuSalesRecord[]
  summary: MenuSalesSummaryTotals
}

