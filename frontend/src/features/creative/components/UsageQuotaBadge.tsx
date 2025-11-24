import React, { useEffect, useState } from 'react';
import { Sparkles, Clock, Infinity } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';

interface UsageQuota {
  unlimited: boolean;
  subscription_tier: string;
  used?: number;
  limit?: number;
  remaining?: number;
  reset_date?: string;
  message?: string;
}

export const UsageQuotaBadge: React.FC = () => {
  const [quota, setQuota] = useState<UsageQuota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const response = await apiClient.get('/api/v1/nano-banana/usage-quota');
      setQuota(response.data);
    } catch (error) {
      console.error('Failed to fetch usage quota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !quota) {
    return null;
  }

  if (quota.unlimited) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/30">
        <Infinity className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-primary-200">
          Unlimited Generations
        </span>
      </div>
    );
  }

  const remaining = quota.remaining ?? 0;
  const used = quota.used ?? 0;
  const limit = quota.limit ?? 3;
  const resetDate = quota.reset_date ? new Date(quota.reset_date) : null;

  // Calculate days until reset
  const daysUntilReset = resetDate
    ? Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Color based on remaining quota
  const getColor = () => {
    if (remaining === 0) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (remaining === 1) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-primary-400 border-primary-500/30 bg-primary-500/10';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getColor()}`}>
      <Sparkles className="w-4 h-4" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {remaining} of {limit} left
        </span>
        {daysUntilReset !== null && (
          <>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Resets in {daysUntilReset}d</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
