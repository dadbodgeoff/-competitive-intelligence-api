import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlySummary {
  current_month_spend: number;
  last_month_spend: number;
  change_percent: number;
  change_amount: number;
  current_month_items: number;
  last_month_items: number;
}

export function MonthlySummaryCard() {
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
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isIncrease = data.change_percent > 0;
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-card-dark border-white/10 hover:border-white/10 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary-500" />
          This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold text-white">
              ${data.current_month_spend.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {data.current_month_items} items ordered
            </div>
          </div>

          <div className={`flex items-center gap-2 text-sm ${
            isIncrease ? 'text-destructive' : 'text-primary-500'
          }`}>
            <TrendIcon className="h-4 w-4" />
            <span className="font-semibold">
              {Math.abs(data.change_percent).toFixed(1)}%
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-slate-500">Last Month</div>
            <div className="text-sm text-slate-300">
              ${data.last_month_spend.toLocaleString()} ({data.last_month_items} items)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
