/**
 * Upgrade Modal
 * Shown when users hit usage limits or try to access premium features
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/hooks/useBilling';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Zap,
  X,
} from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string; // What feature triggered this
  currentUsage?: number;
  limit?: number;
}

const premiumFeatures = [
  'Unlimited invoice uploads',
  '50 AI image generations/month',
  'Unlimited competitor analyses',
  'Unlimited menu comparisons',
  'Priority support',
  'Data export (CSV, PDF)',
];

export function UpgradeModal({
  open,
  onOpenChange,
  feature,
  currentUsage,
  limit,
}: UpgradeModalProps) {
  const checkout = useCheckout();

  const handleUpgrade = () => {
    checkout.mutate('premium_monthly');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1E1E1E] border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-400" />
              Upgrade to Premium
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Limit Message */}
          {feature && (
            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <p className="text-sm text-primary-300">
                {currentUsage !== undefined && limit !== undefined ? (
                  <>
                    You've used <strong>{currentUsage}/{limit}</strong> {feature} this period.
                  </>
                ) : (
                  <>This feature requires a Premium subscription.</>
                )}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-white">$99</span>
              <span className="text-slate-400">/month</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Cancel anytime</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {premiumFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              className="w-full h-12 bg-primary-500 hover:bg-primary-400 text-white font-semibold"
              onClick={handleUpgrade}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Maybe later
            </Button>
          </div>

          {/* Guarantee */}
          <p className="text-xs text-center text-slate-500">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage upgrade modal state
 */
import { useState, useCallback } from 'react';

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<{
    feature?: string;
    currentUsage?: number;
    limit?: number;
  }>({});

  const showUpgradeModal = useCallback(
    (options?: { feature?: string; currentUsage?: number; limit?: number }) => {
      setContext(options || {});
      setIsOpen(true);
    },
    []
  );

  const hideUpgradeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    context,
    showUpgradeModal,
    hideUpgradeModal,
    setIsOpen,
  };
}
