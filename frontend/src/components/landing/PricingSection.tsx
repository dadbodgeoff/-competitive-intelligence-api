import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Sparkles, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/design-system/shadcn/components/card';
import { Button } from '@/design-system/shadcn/components/button';
import { Badge } from '@/design-system/shadcn/components/badge';
import { useCheckout } from '@/hooks/useBilling';
import { useAuthStore } from '@/stores/authStore';
import { featureFlags } from '@/config/featureFlags';

const freeTierFeatures = [
  '1 invoice upload per week + 2 bonus every 28 days',
  '5 AI image generations per month',
  'Recipe costing that updates automatically',
  'Basic competitor analysis',
  'Unlimited brand profiles',
  'Email support',
];

const premiumFeatures = [
  'Unlimited invoice uploads',
  '50 AI image generations per month',
  'Unlimited competitor analyses',
  'Unlimited menu comparisons',
  'Priority support',
  'Data export (CSV, PDF)',
];

const enterpriseFeatures = [
  'Everything in Premium',
  'Unlimited AI generations',
  'Team permissions & audit logs',
  'Multi-location support',
  'Dedicated onboarding',
  'API access & custom integrations',
];

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkout = useCheckout();

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      // Redirect to register with upgrade intent
      navigate('/register?plan=premium_monthly');
      return;
    }
    // If billing is disabled, just go to register
    if (!featureFlags.BILLING_ENABLED) {
      navigate('/register?plan=premium_monthly');
      return;
    }
    // Start checkout
    checkout.mutate('premium_monthly');
  };

  return (
    <section id="pricing" className="py-20 md:py-32 relative bg-[#121212]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <Badge className="bg-primary-500/20 text-primary-400 border-primary-500/30 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Now with AI Creative Studio
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Simple pricing. Serious results.
          </h2>
          <p className="text-xl text-[#A8B1B9] max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="rounded-2xl border border-white/10 bg-[#1E1E1E]">
            <CardContent className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-[#A8B1B9]">/mo</span>
                </div>
                <p className="text-[#A8B1B9] text-sm mt-2">
                  Perfect for trying out RestaurantIQ
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {freeTierFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A8B1B9] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#A8B1B9]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="block">
                <Button 
                  variant="outline"
                  className="w-full h-12 border-white/10 hover:border-[#4A6572] text-white bg-transparent"
                >
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Plan - Featured */}
          <Card className="rounded-2xl border-2 border-primary-500/50 bg-[#1E1E1E] relative overflow-hidden lg:scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary-500 text-white border-0 text-xs">
                Most Popular
              </Badge>
            </div>
            <CardContent className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$99</span>
                  <span className="text-[#A8B1B9]">/mo</span>
                </div>
                <p className="text-[#A8B1B9] text-sm mt-2">
                  For serious operators who want unlimited access
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#E0E0E0]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                size="lg" 
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
                    Upgrade to Premium
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-[#A8B1B9] text-xs mt-3">
                Cancel anytime • 30-day money-back guarantee
              </p>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="rounded-2xl border border-white/10 bg-[#1E1E1E]">
            <CardContent className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$299</span>
                  <span className="text-[#A8B1B9]">/mo</span>
                </div>
                <p className="text-[#A8B1B9] text-sm mt-2">
                  For multi-unit operators and groups
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {enterpriseFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-[#A8B1B9] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#A8B1B9]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline"
                className="w-full h-12 border-white/10 hover:border-[#4A6572] text-white bg-transparent"
                onClick={() => window.location.href = 'mailto:enterprise@restaurantiq.us?subject=Enterprise%20Inquiry'}
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust */}
        <div className="mt-14 text-center">
          <p className="text-[#A8B1B9] text-sm">
            Built by a restaurant owner who closed at 2am for a decade. No salespeople. Your data stays yours.
          </p>
        </div>
      </div>
    </section>
  );
};
