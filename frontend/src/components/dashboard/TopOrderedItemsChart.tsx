import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopItem {
  description: string;
  order_frequency: number;
  total_quantity: number;
  total_cost: number;
  avg_unit_price: number;
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

export function TopOrderedItemsChart() {
  const [items, setItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await apiClient.get('/api/v1/dashboard/top-ordered-items?days=30&limit=5');
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to load top ordered items:', error);
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

  // Prepare chart data
  const chartData = items.map((item, index) => ({
    name: item.description.length > 20 
      ? item.description.substring(0, 20) + '...' 
      : item.description,
    fullName: item.description,
    frequency: item.order_frequency,
    cost: item.total_cost,
    color: COLORS[index]
  }));

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary-500" />
          Most Ordered Items (30 days)
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
                  tickFormatter={(value) => `${value}x`}
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
                    if (name === 'frequency') {
                      return [`${value}x ordered`, props.payload.fullName];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed List */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-card-dark/30 hover:bg-card-dark/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${COLORS[index]}20`, color: COLORS[index] }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {item.description}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.order_frequency}x ordered
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary-500 ml-3">
                  ${item.total_cost.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
