import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RisingCost {
  description: string;
  price_30_days_ago: number;
  current_price: number;
  price_increase: number;
  increase_percent: number;
}

export function FastestRisingCostsCard() {
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
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-400" />
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

  return (
    <Card className="bg-card-dark border-white/10 border-red-500/20">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          Fastest Rising Costs (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors"
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
                <TrendingUp className="h-4 w-4 text-red-400" />
                <span className="text-sm font-bold text-red-400">
                  +{item.increase_percent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
