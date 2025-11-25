/**
 * Subscription Badge
 * Shows current tier in navigation/header
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useBilling';
import { Crown, Sparkles, Zap } from 'lucide-react';

interface SubscriptionBadgeProps {
  showUpgradeLink?: boolean;
  className?: string;
}

export function SubscriptionBadge({
  showUpgradeLink = true,
  className = '',
}: SubscriptionBadgeProps) {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading) {
    return null;
  }

  const isActive =
    subscription?.has_subscription && subscription?.status === 'active';
  const planName = subscription?.plan_name || 'Free';
  const isPremium = planName.toLowerCase() === 'premium';
  const isEnterprise = planName.toLowerCase() === 'enterprise';

  if (isActive) {
    return (
      <Link to="/settings/billing" className={className}>
        <Badge
          className={`
            ${isPremium ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : ''}
            ${isEnterprise ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : ''}
            hover:opacity-80 transition-opacity cursor-pointer
          `}
        >
          {isEnterprise ? (
            <Crown className="w-3 h-3 mr-1" />
          ) : (
            <Sparkles className="w-3 h-3 mr-1" />
          )}
          {planName}
        </Badge>
      </Link>
    );
  }

  // Free tier
  if (showUpgradeLink) {
    return (
      <Link to="/settings/billing" className={className}>
        <Badge
          className="bg-white/10 text-slate-300 border-white/10 hover:bg-primary-500/20 hover:text-primary-400 hover:border-primary-500/30 transition-colors cursor-pointer"
        >
          <Zap className="w-3 h-3 mr-1" />
          Upgrade
        </Badge>
      </Link>
    );
  }

  return (
    <Badge className={`bg-white/10 text-slate-400 border-white/10 ${className}`}>
      Free
    </Badge>
  );
}
