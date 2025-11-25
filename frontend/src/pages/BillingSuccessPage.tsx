/**
 * Billing Success Page
 * Shown after successful Stripe checkout
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Sparkles, ArrowRight, Rocket } from 'lucide-react';

export function BillingSuccessPage() {
  const queryClient = useQueryClient();

  // Invalidate subscription query to refetch new status
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-primary-500/30 bg-[#1E1E1E]">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary-400" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to Premium! 🎉
          </h1>
          <p className="text-slate-400 mb-8">
            Your subscription is now active. You have full access to all premium features.
          </p>

          {/* What's Unlocked */}
          <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              What's Unlocked
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Unlimited invoice uploads</span>
                  <p className="text-sm text-slate-400">No more weekly limits</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">50 AI image generations/month</span>
                  <p className="text-sm text-slate-400">Create stunning marketing assets</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Unlimited competitor analyses</span>
                  <p className="text-sm text-slate-400">Deep dive into your market</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Priority support</span>
                  <p className="text-sm text-slate-400">Get help when you need it</p>
                </div>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Link to="/dashboard" className="block">
              <Button className="w-full h-12 bg-primary-500 hover:bg-primary-400 text-white font-semibold">
                <Rocket className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/creative" className="block">
              <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5">
                Try Creative Studio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Receipt Note */}
          <p className="text-xs text-slate-500 mt-6">
            A receipt has been sent to your email. You can manage your subscription anytime from Settings → Billing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
