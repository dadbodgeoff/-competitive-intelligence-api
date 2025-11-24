import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeading } from '@/components/layout/PageHeading';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePriceAlerts, useUpdateAlertThresholds } from '@/hooks/useAlerts';

export function AlertSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [thresholds, setThresholds] = useState({
    price_alert_threshold_7day: 10.0,
    price_alert_threshold_28day: 15.0,
    price_drop_alert_threshold_7day: 10.0,
    price_drop_alert_threshold_28day: 15.0,
  });
  
  const { data: priceAlerts } = usePriceAlerts();
  
  useEffect(() => {
    if (priceAlerts?.thresholds) {
      setThresholds({
        price_alert_threshold_7day: priceAlerts.thresholds.increase_7day,
        price_alert_threshold_28day: priceAlerts.thresholds.increase_28day,
        price_drop_alert_threshold_7day: priceAlerts.thresholds.decrease_7day,
        price_drop_alert_threshold_28day: priceAlerts.thresholds.decrease_28day,
      });
    }
  }, [priceAlerts]);
  
  const updateMutation = useUpdateAlertThresholds();
  
  const handleSave = () => {
    updateMutation.mutate(thresholds, {
      onSuccess: () => {
        toast({
          title: 'Settings saved',
          description: 'Your alert thresholds have been updated.',
        });
        navigate(-1);
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update thresholds. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };
  
  return (
    <AppShell>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <PageHeading className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-accent-400" />
            Alert Settings
          </PageHeading>
          <p className="text-slate-400 mt-2">
            Configure when you want to be notified about price changes
          </p>
        </div>
      </div>
      
      <Card className="p-6 bg-card-dark border-white/10">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Price Increase Alerts
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Get notified when prices increase beyond these thresholds
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  7-Day Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={thresholds.price_alert_threshold_7day}
                  onChange={(e) => setThresholds({
                    ...thresholds,
                    price_alert_threshold_7day: parseFloat(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-obsidian border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Alert if price increases more than this % vs 7-day average
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  28-Day Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={thresholds.price_alert_threshold_28day}
                  onChange={(e) => setThresholds({
                    ...thresholds,
                    price_alert_threshold_28day: parseFloat(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-obsidian border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Alert if price increases more than this % vs 28-day average
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Savings Opportunity Alerts
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Get notified when prices decrease beyond these thresholds
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  7-Day Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={thresholds.price_drop_alert_threshold_7day}
                  onChange={(e) => setThresholds({
                    ...thresholds,
                    price_drop_alert_threshold_7day: parseFloat(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-obsidian border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Alert if price decreases more than this % vs 7-day average
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  28-Day Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={thresholds.price_drop_alert_threshold_28day}
                  onChange={(e) => setThresholds({
                    ...thresholds,
                    price_drop_alert_threshold_28day: parseFloat(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-obsidian border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-success-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Alert if price decreases more than this % vs 28-day average
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

