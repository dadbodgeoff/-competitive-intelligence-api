/**
 * Menu Comparison Types
 * TypeScript definitions for menu comparison feature
 */

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface StartComparisonRequest {
  restaurant_name: string;
  location: string;
  category?: string;
  radius_miles?: number;
}

export interface SelectCompetitorsRequest {
  analysis_id: string;
  competitor_ids: [string, string]; // Exactly 2 competitors
}

export interface SaveComparisonRequest {
  analysis_id: string;
  report_name?: string;
  notes?: string;
}

// ============================================================================
// Data Models
// ============================================================================

export interface CompetitorInfo {
  id: string; // place_id
  business_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number; // 1-5 stars
  review_count?: number;
  price_level?: number; // 1-4 ($-$$$$)
  distance_miles?: number;
  phone?: string;
  website?: string;
  menu_url?: string;
  is_selected: boolean;
  menu_items?: ParsedMenuItem[]; // Parsed menu items for this competitor
}

export interface MenuItemPrice {
  size?: string; // "Small", "Large", null for single price
  price: number;
}

export interface ParsedMenuItem {
  id: string;
  category_name?: string; // "Pizza", "Appetizers", etc.
  item_name: string;
  description?: string;
  base_price?: number; // Lowest price
  price_range_low?: number;
  price_range_high?: number;
  size_variants?: MenuItemPrice[];
  notes?: string;
}

export interface ComparisonInsight {
  id: string;
  insight_type: 'pricing_gap' | 'missing_item' | 'overpriced_item' | 'underpriced_item' | 'category_gap' | 'opportunity';
  category?: string;
  title: string;
  description: string;
  user_item_name?: string;
  user_item_price?: number;
  competitor_item_name?: string;
  competitor_item_price?: number;
  competitor_business_name?: string;
  price_difference?: number;
  price_difference_percent?: number;
  confidence: 'high' | 'medium' | 'low';
  priority: number; // 0-100
  evidence?: Record<string, any>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DiscoveryResponse {
  success: boolean;
  analysis_id: string;
  competitors_found: number;
  competitors: CompetitorInfo[];
  selected_competitors: string[]; // IDs of auto-selected competitors
  message: string;
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: 'discovering' | 'selecting' | 'analyzing' | 'completed' | 'failed';
  current_step?: string;
  competitors_found: number;
  competitors_selected: number;
  location?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ComparisonResultsResponse {
  success: boolean;
  analysis_id: string;
  restaurant_name: string;
  location: string;
  status: string;
  competitors: CompetitorInfo[];
  insights: ComparisonInsight[];
  total_insights: number;
  high_priority_insights: number;
  metadata: {
    competitors_analyzed: number;
    analysis_status: string;
  };
  created_at: string;
  completed_at?: string;
}

export interface SavedComparisonSummary {
  id: string;
  analysis_id: string;
  report_name?: string;
  restaurant_name: string;
  location: string;
  competitors_count: number;
  insights_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedComparisonsListResponse {
  success: boolean;
  data: SavedComparisonSummary[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    next_page: number | null;
    prev_page: number | null;
  };
}

// ============================================================================
// Streaming Event Types
// ============================================================================

export interface StreamingEvent {
  type: 'competitors_selected' | 'user_menu_loaded' | 'parsing_competitor_menu' | 'competitor_menu_parsed' | 'llm_analysis_started' | 'analysis_complete' | 'error';
  data: {
    message?: string;
    progress?: number;
    competitor_name?: string;
    items_found?: number;
    insights_generated?: number;
    error?: string;
  };
}

// ============================================================================
// UI State Types
// ============================================================================

export interface MenuComparisonState {
  currentStep: 'start' | 'discover' | 'select' | 'parse' | 'review' | 'save';
  analysisId?: string;
  
  // Discovery step
  discoveryForm: {
    restaurant_name: string;
    location: string;
    category: string;
    radius_miles: number;
  };
  
  // Competitors data
  competitors: CompetitorInfo[];
  selectedCompetitors: string[]; // Array of 2 competitor IDs
  
  // Parsing progress
  parseProgress: {
    currentCompetitor?: string;
    progress: number; // 0-100
    message: string;
    isComplete: boolean;
  };
  
  // Results
  results?: {
    analysis: ComparisonResultsResponse;
    menuItems: ParsedMenuItem[];
  };
  
  // Loading states
  isLoading: boolean;
  error?: string;
}

export interface ParsedCompetitorMenu {
  competitor_id: string;
  competitor_name: string;
  menu_items: ParsedMenuItem[];
  parse_metadata: {
    items_extracted: number;
    success: boolean;
    model_used: string;
    parse_time_seconds: number;
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface CompetitorSelectorProps {
  competitors: CompetitorInfo[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  maxSelection?: number;
}

export interface MenuItemsTableProps {
  competitor: CompetitorInfo;
  menuItems: ParsedMenuItem[];
  onItemClick?: (item: ParsedMenuItem) => void;
}

export interface ComparisonSummaryProps {
  analysis: ComparisonResultsResponse;
  competitors: CompetitorInfo[];
  menuItems: ParsedMenuItem[];
}

export interface SaveComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { report_name?: string; notes?: string }) => void;
  analysisId: string;
  restaurantName: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type ComparisonStatus = 'discovering' | 'selecting' | 'analyzing' | 'completed' | 'failed';

export type InsightType = 'pricing_gap' | 'missing_item' | 'overpriced_item' | 'underpriced_item' | 'category_gap' | 'opportunity';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DeleteConfirmation {
  type: 'analysis' | 'saved_comparison';
  id: string;
  name: string;
  relatedData: {
    competitors: number;
    menu_items: number;
    insights: number;
    saved_comparisons?: number;
  };
}