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


