import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Settings } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { alertsApi } from '../services/api/alertsApi';
import type { PriceAlert } from '../types/alerts';

export function PriceAlertsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'dismissed'>('active');
  const queryClient = useQueryClient();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', 'price-increases'],
    queryFn: () => alertsApi.getPriceIncreaseAlerts()
  });
  
  const dismissMutation = useMutation({
    mutationFn: (alertKey: string) => 
      alertsApi.dismissAlert(alertKey, 'price_increase'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });
  
  return (
    <div className="min-h-screen bg-obsidian">
      <PageHeader 
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Price Analytics', href: '/analytics' },
          { label: 'Price Alerts' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading alerts...</div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  Price Alerts
                </h1>
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
                              <span className="text-red-400 font-bold text-2xl">
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
                                <p className="text-lg text-red-400">${alert.actual_price.toFixed(2)}</p>
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
                          onClick={() => dismissMutation.mutate(alert.alert_key)}
                          disabled={dismissMutation.isPending}
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
          </>
        )}
      </div>
    </div>
  );
}

