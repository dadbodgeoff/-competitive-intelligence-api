import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/design-system/shadcn/components/card';
import { Button } from '@/design-system/shadcn/components/button';
import { Badge } from '@/design-system/shadcn/components/badge';

const freeTierFeatures = [
  '1 invoice upload per week',
  '2 bonus invoices every 28 days',
  '2 free competitor analyses per week',
  '1 premium competitor analysis per week',
  '1 menu comparison per week',
  '1 menu upload per week',
  'No credit card required',
];

const premiumFeatures = [
  'All the competitor insights you need',
  'Upload every invoice',
  'Compare all competitor menus',
  'Full price analytics',
  'Full inventory management',
  'Cancel anytime',
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-3">
          Simple Pricing. No Surprises.
        </h2>
        <p className="text-center text-gray-400 mb-12 md:mb-16 text-base md:text-lg">
          Start free. Upgrade when you're ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Free Tier */}
          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6">
                <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-4 px-4 py-1">
                  Free Forever
                </Badge>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">$0</div>
                <p className="text-sm md:text-base text-gray-400">Perfect to test it out</p>
              </div>

              <ul className="space-y-3 mb-8">
                {freeTierFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="block">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-2 border-slate-600 hover:border-cyan-400 hover:bg-cyan-500/10 text-white min-h-[48px]"
                >
                  Start Free Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-slate-800 border-emerald-400/30 hover:border-emerald-400/50 transition-colors shadow-xl relative overflow-hidden">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
              <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 text-sm font-bold shadow-lg">
                UNLIMITED
              </Badge>
            </div>
            <CardContent className="p-6 md:p-8 pt-10 md:pt-12">
              <div className="text-center mb-6">
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 px-4 py-1">
                  Coming Soon
                </Badge>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">Pricing TBD</div>
              </div>

              <ul className="space-y-3 mb-8">
                {premiumFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="block">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white min-h-[48px]"
                >
                  Join Waitlist
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
