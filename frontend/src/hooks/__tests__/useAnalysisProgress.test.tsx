import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalysisProgress } from '../useAnalysisProgress';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';

// Mock the API service
const mockGetAnalysisStatus = vi.fn();
vi.mock('@/services/ReviewAnalysisAPIService', () => ({
  reviewAnalysisAPI: {
    getAnalysisStatus: mockGetAnalysisStatus,
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAnalysisProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts polling when analysis ID is provided', async () => {
    const mockStatus = {
      analysis_id: 'test-123',
      status: 'running' as const,
      progress_percentage: 25,
      current_step: 'Fetching competitor data',
    };

    mockGetAnalysisStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(
      () => useAnalysisProgress('test-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
      expect(result.current.isPolling).toBe(true);
    });

    expect(mockGetAnalysisStatus).toHaveBeenCalledWith('test-123');
  });

  it('stops polling when analysis completes', async () => {
    const completedStatus = {
      analysis_id: 'test-123',
      status: 'completed' as const,
      progress_percentage: 100,
      current_step: 'Analysis complete',
    };

    mockGetAnalysisStatus.mockResolvedValue(completedStatus);

    const { result } = renderHook(
      () => useAnalysisProgress('test-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.status).toEqual(completedStatus);
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('stops polling when analysis fails', async () => {
    const failedStatus = {
      analysis_id: 'test-123',
      status: 'failed' as const,
      progress_percentage: 50,
      current_step: 'Analysis failed',
      error_message: 'No competitors found',
    };

    mockGetAnalysisStatus.mockResolvedValue(failedStatus);

    const { result } = renderHook(
      () => useAnalysisProgress('test-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.status).toEqual(failedStatus);
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('provides stop and start polling controls', async () => {
    const mockStatus = {
      analysis_id: 'test-123',
      status: 'running' as const,
      progress_percentage: 25,
      current_step: 'Fetching competitor data',
    };

    mockGetAnalysisStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(
      () => useAnalysisProgress('test-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    // Test stop polling
    result.current.stopPolling();
    expect(result.current.isPolling).toBe(false);

    // Test start polling
    result.current.startPolling();
    expect(result.current.isPolling).toBe(true);
  });
});