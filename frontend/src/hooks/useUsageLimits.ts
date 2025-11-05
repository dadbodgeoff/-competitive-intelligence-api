/**
 * Usage Limits Hook
 * Centralized hook for checking and displaying usage limits across the app
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';

export interface UsageLimit {
  allowed: boolean;
  current_usage: number;
  limit: number;
  reset_date: string;
  message: string;
  subscription_tier: string;
}

export interface UsageSummary {
  subscription_tier: string;
  unlimited: boolean;
  weekly?: {
    invoice_uploads: { used: number; limit: number; reset_date: string };
    free_analyses: { used: number; limit: number; reset_date: string };
    menu_comparisons: { used: number; limit: number; reset_date: string };
    menu_uploads: { used: number; limit: number; reset_date: string };
    premium_analyses: { used: number; limit: number; reset_date: string };
  };
  monthly?: {
    bonus_invoices: { used: number; limit: number; reset_date: string };
  };
}

/**
 * Check a specific usage limit
 * @param operationType - Type of operation to check
 * @param autoCheck - Whether to check on mount (default: true)
 */
export function useUsageLimit(
  operationType: 'invoice_upload' | 'free_analysis' | 'menu_comparison' | 'menu_upload' | 'premium_analysis',
  autoCheck: boolean = true
) {
  const [limit, setLimit] = useState<UsageLimit | null>(null);
  const [loading, setLoading] = useState(autoCheck);
  const [error, setError] = useState<string | null>(null);

  const checkLimit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/v1/usage/check/${operationType}`);
      
      if (response.data.success) {
        setLimit(response.data);
      } else {
        setError(response.data.error || 'Failed to check limit');
      }
    } catch (err) {
      console.error('Failed to check usage limit:', err);
      setError(err instanceof Error ? err.message : 'Failed to check limit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      checkLimit();
    }
  }, [operationType, autoCheck]);

  return {
    limit,
    loading,
    error,
    checkLimit,
    isAllowed: limit?.allowed ?? true, // Default to allowed if not loaded
    isBlocked: limit?.allowed === false,
  };
}

/**
 * Get full usage summary for the current user
 */
export function useUsageSummary() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/v1/usage/summary');
      
      if (response.data.success || response.data.subscription_tier) {
        setSummary(response.data);
      } else {
        setError(response.data.error || 'Failed to fetch summary');
      }
    } catch (err) {
      console.error('Failed to fetch usage summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
    isPremium: summary?.subscription_tier === 'premium' || summary?.subscription_tier === 'enterprise',
    isUnlimited: summary?.unlimited ?? false,
  };
}
