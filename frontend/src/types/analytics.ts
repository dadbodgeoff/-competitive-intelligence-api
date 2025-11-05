/**
 * Price Analytics Types
 * For vendor comparison, savings opportunities, and price trends
 */

export interface PriceTrend {
  date: string;
  price: number;
  vendor_name: string;
  vendor_id: string;
}

export interface VendorPriceComparison {
  vendor_id: string;
  vendor_name: string;
  current_price: number;
  last_ordered: string;
  pack_size?: string;
  price_history: PriceTrend[];
}

export interface CrossVendorPricesResponse {
  success: boolean;
  item: {
    id: string;
    name: string;
    category: string;
  };
  vendor_prices: VendorPriceComparison[];
  vendor_count: number;
  lowest_price: number | null;
  highest_price: number | null;
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
  success: boolean;
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
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return classes[severity];
}
