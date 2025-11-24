/**
 * Usage Limit Warning Component
 * Reusable component for displaying usage limit warnings
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Crown } from 'lucide-react';
import { UsageLimit } from '@/hooks/useUsageLimits';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface UsageLimitWarningProps {
  limit: UsageLimit;
  featureName: string;
  className?: string;
}

export function UsageLimitWarning({ limit, featureName, className }: UsageLimitWarningProps) {
  if (limit.allowed) {
    return null;
  }

  const resetDate = new Date(limit.reset_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Alert className={`border-primary-600/30 bg-primary-500/10 ${className || ''}`}>
      <AlertCircle className="h-4 w-4 text-primary-500" />
      <AlertDescription className="text-primary-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <strong className="block mb-1">Usage Limit Reached</strong>
            <p className="text-sm mb-2">{limit.message}</p>
            <p className="text-xs text-primary-300/80">
              Resets: {resetDate}
            </p>
          </div>
          
          {limit.subscription_tier === 'free' && (
            <Link to="/pricing">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90 text-white"
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
        
        {limit.subscription_tier === 'free' && (
          <p className="text-xs text-primary-300/80 mt-3 pt-3 border-t border-primary-600/20">
            💡 Upgrade to Premium for unlimited {featureName}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Usage Counter Component
 * Shows current usage vs limit
 */
interface UsageCounterProps {
  limit: UsageLimit;
  className?: string;
}

export function UsageCounter({ limit, className }: UsageCounterProps) {
  const percentage = (limit.current_usage / limit.limit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className={`text-xs ${className || ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={isNearLimit ? 'text-primary-500' : 'text-slate-400'}>
          {limit.current_usage} of {limit.limit} used
        </span>
        {isNearLimit && limit.current_usage < limit.limit && (
          <span className="text-primary-500">⚠️ Almost at limit</span>
        )}
      </div>
      <div className="w-full bg-card-dark rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            isNearLimit ? 'bg-primary-400' : 'bg-primary-400'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
