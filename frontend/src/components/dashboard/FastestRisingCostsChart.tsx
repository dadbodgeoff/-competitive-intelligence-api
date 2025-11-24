import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface RisingCost {
  description: string;
  price_30_days_ago: number;
  current_price: number;
  price_increase: number;
  increase_percent: number;
}

export function FastestRisingCostsChart() {
  const [items, setItems] = useState<RisingCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await apiClient.get('/api/v1/dashboard/fastest-rising-costs?days=30&limit=5');
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to load rising costs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-destructive" />
            Fastest Rising Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            No significant price increases detected
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = items.map((item) => ({
    name: item.description.length > 20 
      ? item.description.substring(0, 20) + '...' 
      : item.description,
    fullName: item.description,
    percent: item.increase_percent,
    oldPrice: item.price_30_days_ago,
    newPrice: item.current_price,
  }));

  return (
    <Card className="bg-card-dark border-white/10 border-red-500/20">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Fastest Rising Costs (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" opacity={0.2} />
                <XAxis 
                  type="number"
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `+${value}%`}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  stroke="#94a3b8"
                  style={{ fontSize: '11px' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    if (name === 'percent') {
                      return [
                        `+${value.toFixed(1)}% increase`,
                        props.payload.fullName
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="percent" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percent > 20 ? '#ef4444' : entry.percent > 10 ? '#f97316' : '#fb923c'} 
                    />
                  ))}
                  <LabelList 
                    dataKey="percent" 
                    position="right" 
                    formatter={(value) => `+${Number(value).toFixed(1)}%`}
                    style={{ fill: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed List */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-red-500/20 hover:bg-destructive/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {item.description}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    ${item.price_30_days_ago.toFixed(2)} → ${item.current_price.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-bold text-destructive">
                    +{item.increase_percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
