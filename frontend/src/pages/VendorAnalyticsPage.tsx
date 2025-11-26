/**
 * Vendor Analytics Page
 * Compare vendor performance, pricing, and reliability
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Building2,
  Search,
  DollarSign,
  Package,
  BarChart3,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { analyticsApi } from '@/services/api/analyticsApi';
import { formatCurrency } from '@/types/analytics';
import { StatCard, EmptyState, ExportButton } from '@/components/analytics';

export function VendorAnalyticsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [daysBack, setDaysBack] = useState(90);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Fetch items list to extract unique vendors
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['items-list', daysBack],
    queryFn: () => analyticsApi.getItemsList(daysBack),
  });

  // Extract unique vendors from items
  const vendors = useMemo(() => {
    if (!itemsData?.items) return [];
    const vendorMap = new Map<string, { itemCount: number; totalSpend: number; lastPurchase: string }>();
    
    itemsData.items.forEach((item) => {
      const vendor = item.last_paid_vendor;
      if (!vendor) return;
      
      const existing = vendorMap.get(vendor) || { itemCount: 0, totalSpend: 0, lastPurchase: '' };
      vendorMap.set(vendor, {
        itemCount: existing.itemCount + 1,
        totalSpend: existing.totalSpend + item.last_paid_price * item.purchase_count,
        lastPurchase: item.last_paid_date > existing.lastPurchase ? item.last_paid_date : existing.lastPurchase,
      });
    });

    return Array.from(vendorMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [itemsData]);

  // Fetch vendor performance for selected vendor
  const { data: vendorPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['vendor-performance', selectedVendor, daysBack],
    queryFn: () => analyticsApi.getVendorPerformance(selectedVendor!, daysBack),
    enabled: !!selectedVendor,
  });

  // Filter vendors by search
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors;
    return vendors.filter((v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendors, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      vendorCount: vendors.length,
      totalSpend: vendors.reduce((sum, v) => sum + v.totalSpend, 0),
      totalItems: vendors.reduce((sum, v) => sum + v.itemCount, 0),
    };
  }, [vendors]);

  // Get rank badge color
  const getRankBadge = (index: number) => {
    if (index === 0) return { label: '#1', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (index === 1) return { label: '#2', className: 'bg-slate-400/20 text-slate-300 border-slate-400/30' };
    if (index === 2) return { label: '#3', className: 'bg-orange-600/20 text-orange-400 border-orange-600/30' };
    return null;
  };

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        <ModulePageHeader
          icon={Building2}
          title="Vendor Analytics"
          description="Compare vendor performance, pricing, and reliability"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Active Vendors"
            value={totals.vendorCount}
            subtitle={`Last ${daysBack} days`}
            icon={Building2}
            iconColor="text-primary-400"
            isLoading={itemsLoading}
            tooltip="Number of unique vendors you've purchased from"
            delay={0}
            compact
          />
          <StatCard
            title="Total Spend"
            value={formatCurrency(totals.totalSpend)}
            subtitle="Across all vendors"
            icon={DollarSign}
            iconColor="text-success-400"
            isLoading={itemsLoading}
            tooltip="Total estimated spend based on purchase history"
            delay={1}
            compact
          />
          <StatCard
            title="Items Tracked"
            value={totals.totalItems}
            subtitle="Unique items"
            icon={Package}
            iconColor="text-accent-400"
            isLoading={itemsLoading}
            tooltip="Total unique items across all vendors"
            delay={2}
            compact
          />
          <StatCard
            title="Avg per Vendor"
            value={formatCurrency(totals.vendorCount > 0 ? totals.totalSpend / totals.vendorCount : 0)}
            subtitle="Average spend"
            icon={BarChart3}
            iconColor="text-primary-400"
            isLoading={itemsLoading}
            tooltip="Average spend per vendor"
            delay={3}
            compact
          />
        </div>

        {/* Filters */}
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
                    placeholder="Search vendors..."
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
                <ExportButton
                  data={vendors}
                  filename="vendor_analytics"
                  columns={[
                    { key: 'name', header: 'Vendor Name' },
                    { key: 'itemCount', header: 'Items' },
                    { key: 'totalSpend', header: 'Total Spend' },
                    { key: 'lastPurchase', header: 'Last Purchase' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vendor Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {itemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 bg-white/10 rounded-xl" />
              ))}
            </div>
          ) : filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredVendors.map((vendor, index) => {
                  const rank = getRankBadge(vendors.indexOf(vendor));
                  const isSelected = selectedVendor === vendor.name;
                  
                  return (
                    <motion.div
                      key={vendor.name}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card
                        className={`bg-card-dark border-white/10 cursor-pointer transition-all overflow-hidden relative group ${
                          isSelected ? 'border-primary-500 ring-2 ring-primary-500/20' : 'hover:border-primary-500/50'
                        }`}
                        onClick={() => setSelectedVendor(vendor.name)}
                      >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <CardHeader className="pb-2 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary-400" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-white">{vendor.name}</CardTitle>
                                {rank && (
                                  <Badge className={`mt-1 ${rank.className}`}>
                                    {rank.label} by spend
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <CheckCircle2 className="h-5 w-5 text-primary-400" />
                              </motion.div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-white/5">
                              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                <Package className="h-3 w-3" />
                                Items
                              </div>
                              <p className="text-xl font-semibold text-white">{vendor.itemCount}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5">
                              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                <DollarSign className="h-3 w-3" />
                                Est. Spend
                              </div>
                              <p className="text-xl font-semibold text-primary-400">
                                {formatCurrency(vendor.totalSpend)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            Last purchase: {new Date(vendor.lastPurchase).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState
              variant="no-vendors"
              action={
                searchTerm
                  ? { label: 'Clear Search', onClick: () => setSearchTerm('') }
                  : undefined
              }
            />
          )}
        </motion.div>

        {/* Selected Vendor Details */}
        <AnimatePresence>
          {selectedVendor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card-dark border-primary-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary-400" />
                    </div>
                    {selectedVendor} - Performance Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  {performanceLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 bg-white/10 rounded-xl" />
                      ))}
                    </div>
                  ) : vendorPerformance && !vendorPerformance.error ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                          <Package className="h-3.5 w-3.5" />
                          Total Items
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {vendorPerformance.performance?.total_items ?? vendorPerformance.total_items ?? 0}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Total Purchases
                        </div>
                        <p className="text-3xl font-bold text-primary-400">
                          {vendorPerformance.performance?.total_purchases ?? vendorPerformance.total_purchases ?? 0}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                          <DollarSign className="h-3.5 w-3.5" />
                          Avg Price
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(vendorPerformance.performance?.avg_price ?? vendorPerformance.avg_price ?? 0)}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                          <BarChart3 className="h-3.5 w-3.5" />
                          Price Volatility
                        </div>
                        <p className="text-3xl font-bold text-success-400">
                          {formatCurrency(vendorPerformance.performance?.price_volatility ?? vendorPerformance.price_volatility ?? 0)}
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <EmptyState variant="no-data" title="No Performance Data" description="Unable to load performance metrics for this vendor." />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
