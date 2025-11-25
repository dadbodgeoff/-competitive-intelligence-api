/**
 * Price Trends Page
 * Interactive charts showing price movements and anomalies
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Search,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  X,
} from 'lucide-react';
import { analyticsApi } from '@/services/api/analyticsApi';
import { formatCurrency } from '@/types/analytics';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { EmptyState, TrendBadge, ExportButton } from '@/components/analytics';

export function PriceTrendsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [daysBack, setDaysBack] = useState(90);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Fetch items list
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['items-list', daysBack],
    queryFn: () => analyticsApi.getItemsList(daysBack),
  });

  // Fetch anomalies
  const { data: anomaliesData, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['price-anomalies', daysBack],
    queryFn: () => analyticsApi.getPriceAnomalies(daysBack, 15),
  });

  // Fetch trends for selected item
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['price-trends', selectedItem, daysBack],
    queryFn: () => analyticsApi.getPriceTrends(selectedItem!, daysBack),
    enabled: !!selectedItem,
  });

  // Filter items with significant price changes
  const trendingItems = useMemo(() => {
    if (!itemsData?.items) return { increasing: [], decreasing: [] };
    
    const increasing = itemsData.items
      .filter((item) => item.price_change_7day_percent && item.price_change_7day_percent > 5)
      .sort((a, b) => (b.price_change_7day_percent || 0) - (a.price_change_7day_percent || 0))
      .slice(0, 8);

    const decreasing = itemsData.items
      .filter((item) => item.price_change_7day_percent && item.price_change_7day_percent < -5)
      .sort((a, b) => (a.price_change_7day_percent || 0) - (b.price_change_7day_percent || 0))
      .slice(0, 8);

    return { increasing, decreasing };
  }, [itemsData]);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!itemsData?.items || !searchTerm) return [];
    return itemsData.items
      .filter((item) => item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 8);
  }, [itemsData, searchTerm]);

  // Process chart data
  const chartData = useMemo(() => {
    if (!trendsData?.trends) return [];
    return trendsData.trends.map((t) => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: t.price,
      vendor: t.vendor_name,
    }));
  }, [trendsData]);

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Price Analytics', href: '/analytics' },
            { label: 'Price Trends' },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PageHeading className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary-400" />
            </div>
            Price Trends
          </PageHeading>
          <p className="text-slate-400 mt-2 ml-15">
            Track price movements and identify anomalies across your inventory
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-card-dark border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search items to view trends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-obsidian border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
                <Select value={daysBack.toString()} onValueChange={(v) => setDaysBack(parseInt(v))}>
                  <SelectTrigger className="w-32 bg-obsidian border-white/10 text-white">
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

              {/* Search Results */}
              <AnimatePresence>
                {searchTerm && filteredItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <p className="text-xs text-slate-400 mb-3">Click to view trend:</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredItems.map((item) => (
                        <motion.button
                          key={item.description}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedItem(item.description);
                            setSearchTerm('');
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all"
                        >
                          {item.description}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Item Chart */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card-dark border-primary-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl">{selectedItem}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/analytics/items/${encodeURIComponent(selectedItem)}`)}
                        className="border-white/10 text-white hover:bg-white/10"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
                        <YAxis stroke="#A8B1B9" fontSize={12} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#1E1E1E', 
                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                          }}
                          labelStyle={{ color: '#fff', fontWeight: 600 }}
                          formatter={(value: number, _name: string, props: any) => [
                            `$${value.toFixed(2)}`,
                            props.payload.vendor,
                          ]}
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
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Increases */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-card-dark border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  </div>
                  Price Increases (7-Day)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full bg-white/10" />
                    ))}
                  </div>
                ) : trendingItems.increasing.length > 0 ? (
                  <div className="space-y-2">
                    {trendingItems.increasing.map((item, idx) => (
                      <motion.div
                        key={item.description}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-destructive/50 hover:bg-destructive/5 transition-all group"
                        onClick={() => setSelectedItem(item.description)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate group-hover:text-destructive transition-colors">
                            {item.description}
                          </p>
                          <p className="text-xs text-slate-400">{item.last_paid_vendor}</p>
                        </div>
                        <TrendBadge value={item.price_change_7day_percent} size="sm" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState variant="no-items" title="No Price Increases" description="No items with significant price increases in the last 7 days." />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Price Decreases */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-card-dark border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-success-400" />
                  </div>
                  Price Decreases (7-Day)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full bg-white/10" />
                    ))}
                  </div>
                ) : trendingItems.decreasing.length > 0 ? (
                  <div className="space-y-2">
                    {trendingItems.decreasing.map((item, idx) => (
                      <motion.div
                        key={item.description}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-success-500/50 hover:bg-success-500/5 transition-all group"
                        onClick={() => setSelectedItem(item.description)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate group-hover:text-success-400 transition-colors">
                            {item.description}
                          </p>
                          <p className="text-xs text-slate-400">{item.last_paid_vendor}</p>
                        </div>
                        <TrendBadge value={item.price_change_7day_percent} size="sm" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState variant="no-items" title="No Price Decreases" description="No items with significant price decreases in the last 7 days." />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Anomalies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="bg-card-dark border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                Price Anomalies
              </CardTitle>
              {anomaliesData?.anomalies && (
                <ExportButton 
                  data={anomaliesData.anomalies} 
                  filename="price_anomalies"
                  columns={[
                    { key: 'item_description', header: 'Item' },
                    { key: 'vendor_name', header: 'Vendor' },
                    { key: 'date', header: 'Date' },
                    { key: 'current_price', header: 'Actual Price' },
                    { key: 'expected_price', header: 'Expected Price' },
                    { key: 'change_percent', header: 'Change %' },
                    { key: 'anomaly_type', header: 'Type' },
                  ]}
                />
              )}
            </CardHeader>
            <CardContent>
              {anomaliesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full bg-white/10" />
                  ))}
                </div>
              ) : anomaliesData?.anomalies && anomaliesData.anomalies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {anomaliesData.anomalies.slice(0, 8).map((anomaly, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                        anomaly.anomaly_type === 'spike'
                          ? 'bg-destructive/5 border-red-500/20 hover:border-red-500/40'
                          : 'bg-success-500/5 border-success-500/20 hover:border-success-500/40'
                      }`}
                      onClick={() => setSelectedItem(anomaly.item_description)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{anomaly.item_description}</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {anomaly.vendor_name} • {new Date(anomaly.date).toLocaleDateString()}
                          </p>
                        </div>
                        <TrendBadge 
                          value={anomaly.anomaly_type === 'spike' ? anomaly.change_percent : -anomaly.change_percent} 
                          threshold={0}
                        />
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Expected:</span>
                          <span className="text-white ml-1">{formatCurrency(anomaly.expected_price)}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                        <div>
                          <span className="text-slate-500">Actual:</span>
                          <span className={`ml-1 ${anomaly.anomaly_type === 'spike' ? 'text-destructive' : 'text-success-400'}`}>
                            {formatCurrency(anomaly.current_price)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState variant="no-data" title="No Anomalies Detected" description="All prices are within expected ranges. Great job monitoring your costs!" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
