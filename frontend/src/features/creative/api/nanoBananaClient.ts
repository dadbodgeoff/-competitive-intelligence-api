import { apiClient, safeRequest } from '@/services/api/client';
import type {
  CreativeJobDetail,
  CreativeJobSummary,
  JobListResponse,
  StartGenerationRequest,
  StartGenerationResponse,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  TemplateSummary,
  ThemeSummary,
  BrandProfileSummary,
} from './types';

function assertData<T>(
  result: Awaited<ReturnType<typeof safeRequest<T>>>,
  fallback: string,
): T {
  if (!result.success || !result.data) {
    const message = result.error?.message ?? fallback;
    throw new Error(message);
  }
  return result.data;
}

export async function fetchThemes(): Promise<ThemeSummary[]> {
  const result = await safeRequest<ThemeSummary[]>(() =>
    apiClient.get('/api/v1/nano-banana/themes'),
  );
  return assertData(result, 'Failed to load creative themes');
}

export async function fetchTemplates(themeId: string): Promise<TemplateSummary[]> {
  const result = await safeRequest<TemplateSummary[]>(() =>
    apiClient.get(`/api/v1/nano-banana/themes/${themeId}/templates`),
  );
  return assertData(result, 'Failed to load creative templates');
}

export async function previewTemplate(
  payload: TemplatePreviewRequest,
): Promise<TemplatePreviewResponse> {
  const result = await safeRequest<TemplatePreviewResponse>(() =>
    apiClient.post('/api/v1/nano-banana/templates/preview', payload),
  );
  return assertData(result, 'Failed to preview template');
}

export async function startGeneration(
  payload: StartGenerationRequest,
): Promise<StartGenerationResponse> {
  const result = await safeRequest<StartGenerationResponse>(() =>
    apiClient.post('/api/v1/nano-banana/generate', payload),
  );
  return assertData(result, 'Failed to start creative generation');
}

export async function getJob(jobId: string): Promise<CreativeJobDetail> {
  const result = await safeRequest<CreativeJobDetail>(() =>
    apiClient.get(`/api/v1/nano-banana/jobs/${jobId}`),
  );
  return assertData(result, 'Failed to fetch job details');
}

export interface ListJobsParams {
  page?: number;
  per_page?: number;
}

export async function listJobs(params: ListJobsParams = {}): Promise<JobListResponse> {
  const result = await safeRequest<JobListResponse>(() =>
    apiClient.get('/api/v1/nano-banana/jobs', { params }),
  );
  const data = assertData(result, 'Failed to load creative jobs');
  const totalCount = data.total_count ?? data.count ?? data.data.length;
  return { ...data, total_count: totalCount };
}

export async function fetchBrandProfiles(): Promise<BrandProfileSummary[]> {
  const result = await safeRequest<BrandProfileSummary[]>(() =>
    apiClient.get('/api/v1/nano-banana/brands'),
  );
  return assertData(result, 'Failed to load brand profiles');
}

