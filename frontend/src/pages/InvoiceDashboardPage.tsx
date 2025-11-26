/**
 * Invoice Dashboard Page
 * Modern dashboard with KPIs, vendor breakdown, and trends
 * Optimized: Single API call for all dashboard data
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  FileText,
  Building2,
  Plus,
  ArrowRight,
  Calendar,
  Package,
} from 'lucide-react';
import { useInvoiceDashboardCombined } from '@/hooks/useInvoiceAnalytics';
import { StatCard, DataTable, type Column } from '@/components/analytics';
import { InvoiceStatusBadge } from '@/design-system/components';
import { formatCurrency } from '@/types/analytics';
import type { RecentInvoice } from '@/services/api/invoiceAnalyticsApi';

export function InvoiceDashboardPage() {
  const navigate = useNavigate();
  const [daysBack, setDaysBack] = useState(90);

  // Single optimized API call for all dashboard data
  const { data: dashboardData, isLoading } = useInvoiceDashboardCombined(daysBack, 8, 10);

  // Memoized data extraction for stable references
  const summary = useMemo(() => dashboardData?.summary, [dashboardData?.summary]);
  const vendorData = useMemo(() => dashboardData?.vendors, [dashboardData?.vendors]);
  const trendData = useMemo(() => dashboardData?.trend, [dashboardData?.trend]);
  const recentData = useMemo(() => dashboardData?.recent, [dashboardData?.recent]);

  // Memoized table columns to prevent re-renders
  const columns: Column<RecentInvoice>[] = useMemo(() => [
    {
      key: 'vendor_name',
      header: 'Vendor',
      sortable: true,
      sortValue: (item) => item.vendor_name,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary-400" />
          </div>
          <span className="font-medium text-white">{item.vendor_name}</span>
        </div>
      ),
    },
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (item) => (
        <span className="font-mono text-slate-300">{item.invoice_number}</span>
      ),
    },
    {
      key: 'invoice_date',
      header: 'Date',
      sortable: true,
      sortValue: (item) => item.invoice_date,
      render: (item) => (
        <span className="text-slate-400">
          {new Date(item.invoice_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.total,
      render: (item) => (
        <span className="font-mono font-medium text-white">
          {formatCurrency(item.total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <InvoiceStatusBadge status={item.status as any} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '50px',
      render: () => (
        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-primary-400 transition-colors" />
      ),
    },
  ], []);

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-4">
        {/* Header with actions */}
        <ModulePageHeader
          icon={FileText}
          title="Invoice Dashboard"
          description="Track spending, vendors, and invoice trends"
          actions={
            <>
              <Select value={daysBack.toString()} onValueChange={(v) => setDaysBack(parseInt(v))}>
                <SelectTrigger className="w-28 h-8 text-xs bg-obsidian/70 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => navigate('/invoices/vendors')}
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5 h-8 text-xs"
              >
                <Building2 className="h-3.5 w-3.5 mr-1.5" />
                By Vendor
              </Button>
              <Button
                onClick={() => navigate('/invoices')}
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5 h-8 text-xs"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                All Invoices
              </Button>
              <Button
                onClick={() => navigate('/invoices/upload')}
                size="sm"
                className="bg-primary-500 hover:bg-primary-600 text-white h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Upload Invoice
              </Button>
            </>
          }
        />

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Spend"
            value={formatCurrency(summary?.total_spend || 0)}
            subtitle={`Last ${daysBack} days`}
            icon={DollarSign}
            iconColor="text-success-400"
            trend={summary?.spend_change_percent ? {
              value: summary.spend_change_percent,
              label: 'vs previous period'
            } : undefined}
            isLoading={isLoading}
            tooltip="Total amount spent on invoices"
            delay={0}
            compact
          />
          <StatCard
            title="Invoices"
            value={summary?.invoice_count || 0}
            subtitle={summary?.invoice_change ? `${summary.invoice_change > 0 ? '+' : ''}${summary.invoice_change} from last period` : `Last ${daysBack} days`}
            icon={FileText}
            iconColor="text-primary-400"
            isLoading={isLoading}
            tooltip="Total number of invoices processed"
            delay={1}
            compact
          />
          <StatCard
            title="Vendors"
            value={summary?.vendor_count || 0}
            subtitle="Active suppliers"
            icon={Building2}
            iconColor="text-accent-400"
            isLoading={isLoading}
            tooltip="Number of unique vendors"
            delay={2}
            compact
          />
          <StatCard
            title="Avg Order"
            value={formatCurrency(summary?.avg_order_value || 0)}
            subtitle="Per invoice"
            icon={Package}
            iconColor="text-primary-400"
            isLoading={isLoading}
            tooltip="Average invoice total"
            delay={3}
            compact
          />
        </div>

        {/* Charts Row - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vendor Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-card-dark border-white/10 h-full">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  <span>Spending by Vendor</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/invoices/vendors')}
                    className="text-slate-400 hover:text-white h-7 text-xs"
                  >
                    View All
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
                    ))}
                  </div>
                ) : vendorData?.vendors && vendorData.vendors.length > 0 ? (
                  <div className="space-y-3">
                    {vendorData.vendors.slice(0, 5).map((vendor, index) => (
                      <div key={vendor.vendor_name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium truncate max-w-[140px]">{vendor.vendor_name}</span>
                          <span className="text-slate-400">
                            {formatCurrency(vendor.total_spend)} ({vendor.percent}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${vendor.percent}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    No vendor data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-card-dark border-white/10 h-full">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  <span>Weekly Spending Trend</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    Last 8 weeks
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {isLoading ? (
                  <div className="h-28 bg-white/5 rounded animate-pulse" />
                ) : trendData?.trend && trendData.trend.length > 0 ? (
                  <div className="space-y-2">
                    {/* Simple bar chart */}
                    <div className="flex items-end justify-between h-24 gap-1">
                      {trendData.trend.map((week, index) => {
                        const maxSpend = Math.max(...(trendData.trend.map(t => t.total_spend) || [1]));
                        const height = maxSpend > 0 ? (week.total_spend / maxSpend) * 100 : 0;
                        return (
                          <motion.div
                            key={week.week_start}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(height, 2)}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="flex-1 bg-gradient-to-t from-primary-500/50 to-primary-500 rounded-t cursor-pointer hover:from-primary-400/50 hover:to-primary-400 transition-colors min-h-[2px]"
                            title={`${new Date(week.week_start).toLocaleDateString()}: ${formatCurrency(week.total_spend)}`}
                          />
                        );
                      })}
                    </div>
                    {/* Week labels */}
                    <div className="flex justify-between text-[10px] text-slate-500">
                      {trendData.trend.map((week) => (
                        <span key={week.week_start}>
                          {new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    No trend data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Invoices Table - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="bg-card-dark border-white/10">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
              <CardTitle className="text-white text-sm">
                Recent Invoices
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({recentData?.count || 0})
                </span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/invoices')}
                className="text-slate-400 hover:text-white h-7 text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentData?.invoices && recentData.invoices.length > 0 ? (
                <DataTable
                  data={recentData.invoices}
                  columns={columns}
                  pageSize={10}
                  onRowClick={(invoice) => navigate(`/invoices/${invoice.id}`)}
                />
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No invoices yet. Upload your first invoice to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
