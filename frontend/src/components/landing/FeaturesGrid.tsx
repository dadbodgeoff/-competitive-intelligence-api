import React from 'react';
import { Upload, TrendingDown, ChefHat, Eye, Zap } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Upload className="w-6 h-6 md:w-7 md:h-7" />,
    title: 'Instant Invoice Parsing',
    description: 'Snap, upload, done. Ingredients and vendors auto-linked—even with fuzzy names.',
  },
  {
    icon: <TrendingDown className="w-6 h-6 md:w-7 md:h-7" />,
    title: 'Real-Time Price Tracking',
    description: 'See your price history and trends for every item and vendor. Find the best deals instantly.',
  },
  {
    icon: <ChefHat className="w-6 h-6 md:w-7 md:h-7" />,
    title: 'Menu Costing Made Simple',
    description: 'Connect your menu and portion usage to live invoice prices. Always know your profit, plate by plate.',
  },
  {
    icon: <Eye className="w-6 h-6 md:w-7 md:h-7" />,
    title: 'Competitor Insights',
    description: 'No more research hours—get automatic updates on local menu changes and reviews, then act on actionable insights.',
  },
  {
    icon: <Zap className="w-6 h-6 md:w-7 md:h-7" />,
    title: 'Operator-Built Workflow',
    description: 'Never feels foreign. Skip the confusion—get set up in minutes, not days.',
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 md:mb-16">
          Everything You Need to Control Costs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 md:p-8 hover:border-emerald-500 transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
