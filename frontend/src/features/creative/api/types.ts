import type { AxiosError } from 'axios';

export interface DesiredOutputs {
  variants: number;
  dimensions: string;
  format: string;
  aspect_ratio?: string | null;
  background?: string | null;
}

export interface ThemeSummary {
  id: string;
  theme_slug: string;
  name: string;
  description?: string | null;
  restaurant_vertical: string;
  default_palette: Record<string, unknown>;
  default_fonts: Record<string, unknown>;
  default_hashtags: string[];
  category?: string | null;
  hero_image_url?: string | null;
  icon_name?: string | null;
}

export interface TemplateSummary {
  id: string;
  slug: string;
  display_name?: string | null;
  description?: string | null;
  use_case?: string | null;
  best_for?: string[] | null;
  variation_tags: string[];
  input_schema: TemplateInputSchema;
  prompt_version?: string | null;
  thumbnail_url?: string | null;
  preview_image_url?: string | null;
  example_output_url?: string | null;
  usage_count?: number;
  last_used_at?: string | null;
}

export interface TemplateInputSchema {
  required?: string[];
  optional?: string[];
  types?: Record<string, 'currency' | 'integer' | 'string'>;
  defaults?: Record<string, string>;
  examples?: Record<string, string>;
}

export interface VariationSummary {
  style_seed?: string;
  noise_level?: number;
  style_notes?: string[];
  texture?: string;
  palette?: Record<string, unknown>;
  style_suffix?: string;
}

export interface StartGenerationRequest {
  template_id: string;
  theme_id: string;
  user_inputs: Record<string, string>;
  brand_profile_id?: string;
  brand_overrides?: Record<string, unknown>;
  style_preferences?: Record<string, unknown>;
  desired_outputs?: Partial<DesiredOutputs>;
  generation_metadata?: Record<string, unknown>;
  cost_estimate?: number;
}

export interface StartGenerationResponse {
  job_id: string;
  nano_job_id: string;
  status: string;
  progress: number;
  created_at: string;
  variation_summary: VariationSummary;
}

export interface TemplatePreviewRequest {
  template_id: string;
  user_inputs?: Record<string, string>;
  style_preferences?: Record<string, unknown>;
}

export interface TemplatePreviewResponse {
  sections: Record<string, string>;
  variation_summary?: VariationSummary | null;
}

export interface CreativeAsset {
  id?: string;
  variant_label?: string | null;
  asset_url: string;
  preview_url?: string | null;
  width?: number | null;
  height?: number | null;
  file_size_bytes?: number | null;
  metadata: Record<string, unknown>;
}

export interface CreativeJobEvent {
  id?: string;
  event_type: string;
  progress?: number | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface CreativeJobSummary {
  id: string;
  status: string;
  progress: number;
  template_slug: string;
  template_version?: string | null;
  template_id?: string | null;
  theme_id?: string | null;
  created_at: string;
  completed_at?: string | null;
  error_message?: string | null;
  nano_job_id?: string | null;
}

export interface JobListResponse {
  data: CreativeJobSummary[];
  total_count: number;
  count?: number;
}

export interface BrandProfileSummary {
  id: string;
  brand_name: string;
  palette: Record<string, unknown>;
  typography: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_default: boolean;
  updated_at?: string;
  // Phase 1 fields
  brand_voice?: string;
  brand_tone?: string;
  voice_description?: string;
  visual_styles?: string[];
  cuisine_type?: string;
  cuisine_specialties?: string[];
  atmosphere_tags?: string[];
  target_demographic?: string;
  // Phase 2 fields
  logo_url?: string;
  logo_placement?: string;
  logo_watermark_style?: string;
  prohibited_elements?: string[];
  allergen_warnings?: string[];
  cultural_sensitivities?: string[];
  primary_social_platforms?: string[];
  preferred_aspect_ratios?: string[];
  brand_hashtags?: string[];
  social_media_handle?: string;
  // Phase 3 fields
  active_seasons?: string[];
  recurring_events?: Array<{name: string; day: string; description?: string}>;
  holiday_participation?: string[];
  seasonal_menu_rotation?: boolean;
  location_type?: string;
  regional_style?: string;
  local_landmarks?: string;
  city?: string;
  state?: string;
  country?: string;
  price_range?: string;
  value_proposition?: string;
  average_check_size?: number;
  positioning_statement?: string;
}

export interface CreativeJobDetail extends CreativeJobSummary {
  desired_outputs: Record<string, unknown>;
  prompt_sections: Record<string, string>;
  variation_summary?: VariationSummary | null;
  assets: CreativeAsset[];
  events: CreativeJobEvent[];
}

export interface ApiProblem {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiProblem };

export type ApiException = AxiosError<{ detail?: string; message?: string }>;


