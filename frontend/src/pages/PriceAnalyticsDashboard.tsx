/**
 * Price Analytics Dashboard
 * Modern, professional UI with animations and data visualization
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Search, 
  Lightbulb, 
  Bell,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { analyticsApi } from '@/services/api/analyticsApi';
import { formatCurrency } from '@/types/analytics';
import type { DashboardSummaryResponse, ItemsListResponse } from '@/types/analytics';
import {
  StatCard,
  DataTable,
  TrendBadge,
  EmptyState,
  FilterChips,
  ExportButton,
  Sparkline,
  type Column,
  type FilterChip,
} from '@/components/analytics';

export function PriceAnalyticsDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [trendFilter, setTrendFilter] = useState<'all' | 'increasing' | 'decreasing' | 'stable'>('all');
  const [daysBack, setDaysBack] = useState(90);

  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard-summary', daysBack],
    queryFn: () => analyticsApi.getDashboardSummary(daysBack),
  });

  // Fetch items list
  const { data: itemsData, isLoading: itemsLoading } = useQuery<ItemsListResponse>({
    queryKey: ['items-list', daysBack],
    queryFn: () => analyticsApi.getItemsList(daysBack),
  });

  // Filter items based on search and trend filter
  const filteredItems = useMemo(() => {
    if (!itemsData?.items) return [];
    
    let filtered = itemsData.items;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (trendFilter !== 'all') {
      filtered = filtered.filter(item => {
        const trend = item.price_change_7day_percent;
        if (trend === null) return false;
        
        switch (trendFilter) {
          case 'increasing': return trend > 5;
          case 'decreasing': return trend < -5;
          case 'stable': return Math.abs(trend) <= 5;
          default: return true;
        }
      });
    }
    
    return filtered;
  }, [itemsData?.items, searchTerm, trendFilter]);

  // Active filters for chips
  const activeFilters = useMemo(() => {
    const filters: FilterChip[] = [];
    if (searchTerm) {
      filters.push({ id: 'search', label: 'Search', value: searchTerm, color: 'default' });
    }
    if (trendFilter !== 'all') {
      const labels = { increasing: 'Price Increasing', decreasing: 'Price Decreasing', stable: 'Price Stable' };
      const colors = { increasing: 'destructive', decreasing: 'success', stable: 'accent' } as const;
      filters.push({ id: 'trend', label: 'Trend', value: labels[trendFilter], color: colors[trendFilter] });
    }
    if (daysBack !== 90) {
      filters.push({ id: 'days', label: 'Period', value: `${daysBack} days`, color: 'primary' });
    }
    return filters;
  }, [searchTerm, trendFilter, daysBack]);

  const handleRemoveFilter = (id: string) => {
    if (id === 'search') setSearchTerm('');
    if (id === 'trend') setTrendFilter('all');
    if (id === 'days') setDaysBack(90);
  };

  // Table columns
  const columns: Column<typeof filteredItems[0]>[] = [
    {
      key: 'description',
      header: 'Item Name',
      sortable: true,
      sortValue: (item) => item.description,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-400" />
          </div>
          <span className="font-medium text-white hover:text-primary-400 transition-colors">
            {item.description}
          </span>
        </div>
      ),
    },
    {
      key: 'last_paid_price',
      header: 'Last Price',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.last_paid_price,
      render: (item) => (
        <span className="text-white font-medium">
          {item.last_paid_price ? formatCurrency(item.last_paid_price) : '-'}
        </span>
      ),
    },
    {
      key: 'sparkline',
      header: 'Trend',
      align: 'center',
      width: '100px',
      render: (item) => {
        // Generate mock sparkline data based on averages
        const data = [
          item.avg_price_28day || item.avg_price_90day,
          item.avg_price_7day || item.avg_price_28day || item.avg_price_90day,
          item.last_paid_price,
        ].filter(Boolean) as number[];
        return <Sparkline data={data} width={80} height={24} />;
      },
    },
    {
      key: 'avg_price_7day',
      header: '7-Day Avg',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.avg_price_7day,
      render: (item) => (
        <span className="text-slate-300">
          {item.avg_price_7day ? formatCurrency(item.avg_price_7day) : '-'}
        </span>
      ),
    },
    {
      key: 'price_change_7day_percent',
      header: '7-Day Change',
      align: 'center',
      sortable: true,
      sortValue: (item) => item.price_change_7day_percent,
      render: (item) => <TrendBadge value={item.price_change_7day_percent} size="sm" />,
    },
    {
      key: 'last_paid_vendor',
      header: 'Vendor',
      sortable: true,
      sortValue: (item) => item.last_paid_vendor,
      render: (item) => (
        <span className="text-slate-400 text-sm">{item.last_paid_vendor || '-'}</span>
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
  ];

  // Export columns
  const exportColumns = [
    { key: 'description', header: 'Item Name' },
    { key: 'last_paid_price', header: 'Last Price' },
    { key: 'avg_price_7day', header: '7-Day Avg' },
    { key: 'avg_price_28day', header: '28-Day Avg' },
    { key: 'price_change_7day_percent', header: '7-Day Change %' },
    { key: 'last_paid_vendor', header: 'Vendor' },
    { key: 'last_paid_date', header: 'Last Purchase' },
  ];

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-8">
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Price Analytics' },
          ]}
        />

        {/* Header with actions */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PageHeading>Price Analytics</PageHeading>
            <p className="text-slate-400 mt-1">
              Track pricing trends and discover savings opportunities
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap gap-3"
          >
            <Button
              onClick={() => navigate('/analytics/trends')}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Price Trends
            </Button>
            <Button
              onClick={() => navigate('/analytics/vendors')}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Vendors
            </Button>
            <Button
              onClick={() => navigate('/analytics/opportunities')}
              className="bg-success-600 hover:bg-success-700 text-white"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Savings
            </Button>
            <Button
              onClick={() => navigate('/analytics/alerts')}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Items Tracked"
            value={summary?.unique_items_tracked || 0}
            subtitle="Unique inventory items"
            icon={Package}
            iconColor="text-accent-400"
            isLoading={summaryLoading}
            tooltip="Total number of unique items from your invoices"
            delay={0}
          />
          <StatCard
            title="Active Vendors"
            value={summary?.active_vendors || 0}
            subtitle="Suppliers tracked"
            icon={Building2}
            iconColor="text-success-400"
            isLoading={summaryLoading}
            tooltip="Number of vendors you've purchased from"
            delay={1}
          />
          <StatCard
            title="Total Purchases"
            value={summary?.total_purchases || 0}
            subtitle={`Last ${daysBack} days`}
            icon={Package}
            iconColor="text-primary-400"
            isLoading={summaryLoading}
            tooltip="Total line items across all invoices"
            delay={2}
          />
          <StatCard
            title="Total Spend"
            value={formatCurrency(summary?.total_spend || 0)}
            subtitle={`Last ${daysBack} days`}
            icon={DollarSign}
            iconColor="text-success-400"
            isLoading={summaryLoading}
            tooltip="Total amount spent on inventory"
            delay={3}
          />
        </div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-card-dark border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search inventory items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-obsidian/70 border-white/10 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={trendFilter} onValueChange={(v: any) => setTrendFilter(v)}>
                      <SelectTrigger className="w-full sm:w-48 bg-obsidian/70 border-white/10 text-white">
                        <SelectValue placeholder="Filter by trend" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="increasing">Price Increasing</SelectItem>
                        <SelectItem value="decreasing">Price Decreasing</SelectItem>
                        <SelectItem value="stable">Price Stable</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={daysBack.toString()} onValueChange={(v) => setDaysBack(parseInt(v))}>
                      <SelectTrigger className="w-full sm:w-32 bg-obsidian/70 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <FilterChips
                  filters={activeFilters}
                  onRemove={handleRemoveFilter}
                  onClearAll={() => {
                    setSearchTerm('');
                    setTrendFilter('all');
                    setDaysBack(90);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-card-dark border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                Inventory Price Tracking
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({filteredItems.length} items)
                </span>
              </CardTitle>
              <ExportButton 
                data={filteredItems} 
                filename="price_analytics" 
                columns={exportColumns}
              />
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <DataTable
                  data={filteredItems}
                  columns={columns}
                  pageSize={10}
                  onRowClick={(item) => navigate(`/analytics/items/${encodeURIComponent(item.description)}`)}
                  emptyState={
                    <EmptyState
                      variant={searchTerm || trendFilter !== 'all' ? 'no-results' : 'no-data'}
                      action={
                        searchTerm || trendFilter !== 'all'
                          ? {
                              label: 'Clear Filters',
                              onClick: () => {
                                setSearchTerm('');
                                setTrendFilter('all');
                              },
                            }
                          : {
                              label: 'Upload Invoices',
                              onClick: () => navigate('/invoices/upload'),
                            }
                      }
                    />
                  }
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
