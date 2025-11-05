-- ============================================================================
-- COMPLETE DATABASE SCHEMA EXPORT
-- Exported from: db.syxquxgynoinzwhwkosa.supabase.co
-- Date: 2025-11-03 14:22:08.395197
-- Includes: Extensions, Tables, Functions, RLS Policies, Triggers, Indexes
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
-- These extensions must be created before the schema

CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Table: analyses
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID,
  restaurant_name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'restaurant'::text,
  review_sources TEXT[] DEFAULT ARRAY['google'::text, 'serpapi'::text],
  time_range TEXT DEFAULT '6_months'::text,
  competitor_count INTEGER DEFAULT 5,
  exclude_seen BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending'::text,
  current_step TEXT,
  total_reviews_analyzed INTEGER,
  llm_provider TEXT,
  llm_cost NUMERIC(10,4),
  processing_time_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  tier VARCHAR(20) DEFAULT 'free'::character varying,
  estimated_cost NUMERIC(10,4) DEFAULT 0.0,
  actual_cost NUMERIC(10,4) DEFAULT 0.0,
  insights_generated INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  estimated_time_remaining_seconds INTEGER,
  analysis_completed_at TIMESTAMP WITH TIME ZONE
);

-- Table: analysis_competitors
CREATE TABLE public.analysis_competitors (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID,
  competitor_id VARCHAR(255),
  competitor_name TEXT NOT NULL,
  rating NUMERIC(2,1),
  review_count INTEGER,
  distance_miles NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: analysis_status_log
CREATE TABLE public.analysis_status_log (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID,
  status VARCHAR(50) NOT NULL,
  current_step VARCHAR(255),
  progress_percentage INTEGER DEFAULT 0,
  estimated_time_remaining_seconds INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: competitor_businesses
CREATE TABLE public.competitor_businesses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL,
  place_id VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  rating NUMERIC(3,2),
  review_count INTEGER,
  price_level INTEGER,
  distance_miles NUMERIC(6,2),
  phone VARCHAR(50),
  website TEXT,
  menu_url TEXT,
  is_selected BOOLEAN DEFAULT false,
  discovery_metadata JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: competitor_menu_analyses
CREATE TABLE public.competitor_menu_analyses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_menu_id UUID NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'discovering'::character varying,
  current_step TEXT,
  competitors_found INTEGER DEFAULT 0,
  competitors_selected INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITHOUT TIME ZONE
);

-- Table: competitor_menu_items
CREATE TABLE public.competitor_menu_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  snapshot_id UUID NOT NULL,
  category_name VARCHAR(100),
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2),
  price_range_low NUMERIC(10,2),
  price_range_high NUMERIC(10,2),
  size_variants JSONB,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: competitor_menu_snapshots
CREATE TABLE public.competitor_menu_snapshots (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL,
  analysis_id UUID NOT NULL,
  menu_source VARCHAR(50),
  menu_url TEXT,
  parse_status VARCHAR(50) DEFAULT 'pending'::character varying,
  parse_metadata JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  parsed_at TIMESTAMP WITHOUT TIME ZONE
);

-- Table: competitor_menus
CREATE TABLE public.competitor_menus (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  competitor_place_id VARCHAR(255) NOT NULL,
  competitor_name VARCHAR(255) NOT NULL,
  menu_data JSONB NOT NULL,
  extraction_method VARCHAR(50) NOT NULL,
  extraction_url VARCHAR(500),
  success_rate NUMERIC(3,2) DEFAULT 1.0,
  item_count INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() + '7 days'::interval),
  last_accessed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: competitors
CREATE TABLE public.competitors (
  id VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  google_place_id TEXT,
  yelp_business_id TEXT,
  category TEXT DEFAULT 'restaurant'::text,
  google_rating NUMERIC(2,1),
  google_review_count INTEGER,
  yelp_rating NUMERIC(2,1),
  yelp_review_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  analysis_id UUID,
  distance_miles NUMERIC(10,2),
  price_level INTEGER,
  business_status VARCHAR(50),
  types TEXT[],
  place_id VARCHAR(255),
  rating NUMERIC(2,1),
  review_count INTEGER
);

-- Table: evidence_reviews
CREATE TABLE public.evidence_reviews (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID,
  competitor_name VARCHAR(255) NOT NULL,
  sentiment_category VARCHAR(20) NOT NULL,
  review_data JSONB NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  source_type VARCHAR(20) DEFAULT 'google_places'::character varying,
  confidence_score NUMERIC(3,2) DEFAULT 1.0,
  source_url TEXT
);

