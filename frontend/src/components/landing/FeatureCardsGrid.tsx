import React from 'react';
import { DollarSign, Clock, Compass, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <DollarSign className="w-8 h-8 text-emerald-400" />,
    title: 'MenuComp',
    description: 'Detailed competitor menu pricing comparisons and insights at your fingertips for smarter pricing decisions.',
  },
  {
    icon: <Clock className="w-8 h-8 text-cyan-400" />,
    title: 'RecipeBrain',
    description: 'Real-time cost tracking and margin calculations that keep recipes profitable and up-to-date.',
  },
  {
    icon: <Compass className="w-8 h-8 text-purple-400" />,
    title: 'CompRadar',
    description: 'Constant monitoring of competitor menu changes so you never miss market opportunities or threats.',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-emerald-300" />,
    title: 'DailyBrief',
    description: 'Daily operational summaries with alerts on sales, costs, and margin shifts to keep you proactive.',
  },
];

export const FeatureCardsGrid: React.FC = () => {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Other Powerful Features
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Beyond creative generation and invoice analytics, we've built a complete operations suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="surface-glass-muted border border-white/5 rounded-2xl p-6 md:p-8 hover-lift"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
