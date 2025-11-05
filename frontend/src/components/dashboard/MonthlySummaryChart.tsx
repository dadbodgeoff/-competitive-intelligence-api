import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlySummary {
  current_month_spend: number;
  last_month_spend: number;
  change_percent: number;
  change_amount: number;
  current_month_items: number;
  last_month_items: number;
}

export function MonthlySummaryChart() {
  const [data, setData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await apiClient.get('/api/v1/dashboard/monthly-summary');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load monthly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isIncrease = data.change_percent > 0;
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;

  // Create chart data
  const chartData = [
    { name: 'Last Month', spend: data.last_month_spend, items: data.last_month_items },
    { name: 'This Month', spend: data.current_month_spend, items: data.current_month_items },
  ];

  return (
    <Card className="bg-card-dark border-white/10 hover:border-emerald-500/30 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          Monthly Spending Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold text-white">
                ${data.current_month_spend.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                This Month ({data.current_month_items} items)
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center justify-end gap-2 text-sm ${
                isIncrease ? 'text-red-400' : 'text-emerald-400'
              }`}>
                <TrendIcon className="h-4 w-4" />
                <span className="font-semibold text-lg">
                  {Math.abs(data.change_percent).toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-slate-400 mt-1">
                vs last month
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#spendGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Last Month</span>
              <span className="text-slate-300 font-medium">
                ${data.last_month_spend.toLocaleString()} ({data.last_month_items} items)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
