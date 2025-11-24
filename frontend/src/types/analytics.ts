/**
 * Price Analytics Types
 * For vendor comparison, savings opportunities, and price trends
 */

export interface PriceTrendPoint {
  date: string;
  price: number;
  vendor_name: string;
  quantity: number;
}

export interface PriceTrendsResponse {
  item_description: string;
  trends: PriceTrendPoint[];
  data_points: number;
}

export interface PriceComparisonVendor {
  vendor_name: string;
  current_price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  purchase_count: number;
  last_purchase_date: string;
}

export interface PriceComparisonResponse {
  item_description: string;
  vendors: PriceComparisonVendor[];
  vendor_count: number;
  best_vendor?: PriceComparisonVendor | null;
  message?: string;
}

export interface SavingsOpportunity {
  item_description: string;
  current_vendor: string;
  current_price: number;
  best_vendor: string;
  best_price: number;
  savings_amount: number;
  savings_percent: number;
}

export interface SavingsOpportunitiesResponse {
  opportunities: SavingsOpportunity[];
  total_opportunities: number;
  estimated_total_monthly_savings: number;
}

export interface PriceAnomaly {
  item_description: string;
  vendor_name: string;
  date: string;
  current_price: number;
  expected_price: number;
  change_percent: number;
  anomaly_type: 'spike' | 'drop';
}

export interface PriceAnomaliesResponse {
  anomalies: PriceAnomaly[];
  total_anomalies: number;
}

export interface VendorPerformance {
  vendor_id: string;
  vendor_name: string;
  total_items: number;
  competitive_items: number;
  expensive_items: number;
  average_price_rank: number;
  competitive_score: number;
  total_spend: number;
  potential_savings: number;
}

export interface VendorPerformanceResponse {
  success?: boolean;
  performance: VendorPerformance;
}

export interface DashboardSummary {
  unique_items_tracked: number;
  active_vendors: number;
  total_purchases: number;
  total_spend: number;
  analysis_period_days: number;
}

export interface DashboardSummaryResponse {
  success?: boolean;
  unique_items_tracked: number;
  active_vendors: number;
  total_purchases: number;
  total_spend: number;
  analysis_period_days: number;
}

export interface ItemsListEntry {
  description: string;
  last_paid_price: number;
  last_paid_date: string;
  last_paid_vendor: string;
  avg_price_7day: number | null;
  avg_price_28day: number | null;
  avg_price_90day: number;
  avg_price_all: number;
  price_change_7day_percent: number | null;
  price_change_28day_percent: number | null;
  min_price: number;
  max_price: number;
  purchase_count: number;
  purchases_last_7days: number;
  purchases_last_28days: number;
}

export interface ItemsListResponse {
  items: ItemsListEntry[];
  total_items: number;
}

export interface ItemPurchaseEntry {
  date: string;
  vendor: string;
  price: number;
  quantity: number;
  invoice_number: string;
}

export interface ItemPurchaseHistoryResponse {
  success?: boolean;
  item_description: string;
  purchases: ItemPurchaseEntry[];
  total_purchases: number;
}

// Chart data types
export interface PriceChartData {
  date: string;
  price: number;
  vendor?: string;
}

export interface VendorComparisonChartData {
  vendor: string;
  avgPrice: number;
  itemCount: number;
  competitiveScore: number;
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'emerald',
    medium: 'amber',
    high: 'red',
  };
  return colors[severity];
}

export function getSeverityBadgeClass(severity: 'low' | 'medium' | 'high'): string {
  const classes = {
    low: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    medium: 'bg-primary-600/20 text-primary-400 border-primary-600/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return classes[severity];
}
