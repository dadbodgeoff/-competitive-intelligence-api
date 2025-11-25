/**
 * Item Detail Page
 * Deep dive into a single item's price history, trends, and vendor comparison
 */

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  TrendingUp,
  Package,
  Calendar,
  Building2,
  BarChart3,
  History,
  Award,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { analyticsApi } from '@/services/api/analyticsApi';
import { formatCurrency } from '@/types/analytics';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard, EmptyState, ExportButton } from '@/components/analytics';

export function ItemDetailPage() {
  const { itemDescription } = useParams<{ itemDescription: string }>();
  const navigate = useNavigate();
  const decodedDescription = decodeURIComponent(itemDescription || '');

  // Fetch price comparison across vendors
  const { data: comparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['price-comparison', decodedDescription],
    queryFn: () => analyticsApi.getPriceComparison(decodedDescription, 90),
    enabled: !!decodedDescription,
  });

  // Fetch price trends for chart
  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['price-trends', decodedDescription],
    queryFn: () => analyticsApi.getPriceTrends(decodedDescription, 90),
    enabled: !!decodedDescription,
  });

  // Fetch purchase history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['item-history', decodedDescription],
    queryFn: () => analyticsApi.getItemPurchaseHistory(decodedDescription),
    enabled: !!decodedDescription,
  });

  // Process chart data
  const chartData = useMemo(() => {
    if (!trends?.trends) return [];
    return trends.trends.map((t) => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: t.price,
      vendor: t.vendor_name,
    }));
  }, [trends]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!comparison?.vendors || comparison.vendors.length === 0) {
      return null;
    }
    const allPrices = comparison.vendors.flatMap((v) => [v.min_price, v.max_price]);
    const currentPrices = comparison.vendors.map((v) => v.current_price);
    
    // Calculate price trend
    const firstPrice = chartData[0]?.price;
    const lastPrice = chartData[chartData.length - 1]?.price;
    const priceTrend = firstPrice && lastPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : null;
    
    return {
      minPrice: Math.min(...allPrices),
      maxPrice: Math.max(...allPrices),
      avgPrice: currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length,
      vendorCount: comparison.vendors.length,
      bestVendor: comparison.best_vendor,
      priceTrend,
    };
  }, [comparison, chartData]);

  const isLoading = comparisonLoading || trendsLoading || historyLoading;

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Price Analytics', href: '/analytics' },
            { label: 'Item Detail' },
          ]}
        />

        {/* Back Button & Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/analytics')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PageHeading className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-400" />
            </div>
            {decodedDescription}
          </PageHeading>
          <p className="text-slate-400 mt-2 ml-15">
            Complete price history and vendor comparison
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Best Price"
            value={stats?.bestVendor ? formatCurrency(stats.bestVendor.current_price) : '-'}
            subtitle={stats?.bestVendor?.vendor_name || 'No data'}
            icon={Award}
            iconColor="text-primary-400"
            isLoading={isLoading}
            tooltip="Lowest current price across all vendors"
            delay={0}
          />
          <StatCard
            title="Price Range"
            value={stats ? `${formatCurrency(stats.minPrice)} - ${formatCurrency(stats.maxPrice)}` : '-'}
            subtitle="Last 90 days"
            icon={BarChart3}
            iconColor="text-accent-400"
            isLoading={isLoading}
            tooltip="Min and max prices seen in the period"
            delay={1}
          />
          <StatCard
            title="Vendors"
            value={stats?.vendorCount || 0}
            subtitle="Supplying this item"
            icon={Building2}
            iconColor="text-success-400"
            isLoading={isLoading}
            tooltip="Number of vendors you've purchased this item from"
            delay={2}
          />
          <StatCard
            title="Total Purchases"
            value={history?.total_purchases || 0}
            subtitle="All time"
            icon={Package}
            iconColor="text-accent-400"
            isLoading={isLoading}
            tooltip="Total number of times you've purchased this item"
            delay={3}
          />
        </div>

        {/* Price Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-card-dark border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
            <CardHeader className="relative flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary-400" />
                </div>
                Price Trend (90 Days)
                {stats?.priceTrend !== null && stats?.priceTrend !== undefined && (
                  <Badge className={`ml-2 ${stats.priceTrend > 0 ? 'bg-destructive/20 text-destructive' : 'bg-success-500/20 text-success-400'}`}>
                    {stats.priceTrend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {Math.abs(stats.priceTrend).toFixed(1)}%
                  </Badge>
                )}
              </CardTitle>
              {chartData.length > 0 && (
                <ExportButton
                  data={chartData}
                  filename={`${decodedDescription}_price_trend`}
                  columns={[
                    { key: 'date', header: 'Date' },
                    { key: 'price', header: 'Price' },
                    { key: 'vendor', header: 'Vendor' },
                  ]}
                />
              )}
            </CardHeader>
            <CardContent className="relative">
              {trendsLoading ? (
                <Skeleton className="h-72 w-full bg-white/10" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B08968" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#B08968" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" stroke="#A8B1B9" fontSize={12} />
                    <YAxis
                      stroke="#A8B1B9"
                      fontSize={12}
                      tickFormatter={(v) => `$${v.toFixed(2)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#B08968"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState variant="no-trends" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor Comparison */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-card-dark border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary-400" />
                  </div>
                  Vendor Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparisonLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full bg-white/10 rounded-xl" />
                    ))}
                  </div>
                ) : comparison?.vendors && comparison.vendors.length > 0 ? (
                  <div className="space-y-3">
                    {comparison.vendors.map((vendor, idx) => (
                      <motion.div
                        key={vendor.vendor_name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border transition-all ${
                          idx === 0
                            ? 'bg-primary-500/10 border-primary-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              idx === 0 ? 'bg-primary-500/20' : 'bg-white/10'
                            }`}>
                              <Building2 className={`h-5 w-5 ${idx === 0 ? 'text-primary-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{vendor.vendor_name}</span>
                                {idx === 0 && (
                                  <Badge className="bg-primary-500/20 text-primary-400 border-primary-500/30">
                                    <Award className="h-3 w-3 mr-1" />
                                    Best Price
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-400 mt-1">
                                {vendor.purchase_count} purchases • Last: {new Date(vendor.last_purchase_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {formatCurrency(vendor.current_price)}
                            </div>
                            <p className="text-xs text-slate-400">
                              Avg: {formatCurrency(vendor.avg_price)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState variant="no-vendors" title="No Vendor Data" description="No vendor comparison data available for this item." />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Purchases */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="bg-card-dark border-white/10 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <History className="h-4 w-4 text-primary-400" />
                  </div>
                  Recent Purchases
                </CardTitle>
                {history?.purchases && (
                  <ExportButton
                    data={history.purchases}
                    filename={`${decodedDescription}_purchase_history`}
                    columns={[
                      { key: 'date', header: 'Date' },
                      { key: 'vendor', header: 'Vendor' },
                      { key: 'price', header: 'Price' },
                      { key: 'quantity', header: 'Quantity' },
                      { key: 'invoice_number', header: 'Invoice' },
                    ]}
                  />
                )}
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full bg-white/10 rounded-xl" />
                    ))}
                  </div>
                ) : history?.purchases && history.purchases.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.purchases.slice(0, 10).map((purchase, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <span className="text-sm text-white font-medium">
                              {new Date(purchase.date).toLocaleDateString()}
                            </span>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {purchase.vendor} • Invoice #{purchase.invoice_number}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            {formatCurrency(purchase.price)}
                          </div>
                          <p className="text-xs text-slate-400">
                            Qty: {purchase.quantity}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState variant="no-history" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
