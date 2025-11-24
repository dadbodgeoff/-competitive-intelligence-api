import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TopItem {
  description: string;
  order_frequency: number;
  total_quantity: number;
  total_cost: number;
  avg_unit_price: number;
}

export function TopOrderedItemsCard() {
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
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary-500" />
          Most Ordered (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-card-dark/30 hover:bg-card-dark/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {item.description}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.order_frequency}x ordered • ${item.avg_unit_price.toFixed(2)} avg
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="text-sm font-semibold text-primary-500">
                  ${item.total_cost.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
