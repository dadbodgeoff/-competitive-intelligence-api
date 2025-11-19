import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/design-system/shadcn/components/card';
import { Button } from '@/design-system/shadcn/components/button';
import { Badge } from '@/design-system/shadcn/components/badge';

const freeTierFeatures = [
  '1 invoice upload per week + 2 bonus credits every 28 days',
  'Full access to Invoice Guard, Recipe Brain, and Competitor Radar in sandbox mode',
  'Save parsed invoices, recipes, and price alerts forever once you register',
  'Export-ready data and PDF summaries for each invoice you keep',
  'Email support directly with the founder-operator who built it',
];

const premiumFeatures = [
  'Unlimited uploads, competitor runs, and historical storage',
  'Team permissions, audit logs, and dedicated onboarding for multi-unit groups',
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Right now – completely free (no card, no catch)
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Perfect for single-unit operators or curious teams. Running 5+ locations? Let’s chat so we can size the unlimited tier for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Free Forever Plan */}
          <Card className="gradient-outline surface-glass rounded-3xl border-2 border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 group overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            <CardContent className="p-8 md:p-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Free Forever Plan</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                    $0/mo
                  </Badge>
                </div>
                <p className="text-slate-400">Everything you need to start saving money immediately.</p>
              </div>

              <ul className="space-y-5 mb-10">
                {freeTierFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-slate-200 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="block">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 group-hover:shadow-emerald-500/20 transition-all"
                >
                  Start free & find your first savings
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-center text-slate-500 text-sm mt-4">
                One upload per week + auto reminder when your limit resets.
              </p>
            </CardContent>
          </Card>

          {/* Waitlist Plan */}
          <Card className="surface-glass-muted border border-slate-700 hover:border-slate-500 transition-colors relative overflow-hidden flex flex-col rounded-3xl">
            <CardContent className="p-8 md:p-10 flex-1 flex flex-col">
              <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Unlimited Plan</h3>
                  <Badge className="bg-slate-700 text-slate-300 border-slate-600 px-3 py-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Coming in 7-14 days
                  </Badge>
                </div>
                <p className="text-slate-400">Designed for multi-unit groups that need unlimited parsing, exports, and permissions.</p>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-6 mb-10 border-l-2 border-slate-700 pl-6 py-4">
                {premiumFeatures.map((feature, idx) => (
                  <p key={idx} className="text-xl text-slate-300 font-medium leading-relaxed">
                    {feature}
                  </p>
                ))}
              </div>

              <div className="mt-auto">
                <Link to="/waitlist" className="block">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full h-14 text-lg border-2 border-slate-600 hover:border-white hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                  >
                    Join the waitlist → lock in founder pricing
                  </Button>
                </Link>
                <p className="text-center text-slate-500 text-sm mt-4">
                  We&rsquo;ll reach out for a quick sizing call and lock in your grandfathered rate.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Kicker */}
        <div className="mt-24 text-center max-w-4xl mx-auto bg-gradient-to-b from-slate-800/50 to-transparent p-8 md:p-12 rounded-3xl border border-slate-700/50">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
            You’ve got nothing to lose and thousands to gain every month.
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed">
            Drop one invoice. If it doesn’t surface something actionable in 30 seconds, delete your account and tell us what we missed.
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              className="cta-button-lg bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 shadow-xl border-0"
            >
              Send me a login—let’s find margin
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
