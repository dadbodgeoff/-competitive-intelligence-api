import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Vendor {
  vendor: string;
  order_count?: number;
  total_spend?: number;
  avg_order_value?: number;
}

interface VendorScorecard {
  most_used: Vendor[];
  highest_spend: Vendor[];
  avg_order_value: Vendor[];
  total_vendors: number;
}

export function VendorScorecardCard() {
  const [data, setData] = useState<VendorScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await apiClient.get('/api/v1/dashboard/vendor-scorecard?days=90');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load vendor scorecard:', error);
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
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Store className="h-5 w-5 text-accent-400" />
          Vendor Scorecard
        </CardTitle>
        <div className="text-sm text-slate-400">
          {data.total_vendors} vendors tracked
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="most-used" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card-dark/50">
            <TabsTrigger value="most-used">Most Used</TabsTrigger>
            <TabsTrigger value="highest-spend">Highest Spend</TabsTrigger>
            <TabsTrigger value="avg-value">Avg Order</TabsTrigger>
          </TabsList>

          <TabsContent value="most-used" className="mt-4">
            <div className="space-y-2">
              {data.most_used.slice(0, 3).map((vendor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-card-dark/30"
                >
                  <div className="text-sm text-white truncate flex-1">
                    {vendor.vendor}
                  </div>
                  <div className="text-sm text-accent-400 font-semibold ml-2">
                    {vendor.order_count} orders
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="highest-spend" className="mt-4">
            <div className="space-y-2">
              {data.highest_spend.slice(0, 3).map((vendor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-card-dark/30"
                >
                  <div className="text-sm text-white truncate flex-1">
                    {vendor.vendor}
                  </div>
                  <div className="text-sm text-primary-500 font-semibold ml-2">
                    ${vendor.total_spend?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="avg-value" className="mt-4">
            <div className="space-y-2">
              {data.avg_order_value.slice(0, 3).map((vendor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-card-dark/30"
                >
                  <div className="text-sm text-white truncate flex-1">
                    {vendor.vendor}
                  </div>
                  <div className="text-sm text-accent-400 font-semibold ml-2">
                    ${vendor.avg_order_value?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
