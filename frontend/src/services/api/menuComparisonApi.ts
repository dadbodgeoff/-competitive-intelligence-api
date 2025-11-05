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
import { apiClient } from './client';

const API_BASE = '/api/v1/menu-comparison';

class MenuComparisonAPIService {
  /**
   * Step 1: Discover competitors
   */
  async discoverCompetitors(request: StartComparisonRequest): Promise<DiscoveryResponse> {
    const response = await apiClient.post(`${API_BASE}/discover`, request);
    return response.data;
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
      const response = await fetch(`${baseUrl}${API_BASE}/analyze/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || 'Failed to start analysis');
      }

      // The response should be the SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEventType = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                const event: StreamingEvent = {
                  type: (currentEventType as any) || 'error',
                  data: data,
                };
                
                onEvent(event);
                
                if (currentEventType === 'analysis_complete') {
                  onComplete();
                  reader.cancel();
                  return;
                }
                
                if (currentEventType === 'error') {
                  onError(data.error || 'Analysis failed');
                  reader.cancel();
                  return;
                }
                
                // Reset for next event
                currentEventType = '';
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
        
        onComplete();
      } catch (streamError) {
        onError(streamError instanceof Error ? streamError.message : 'Stream error');
      } finally {
        reader.releaseLock();
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
    const response = await apiClient.get(`${API_BASE}/${analysisId}/status`);
    return response.data;
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(analysisId: string): Promise<ComparisonResultsResponse> {
    const response = await apiClient.get(`${API_BASE}/${analysisId}/results`);
    // Backend returns { success: true, data: {...} }
    return response.data.data || response.data;
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
      const response = await apiClient.post(`${API_BASE}/save`, request);
      console.log('✅ [MenuComparisonAPI] Success:', response.data);
      return response.data;
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
    const response = await apiClient.get(`${API_BASE}/saved`, {
      params: { page, per_page }
    });
    return response.data;
  }

  /**
   * Archive saved comparison
   */
  async archiveSavedComparison(savedId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${API_BASE}/saved/${savedId}`);
    return response.data;
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
    const response = await apiClient.delete(`${API_BASE}/${analysisId}/cascade`);
    return response.data;
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