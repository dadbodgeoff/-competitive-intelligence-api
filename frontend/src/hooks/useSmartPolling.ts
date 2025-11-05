/**
 * Smart Polling Hook
 * 
 * Implements intelligent polling with exponential backoff for async operations.
 * Automatically stops polling when operation completes.
 * 
 * Features:
 * - Exponential backoff to reduce server load
 * - Automatic stop when complete
 * - Refetch on window focus
 * - Retry on failure
 * - Completion callback
 * 
 * @example
 * const { data, isLoading } = useSmartPolling({
 *   queryKey: ['analysis', id],
 *   queryFn: () => api.getAnalysis(id),
 *   isComplete: (data) => data?.status === 'completed',
 *   onComplete: (data) => toast.success('Done!'),
 * });
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface SmartPollingOptions<T> {
  /** React Query key */
  queryKey: any[];
  
  /** Function to fetch data */
  queryFn: () => Promise<T>;
  
  /** Whether polling is enabled */
  enabled?: boolean;
  
  /** Function to determine if operation is complete */
  isComplete: (data: T | undefined) => boolean;
  
  /** Callback when operation completes */
  onComplete?: (data: T) => void;
  
  /** Initial polling interval in ms (default: 2000) */
  initialInterval?: number;
  
  /** Maximum polling interval in ms (default: 30000) */
  maxInterval?: number;
  
  /** Backoff multiplier (default: 1.5) */
  backoffMultiplier?: number;
  
  /** Number of retries on failure (default: 3) */
  maxRetries?: number;
}

/**
 * Hook for smart polling with exponential backoff
 */
export function useSmartPolling<T>({
  queryKey,
  queryFn,
  enabled = true,
  isComplete,
  onComplete,
  initialInterval = 2000,
  maxInterval = 30000,
  backoffMultiplier = 1.5,
  maxRetries = 3,
}: SmartPollingOptions<T>): UseQueryResult<T, Error> {
  const intervalRef = useRef(initialInterval);
  const attemptRef = useRef(0);
  const completedRef = useRef(false);

  const query = useQuery<T, Error>({
    queryKey,
    queryFn,
    enabled: enabled && !completedRef.current,
    
    // Dynamic refetch interval with exponential backoff
    refetchInterval: (data) => {
      // Stop polling if complete
      if (data && isComplete(data)) {
        completedRef.current = true;
        return false;
      }

      // Exponential backoff
      attemptRef.current += 1;
      const nextInterval = Math.min(
        initialInterval * Math.pow(backoffMultiplier, attemptRef.current - 1),
        maxInterval
      );
      intervalRef.current = nextInterval;

      return nextInterval;
    },
    
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
    
    // Retry failed requests
    retry: maxRetries,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData as T,
  });

  // Handle completion
  useEffect(() => {
    if (query.data && isComplete(query.data) && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(query.data);
      
      // Reset for potential reuse
      attemptRef.current = 0;
      intervalRef.current = initialInterval;
    }
  }, [query.data, isComplete, onComplete, initialInterval]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      completedRef.current = false;
      attemptRef.current = 0;
      intervalRef.current = initialInterval;
    };
  }, [initialInterval]);

  return query;
}

/**
 * Hook for polling until a condition is met
 * Simpler version for basic use cases
 */
export function usePollUntil<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  condition: (data: T | undefined) => boolean,
  options?: {
    interval?: number;
    enabled?: boolean;
    onComplete?: (data: T) => void;
  }
): UseQueryResult<T, Error> {
  return useSmartPolling({
    queryKey,
    queryFn,
    enabled: options?.enabled,
    isComplete: condition,
    onComplete: options?.onComplete,
    initialInterval: options?.interval || 3000,
    maxInterval: options?.interval || 3000,
    backoffMultiplier: 1, // No backoff for simple polling
  });
}
