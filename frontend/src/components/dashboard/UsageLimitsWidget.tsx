/**
 * Usage Limits Widget
 * Shows current usage for all features on the dashboard
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUsageSummary } from '@/hooks/useUsageLimits';
import {
  FileText,
  Menu,
  Search,
  Users,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface FeatureUsage {
  icon: React.ReactNode;
  name: string;
  used: number;
  limit: number;
  resetDate: string;
  color: string;
}

export function UsageLimitsWidget() {
  const { summary, loading, isPremium, isUnlimited } = useUsageSummary();

  if (loading) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Usage...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isUnlimited) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/20">
            <Crown className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Premium Account</span>
              <CheckCircle2 className="h-4 w-4 text-primary-500" />
            </div>
            <p className="text-sm text-slate-400">Unlimited access to all features</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary?.weekly) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary-500" />
            Usage Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Unable to load usage data</p>
        </CardContent>
      </Card>
    );
  }

  const features: FeatureUsage[] = [
    {
      icon: <FileText className="h-4 w-4" />,
      name: 'Invoice Uploads',
      used: summary.weekly.invoice_uploads.used,
      limit: summary.weekly.invoice_uploads.limit,
      resetDate: summary.weekly.invoice_uploads.reset_date,
      color: 'emerald',
    },
    {
      icon: <Menu className="h-4 w-4" />,
      name: 'Menu Uploads',
      used: summary.weekly.menu_uploads.used,
      limit: summary.weekly.menu_uploads.limit,
      resetDate: summary.weekly.menu_uploads.reset_date,
      color: 'cyan',
    },
    {
      icon: <Search className="h-4 w-4" />,
      name: 'Free Analyses',
      used: summary.weekly.free_analyses.used,
      limit: summary.weekly.free_analyses.limit,
      resetDate: summary.weekly.free_analyses.reset_date,
      color: 'blue',
    },
    {
      icon: <Users className="h-4 w-4" />,
      name: 'Menu Comparisons',
      used: summary.weekly.menu_comparisons.used,
      limit: summary.weekly.menu_comparisons.limit,
      resetDate: summary.weekly.menu_comparisons.reset_date,
      color: 'purple',
    },
  ];

  // Add monthly bonus if available
  if (summary.monthly?.bonus_invoices) {
    features.push({
      icon: <FileText className="h-4 w-4" />,
      name: 'Bonus Invoices',
      used: summary.monthly.bonus_invoices.used,
      limit: summary.monthly.bonus_invoices.limit,
      resetDate: summary.monthly.bonus_invoices.reset_date,
      color: 'yellow',
    });
  }

  const resetDate = new Date(summary.weekly.invoice_uploads.reset_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-lg">Weekly Usage</CardTitle>
        <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
          Resets {resetDate}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {features.map((feature, index) => {
          const percentage = (feature.used / feature.limit) * 100;
          const remaining = feature.limit - feature.used;
          const isAtLimit = remaining === 0;
          const isNearLimit = percentage >= 80 && !isAtLimit;

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`text-${feature.color}-400`}>
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-300">
                    {feature.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isAtLimit ? (
                    <Badge variant="outline" className="text-xs text-destructive border-red-500/30 bg-destructive/10">
                      Limit Reached
                    </Badge>
                  ) : isNearLimit ? (
                    <Badge variant="outline" className="text-xs text-primary-500 border-primary-600/30 bg-primary-500/10">
                      {remaining} left
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {remaining} of {feature.limit} left
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-card-dark rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isAtLimit
                      ? 'bg-destructive'
                      : isNearLimit
                      ? 'bg-primary-400'
                      : `bg-${feature.color}-400`
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Upgrade CTA for free users */}
        {!isPremium && (
          <div className="pt-3 mt-3 border-t border-white/10">
            <Link to="/pricing">
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90 text-white"
              >
                <Crown className="h-3 w-3 mr-2" />
                Upgrade for Unlimited Access
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