-- Table: excluded_competitors
CREATE TABLE public.excluded_competitors (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID,
  restaurant_id UUID,
  competitor_id VARCHAR(255),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: insights
CREATE TABLE public.insights (
  id TEXT NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID,
  competitor_id VARCHAR(255),
  category TEXT,
  title TEXT NOT NULL,
  description TEXT,
  proof_quote TEXT,
  mention_count INTEGER DEFAULT 0,
  confidence TEXT,
  significance NUMERIC(5,2),
  sentiment TEXT,
  is_filtered_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  competitor_name TEXT
);

-- Table: inventory_alerts
CREATE TABLE public.inventory_alerts (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  inventory_item_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMP WITHOUT TIME ZONE,
  dismissed_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: inventory_items
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  current_quantity NUMERIC(12,3) DEFAULT 0,
  unit_of_measure TEXT NOT NULL,
  average_unit_cost NUMERIC(10,2),
  last_purchase_price NUMERIC(10,2),
  last_purchase_date DATE,
  waste_buffer_percent NUMERIC(5,2) DEFAULT 1.0,
  safety_stock_days NUMERIC(5,2) DEFAULT 2.0,
  par_level NUMERIC(12,3),
  reorder_point NUMERIC(12,3),
  last_counted_at TIMESTAMP WITHOUT TIME ZONE,
  last_counted_quantity NUMERIC(12,3),
  is_perishable BOOLEAN DEFAULT true,
  shelf_life_days INTEGER,
  storage_location TEXT,
  preferred_vendor_id UUID,
  track_by_batch BOOLEAN DEFAULT false,
  minimum_order_quantity NUMERIC(12,3),
  tags TEXT[],
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  base_unit TEXT,
  conversion_factor NUMERIC(12,6),
  last_paid_price NUMERIC(10,2),
  last_paid_date DATE,
  price_7day_avg NUMERIC(10,2),
  price_28day_avg NUMERIC(10,2),
  price_last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: inventory_transactions
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  inventory_item_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  quantity_change NUMERIC(12,3) NOT NULL,
  running_balance NUMERIC(12,3) NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(12,2),
  notes TEXT,
  transaction_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: invoice_items
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL,
  item_number TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  pack_size TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  extended_price NUMERIC(10,2) NOT NULL,
  category TEXT,
  user_corrected BOOLEAN DEFAULT false,
  original_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: invoice_parse_logs
CREATE TABLE public.invoice_parse_logs (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  invoice_id UUID,
  user_id UUID NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER,
  cost NUMERIC(10,6),
  parse_time_seconds INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: invoices
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  vendor_name TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  parse_method TEXT NOT NULL,
  parse_cost NUMERIC(10,6),
  parse_time_seconds INTEGER,
  parse_tokens_used INTEGER,
  status TEXT NOT NULL DEFAULT 'parsed'::text,
  raw_file_url TEXT NOT NULL,
  parsed_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_hash VARCHAR(64)
);

-- Table: item_categories
CREATE TABLE public.item_categories (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_category_id UUID,
  display_order INTEGER,
  icon TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: menu_analyses
CREATE TABLE public.menu_analyses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  restaurant_menu JSONB NOT NULL,
  tier VARCHAR(20) NOT NULL,
  competitor_count INTEGER DEFAULT 2,
  status VARCHAR(50) DEFAULT 'pending'::character varying,
  current_step VARCHAR(255),
  error_message TEXT,
  total_competitors_analyzed INTEGER,
  total_menu_items_compared INTEGER,
  processing_time_seconds INTEGER,
  estimated_cost NUMERIC(10,4),
  actual_cost NUMERIC(10,4),
  llm_provider VARCHAR(50) DEFAULT 'google_gemini'::character varying,
  llm_model VARCHAR(100) DEFAULT 'gemini-2.0-flash-exp'::character varying,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITHOUT TIME ZONE
);

-- Table: menu_categories
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: menu_comparison_insights
CREATE TABLE public.menu_comparison_insights (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL,
  insight_type VARCHAR(50),
  category VARCHAR(100),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  user_item_name VARCHAR(255),
  user_item_price NUMERIC(10,2),
  competitor_item_name VARCHAR(255),
  competitor_item_price NUMERIC(10,2),
  competitor_business_name VARCHAR(255),
  price_difference NUMERIC(10,2),
  price_difference_percent NUMERIC(5,2),
  confidence VARCHAR(20),
  priority INTEGER DEFAULT 0,
  evidence JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: menu_insights
CREATE TABLE public.menu_insights (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  menu_analysis_id UUID,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  confidence VARCHAR(20) NOT NULL,
  significance NUMERIC(4,2),
  proof_quote TEXT,
  mention_count INTEGER DEFAULT 1,
  competitor_source VARCHAR(255),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: menu_item_ingredients
CREATE TABLE public.menu_item_ingredients (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL,
  menu_item_price_id UUID,
  inventory_item_id UUID NOT NULL,
  quantity_per_serving NUMERIC(12,3) NOT NULL,
  unit_of_measure TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: menu_item_matches
CREATE TABLE public.menu_item_matches (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  menu_analysis_id UUID,
  user_item_name VARCHAR(255) NOT NULL,
  user_item_price NUMERIC(10,2),
  user_item_category VARCHAR(100),
  competitor_item_name VARCHAR(255) NOT NULL,
  competitor_name VARCHAR(255) NOT NULL,
  competitor_item_price NUMERIC(10,2),
  match_confidence NUMERIC(3,2) NOT NULL,
  price_difference NUMERIC(10,2),
  price_difference_percent NUMERIC(5,2),
  pricing_recommendation TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: menu_item_prices
CREATE TABLE public.menu_item_prices (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL,
  size_label VARCHAR(50),
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: menu_items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL,
  category_id UUID NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  options JSONB,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: metrics_events
CREATE TABLE public.metrics_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: multi_source_metadata
CREATE TABLE public.multi_source_metadata (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID,
  competitor_id VARCHAR(255),
  google_reviews_count INTEGER DEFAULT 0,
  yelp_reviews_count INTEGER DEFAULT 0,
  web_scraped_count INTEGER DEFAULT 0,
  total_collected INTEGER DEFAULT 0,
  total_after_dedup INTEGER DEFAULT 0,
  total_after_quality INTEGER DEFAULT 0,
  collection_success_rate NUMERIC(5,2),
  collection_cost NUMERIC(8,4),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: pack_size_patterns
CREATE TABLE public.pack_size_patterns (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  pattern TEXT NOT NULL,
  description TEXT,
  example TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: price_history
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  inventory_item_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  pack_size TEXT,
  total_pack_price NUMERIC(10,2),
  invoice_id UUID,
  invoice_date DATE NOT NULL,
  previous_price NUMERIC(10,2),
  price_change_percent NUMERIC(6,2),
  is_price_increase BOOLEAN,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: processed_events
CREATE TABLE public.processed_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_id UUID NOT NULL,
  processed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  processing_result TEXT NOT NULL,
  error_message TEXT
);

-- Table: restaurant_menus
CREATE TABLE public.restaurant_menus (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  menu_version INTEGER DEFAULT 1,
  file_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active'::character varying,
  parse_metadata JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: restaurants
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  category TEXT DEFAULT 'restaurant'::text,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: reviews
CREATE TABLE public.reviews (
  id VARCHAR(255) NOT NULL,
  competitor_id VARCHAR(255),
  external_id VARCHAR(255),
  source VARCHAR(50) NOT NULL,
  author_name VARCHAR(255),
  rating INTEGER,
  text TEXT,
  review_date DATE,
  language VARCHAR(10) DEFAULT 'en'::character varying,
  quality_score NUMERIC(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  source_type VARCHAR(20) DEFAULT 'google_places'::character varying,
  confidence_score NUMERIC(3,2) DEFAULT 1.0,
  source_url TEXT,
  extraction_metadata JSONB
);

-- Table: reviews_archive_metadata
CREATE TABLE public.reviews_archive_metadata (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID,
  competitor_id VARCHAR(255),
  source TEXT,
  s3_bucket TEXT,
  s3_key TEXT,
  review_count INTEGER,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: saved_menu_comparisons
CREATE TABLE public.saved_menu_comparisons (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL,
  user_id UUID NOT NULL,
  report_name VARCHAR(255),
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: seen_competitors
CREATE TABLE public.seen_competitors (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID,
  restaurant_id UUID,
  competitor_id VARCHAR(255),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: streaming_events
CREATE TABLE public.streaming_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  analysis_id UUID,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  progress_percentage INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: subscription_history
CREATE TABLE public.subscription_history (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID,
  previous_tier VARCHAR(50),
  new_tier VARCHAR(50) NOT NULL,
  changed_by UUID,
  change_reason TEXT,
  changed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: subscription_metadata
CREATE TABLE public.subscription_metadata (
  user_id UUID NOT NULL,
  tier VARCHAR(50) NOT NULL,
  started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITHOUT TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  payment_provider VARCHAR(50) DEFAULT 'manual'::character varying,
  external_subscription_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: units_of_measure
CREATE TABLE public.units_of_measure (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  base_unit_code TEXT,
  conversion_to_base NUMERIC(12,6),
  display_order INTEGER,
  commonly_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: user_inventory_preferences
CREATE TABLE public.user_inventory_preferences (
  user_id UUID NOT NULL,
  default_category_order JSONB,
  hidden_categories TEXT[],
  preferred_weight_unit TEXT DEFAULT 'lb'::text,
  preferred_volume_unit TEXT DEFAULT 'ga'::text,
  low_stock_threshold_days NUMERIC(5,2) DEFAULT 3.0,
  price_increase_alert_percent NUMERIC(5,2) DEFAULT 5.0,
  show_unit_conversions BOOLEAN DEFAULT true,
  group_by_vendor BOOLEAN DEFAULT false,
  default_waste_buffers JSONB DEFAULT '{"dairy": 1.2, "frozen": 0.8, "produce": 1.8, "cleaning": 0.1, "proteins": 1.0, "beverages": 0.3, "dry_goods": 0.5, "smallwares": 0.0, "disposables": 0.2, "paper_goods": 0.1}'::jsonb,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: users
CREATE TABLE public.users (
  id UUID NOT NULL,
  first_name TEXT,
  last_name TEXT,
  subscription_tier TEXT DEFAULT 'free'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Table: vendor_item_mappings
CREATE TABLE public.vendor_item_mappings (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  vendor_item_number TEXT NOT NULL,
  vendor_description TEXT NOT NULL,
  inventory_item_id UUID,
  match_confidence NUMERIC(3,2) DEFAULT 0.0,
  match_method TEXT,
  matched_at TIMESTAMP WITHOUT TIME ZONE,
  vendor_pack_size TEXT,
  conversion_to_base_unit NUMERIC(12,3),
  last_price NUMERIC(10,2),
  last_ordered_date DATE,
  needs_review BOOLEAN DEFAULT false,
  is_preferred BOOLEAN DEFAULT false,
  quality_rating INTEGER,
  quality_notes TEXT,
  last_quality_issue_date DATE,
  ordering_notes TEXT,
  lead_time_days INTEGER,
  case_pack_quantity INTEGER,
  inner_pack_quantity INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: vendors
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  vendor_type TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  typical_order_day TEXT,
  delivery_lead_time_days INTEGER DEFAULT 1,
  minimum_order_amount NUMERIC(10,2),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE UNIQUE INDEX analyses_pkey ON public.analyses USING btree (id);
CREATE INDEX idx_analyses_created_at ON public.analyses USING btree (created_at DESC);
CREATE INDEX idx_analyses_current_step ON public.analyses USING btree (current_step);
CREATE INDEX idx_analyses_estimated_cost ON public.analyses USING btree (estimated_cost);
CREATE INDEX idx_analyses_progress ON public.analyses USING btree (progress_percentage);
CREATE INDEX idx_analyses_status ON public.analyses USING btree (status);
CREATE INDEX idx_analyses_tier ON public.analyses USING btree (tier);
CREATE INDEX idx_analyses_user_id ON public.analyses USING btree (user_id);
CREATE INDEX idx_analyses_user_month ON public.analyses USING btree (user_id, created_at);
CREATE UNIQUE INDEX analysis_competitors_analysis_id_competitor_id_key ON public.analysis_competitors USING btree (analysis_id, competitor_id);
CREATE UNIQUE INDEX analysis_competitors_pkey ON public.analysis_competitors USING btree (id);
CREATE INDEX idx_analysis_competitors_analysis_id ON public.analysis_competitors USING btree (analysis_id);
CREATE UNIQUE INDEX analysis_status_log_pkey ON public.analysis_status_log USING btree (id);
CREATE INDEX idx_analysis_status_log_analysis_id ON public.analysis_status_log USING btree (analysis_id);
CREATE INDEX idx_analysis_status_log_created_at ON public.analysis_status_log USING btree (created_at);
CREATE UNIQUE INDEX competitor_businesses_pkey ON public.competitor_businesses USING btree (id);
CREATE INDEX idx_businesses_analysis_id ON public.competitor_businesses USING btree (analysis_id);
CREATE INDEX idx_businesses_place_id ON public.competitor_businesses USING btree (place_id);
CREATE INDEX idx_businesses_selected ON public.competitor_businesses USING btree (analysis_id, is_selected);
CREATE UNIQUE INDEX competitor_menu_analyses_pkey ON public.competitor_menu_analyses USING btree (id);
CREATE INDEX idx_analyses_user_status ON public.competitor_menu_analyses USING btree (user_id, status);
CREATE INDEX idx_competitor_menu_analyses_user_month ON public.competitor_menu_analyses USING btree (user_id, created_at);
CREATE UNIQUE INDEX competitor_menu_items_pkey ON public.competitor_menu_items USING btree (id);
CREATE INDEX idx_items_category ON public.competitor_menu_items USING btree (category_name);
CREATE INDEX idx_items_price ON public.competitor_menu_items USING btree (base_price);
CREATE INDEX idx_items_snapshot_id ON public.competitor_menu_items USING btree (snapshot_id);
CREATE UNIQUE INDEX competitor_menu_snapshots_pkey ON public.competitor_menu_snapshots USING btree (id);
CREATE INDEX idx_snapshots_analysis_id ON public.competitor_menu_snapshots USING btree (analysis_id);
CREATE INDEX idx_snapshots_competitor_id ON public.competitor_menu_snapshots USING btree (competitor_id);
CREATE INDEX idx_snapshots_status ON public.competitor_menu_snapshots USING btree (parse_status);
CREATE UNIQUE INDEX competitor_menus_pkey ON public.competitor_menus USING btree (id);
CREATE INDEX idx_competitor_menus_expires_at ON public.competitor_menus USING btree (expires_at);
CREATE INDEX idx_competitor_menus_extraction_method ON public.competitor_menus USING btree (extraction_method);
CREATE INDEX idx_competitor_menus_place_id ON public.competitor_menus USING btree (competitor_place_id);
CREATE UNIQUE INDEX competitors_google_place_id_yelp_business_id_key ON public.competitors USING btree (google_place_id, yelp_business_id);
CREATE UNIQUE INDEX competitors_pkey ON public.competitors USING btree (id);
CREATE INDEX idx_competitors_analysis_id ON public.competitors USING btree (analysis_id);
CREATE INDEX idx_competitors_category ON public.competitors USING btree (category);
CREATE INDEX idx_competitors_distance ON public.competitors USING btree (distance_miles);
CREATE INDEX idx_competitors_google_rating ON public.competitors USING btree (google_rating);
CREATE INDEX idx_competitors_latitude_longitude ON public.competitors USING btree (latitude, longitude);
CREATE INDEX idx_competitors_location ON public.competitors USING btree (latitude, longitude);
CREATE UNIQUE INDEX evidence_reviews_pkey ON public.evidence_reviews USING btree (id);
CREATE INDEX idx_evidence_reviews_analysis_id ON public.evidence_reviews USING btree (analysis_id);
CREATE INDEX idx_evidence_reviews_competitor ON public.evidence_reviews USING btree (analysis_id, competitor_name);
CREATE INDEX idx_evidence_reviews_source ON public.evidence_reviews USING btree (source_type);
CREATE UNIQUE INDEX excluded_competitors_pkey ON public.excluded_competitors USING btree (id);
CREATE UNIQUE INDEX excluded_competitors_user_id_restaurant_id_competitor_id_key ON public.excluded_competitors USING btree (user_id, restaurant_id, competitor_id);
CREATE INDEX idx_excluded_competitors_user_id ON public.excluded_competitors USING btree (user_id);
CREATE INDEX idx_insights_analysis_id ON public.insights USING btree (analysis_id);
CREATE INDEX idx_insights_competitor_name ON public.insights USING btree (competitor_name);
CREATE INDEX idx_insights_confidence ON public.insights USING btree (confidence);
CREATE UNIQUE INDEX insights_pkey ON public.insights USING btree (id);
CREATE INDEX idx_alerts_user_unread ON public.inventory_alerts USING btree (user_id) WHERE (read_at IS NULL);
CREATE UNIQUE INDEX inventory_alerts_pkey ON public.inventory_alerts USING btree (id);
CREATE INDEX idx_inventory_items_base_unit ON public.inventory_items USING btree (base_unit);
CREATE INDEX idx_inventory_items_category ON public.inventory_items USING btree (category);
CREATE INDEX idx_inventory_items_normalized ON public.inventory_items USING btree (normalized_name);
CREATE INDEX idx_inventory_items_normalized_trgm ON public.inventory_items USING gin (normalized_name gin_trgm_ops);
CREATE INDEX idx_inventory_items_user ON public.inventory_items USING btree (user_id);
CREATE INDEX idx_inventory_storage ON public.inventory_items USING btree (storage_location);
CREATE INDEX idx_inventory_tags ON public.inventory_items USING gin (tags);
CREATE UNIQUE INDEX inventory_items_pkey ON public.inventory_items USING btree (id);
CREATE UNIQUE INDEX unique_user_item ON public.inventory_items USING btree (user_id, normalized_name);
CREATE INDEX idx_transactions_item_date ON public.inventory_transactions USING btree (inventory_item_id, transaction_date DESC);
CREATE INDEX idx_transactions_reference ON public.inventory_transactions USING btree (reference_id, reference_type);
CREATE INDEX idx_transactions_user_date ON public.inventory_transactions USING btree (user_id, transaction_date DESC);
CREATE UNIQUE INDEX inventory_transactions_pkey ON public.inventory_transactions USING btree (id);
CREATE INDEX idx_invoice_items_category ON public.invoice_items USING btree (category);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);
CREATE INDEX idx_invoice_items_item_number ON public.invoice_items USING btree (item_number);
CREATE UNIQUE INDEX invoice_items_pkey ON public.invoice_items USING btree (id);
CREATE INDEX idx_invoice_parse_logs_invoice_id ON public.invoice_parse_logs USING btree (invoice_id);
CREATE INDEX idx_invoice_parse_logs_user_id ON public.invoice_parse_logs USING btree (user_id);
CREATE INDEX idx_parse_logs_created_at ON public.invoice_parse_logs USING btree (created_at DESC);
CREATE INDEX idx_parse_logs_user_id ON public.invoice_parse_logs USING btree (user_id);
CREATE UNIQUE INDEX invoice_parse_logs_pkey ON public.invoice_parse_logs USING btree (id);
CREATE INDEX idx_invoices_created_at ON public.invoices USING btree (created_at DESC);
CREATE INDEX idx_invoices_date ON public.invoices USING btree (invoice_date DESC);
CREATE INDEX idx_invoices_file_hash ON public.invoices USING btree (user_id, file_hash) WHERE (file_hash IS NOT NULL);
CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);
CREATE INDEX idx_invoices_user_id ON public.invoices USING btree (user_id);
CREATE INDEX idx_invoices_user_month ON public.invoices USING btree (user_id, created_at);
CREATE INDEX idx_invoices_vendor ON public.invoices USING btree (vendor_name);
CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);
CREATE UNIQUE INDEX invoices_user_id_vendor_name_invoice_number_invoice_date_key ON public.invoices USING btree (user_id, vendor_name, invoice_number, invoice_date);
CREATE UNIQUE INDEX item_categories_name_key ON public.item_categories USING btree (name);
CREATE UNIQUE INDEX item_categories_pkey ON public.item_categories USING btree (id);
CREATE INDEX idx_menu_analyses_created_at ON public.menu_analyses USING btree (created_at);
CREATE INDEX idx_menu_analyses_status ON public.menu_analyses USING btree (status);
CREATE INDEX idx_menu_analyses_tier ON public.menu_analyses USING btree (tier);
CREATE INDEX idx_menu_analyses_user_id ON public.menu_analyses USING btree (user_id);
CREATE UNIQUE INDEX menu_analyses_pkey ON public.menu_analyses USING btree (id);
CREATE INDEX idx_categories_display_order ON public.menu_categories USING btree (menu_id, display_order);
CREATE INDEX idx_categories_menu_id ON public.menu_categories USING btree (menu_id);
CREATE UNIQUE INDEX menu_categories_menu_id_category_name_key ON public.menu_categories USING btree (menu_id, category_name);
CREATE UNIQUE INDEX menu_categories_pkey ON public.menu_categories USING btree (id);
CREATE INDEX idx_insights_priority ON public.menu_comparison_insights USING btree (analysis_id, priority DESC);
CREATE INDEX idx_insights_type ON public.menu_comparison_insights USING btree (insight_type);
CREATE UNIQUE INDEX menu_comparison_insights_pkey ON public.menu_comparison_insights USING btree (id);
CREATE INDEX idx_menu_insights_analysis_id ON public.menu_insights USING btree (menu_analysis_id);
CREATE INDEX idx_menu_insights_category ON public.menu_insights USING btree (category);
CREATE INDEX idx_menu_insights_confidence ON public.menu_insights USING btree (confidence);
CREATE UNIQUE INDEX menu_insights_pkey ON public.menu_insights USING btree (id);
CREATE INDEX idx_menu_ingredients_inventory ON public.menu_item_ingredients USING btree (inventory_item_id);
CREATE INDEX idx_menu_ingredients_menu_item ON public.menu_item_ingredients USING btree (menu_item_id);
CREATE INDEX idx_menu_ingredients_price ON public.menu_item_ingredients USING btree (menu_item_price_id);
CREATE UNIQUE INDEX menu_item_ingredients_pkey ON public.menu_item_ingredients USING btree (id);
CREATE UNIQUE INDEX unique_menu_inventory_link ON public.menu_item_ingredients USING btree (menu_item_id, menu_item_price_id, inventory_item_id);
CREATE INDEX idx_menu_item_matches_analysis_id ON public.menu_item_matches USING btree (menu_analysis_id);
CREATE INDEX idx_menu_item_matches_confidence ON public.menu_item_matches USING btree (match_confidence);
CREATE UNIQUE INDEX menu_item_matches_pkey ON public.menu_item_matches USING btree (id);
CREATE INDEX idx_prices_item_id ON public.menu_item_prices USING btree (menu_item_id);
CREATE UNIQUE INDEX menu_item_prices_pkey ON public.menu_item_prices USING btree (id);
CREATE INDEX idx_items_category_id ON public.menu_items USING btree (category_id);
CREATE INDEX idx_items_display_order ON public.menu_items USING btree (category_id, display_order);
CREATE INDEX idx_items_menu_id ON public.menu_items USING btree (menu_id);
CREATE UNIQUE INDEX menu_items_pkey ON public.menu_items USING btree (id);
CREATE INDEX idx_metrics_events_created ON public.metrics_events USING btree (created_at);
CREATE INDEX idx_metrics_events_name ON public.metrics_events USING btree (event_name);
CREATE INDEX idx_metrics_events_user ON public.metrics_events USING btree (user_id);
CREATE UNIQUE INDEX metrics_events_pkey ON public.metrics_events USING btree (id);
CREATE INDEX idx_multi_source_analysis ON public.multi_source_metadata USING btree (analysis_id);
CREATE UNIQUE INDEX multi_source_metadata_pkey ON public.multi_source_metadata USING btree (id);
CREATE UNIQUE INDEX pack_size_patterns_pkey ON public.pack_size_patterns USING btree (id);
CREATE INDEX idx_price_history_item_date ON public.price_history USING btree (inventory_item_id, invoice_date DESC);
CREATE INDEX idx_price_history_user_item_date ON public.price_history USING btree (user_id, inventory_item_id, invoice_date DESC);
CREATE INDEX idx_price_history_user_vendor_date ON public.price_history USING btree (user_id, vendor_id, invoice_date DESC);
CREATE INDEX idx_price_history_vendor_date ON public.price_history USING btree (vendor_id, invoice_date DESC);
CREATE UNIQUE INDEX price_history_pkey ON public.price_history USING btree (id);
CREATE INDEX idx_processed_events_lookup ON public.processed_events USING btree (event_type, event_id);
CREATE UNIQUE INDEX processed_events_pkey ON public.processed_events USING btree (id);
CREATE UNIQUE INDEX unique_event ON public.processed_events USING btree (event_type, event_id);
CREATE INDEX idx_menus_status ON public.restaurant_menus USING btree (status);
CREATE INDEX idx_menus_user_id ON public.restaurant_menus USING btree (user_id);
CREATE INDEX idx_menus_user_status ON public.restaurant_menus USING btree (user_id, status);
CREATE UNIQUE INDEX restaurant_menus_pkey ON public.restaurant_menus USING btree (id);
CREATE UNIQUE INDEX restaurant_menus_user_id_menu_version_key ON public.restaurant_menus USING btree (user_id, menu_version);
CREATE UNIQUE INDEX restaurants_pkey ON public.restaurants USING btree (id);
CREATE INDEX idx_reviews_competitor_id ON public.reviews USING btree (competitor_id);
CREATE INDEX idx_reviews_confidence ON public.reviews USING btree (confidence_score);
CREATE INDEX idx_reviews_date ON public.reviews USING btree (review_date);
CREATE INDEX idx_reviews_quality ON public.reviews USING btree (quality_score);
CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);
CREATE INDEX idx_reviews_serpapi_source ON public.reviews USING btree (source) WHERE ((source)::text = 'serpapi'::text);
CREATE INDEX idx_reviews_source ON public.reviews USING btree (source);
CREATE INDEX idx_reviews_source_type ON public.reviews USING btree (source_type);
CREATE UNIQUE INDEX reviews_competitor_id_source_external_id_key ON public.reviews USING btree (competitor_id, source, external_id);
CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);
CREATE UNIQUE INDEX reviews_archive_metadata_pkey ON public.reviews_archive_metadata USING btree (id);
CREATE INDEX idx_saved_archived ON public.saved_menu_comparisons USING btree (user_id, is_archived);
CREATE INDEX idx_saved_created_at ON public.saved_menu_comparisons USING btree (created_at DESC);
CREATE INDEX idx_saved_user_id ON public.saved_menu_comparisons USING btree (user_id);
CREATE UNIQUE INDEX saved_menu_comparisons_pkey ON public.saved_menu_comparisons USING btree (id);
CREATE INDEX idx_seen_competitors_user_id ON public.seen_competitors USING btree (user_id);
CREATE UNIQUE INDEX seen_competitors_pkey ON public.seen_competitors USING btree (id);
CREATE UNIQUE INDEX seen_competitors_user_id_restaurant_id_competitor_id_key ON public.seen_competitors USING btree (user_id, restaurant_id, competitor_id);
CREATE INDEX idx_streaming_events_analysis_id ON public.streaming_events USING btree (analysis_id);
CREATE INDEX idx_streaming_events_type ON public.streaming_events USING btree (event_type);
CREATE UNIQUE INDEX streaming_events_pkey ON public.streaming_events USING btree (id);
CREATE INDEX idx_subscription_history_changed_at ON public.subscription_history USING btree (changed_at DESC);
CREATE INDEX idx_subscription_history_user_id ON public.subscription_history USING btree (user_id);
CREATE UNIQUE INDEX subscription_history_pkey ON public.subscription_history USING btree (id);
CREATE INDEX idx_subscription_metadata_expires_at ON public.subscription_metadata USING btree (expires_at);
CREATE INDEX idx_subscription_metadata_tier ON public.subscription_metadata USING btree (tier);
CREATE UNIQUE INDEX subscription_metadata_pkey ON public.subscription_metadata USING btree (user_id);
CREATE UNIQUE INDEX units_of_measure_pkey ON public.units_of_measure USING btree (id);
CREATE UNIQUE INDEX units_of_measure_unit_code_key ON public.units_of_measure USING btree (unit_code);
CREATE INDEX idx_user_preferences_user_id ON public.user_inventory_preferences USING btree (user_id);
CREATE UNIQUE INDEX user_inventory_preferences_pkey ON public.user_inventory_preferences USING btree (user_id);
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);
CREATE INDEX idx_vendor_mappings_confidence ON public.vendor_item_mappings USING btree (match_confidence);
CREATE INDEX idx_vendor_mappings_inventory ON public.vendor_item_mappings USING btree (inventory_item_id);
CREATE INDEX idx_vendor_mappings_method ON public.vendor_item_mappings USING btree (match_method);
CREATE INDEX idx_vendor_mappings_needs_review ON public.vendor_item_mappings USING btree (user_id, needs_review) WHERE (needs_review = true);
CREATE INDEX idx_vendor_mappings_vendor_item ON public.vendor_item_mappings USING btree (vendor_id, vendor_item_number);
CREATE UNIQUE INDEX unique_vendor_item ON public.vendor_item_mappings USING btree (user_id, vendor_id, vendor_item_number);
CREATE UNIQUE INDEX vendor_item_mappings_pkey ON public.vendor_item_mappings USING btree (id);
CREATE INDEX idx_vendors_user ON public.vendors USING btree (user_id);
CREATE UNIQUE INDEX unique_user_vendor ON public.vendors USING btree (user_id, normalized_name);
CREATE UNIQUE INDEX vendors_pkey ON public.vendors USING btree (id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_vendor_competitive_score(target_vendor_id uuid, target_user_id uuid, days_back integer DEFAULT 90)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    total_items INT;
    best_price_count INT;
    score DECIMAL(5,2);
BEGIN
    -- Count items where this vendor has the best price
    WITH vendor_ranks AS (
        SELECT 
            ph.inventory_item_id,
            ph.vendor_id,
            RANK() OVER (PARTITION BY ph.inventory_item_id ORDER BY AVG(ph.unit_price)) as price_rank
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        GROUP BY ph.inventory_item_id, ph.vendor_id
    )
    SELECT 
        COUNT(DISTINCT inventory_item_id),
        COUNT(DISTINCT CASE WHEN price_rank = 1 THEN inventory_item_id END)
    INTO total_items, best_price_count
    FROM vendor_ranks
    WHERE vendor_id = target_vendor_id;
    
    -- Calculate score
    IF total_items > 0 THEN
        score := (best_price_count::DECIMAL / total_items::DECIMAL) * 100;
    ELSE
        score := 50.0;
    END IF;
    
    RETURN score;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_and_reserve_usage_atomic(p_user_id uuid, p_operation_type text, p_max_allowed integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_current_count INTEGER;
    v_tier TEXT;
BEGIN
    -- Get user's tier with row lock (prevents concurrent checks)
    SELECT subscription_tier INTO v_tier
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;  -- Lock this row until transaction completes
    
    -- Count current usage this month based on operation type
    IF p_operation_type = 'analysis' THEN
        SELECT COUNT(*) INTO v_current_count
        FROM analyses
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', NOW());
        
    ELSIF p_operation_type = 'invoice_parse' THEN
        SELECT COUNT(*) INTO v_current_count
        FROM invoices
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', NOW());
        
    ELSIF p_operation_type = 'menu_comparison' THEN
        SELECT COUNT(*) INTO v_current_count
        FROM competitor_menu_analyses
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', NOW());
        
    ELSE
        -- Unknown operation type
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'unknown_operation_type',
            'current_count', 0,
            'max_allowed', p_max_allowed
        );
    END IF;
    
    -- Check if limit exceeded
    IF v_current_count >= p_max_allowed THEN
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'limit_exceeded',
            'current_count', v_current_count,
            'max_allowed', p_max_allowed,
            'tier', v_tier
        );
    END IF;
    
    -- Within limits - allow operation
    RETURN jsonb_build_object(
        'allowed', TRUE,
        'current_count', v_current_count,
        'max_allowed', p_max_allowed,
        'tier', v_tier,
        'remaining', p_max_allowed - v_current_count - 1
    );
    
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_duplicate_invoice(target_user_id uuid, invoice_number text, vendor_name text, invoice_date date, total_amount numeric, tolerance numeric DEFAULT 0.01)
 RETURNS TABLE(is_duplicate boolean, duplicate_type text, existing_invoice_id uuid, existing_total numeric, total_difference numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE
    existing_record RECORD;
BEGIN
    -- Check for exact match first
    SELECT id, total INTO existing_record
    FROM invoices
    WHERE user_id = target_user_id
    AND invoice_number = check_duplicate_invoice.invoice_number
    AND vendor_name = check_duplicate_invoice.vendor_name
    AND invoice_date = check_duplicate_invoice.invoice_date
    LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            TRUE, 
            'exact'::TEXT, 
            existing_record.id, 
            existing_record.total,
            ABS(existing_record.total - total_amount);
        RETURN;
    END IF;
    
    -- Check for near-duplicate (same vendor, similar date, similar total)
    SELECT id, total INTO existing_record
    FROM invoices
    WHERE user_id = target_user_id
    AND vendor_name = check_duplicate_invoice.vendor_name
    AND invoice_date BETWEEN (check_duplicate_invoice.invoice_date - INTERVAL '1 day') 
                         AND (check_duplicate_invoice.invoice_date + INTERVAL '1 day')
    AND ABS(total - total_amount) <= tolerance
    LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            TRUE, 
            'near'::TEXT, 
            existing_record.id, 
            existing_record.total,
            ABS(existing_record.total - total_amount);
        RETURN;
    END IF;
    
    -- No duplicate found
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::UUID, NULL::DECIMAL, NULL::DECIMAL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_operation_limit(p_user_id uuid, p_operation_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_tier TEXT;
    v_limits JSONB;
    v_max_allowed INTEGER;
BEGIN
    -- Get user tier
    SELECT subscription_tier INTO v_tier
    FROM users
    WHERE id = p_user_id;
    
    IF v_tier IS NULL THEN
        v_tier := 'free';  -- Default to free tier
    END IF;
    
    -- Get tier limits
    v_limits := get_tier_limits(v_tier);
    
    -- Extract specific limit
    IF p_operation_type = 'analysis' THEN
        v_max_allowed := (v_limits->>'analyses_per_month')::INTEGER;
    ELSIF p_operation_type = 'invoice_parse' THEN
        v_max_allowed := (v_limits->>'invoices_per_month')::INTEGER;
    ELSIF p_operation_type = 'menu_comparison' THEN
        v_max_allowed := (v_limits->>'menu_comparisons_per_month')::INTEGER;
    ELSE
        v_max_allowed := 0;
    END IF;
    
    -- Check and reserve atomically
    RETURN check_and_reserve_usage_atomic(p_user_id, p_operation_type, v_max_allowed);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_expired_competitor_menus()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.competitor_menus 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_invoice_with_cascade(target_invoice_id uuid, target_user_id uuid, item_descriptions text[])
 RETURNS TABLE(success boolean, invoice_items_deleted integer, inventory_items_deleted integer, error_message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    invoice_items_count INT := 0;
    inventory_items_count INT := 0;
    invoice_exists BOOLEAN := FALSE;
BEGIN
    -- Check if invoice exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM invoices 
        WHERE id = target_invoice_id AND user_id = target_user_id
    ) INTO invoice_exists;
    
    IF NOT invoice_exists THEN
        RETURN QUERY SELECT FALSE, 0, 0, 'Invoice not found or access denied'::TEXT;
        RETURN;
    END IF;
    
    -- Start transaction (function is already in transaction context)
    
    -- Count items before deletion
    SELECT COUNT(*) INTO invoice_items_count
    FROM invoice_items 
    WHERE invoice_id = target_invoice_id;
    
    -- Delete the invoice (invoice_items will cascade via FK)
    DELETE FROM invoices 
    WHERE id = target_invoice_id AND user_id = target_user_id;
    
    -- CASCADE: Delete inventory_items that match descriptions (user-scoped)
    IF array_length(item_descriptions, 1) > 0 THEN
        DELETE FROM inventory_items 
        WHERE user_id = target_user_id 
        AND name = ANY(item_descriptions);
        
        GET DIAGNOSTICS inventory_items_count = ROW_COUNT;
    END IF;
    
    -- Return success
    RETURN QUERY SELECT TRUE, invoice_items_count, inventory_items_count, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Transaction will be rolled back automatically
        RETURN QUERY SELECT FALSE, 0, 0, SQLERRM::TEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.detect_price_anomalies(target_user_id uuid, days_back integer DEFAULT 90, std_dev_threshold numeric DEFAULT 2.0)
 RETURNS TABLE(item_id uuid, item_name text, vendor_id uuid, vendor_name text, current_price numeric, expected_price numeric, deviation_percent numeric, anomaly_type text, severity text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH price_stats AS (
        SELECT 
            ph.inventory_item_id,
            ph.vendor_id,
            ph.unit_price as current_price,
            AVG(ph2.unit_price) as avg_price,
            STDDEV(ph2.unit_price) as std_dev,
            ph.invoice_date
        FROM price_history ph
        JOIN price_history ph2 ON ph.inventory_item_id = ph2.inventory_item_id
            AND ph2.invoice_date < ph.invoice_date
            AND ph2.invoice_date >= CURRENT_DATE - days_back
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        GROUP BY ph.inventory_item_id, ph.vendor_id, ph.unit_price, ph.invoice_date
        HAVING COUNT(ph2.id) >= 3  -- Need enough historical data
    ),
    anomalies AS (
        SELECT 
            ps.inventory_item_id,
            ps.vendor_id,
            ps.current_price,
            ps.avg_price as expected_price,
            ABS((ps.current_price - ps.avg_price) / ps.avg_price * 100) as deviation_percent,
            CASE 
                WHEN ps.current_price > ps.avg_price THEN 'spike'
                ELSE 'drop'
            END as anomaly_type,
            ABS((ps.current_price - ps.avg_price) / NULLIF(ps.std_dev, 0)) as z_score
        FROM price_stats ps
        WHERE ps.std_dev > 0
            AND ABS((ps.current_price - ps.avg_price) / ps.std_dev) >= std_dev_threshold
    )
    SELECT 
        a.inventory_item_id,
        ii.name as item_name,
        a.vendor_id,
        v.name as vendor_name,
        a.current_price,
        a.expected_price,
        a.deviation_percent,
        a.anomaly_type,
        CASE 
            WHEN a.z_score >= 3.0 THEN 'high'
            WHEN a.z_score >= 2.5 THEN 'medium'
            ELSE 'low'
        END as severity
    FROM anomalies a
    JOIN inventory_items ii ON a.inventory_item_id = ii.id
    JOIN vendors v ON a.vendor_id = v.id
    ORDER BY a.z_score DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.find_savings_opportunities(target_user_id uuid, min_savings_percent numeric DEFAULT 5.0, days_back integer DEFAULT 90)
 RETURNS TABLE(item_id uuid, item_name text, current_vendor_id uuid, current_vendor_name text, current_price numeric, best_vendor_id uuid, best_vendor_name text, best_price numeric, savings_amount numeric, savings_percent numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH latest_purchases AS (
        SELECT DISTINCT ON (ph.inventory_item_id)
            ph.inventory_item_id,
            ph.vendor_id as current_vendor_id,
            ph.unit_price as current_price,
            ph.invoice_date
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        ORDER BY ph.inventory_item_id, ph.invoice_date DESC
    ),
    best_prices AS (
        SELECT DISTINCT ON (ph.inventory_item_id)
            ph.inventory_item_id,
            ph.vendor_id as best_vendor_id,
            ph.unit_price as best_price
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        ORDER BY ph.inventory_item_id, ph.unit_price ASC
    )
    SELECT 
        lp.inventory_item_id,
        ii.name as item_name,
        lp.current_vendor_id,
        cv.name as current_vendor_name,
        lp.current_price,
        bp.best_vendor_id,
        bv.name as best_vendor_name,
        bp.best_price,
        (lp.current_price - bp.best_price) as savings_amount,
        ((lp.current_price - bp.best_price) / lp.current_price * 100) as savings_percent
    FROM latest_purchases lp
    JOIN best_prices bp ON lp.inventory_item_id = bp.inventory_item_id
    JOIN inventory_items ii ON lp.inventory_item_id = ii.id
    JOIN vendors cv ON lp.current_vendor_id = cv.id
    JOIN vendors bv ON bp.best_vendor_id = bv.id
    WHERE lp.current_vendor_id != bp.best_vendor_id
        AND ((lp.current_price - bp.best_price) / lp.current_price * 100) >= min_savings_percent
    ORDER BY savings_amount DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.find_similar_items(target_name text, target_user_id uuid, similarity_threshold double precision DEFAULT 0.3, result_limit integer DEFAULT 10)
 RETURNS TABLE(id uuid, name text, normalized_name text, category text, unit_of_measure text, current_quantity numeric, similarity_score double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.normalized_name,
        i.category,
        i.unit_of_measure,
        i.current_quantity,
        similarity(i.normalized_name, target_name) as similarity_score
    FROM inventory_items i
    WHERE i.user_id = target_user_id
    AND similarity(i.normalized_name, target_name) > similarity_threshold
    ORDER BY similarity_score DESC
    LIMIT result_limit;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_active_menu(p_user_id uuid)
 RETURNS TABLE(menu_id uuid, restaurant_name character varying, menu_version integer, category_id uuid, category_name character varying, category_order integer, item_id uuid, item_name character varying, item_description text, item_options jsonb, item_notes text, item_order integer, price_id uuid, size_label character varying, price numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS menu_id,
        m.restaurant_name,
        m.menu_version,
        c.id AS category_id,
        c.category_name,
        c.display_order AS category_order,
        i.id AS item_id,
        i.item_name,
        i.description AS item_description,
        i.options AS item_options,
        i.notes AS item_notes,
        i.display_order AS item_order,
        p.id AS price_id,
        p.size_label,
        p.price
    FROM restaurant_menus m
    LEFT JOIN menu_categories c ON c.menu_id = m.id
    LEFT JOIN menu_items i ON i.category_id = c.id
    LEFT JOIN menu_item_prices p ON p.menu_item_id = i.id
    WHERE m.user_id = p_user_id
    AND m.status = 'active'
    ORDER BY c.display_order, i.display_order, p.price;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_alert_threshold(target_user_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    threshold_value DECIMAL;
BEGIN
    SELECT low_stock_threshold_days
    INTO threshold_value
    FROM user_inventory_preferences
    WHERE user_id = target_user_id;
    
    -- Return default if not found
    RETURN COALESCE(threshold_value, 3.0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_items_price_summary(target_user_id uuid)
 RETURNS TABLE(item_id uuid, item_name text, last_paid_price numeric, last_paid_date date, last_paid_vendor text, avg_price_7day numeric, avg_price_28day numeric, price_trend text, has_recent_data boolean)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        m.item_id,
        m.item_name,
        m.last_paid_price,
        m.last_paid_date,
        m.last_paid_vendor_name,
        m.avg_price_7day,
        m.avg_price_28day,
        CASE 
            WHEN m.price_change_7day_percent > 5 THEN 'increasing'
            WHEN m.price_change_7day_percent < -5 THEN 'decreasing'
            ELSE 'stable'
        END as price_trend,
        (m.last_paid_date >= CURRENT_DATE - INTERVAL '7 days') as has_recent_data
    FROM get_item_price_metrics(target_user_id, NULL) m
    ORDER BY m.last_paid_date DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_comparison_insights(p_analysis_id uuid)
 RETURNS TABLE(insight_id uuid, insight_type character varying, category character varying, title text, description text, user_item_name character varying, user_item_price numeric, competitor_item_name character varying, competitor_item_price numeric, competitor_business_name character varying, price_difference numeric, price_difference_percent numeric, confidence character varying, priority integer, evidence jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        mci.id AS insight_id,
        mci.insight_type,
        mci.category,
        mci.title,
        mci.description,
        mci.user_item_name,
        mci.user_item_price,
        mci.competitor_item_name,
        mci.competitor_item_price,
        mci.competitor_business_name,
        mci.price_difference,
        mci.price_difference_percent,
        mci.confidence,
        mci.priority,
        mci.evidence
    FROM menu_comparison_insights mci
    WHERE mci.analysis_id = p_analysis_id
    ORDER BY mci.priority DESC, mci.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_fuzzy_matching_stats(target_user_id uuid)
 RETURNS TABLE(total_mappings bigint, exact_matches bigint, fuzzy_auto_matches bigint, fuzzy_review_matches bigint, fuzzy_confirmed_matches bigint, manual_matches bigint, new_items bigint, pending_review bigint, avg_confidence numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_mappings,
        COUNT(*) FILTER (WHERE match_method = 'exact') as exact_matches,
        COUNT(*) FILTER (WHERE match_method = 'fuzzy_auto') as fuzzy_auto_matches,
        COUNT(*) FILTER (WHERE match_method = 'fuzzy_review') as fuzzy_review_matches,
        COUNT(*) FILTER (WHERE match_method = 'fuzzy_confirmed') as fuzzy_confirmed_matches,
        COUNT(*) FILTER (WHERE match_method = 'manual') as manual_matches,
        COUNT(*) FILTER (WHERE match_method = 'new') as new_items,
        COUNT(*) FILTER (WHERE needs_review = true) as pending_review,
        AVG(match_confidence) as avg_confidence
    FROM vendor_item_mappings
    WHERE user_id = target_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_item_price_metrics(target_user_id uuid, target_item_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(item_id uuid, item_name text, last_paid_price numeric, last_paid_date date, last_paid_vendor_id uuid, last_paid_vendor_name text, avg_price_7day numeric, avg_price_28day numeric, price_change_7day_percent numeric, price_change_28day_percent numeric, total_purchases_7day integer, total_purchases_28day integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH item_list AS (
        -- Get all items or specific item
        SELECT 
            ii.id,
            ii.name
        FROM public.inventory_items ii
        WHERE ii.user_id = target_user_id
            AND (target_item_id IS NULL OR ii.id = target_item_id)
    ),
    last_purchase AS (
        -- Get most recent purchase for each item
        SELECT DISTINCT ON (ph.inventory_item_id)
            ph.inventory_item_id,
            ph.unit_price as last_price,
            ph.invoice_date as last_date,
            ph.vendor_id,
            v.name as vendor_name
        FROM public.price_history ph
        JOIN public.vendors v ON ph.vendor_id = v.id
        WHERE ph.user_id = target_user_id
        ORDER BY ph.inventory_item_id, ph.invoice_date DESC
    ),
    avg_7day AS (
        -- Calculate 7-day average
        SELECT 
            ph.inventory_item_id,
            AVG(ph.unit_price) as avg_price,
            COUNT(*) as purchase_count
        FROM public.price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY ph.inventory_item_id
    ),
    avg_28day AS (
        -- Calculate 28-day average
        SELECT 
            ph.inventory_item_id,
            AVG(ph.unit_price) as avg_price,
            COUNT(*) as purchase_count
        FROM public.price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - INTERVAL '28 days'
        GROUP BY ph.inventory_item_id
    )
    SELECT 
        il.id,
        il.name,
        lp.last_price,
        lp.last_date,
        lp.vendor_id,
        lp.vendor_name,
        a7.avg_price,
        a28.avg_price,
        -- Calculate % change from 7-day avg to last price
        CASE 
            WHEN a7.avg_price IS NOT NULL AND a7.avg_price > 0 
            THEN ((lp.last_price - a7.avg_price) / a7.avg_price * 100)
            ELSE NULL
        END as price_change_7day_percent,
        -- Calculate % change from 28-day avg to last price
        CASE 
            WHEN a28.avg_price IS NOT NULL AND a28.avg_price > 0 
            THEN ((lp.last_price - a28.avg_price) / a28.avg_price * 100)
            ELSE NULL
        END as price_change_28day_percent,
        COALESCE(a7.purchase_count, 0)::INT,
        COALESCE(a28.purchase_count, 0)::INT
    FROM item_list il
    LEFT JOIN last_purchase lp ON il.id = lp.inventory_item_id
    LEFT JOIN avg_7day a7 ON il.id = a7.inventory_item_id
    LEFT JOIN avg_28day a28 ON il.id = a28.inventory_item_id
    WHERE lp.last_price IS NOT NULL  -- Only return items with price history
    ORDER BY il.name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_items_with_price_changes(target_user_id uuid, min_change_percent numeric DEFAULT 10.0, days_to_compare integer DEFAULT 7)
 RETURNS TABLE(item_id uuid, item_name text, last_paid_price numeric, comparison_avg_price numeric, price_change_percent numeric, change_type text, last_vendor text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        m.item_id,
        m.item_name,
        m.last_paid_price,
        CASE 
            WHEN days_to_compare = 7 THEN m.avg_price_7day
            ELSE m.avg_price_28day
        END as comparison_avg,
        CASE 
            WHEN days_to_compare = 7 THEN m.price_change_7day_percent
            ELSE m.price_change_28day_percent
        END as change_percent,
        CASE 
            WHEN days_to_compare = 7 AND m.price_change_7day_percent > 0 THEN 'increase'
            WHEN days_to_compare = 28 AND m.price_change_28day_percent > 0 THEN 'increase'
            ELSE 'decrease'
        END as change_type,
        m.last_paid_vendor_name
    FROM get_item_price_metrics(target_user_id, NULL) m
    WHERE (
        (days_to_compare = 7 AND ABS(m.price_change_7day_percent) >= min_change_percent)
        OR
        (days_to_compare = 28 AND ABS(m.price_change_28day_percent) >= min_change_percent)
    )
    ORDER BY 
        CASE 
            WHEN days_to_compare = 7 THEN ABS(m.price_change_7day_percent)
            ELSE ABS(m.price_change_28day_percent)
        END DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_menu_comparison_analysis(p_analysis_id uuid)
 RETURNS TABLE(analysis_id uuid, user_menu_id uuid, restaurant_name character varying, location character varying, status character varying, competitor_id uuid, competitor_name character varying, competitor_address text, is_selected boolean, snapshot_id uuid, menu_source character varying, parse_status character varying, item_id uuid, category_name character varying, item_name character varying, item_description text, base_price numeric, size_variants jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        a.id AS analysis_id,
        a.user_menu_id,
        a.restaurant_name,
        a.location,
        a.status,
        cb.id AS competitor_id,
        cb.business_name AS competitor_name,
        cb.address AS competitor_address,
        cb.is_selected,
        cms.id AS snapshot_id,
        cms.menu_source,
        cms.parse_status,
        cmi.id AS item_id,
        cmi.category_name,
        cmi.item_name,
        cmi.description AS item_description,
        cmi.base_price,
        cmi.size_variants
    FROM competitor_menu_analyses a
    LEFT JOIN competitor_businesses cb ON cb.analysis_id = a.id
    LEFT JOIN competitor_menu_snapshots cms ON cms.competitor_id = cb.id
    LEFT JOIN competitor_menu_items cmi ON cmi.snapshot_id = cms.id
    WHERE a.id = p_analysis_id
    ORDER BY cb.business_name, cmi.category_name, cmi.item_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_system_time()
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN NOW();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_tier_limits(p_tier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN CASE p_tier
        WHEN 'free' THEN jsonb_build_object(
            'analyses_per_month', 5,
            'invoices_per_month', 10,
            'menu_comparisons_per_month', 2
        )
        WHEN 'premium' THEN jsonb_build_object(
            'analyses_per_month', -1,  -- Unlimited
            'invoices_per_month', -1,
            'menu_comparisons_per_month', -1
        )
        WHEN 'enterprise' THEN jsonb_build_object(
            'analyses_per_month', -1,
            'invoices_per_month', -1,
            'menu_comparisons_per_month', -1
        )
        ELSE jsonb_build_object(
            'analyses_per_month', 0,
            'invoices_per_month', 0,
            'menu_comparisons_per_month', 0
        )
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_subscription_details(target_user_id uuid)
 RETURNS TABLE(user_id uuid, email text, subscription_tier character varying, started_at timestamp without time zone, expires_at timestamp without time zone, is_active boolean, payment_provider character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        au.email,
        u.subscription_tier,
        COALESCE(sm.started_at, u.created_at) as started_at,
        sm.expires_at,
        u.is_active,
        COALESCE(sm.payment_provider, 'manual') as payment_provider
    FROM public.users u
    LEFT JOIN auth.users au ON u.id = au.id
    LEFT JOIN public.subscription_metadata sm ON u.id = sm.user_id
    WHERE u.id = target_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_usage_stats(target_user_id uuid, operation_type text, time_window_hours integer DEFAULT 24)
 RETURNS TABLE(operation_count integer, first_operation_time timestamp without time zone, last_operation_time timestamp without time zone, within_limit boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
    count_result INT := 0;
    first_time TIMESTAMP;
    last_time TIMESTAMP;
    time_cutoff TIMESTAMP;
BEGIN
    time_cutoff := NOW() - (time_window_hours || ' hours')::INTERVAL;
    
    -- Count operations based on type
    IF operation_type = 'invoice_parse' THEN
        SELECT COUNT(*), MIN(created_at), MAX(created_at)
        INTO count_result, first_time, last_time
        FROM invoices
        WHERE user_id = target_user_id
        AND created_at >= time_cutoff;
        
    ELSIF operation_type = 'analysis' THEN
        SELECT COUNT(*), MIN(created_at), MAX(created_at)
        INTO count_result, first_time, last_time
        FROM analyses
        WHERE user_id = target_user_id
        AND created_at >= time_cutoff;
        
    END IF;
    
    -- Return results (limit checking done in application layer)
    RETURN QUERY SELECT 
        count_result,
        first_time,
        last_time,
        TRUE; -- Application will determine if within limit
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_vendor_price_comparison(target_item_id uuid, target_user_id uuid, days_back integer DEFAULT 90)
 RETURNS TABLE(vendor_id uuid, vendor_name text, current_price numeric, avg_price numeric, min_price numeric, max_price numeric, purchase_count bigint, last_purchase_date date, price_trend text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH vendor_prices AS (
        SELECT 
            ph.vendor_id,
            v.name as vendor_name,
            ph.unit_price,
            ph.invoice_date,
            ROW_NUMBER() OVER (PARTITION BY ph.vendor_id ORDER BY ph.invoice_date DESC) as rn
        FROM price_history ph
        JOIN vendors v ON ph.vendor_id = v.id
        WHERE ph.inventory_item_id = target_item_id
            AND ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
    ),
    vendor_stats AS (
        SELECT 
            vp.vendor_id,
            vp.vendor_name,
            MAX(CASE WHEN vp.rn = 1 THEN vp.unit_price END) as current_price,
            AVG(vp.unit_price) as avg_price,
            MIN(vp.unit_price) as min_price,
            MAX(vp.unit_price) as max_price,
            COUNT(*) as purchase_count,
            MAX(vp.invoice_date) as last_purchase_date
        FROM vendor_prices vp
        GROUP BY vp.vendor_id, vp.vendor_name
    )
    SELECT 
        vs.vendor_id,
        vs.vendor_name,
        vs.current_price,
        vs.avg_price,
        vs.min_price,
        vs.max_price,
        vs.purchase_count,
        vs.last_purchase_date,
        CASE 
            WHEN vs.current_price > vs.avg_price * 1.05 THEN 'increasing'
            WHEN vs.current_price < vs.avg_price * 0.95 THEN 'decreasing'
            ELSE 'stable'
        END as price_trend
    FROM vendor_stats vs
    ORDER BY vs.current_price ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_waste_buffer(target_user_id uuid, target_category text)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    buffer_value DECIMAL;
BEGIN
    SELECT (default_waste_buffers->>target_category)::DECIMAL
    INTO buffer_value
    FROM user_inventory_preferences
    WHERE user_id = target_user_id;
    
    -- Return default if not found
    RETURN COALESCE(buffer_value, 1.0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.users (id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_competitor_menu_access()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_inventory_item_price_tracking()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_item_id UUID;
    v_user_id UUID;
    v_last_price DECIMAL(10,2);
    v_last_date DATE;
    v_avg_7day DECIMAL(10,2);
    v_avg_28day DECIMAL(10,2);
BEGIN
    -- Get the item_id from the trigger
    IF TG_OP = 'DELETE' THEN
        v_item_id := OLD.inventory_item_id;
        v_user_id := OLD.user_id;
    ELSE
        v_item_id := NEW.inventory_item_id;
        v_user_id := NEW.user_id;
    END IF;

    -- Get most recent price
    SELECT unit_price, invoice_date
    INTO v_last_price, v_last_date
    FROM price_history
    WHERE inventory_item_id = v_item_id
      AND user_id = v_user_id
    ORDER BY invoice_date DESC, created_at DESC
    LIMIT 1;

    -- Calculate 7-day average
    SELECT AVG(unit_price)
    INTO v_avg_7day
    FROM price_history
    WHERE inventory_item_id = v_item_id
      AND user_id = v_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '7 days';

    -- Calculate 28-day average
    SELECT AVG(unit_price)
    INTO v_avg_28day
    FROM price_history
    WHERE inventory_item_id = v_item_id
      AND user_id = v_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '28 days';

    -- Update inventory_items table
    UPDATE inventory_items
    SET 
        last_paid_price = v_last_price,
        last_paid_date = v_last_date,
        price_7day_avg = v_avg_7day,
        price_28day_avg = v_avg_28day,
        price_last_updated_at = NOW()
    WHERE id = v_item_id
      AND user_id = v_user_id;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_inventory_item_price_tracking_for_item(p_item_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_last_price DECIMAL(10,2);
    v_last_date DATE;
    v_avg_7day DECIMAL(10,2);
    v_avg_28day DECIMAL(10,2);
BEGIN
    -- Get most recent price
    SELECT unit_price, invoice_date
    INTO v_last_price, v_last_date
    FROM price_history
    WHERE inventory_item_id = p_item_id
      AND user_id = p_user_id
    ORDER BY invoice_date DESC, created_at DESC
    LIMIT 1;

    -- Calculate 7-day average
    SELECT AVG(unit_price)
    INTO v_avg_7day
    FROM price_history
    WHERE inventory_item_id = p_item_id
      AND user_id = p_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '7 days';

    -- Calculate 28-day average
    SELECT AVG(unit_price)
    INTO v_avg_28day
    FROM price_history
    WHERE inventory_item_id = p_item_id
      AND user_id = p_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '28 days';

    -- Update inventory_items table
    UPDATE inventory_items
    SET 
        last_paid_price = v_last_price,
        last_paid_date = v_last_date,
        price_7day_avg = v_avg_7day,
        price_28day_avg = v_avg_28day,
        price_last_updated_at = NOW()
    WHERE id = p_item_id
      AND user_id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_subscription_tier(target_user_id uuid, new_tier character varying, admin_user_id uuid DEFAULT NULL::uuid, reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    old_tier VARCHAR(50);
BEGIN
    -- Get current tier
    SELECT subscription_tier INTO old_tier
    FROM public.users
    WHERE id = target_user_id;

    -- Update user tier
    UPDATE public.users
    SET subscription_tier = new_tier,
        updated_at = NOW()
    WHERE id = target_user_id;

    -- Record in history
    INSERT INTO public.subscription_history (
        user_id,
        previous_tier,
        new_tier,
        changed_by,
        change_reason
    ) VALUES (
        target_user_id,
        old_tier,
        new_tier,
        admin_user_id,
        reason
    );

    -- Update or create metadata
    INSERT INTO public.subscription_metadata (
        user_id,
        tier,
        started_at,
        payment_provider,
        notes
    ) VALUES (
        target_user_id,
        new_tier,
        NOW(),
        'manual',
        reason
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        tier = new_tier,
        started_at = NOW(),
        notes = reason,
        updated_at = NOW();

    RAISE NOTICE 'Updated user % from % to %', target_user_id, old_tier, new_tier;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_menu_structure(menu_json jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    -- Check if menu has required structure
    IF NOT (menu_json ? 'categories') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if categories is an array
    IF jsonb_typeof(menu_json->'categories') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Additional validation can be added here
    RETURN TRUE;
END;
$function$
;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE public.streaming_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_parse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seen_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excluded_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews_archive_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_item_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_menu_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_menu_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_comparison_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_menu_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.competitor_menu_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_menus_access BEFORE UPDATE ON public.competitor_menus FOR EACH ROW EXECUTE FUNCTION update_competitor_menu_access();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_analyses_updated_at BEFORE UPDATE ON public.menu_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_price_tracking_delete AFTER DELETE ON public.price_history FOR EACH ROW EXECUTE FUNCTION update_inventory_item_price_tracking();
CREATE TRIGGER trigger_update_price_tracking_insert AFTER INSERT ON public.price_history FOR EACH ROW EXECUTE FUNCTION update_inventory_item_price_tracking();
CREATE TRIGGER trigger_update_price_tracking_update AFTER UPDATE ON public.price_history FOR EACH ROW EXECUTE FUNCTION update_inventory_item_price_tracking();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.restaurant_menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_updated_at BEFORE UPDATE ON public.saved_menu_comparisons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_inventory_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_item_mappings_updated_at BEFORE UPDATE ON public.vendor_item_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_mappings_updated_at BEFORE UPDATE ON public.vendor_item_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

ALTER TABLE public.analyses ADD CONSTRAINT analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
ALTER TABLE public.analysis_competitors ADD CONSTRAINT analysis_competitors_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id) ON DELETE CASCADE;
ALTER TABLE public.analysis_competitors ADD CONSTRAINT analysis_competitors_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES public.competitors (id);
ALTER TABLE public.analysis_status_log ADD CONSTRAINT analysis_status_log_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id);
ALTER TABLE public.competitor_businesses ADD CONSTRAINT competitor_businesses_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.competitor_menu_analyses (id) ON DELETE CASCADE;
ALTER TABLE public.competitor_menu_analyses ADD CONSTRAINT competitor_menu_analyses_user_menu_id_fkey FOREIGN KEY (user_menu_id) REFERENCES public.restaurant_menus (id) ON DELETE CASCADE;
ALTER TABLE public.competitor_menu_items ADD CONSTRAINT competitor_menu_items_snapshot_id_fkey FOREIGN KEY (snapshot_id) REFERENCES public.competitor_menu_snapshots (id) ON DELETE CASCADE;
ALTER TABLE public.competitor_menu_snapshots ADD CONSTRAINT competitor_menu_snapshots_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.competitor_menu_analyses (id) ON DELETE CASCADE;
ALTER TABLE public.competitor_menu_snapshots ADD CONSTRAINT competitor_menu_snapshots_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES public.competitor_businesses (id) ON DELETE CASCADE;
ALTER TABLE public.competitors ADD CONSTRAINT competitors_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id);
ALTER TABLE public.evidence_reviews ADD CONSTRAINT evidence_reviews_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id) ON DELETE CASCADE;
ALTER TABLE public.excluded_competitors ADD CONSTRAINT excluded_competitors_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES public.competitors (id);
ALTER TABLE public.excluded_competitors ADD CONSTRAINT excluded_competitors_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants (id) ON DELETE CASCADE;
ALTER TABLE public.excluded_competitors ADD CONSTRAINT excluded_competitors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
ALTER TABLE public.insights ADD CONSTRAINT insights_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id) ON DELETE CASCADE;
ALTER TABLE public.insights ADD CONSTRAINT insights_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES public.competitors (id);
ALTER TABLE public.inventory_alerts ADD CONSTRAINT inventory_alerts_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items (id) ON DELETE CASCADE;
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items (id) ON DELETE CASCADE;
ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices (id) ON DELETE CASCADE;
ALTER TABLE public.invoice_parse_logs ADD CONSTRAINT invoice_parse_logs_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices (id) ON DELETE SET NULL;
ALTER TABLE public.item_categories ADD CONSTRAINT item_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.item_categories (id) ON DELETE CASCADE;
ALTER TABLE public.menu_analyses ADD CONSTRAINT menu_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id);
ALTER TABLE public.menu_categories ADD CONSTRAINT menu_categories_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.restaurant_menus (id) ON DELETE CASCADE;
ALTER TABLE public.menu_comparison_insights ADD CONSTRAINT menu_comparison_insights_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.competitor_menu_analyses (id) ON DELETE CASCADE;
ALTER TABLE public.menu_insights ADD CONSTRAINT menu_insights_menu_analysis_id_fkey FOREIGN KEY (menu_analysis_id) REFERENCES public.menu_analyses (id) ON DELETE CASCADE;
ALTER TABLE public.menu_item_ingredients ADD CONSTRAINT menu_item_ingredients_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items (id) ON DELETE RESTRICT;
ALTER TABLE public.menu_item_ingredients ADD CONSTRAINT menu_item_ingredients_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items (id) ON DELETE CASCADE;
ALTER TABLE public.menu_item_ingredients ADD CONSTRAINT menu_item_ingredients_menu_item_price_id_fkey FOREIGN KEY (menu_item_price_id) REFERENCES public.menu_item_prices (id) ON DELETE CASCADE;
ALTER TABLE public.menu_item_matches ADD CONSTRAINT menu_item_matches_menu_analysis_id_fkey FOREIGN KEY (menu_analysis_id) REFERENCES public.menu_analyses (id) ON DELETE CASCADE;
ALTER TABLE public.menu_item_prices ADD CONSTRAINT menu_item_prices_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items (id) ON DELETE CASCADE;
ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.menu_categories (id) ON DELETE CASCADE;
ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.restaurant_menus (id) ON DELETE CASCADE;
ALTER TABLE public.multi_source_metadata ADD CONSTRAINT multi_source_metadata_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id) ON DELETE CASCADE;
ALTER TABLE public.price_history ADD CONSTRAINT price_history_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items (id) ON DELETE CASCADE;
ALTER TABLE public.price_history ADD CONSTRAINT price_history_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors (id) ON DELETE CASCADE;
ALTER TABLE public.restaurant_menus ADD CONSTRAINT restaurant_menus_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
ALTER TABLE public.restaurants ADD CONSTRAINT restaurants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES public.competitors (id);
ALTER TABLE public.reviews_archive_metadata ADD CONSTRAINT reviews_archive_metadata_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id) ON DELETE CASCADE;
ALTER TABLE public.reviews_archive_metadata ADD CONSTRAINT reviews_archive_metadata_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES public.competitors (id);
ALTER TABLE public.saved_menu_comparisons ADD CONSTRAINT saved_menu_comparisons_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.competitor_menu_analyses (id) ON DELETE CASCADE;
ALTER TABLE public.seen_competitors ADD CONSTRAINT seen_competitors_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES public.competitors (id);
ALTER TABLE public.seen_competitors ADD CONSTRAINT seen_competitors_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants (id) ON DELETE CASCADE;
ALTER TABLE public.seen_competitors ADD CONSTRAINT seen_competitors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
ALTER TABLE public.streaming_events ADD CONSTRAINT streaming_events_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses (id);
ALTER TABLE public.subscription_history ADD CONSTRAINT subscription_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users (id);
ALTER TABLE public.subscription_history ADD CONSTRAINT subscription_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
ALTER TABLE public.subscription_metadata ADD CONSTRAINT subscription_metadata_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;
ALTER TABLE public.vendor_item_mappings ADD CONSTRAINT vendor_item_mappings_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items (id) ON DELETE SET NULL;
ALTER TABLE public.vendor_item_mappings ADD CONSTRAINT vendor_item_mappings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors (id) ON DELETE CASCADE;
