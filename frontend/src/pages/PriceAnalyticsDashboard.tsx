import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { PageHeading } from '../components/layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Package, Search, Filter, Lightbulb, Bell } from 'lucide-react';
import { analyticsApi } from '../services/api/analyticsApi';
import { formatCurrency, formatPercent } from '../types/analytics';
import type { DashboardSummaryResponse, ItemsListResponse } from '../types/analytics';

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
  const filteredItems = React.useMemo(() => {
    if (!itemsData?.items) return [];
    
    let filtered = itemsData.items;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Trend filter
    if (trendFilter !== 'all') {
      filtered = filtered.filter(item => {
        const trend = item.price_change_7day_percent;
        if (trend === null) return false;
        
        switch (trendFilter) {
          case 'increasing':
            return trend > 5; // More than 5% increase
          case 'decreasing':
            return trend < -5; // More than 5% decrease
          case 'stable':
            return Math.abs(trend) <= 5; // Within 5%
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [itemsData?.items, searchTerm, trendFilter]);

  const getTrendBadge = (trend: number | null) => {
    if (trend === null) return <Badge variant="secondary">No Data</Badge>;
    
    if (trend > 5) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <TrendingUp className="h-3 w-3 mr-1" />
        {formatPercent(trend)}
      </Badge>;
    } else if (trend < -5) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <TrendingDown className="h-3 w-3 mr-1" />
        {formatPercent(Math.abs(trend))}
      </Badge>;
    } else {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
        Stable {formatPercent(Math.abs(trend))}
      </Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian">
      <PageHeader 
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Price Analytics' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title & Quick Actions */}
        <div className="mb-6">
          <PageHeading>Price Analytics</PageHeading>
          <p className="text-gray-400 mb-4">Track pricing trends and discover savings opportunities</p>
          
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/analytics/opportunities')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Savings Opportunities
            </Button>
            <Button
              onClick={() => navigate('/analytics/alerts')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Price Alerts
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-obsidian-light border-obsidian-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Items Tracked
              </CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryLoading ? '...' : summary?.unique_items_tracked || 0}
              </div>
              <p className="text-xs text-gray-400">
                Unique inventory items
              </p>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-light border-obsidian-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Active Vendors
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryLoading ? '...' : summary?.active_vendors || 0}
              </div>
              <p className="text-xs text-gray-400">
                Suppliers tracked
              </p>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-light border-obsidian-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Purchases
              </CardTitle>
              <Package className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryLoading ? '...' : summary?.total_purchases || 0}
              </div>
              <p className="text-xs text-gray-400">
                Last {daysBack} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-light border-obsidian-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Spend
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryLoading ? '...' : formatCurrency(summary?.total_spend || 0)}
              </div>
              <p className="text-xs text-gray-400">
                Last {daysBack} days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-obsidian-light border-obsidian-border mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-obsidian border-obsidian-border text-white"
                  />
                </div>
              </div>
              <Select value={trendFilter} onValueChange={(value: any) => setTrendFilter(value)}>
                <SelectTrigger className="w-48 bg-obsidian border-obsidian-border text-white">
                  <SelectValue placeholder="Filter by trend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="increasing">Price Increasing</SelectItem>
                  <SelectItem value="decreasing">Price Decreasing</SelectItem>
                  <SelectItem value="stable">Price Stable</SelectItem>
                </SelectContent>
              </Select>
              <Select value={daysBack.toString()} onValueChange={(value) => setDaysBack(parseInt(value))}>
                <SelectTrigger className="w-32 bg-obsidian border-obsidian-border text-white">
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
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="bg-obsidian-light border-obsidian-border">
          <CardHeader>
            <CardTitle className="text-white">
              Inventory Price Tracking ({filteredItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading inventory data...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No items found matching your filters</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-obsidian-border">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Item Name</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">Last Price</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">7-Day Avg</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">28-Day Avg</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-medium">7-Day Trend</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">Last Purchase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => (
                      <tr key={index} className="border-b border-obsidian-border/50 hover:bg-obsidian/50">
                        <td className="py-3 px-4 text-white font-medium">{item.description}</td>
                        <td className="py-3 px-4 text-right text-white">
                          {item.last_paid_price ? formatCurrency(item.last_paid_price) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {item.avg_price_7day ? formatCurrency(item.avg_price_7day) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {item.avg_price_28day ? formatCurrency(item.avg_price_28day) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getTrendBadge(item.price_change_7day_percent)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400 text-sm">
                          {item.last_paid_date ? new Date(item.last_paid_date).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}