export interface CreateBrandProfileRequest {
  brand_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  headline_font?: string;
  body_font?: string;
  is_default?: boolean;
  // Phase 1 fields
  brand_voice?: string;
  voice_description?: string;
  visual_styles?: string[];
  cuisine_type?: string;
  cuisine_specialties?: string[];
  atmosphere_tags?: string[];
  target_demographic?: string;
  // Phase 2 fields
  logo_placement?: string;
  logo_watermark_style?: string;
  prohibited_elements?: string[];
  allergen_warnings?: string[];
  primary_social_platforms?: string[];
  preferred_aspect_ratios?: string[];
  brand_hashtags?: string[];
  social_media_handle?: string;
  // Phase 3 fields
  active_seasons?: string[];
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

export async function createBrandProfile(
  payload: CreateBrandProfileRequest,
): Promise<BrandProfileSummary> {
  const result = await safeRequest<BrandProfileSummary>(() =>
    apiClient.post('/api/v1/nano-banana/brands', {
      brand_name: payload.brand_name,
      palette: {
        primary: payload.primary_color,
        secondary: payload.secondary_color,
        accent: payload.accent_color,
      },
      typography: {
        headline: payload.headline_font || null,
        body: payload.body_font || null,
      },
      is_default: payload.is_default || false,
      metadata: {},
      // Phase 1 fields
      brand_voice: payload.brand_voice || null,
      voice_description: payload.voice_description || null,
      visual_styles: payload.visual_styles || [],
      cuisine_type: payload.cuisine_type || null,
      cuisine_specialties: payload.cuisine_specialties || [],
      atmosphere_tags: payload.atmosphere_tags || [],
      target_demographic: payload.target_demographic || null,
      // Phase 2 fields
      logo_placement: payload.logo_placement || 'top_left',
      logo_watermark_style: payload.logo_watermark_style || 'subtle',
      prohibited_elements: payload.prohibited_elements || [],
      allergen_warnings: payload.allergen_warnings || [],
      primary_social_platforms: payload.primary_social_platforms || [],
      preferred_aspect_ratios: payload.preferred_aspect_ratios || [],
      brand_hashtags: payload.brand_hashtags || [],
      social_media_handle: payload.social_media_handle || null,
      // Phase 3 fields
      active_seasons: payload.active_seasons || [],
      holiday_participation: payload.holiday_participation || [],
      seasonal_menu_rotation: payload.seasonal_menu_rotation || false,
      location_type: payload.location_type || null,
      regional_style: payload.regional_style || null,
      local_landmarks: payload.local_landmarks || null,
      city: payload.city || null,
      state: payload.state || null,
      country: payload.country || 'USA',
      price_range: payload.price_range || null,
      value_proposition: payload.value_proposition || null,
      average_check_size: payload.average_check_size || null,
      positioning_statement: payload.positioning_statement || null,
    }),
  );
  return assertData(result, 'Failed to create brand profile');
}

export async function updateBrandProfile(
  profileId: string,
  payload: CreateBrandProfileRequest,
): Promise<BrandProfileSummary> {
  const result = await safeRequest<BrandProfileSummary>(() =>
    apiClient.put(`/api/v1/nano-banana/brands/${profileId}`, {
      brand_name: payload.brand_name,
      palette: {
        primary: payload.primary_color,
        secondary: payload.secondary_color,
        accent: payload.accent_color,
      },
      typography: {
        headline: payload.headline_font || null,
        body: payload.body_font || null,
      },
      is_default: payload.is_default || false,
      metadata: {},
      // Phase 1 fields
      brand_voice: payload.brand_voice || null,
      voice_description: payload.voice_description || null,
      visual_styles: payload.visual_styles || [],
      cuisine_type: payload.cuisine_type || null,
      cuisine_specialties: payload.cuisine_specialties || [],
      atmosphere_tags: payload.atmosphere_tags || [],
      target_demographic: payload.target_demographic || null,
      // Phase 2 fields
      logo_placement: payload.logo_placement || 'top_left',
      logo_watermark_style: payload.logo_watermark_style || 'subtle',
      prohibited_elements: payload.prohibited_elements || [],
      allergen_warnings: payload.allergen_warnings || [],
      primary_social_platforms: payload.primary_social_platforms || [],
      preferred_aspect_ratios: payload.preferred_aspect_ratios || [],
      brand_hashtags: payload.brand_hashtags || [],
      social_media_handle: payload.social_media_handle || null,
      // Phase 3 fields
      active_seasons: payload.active_seasons || [],
      holiday_participation: payload.holiday_participation || [],
      seasonal_menu_rotation: payload.seasonal_menu_rotation || false,
      location_type: payload.location_type || null,
      regional_style: payload.regional_style || null,
      local_landmarks: payload.local_landmarks || null,
      city: payload.city || null,
      state: payload.state || null,
      country: payload.country || 'USA',
      price_range: payload.price_range || null,
      value_proposition: payload.value_proposition || null,
      average_check_size: payload.average_check_size || null,
      positioning_statement: payload.positioning_statement || null,
    }),
  );
  return assertData(result, 'Failed to update brand profile');
}

export async function deleteBrandProfile(profileId: string): Promise<void> {
  const result = await safeRequest<{ message: string }>(() =>
    apiClient.delete(`/api/v1/nano-banana/brands/${profileId}`),
  );
  assertData(result, 'Failed to delete brand profile');
}

export type {
  ThemeSummary,
  TemplateSummary,
  CreativeJobDetail,
  CreativeJobSummary,
  BrandProfileSummary,
  StartGenerationRequest,
  StartGenerationResponse,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  JobListResponse,
};


