import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalysisStatus } from '@/services/api/reviewAnalysisApi';

export function useAnalysisProgress(analysisId: string) {
  const [isPolling, setIsPolling] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const lastProgressRef = useRef(0);

  // Monitor tab visibility for battery optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const { data: status, error, isLoading } = useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => getAnalysisStatus(analysisId),
    enabled: isPolling && !!analysisId && isTabVisible,
    refetchInterval: (query) => {
      const data = query?.state?.data;
      
      // Stop polling when complete
      if (data?.status === 'completed' || data?.status === 'failed') {
        setIsPolling(false);
        return false;
      }

      // Battery-efficient polling based on tab visibility and progress
      const progress = data?.progress_percentage || 0;
      lastProgressRef.current = progress;

      // Slower polling when tab is hidden
      if (!isTabVisible) {
        return 10000; // 10s when tab hidden
      }

      // Adaptive polling based on progress
      if (progress > 80) return 1000;  // Poll faster near completion
      if (progress < 20) return 3000;  // Poll slower at start
      return 2000; // Default 2s polling
    },
    retry: (failureCount) => {
      // Exponential backoff for polling errors
      return failureCount < 3;
    },
  });

  // Stop polling when component unmounts or analysis completes
  useEffect(() => {
    return () => setIsPolling(false);
  }, []);

  // Stop polling on completion
  useEffect(() => {
    if (status?.status === 'completed' || status?.status === 'failed') {
      setIsPolling(false);
    }
  }, [status?.status]);

  // Resume polling when tab becomes visible again
  useEffect(() => {
    if (isTabVisible && status && status.status === 'running' && !isPolling) {
      setIsPolling(true);
    }
  }, [isTabVisible, status, isPolling]);

  return { 
    status, 
    error, 
    isLoading,
    isPolling,
    isTabVisible,
    stopPolling: () => setIsPolling(false),
    startPolling: () => setIsPolling(true),
  };
}