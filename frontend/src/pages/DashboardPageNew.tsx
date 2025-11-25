/**
 * Dashboard Page - Compact Professional Design
 * Main hub for restaurant intelligence platform
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard, ListContainer, CategoryBadge } from '@/components/ui';
import {
  FileText,
  UtensilsCrossed,
  TrendingDown,
  AlertTriangle,
  Upload,
  BarChart3,
  Building2,
  Sparkles,
  ArrowRight,
  Clock,
  Package,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi, DashboardKPIData, RecentlyOrderedItem } from '@/services/api/dashboardApi';
import { formatCurrency } from '@/types/analytics';
import { formatDistanceToNow } from 'date-fns';
import { TrendBadge } from '@/components/analytics';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardPageNew() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const { data: kpiData, isLoading: kpiLoading } = useQuery<DashboardKPIData>({
    queryKey: ['dashboard-kpi'],
    queryFn: () => dashboardApi.getKPIData(),
    staleTime: 60000,
  });

  const { data: recentItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['dashboard-recent-items'],
    queryFn: () => dashboardApi.getRecentlyOrderedItems(0, 4),
    staleTime: 60000,
  });

  return (
    <AppShell maxWidth="wide">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Compact Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {greeting}, {user?.first_name || 'there'}
            </h1>
            <p className="text-sm text-slate-400">
              Your restaurant overview
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/invoices/upload')}
              size="sm"
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Upload Invoice
            </Button>
            <Button
              onClick={() => navigate('/creative')}
              size="sm"
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Creative Studio
            </Button>
          </div>
        </motion.div>

        {/* Compact KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Price Alerts"
            value={kpiData?.negativeAlerts || 0}
            subtitle="Need attention"
            icon={AlertTriangle}
            color="destructive"
            href="/analytics/alerts"
            isLoading={kpiLoading}
          />
          <KPICard
            label="Savings Found"
            value={kpiData?.positiveAlerts || 0}
            subtitle="Opportunities"
            icon={TrendingDown}
            color="success"
            href="/analytics/opportunities"
            isLoading={kpiLoading}
          />
          <KPICard
            label="Invoices"
            value={kpiData?.recentInvoicesCount || 0}
            subtitle="Processed"
            icon={FileText}
            color="accent"
            href="/invoices"
            isLoading={kpiLoading}
          />
          <KPICard
            label="Menu Items"
            value={kpiData?.menuItemsCount || 0}
            subtitle="Tracked"
            icon={UtensilsCrossed}
            color="primary"
            href="/menu/dashboard"
            isLoading={kpiLoading}
          />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left: Quick Actions + Recent Items */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
            {/* Compact Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              <QuickAction
                icon={BarChart3}
                label="Analytics"
                onClick={() => navigate('/analytics')}
                color="primary"
              />
              <QuickAction
                icon={Building2}
                label="Vendors"
                onClick={() => navigate('/analytics/vendors')}
                color="accent"
              />
              <QuickAction
                icon={Calendar}
                label="Scheduling"
                onClick={() => navigate('/scheduling')}
                color="success"
              />
              <QuickAction
                icon={Package}
                label="Ordering"
                onClick={() => navigate('/ordering')}
                color="warning"
              />
            </div>

            {/* Recent Items - Compact */}
            <Card className="bg-card-dark border-white/10">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Recent Orders
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/analytics')}
                  className="h-7 text-xs text-slate-400 hover:text-white"
                >
                  View All
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {itemsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full bg-white/10 rounded-lg" />
                    ))}
                  </div>
                ) : recentItems?.items && recentItems.items.length > 0 ? (
                  <ListContainer gap="sm">
                    {recentItems.items.slice(0, 4).map((item, idx) => (
                      <RecentItemRow key={idx} item={item} />
                    ))}
                  </ListContainer>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No recent orders</p>
                    <Button
                      onClick={() => navigate('/invoices/upload')}
                      size="sm"
                      className="mt-3 bg-primary-500 hover:bg-primary-600"
                    >
                      Upload Invoice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Creative Studio + Modules */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            {/* Creative Studio Card - Compact */}
            <Card className="bg-gradient-to-br from-primary-500/15 to-accent-500/5 border-primary-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Creative Studio</h3>
                    <p className="text-xs text-slate-400">AI marketing assets</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Generate food photography and marketing materials with AI.
                </p>
                <Button
                  onClick={() => navigate('/creative')}
                  size="sm"
                  className="w-full bg-primary-500 hover:bg-primary-600"
                >
                  Open Studio
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Button>
              </CardContent>
            </Card>

            {/* Module Links - Compact */}
            <Card className="bg-card-dark border-white/10">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium text-white">Modules</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-1">
                <ModuleLink
                  icon={BarChart3}
                  label="Price Analytics"
                  href="/analytics"
                  badge={kpiData?.negativeAlerts ? `${kpiData.negativeAlerts}` : undefined}
                  badgeColor="destructive"
                />
                <ModuleLink icon={FileText} label="Invoices" href="/invoices" />
                <ModuleLink icon={UtensilsCrossed} label="Menu" href="/menu/dashboard" />
                <ModuleLink icon={Calendar} label="Scheduling" href="/scheduling" />
                <ModuleLink icon={Package} label="Ordering" href="/ordering" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}

