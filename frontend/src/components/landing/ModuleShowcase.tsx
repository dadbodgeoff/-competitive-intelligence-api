import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Calendar,
  ChefHat,
  GitCompare,
  Star
} from 'lucide-react';

interface ModuleFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Module {
  id: string;
  name: string;
  features: ModuleFeature[];
}

const modules: Module[] = [
  {
    id: 'invoice',
    name: 'Invoice Upload',
    features: [
      {
        icon: <FileText className="w-6 h-6" />,
        title: 'Instant OCR Extraction',
        description: 'Upload any invoice format and extract line items in seconds with AI-powered accuracy.'
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Auto-Matching',
        description: 'Automatically matches invoice items to your inventory, learning your naming conventions.'
      },
      {
        icon: <DollarSign className="w-6 h-6" />,
        title: 'Price Change Alerts',
        description: 'Get notified when vendor prices increase so you can adjust recipes and protect margins.'
      },
      {
        icon: <FileText className="w-6 h-6" />,
        title: 'Historical Tracking',
        description: 'Build complete price history for every ingredient across all vendors for better negotiation.'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Price Analytics',
    features: [
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Price Trend Visualization',
        description: 'Interactive charts show price movements over time, helping you spot seasonal patterns.'
      },
      {
        icon: <GitCompare className="w-6 h-6" />,
        title: 'Variance Analysis',
        description: 'Compare actual vs. budgeted costs with automatic variance calculations.'
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Predictive Forecasting',
        description: 'AI-powered predictions for future price movements based on historical data.'
      },
      {
        icon: <DollarSign className="w-6 h-6" />,
        title: 'Multi-Vendor Comparison',
        description: 'Side-by-side pricing across all vendors to ensure you\'re getting the best deal.'
      }
    ]
  },
  {
    id: 'cogs',
    name: 'Cost of Goods',
    features: [
      {
        icon: <DollarSign className="w-6 h-6" />,
        title: 'Real-Time Recipe Costing',
        description: 'Every recipe updates automatically when ingredient prices change.'
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Margin Alerts',
        description: 'Get instant notifications when recipe margins fall below target thresholds.'
      },
      {
        icon: <GitCompare className="w-6 h-6" />,
        title: 'Menu Engineering',
        description: 'Identify your stars, plowhorses, puzzles, and dogs with profitability analysis.'
      },
      {
        icon: <ChefHat className="w-6 h-6" />,
        title: 'Batch Costing',
        description: 'Calculate costs for prep batches, catering orders, and special events with precision.'
      }
    ]
  },
  {
    id: 'creative',
    name: 'Creative Marketing',
    features: [
      {
        icon: <Sparkles className="w-6 h-6" />,
        title: 'AI Image Generation',
        description: 'Generate restaurant-specific marketing images with Nano Banana AI in seconds.'
      },
      {
        icon: <FileText className="w-6 h-6" />,
        title: 'Brand Consistency',
        description: 'Centralized brand profiles ensure every asset matches your colors, fonts, and voice.'
      },
      {
        icon: <Sparkles className="w-6 h-6" />,
        title: 'Template Library',
        description: '50+ restaurant-specific templates for specials, events, hiring, and reviews.'
      },
      {
        icon: <FileText className="w-6 h-6" />,
        title: 'Multi-Format Export',
        description: 'Download assets optimized for Instagram, Facebook, print, and digital displays.'
      }
    ]
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    features: [
      {
        icon: <Calendar className="w-6 h-6" />,
        title: 'Demand Forecasting',
        description: 'AI predicts busy periods based on historical sales, weather, and local events.'
      },
      {
        icon: <DollarSign className="w-6 h-6" />,
        title: 'Labor Cost Optimization',
        description: 'Automatically suggests schedules that meet demand within your labor budget.'
      },
      {
        icon: <Calendar className="w-6 h-6" />,
        title: 'Shift Marketplace',
        description: 'Staff can swap shifts, pick up extras, and request time off with manager approval.'
      },
      {
        icon: <FileText className="w-6 h-6" />,
        title: 'Compliance Tracking',
        description: 'Automatic break scheduling, overtime alerts, and labor law compliance.'
      }
    ]
  },
  {
    id: 'prep',
    name: 'Daily Prep',
    features: [
      {
        icon: <ChefHat className="w-6 h-6" />,
        title: 'Smart Prep Lists',
        description: 'AI-generated prep quantities based on forecasted sales and current inventory.'
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Waste Reduction',
        description: 'Track prep vs. actual usage to identify over-prepping patterns.'
      },
      {
        icon: <FileText className="w-6 h-6" />,
        title: 'Batch Tracking',
        description: 'Label and track prep batches with dates and expiration for food safety.'
      },
      {
        icon: <ChefHat className="w-6 h-6" />,
        title: 'Recipe Integration',
        description: 'Prep lists automatically pull from your recipe database with exact measurements.'
      }
    ]
  },
  {
    id: 'menu-comparison',
    name: 'Menu Comparison',
    features: [
      {
        icon: <GitCompare className="w-6 h-6" />,
        title: 'Competitor Menu Parsing',
        description: 'Upload competitor menus and AI extracts every item, price, and description.'
      },
      {
        icon: <DollarSign className="w-6 h-6" />,
        title: 'Price Positioning',
        description: 'See exactly where your prices sit vs. competitors with visual heat maps.'
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Menu Gap Identification',
        description: 'Discover profitable menu items your competitors offer that you\'re missing.'
      },
      {
        icon: <GitCompare className="w-6 h-6" />,
        title: 'Market Trend Tracking',
        description: 'Monitor how competitor pricing changes over time to stay ahead of shifts.'
      }
    ]
  },
  {
    id: 'reviews',
    name: 'Review Analysis',
    features: [
      {
        icon: <Star className="w-6 h-6" />,
        title: 'Sentiment Analysis',
        description: 'AI analyzes thousands of reviews to identify patterns in customer satisfaction.'
      },
      {
        icon: <FileText className="w-6 h-6" />,
        title: 'Topic Extraction',
        description: 'Automatically categorizes feedback by food quality, service, ambiance, and value.'
      },
      {
        icon: <GitCompare className="w-6 h-6" />,
        title: 'Competitive Benchmarking',
        description: 'Compare your review sentiment against local competitors to identify strengths.'
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Action Recommendations',
        description: 'Get specific, prioritized suggestions for menu changes and service improvements.'
      }
    ]
  }
];

export const ModuleShowcase: React.FC = () => {
  const [activeModule, setActiveModule] = useState('invoice');
  const currentModule = modules.find(m => m.id === activeModule) || modules[0];

  return (
    <section className="py-16 md:py-24 px-4 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xl text-slate-300">
            Eight powerful modules working together to drive profitability.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-700 mb-10">
          <div className="flex justify-center -mb-px">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`px-4 lg:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeModule === module.id
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {module.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {currentModule.features.map((feature, index) => (
            <div key={index} className="flex gap-4 min-h-[120px]">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-base text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Example Images for Creative Marketing */}
        {activeModule === 'creative' && (
          <div className="mt-10 grid grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <img
                src={`${import.meta.env.BASE_URL}examples/creative-example-1.jpg`}
                alt="AI-generated restaurant marketing creative example 1"
                className="w-full h-auto"
                onError={(e) => {
                  console.error('Image failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <img
                src={`${import.meta.env.BASE_URL}examples/creative-example-2.jpg`}
                alt="AI-generated restaurant marketing creative example 2"
                className="w-full h-auto"
                onError={(e) => {
                  console.error('Image failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
