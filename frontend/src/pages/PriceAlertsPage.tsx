import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Settings } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { usePriceAlerts, useDismissAlert } from '@/hooks/useAlerts';
import type { PriceAlert } from '../types/alerts';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeading } from '@/components/layout/PageHeading';

export function PriceAlertsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'dismissed'>('active');

  const { data: alerts, isLoading } = usePriceAlerts();
  const dismissAlert = useDismissAlert('price_increase');

  return (
    <AppShell maxWidth="wide">
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center text-gray-400">
          Loading alerts...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <PageHeading className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                Price Alerts
              </PageHeading>
              <p className="text-gray-400 mt-2">
                {alerts?.total_count || 0} items with unusual price increases
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/settings/alerts')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Adjust Thresholds
            </Button>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="bg-obsidian-light border border-obsidian-border">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {alerts?.alerts && alerts.alerts.length > 0 ? (
                alerts.alerts.map((alert: PriceAlert) => (
                  <Card key={alert.alert_key} className="p-6 bg-obsidian-light border-red-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white">
                          {alert.item_description}
                        </h3>
                        <p className="text-gray-400 mt-1">{alert.vendor_name}</p>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-destructive font-bold text-2xl">
                              +{alert.change_percent.toFixed(1)}%
                            </span>
                            <span className="text-gray-400">
                              vs {alert.trigger.replace('_', '-')} average
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-gray-500">Expected</p>
                              <p className="text-lg text-white">${alert.expected_price.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Actual</p>
                              <p className="text-lg text-destructive">${alert.actual_price.toFixed(2)}</p>
                            </div>
                          </div>

                          {alert.triggers && alert.triggers.length > 1 && (
                            <div className="mt-2 text-sm text-gray-400">
                              Also exceeds 28-day threshold: +{alert.change_percent_28d?.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dismissAlert.mutate(alert.alert_key)}
                        disabled={dismissAlert.isPending}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No active price alerts. Great job keeping costs under control!
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-6">
              <div className="text-center py-12 text-gray-400">
                All alerts view - coming soon
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppShell>
  );
}

