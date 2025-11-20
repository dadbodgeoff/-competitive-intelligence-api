/**
 * Menu Comparison API Service
 * Handles all API calls for menu comparison feature
 */

import type {
  StartComparisonRequest,
  SelectCompetitorsRequest,
  SaveComparisonRequest,
  DiscoveryResponse,
  AnalysisStatusResponse,
  ComparisonResultsResponse,
  SavedComparisonsListResponse,
  StreamingEvent,
} from '@/types/menuComparison';
import { apiClient, safeRequest } from './client';
import { streamSse, type SseConnection } from '@/lib/sse';
import { ensureResponseSuccess } from './validation';

const API_BASE = '/api/v1/menu-comparison';

class MenuComparisonAPIService {
  /**
   * Step 1: Discover competitors
   */
  async discoverCompetitors(request: StartComparisonRequest): Promise<DiscoveryResponse> {
    const result = await safeRequest<DiscoveryResponse | { success?: boolean; data?: DiscoveryResponse }>(() =>
      apiClient.post(`${API_BASE}/discover`, request)
    );
    const payload = ensureResponseSuccess(result, 'Failed to start competitor discovery');
    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      'data' in payload &&
      payload.data
    ) {
      return payload.data;
    }
    return payload as DiscoveryResponse;
  }

  /**
   * Step 2: Analyze selected competitors (streaming)
   */
  async analyzeCompetitors(
    request: SelectCompetitorsRequest,
    onEvent: (event: StreamingEvent) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      let isComplete = false;
      const connection: SseConnection = streamSse({
        url: `${baseUrl}${API_BASE}/analyze/stream`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
        onEvent: ({ event, data }) => {
          const streamingEvent: StreamingEvent = {
            type: (event as StreamingEvent['type']) || 'error',
            data: (data as StreamingEvent['data']) ?? {},
          };

          onEvent(streamingEvent);

          if (event === 'analysis_complete') {
            isComplete = true;
            onComplete();
            connection.stop();
          } else if (event === 'error') {
            isComplete = true;
            const errorPayload = (data ?? {}) as { error?: string; message?: string };
            onError(errorPayload.error ?? errorPayload.message ?? 'Analysis failed');
            connection.stop();
          }
        },
        onError: (error) => {
          onError(error.message || 'Analysis failed');
        },
      });

      try {
        await connection.finished;
      } finally {
        if (!isComplete) {
          onComplete();
        }
      }

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to start analysis');
      throw error;
    }
  }

  /**
   * Get analysis status
   */
  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
    const result = await safeRequest<AnalysisStatusResponse>(() =>
      apiClient.get(`${API_BASE}/${analysisId}/status`)
    );
    return ensureResponseSuccess(result, 'Failed to load analysis status');
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(analysisId: string): Promise<ComparisonResultsResponse> {
    const result = await safeRequest<ComparisonResultsResponse | { success?: boolean; data?: ComparisonResultsResponse }>(() =>
      apiClient.get(`${API_BASE}/${analysisId}/results`)
    );
    const payload = ensureResponseSuccess(result, 'Failed to fetch comparison results');
    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      'data' in payload &&
      payload.data
    ) {
      return payload.data;
    }
    return payload as ComparisonResultsResponse;
  }

  /**
   * Save comparison to user account
   */
  async saveComparison(request: SaveComparisonRequest): Promise<{ success: boolean; saved_id: string; message: string }> {
    console.log('🔍 [MenuComparisonAPI] saveComparison called');
    console.log('📦 [MenuComparisonAPI] Request:', JSON.stringify(request, null, 2));
    console.log('📍 [MenuComparisonAPI] Full URL:', `${API_BASE}/save`);
    console.log('🍪 [MenuComparisonAPI] withCredentials:', apiClient.defaults.withCredentials);
    
    try {
      const result = await safeRequest<{ success: boolean; saved_id: string; message: string }>(() =>
        apiClient.post(`${API_BASE}/save`, request)
      );
      return ensureResponseSuccess(result, 'Failed to save comparison');
    } catch (error: any) {
      console.error('❌ [MenuComparisonAPI] Error:', error);
      console.error('❌ [MenuComparisonAPI] Error response:', error.response?.data);
      console.error('❌ [MenuComparisonAPI] Error status:', error.response?.status);
      throw error;
    }
  }

  /**
   * List saved comparisons
   */
  async listSavedComparisons(
    page: number = 1,
    per_page: number = 50
  ): Promise<SavedComparisonsListResponse> {
    const result = await safeRequest<SavedComparisonsListResponse>(() =>
      apiClient.get(`${API_BASE}/saved`, {
        params: { page, per_page }
      })
    );
    return ensureResponseSuccess(result, 'Failed to load saved comparisons');
  }

  /**
   * Archive saved comparison
   */
  async archiveSavedComparison(savedId: string): Promise<{ success: boolean; message: string }> {
    const result = await safeRequest<{ success: boolean; message: string }>(() =>
      apiClient.delete(`${API_BASE}/saved/${savedId}`)
    );
    return ensureResponseSuccess(result, 'Failed to archive comparison');
  }

  /**
   * Delete analysis with cascade (with warning)
   */
  async deleteAnalysisCascade(analysisId: string): Promise<{
    success: boolean;
    message: string;
    deleted_counts: {
      analysis: number;
      competitors: number;
      menu_items: number;
      insights: number;
      saved_comparisons: number;
    };
  }> {
    const result = await safeRequest<{
      success: boolean;
      message: string;
      deleted_counts: {
        analysis: number;
        competitors: number;
        menu_items: number;
        insights: number;
        saved_comparisons: number;
      };
    }>(() => apiClient.delete(`${API_BASE}/${analysisId}/cascade`));

    return ensureResponseSuccess(result, 'Failed to delete analysis');
  }

  /**
   * Poll analysis status until complete
   */
  async pollAnalysisStatus(
    analysisId: string,
    onStatusUpdate: (status: AnalysisStatusResponse) => void,
    intervalMs: number = 2000,
    maxAttempts: number = 60
  ): Promise<AnalysisStatusResponse> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          const status = await this.getAnalysisStatus(analysisId);
          onStatusUpdate(status);

          if (status.status === 'completed') {
            resolve(status);
            return;
          }

          if (status.status === 'failed') {
            reject(new Error(status.error_message || 'Analysis failed'));
            return;
          }

          if (attempts >= maxAttempts) {
            reject(new Error('Analysis timeout'));
            return;
          }

          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

export const menuComparisonAPI = new MenuComparisonAPIService();
export default menuComparisonAPI;