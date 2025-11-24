import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  enabled: boolean;
  status: 'idle' | 'streaming' | 'complete' | 'error';
  analysisId?: string;
  onComplete: (data: any) => void;
  timeout?: number;
}

export function useAutoRefreshOnComplete({
  enabled,
  status,
  analysisId,
  onComplete,
  timeout = 60000,
}: UseAutoRefreshOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (status === 'streaming') {
      hasCheckedRef.current = false;
    }

    if (enabled && status === 'streaming' && analysisId && !hasCheckedRef.current) {
      timeoutRef.current = setTimeout(async () => {
        if (status !== 'streaming') return;
        
        hasCheckedRef.current = true;
        
        try {
          const response = await fetch(
            `/api/v1/streaming/stream/${analysisId}/status`,
            { credentials: 'include' }
          );
          
          if (!response.ok) return;
          
          const data = await response.json();
          
          if (data.status === 'completed') {
            onComplete(data);
          }
        } catch (error) {
          console.error('Auto-refresh check failed:', error);
        }
      }, timeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, status, analysisId, timeout, onComplete]);
}