// Compact KPI Card
function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
  href,
  isLoading,
}: {
  label: string;
  value: number;
  subtitle: string;
  icon: any;
  color: 'destructive' | 'success' | 'accent' | 'primary';
  href: string;
  isLoading: boolean;
}) {
  const colorMap = {
    destructive: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'hover:border-destructive/50' },
    success: { bg: 'bg-success-500/10', text: 'text-success-400', border: 'hover:border-success-500/50' },
    accent: { bg: 'bg-accent-500/10', text: 'text-accent-400', border: 'hover:border-accent-500/50' },
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'hover:border-primary-500/50' },
  };
  const colors = colorMap[color];

  return (
    <Link to={href} className="block group">
      <Card className={`bg-card-dark border-white/10 ${colors.border} transition-all h-full`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">{label}</span>
            <div className={`w-7 h-7 rounded-md ${colors.bg} flex items-center justify-center`}>
              <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-12 bg-white/10" />
          ) : (
            <p className={`text-2xl font-bold ${color === 'destructive' || color === 'success' ? colors.text : 'text-white'}`}>
              {value}
            </p>
          )}
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact Quick Action
function QuickAction({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  color: 'primary' | 'accent' | 'success' | 'warning';
}) {
  const colorMap = {
    primary: 'bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20',
    accent: 'bg-accent-500/10 text-accent-400 group-hover:bg-accent-500/20',
    success: 'bg-success-500/10 text-success-400 group-hover:bg-success-500/20',
    warning: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
  };

  return (
    <button
      onClick={onClick}
      className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all text-center group"
    >
      <div className={`w-8 h-8 rounded-md ${colorMap[color]} flex items-center justify-center mx-auto mb-1.5 transition-colors`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-medium text-slate-300">{label}</p>
    </button>
  );
}

// Compact Recent Item Row
function RecentItemRow({ item }: { item: RecentlyOrderedItem }) {
  const navigate = useNavigate();
  
  return (
    <ContentCard
      variant="compact"
      title={item.item_description}
      description={item.vendor_name}
      icon={<Package className="h-4 w-4" />}
      onClick={() => navigate(`/analytics/items/${encodeURIComponent(item.item_description)}`)}
      trailing={
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-white">{formatCurrency(item.last_price)}</p>
            <p className="text-[10px] text-slate-500">
              {formatDistanceToNow(new Date(item.last_ordered), { addSuffix: true })}
            </p>
          </div>
          <div className="w-14">
            {item.trend === 'up' && <TrendBadge value={item.price_change_percent || 10} size="sm" />}
            {item.trend === 'down' && <TrendBadge value={-(item.price_change_percent || 10)} size="sm" />}
            {item.trend === 'stable' && <TrendBadge value={0} size="sm" />}
          </div>
        </div>
      }
    />
  );
}

// Compact Module Link
function ModuleLink({
  icon: Icon,
  label,
  href,
  badge,
  badgeColor,
}: {
  icon: any;
  label: string;
  href: string;
  badge?: string;
  badgeColor?: 'destructive' | 'success' | 'primary';
}) {
  const navigate = useNavigate();
  const badgeVariants = {
    destructive: 'danger' as const,
    success: 'success' as const,
    primary: 'primary' as const,
  };

  return (
    <button
      onClick={() => navigate(href)}
      className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white/[0.04] transition-colors group text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
        <span className="text-xs text-slate-300 group-hover:text-white">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {badge && (
          <CategoryBadge variant={badgeVariants[badgeColor || 'primary']} size="sm">
            {badge}
          </CategoryBadge>
        )}
        <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
      </div>
    </button>
  );
}
