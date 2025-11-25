import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Sparkles,
  ChefHat,
  Star,
  Clock,
  Layers,
  Target,
  BarChart3,
  Zap,
  Shield,
  Users,
  Package,
  Activity,
  Eye,
  Award,
  RefreshCw,
  CheckCircle2,
  MapPin,
  MessageSquare,
  ChevronDown,
} from '@/components/ui/icons';
import { LucideIcon } from 'lucide-react';

interface ModuleFeature {
  icon: LucideIcon;
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
        icon: Zap,
        title: 'Instant OCR Extraction',
        description: 'Upload any invoice format and extract line items in seconds with AI-powered accuracy.'
      },
      {
        icon: RefreshCw,
        title: 'Auto-Matching',
        description: 'Automatically matches invoice items to your inventory, learning your naming conventions.'
      },
      {
        icon: Activity,
        title: 'Price Change Alerts',
        description: 'Get notified when vendor prices increase so you can adjust recipes and protect margins.'
      },
      {
        icon: Clock,
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
        icon: BarChart3,
        title: 'Price Trend Visualization',
        description: 'Interactive charts show price movements over time, helping you spot seasonal patterns.'
      },
      {
        icon: Target,
        title: 'Variance Analysis',
        description: 'Compare actual vs. budgeted costs with automatic variance calculations.'
      },
      {
        icon: TrendingUp,
        title: 'Predictive Forecasting',
        description: 'AI-powered predictions for future price movements based on historical data.'
      },
      {
        icon: Layers,
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
        icon: DollarSign,
        title: 'Real-Time Recipe Costing',
        description: 'Every recipe updates automatically when ingredient prices change.'
      },
      {
        icon: Activity,
        title: 'Margin Alerts',
        description: 'Get instant notifications when recipe margins fall below target thresholds.'
      },
      {
        icon: Award,
        title: 'Menu Engineering',
        description: 'Identify your stars, plowhorses, puzzles, and dogs with profitability analysis.'
      },
      {
        icon: Package,
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
        icon: Sparkles,
        title: 'AI Image Generation',
        description: 'Generate restaurant-specific marketing images with Nano Banana AI in seconds.'
      },
      {
        icon: Shield,
        title: 'Brand Consistency',
        description: 'Centralized brand profiles ensure every asset matches your colors, fonts, and voice.'
      },
      {
        icon: Layers,
        title: 'Template Library',
        description: '50+ restaurant-specific templates for specials, events, hiring, and reviews.'
      },
      {
        icon: Eye,
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
        icon: TrendingUp,
        title: 'Demand Forecasting',
        description: 'AI predicts busy periods based on historical sales, weather, and local events.'
      },
      {
        icon: DollarSign,
        title: 'Labor Cost Optimization',
        description: 'Automatically suggests schedules that meet demand within your labor budget.'
      },
      {
        icon: Users,
        title: 'Shift Marketplace',
        description: 'Staff can swap shifts, pick up extras, and request time off with manager approval.'
      },
      {
        icon: CheckCircle2,
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
        icon: ChefHat,
        title: 'Smart Prep Lists',
        description: 'AI-generated prep quantities based on forecasted sales and current inventory.'
      },
      {
        icon: Target,
        title: 'Waste Reduction',
        description: 'Track prep vs. actual usage to identify over-prepping patterns.'
      },
      {
        icon: Clock,
        title: 'Batch Tracking',
        description: 'Label and track prep batches with dates and expiration for food safety.'
      },
      {
        icon: FileText,
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
        icon: Eye,
        title: 'Competitor Menu Parsing',
        description: 'Upload competitor menus and AI extracts every item, price, and description.'
      },
      {
        icon: MapPin,
        title: 'Price Positioning',
        description: 'See exactly where your prices sit vs. competitors with visual heat maps.'
      },
      {
        icon: Target,
        title: 'Menu Gap Identification',
        description: 'Discover profitable menu items your competitors offer that you\'re missing.'
      },
      {
        icon: Activity,
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
        icon: Star,
        title: 'Sentiment Analysis',
        description: 'AI analyzes thousands of reviews to identify patterns in customer satisfaction.'
      },
      {
        icon: MessageSquare,
        title: 'Topic Extraction',
        description: 'Automatically categorizes feedback by food quality, service, ambiance, and value.'
      },
      {
        icon: BarChart3,
        title: 'Competitive Benchmarking',
        description: 'Compare your review sentiment against local competitors to identify strengths.'
      },
      {
        icon: Zap,
        title: 'Action Recommendations',
        description: 'Get specific, prioritized suggestions for menu changes and service improvements.'
      }
    ]
  }
];

export const ModuleShowcase: React.FC = () => {
  const [activeModule, setActiveModule] = useState('creative');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentModule = modules.find((m) => m.id === activeModule) || modules[0];

  return (
    <section className="py-10 md:py-14 px-4 bg-[#121212]">
      <div className="max-w-6xl mx-auto">
        {/* Callout + Creative Marketing Images */}
        <div className="text-center mb-6">
          <p className="text-slate-300 text-base md:text-lg">
            See how our <span className="text-primary-400 font-semibold">Creative Marketing</span> module saves you time and money
          </p>
        </div>

        {/* Creative Marketing Images - Staggered layout with label on center */}
        <div className="mb-8 md:mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto items-center">
          <div className="rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 aspect-video bg-[#1E1E1E] sm:translate-y-3">
            <img
              src="/examples/creative-example-1.jpg"
              alt="AI-generated Taco Tuesday marketing creative"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden border-2 border-primary-500/30 hover:border-primary-500/60 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary-500/20 aspect-video bg-[#1E1E1E] sm:-translate-y-1 relative">
            {/* Creative Marketing label centered on middle image */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-primary-500/40">
                <Icon icon={Sparkles} size="xs" variant="primary" />
                <span className="text-xs font-semibold text-primary-300">Creative Marketing</span>
              </div>
            </div>
            <img
              src="/examples/creative-example-2.jpg"
              alt="AI-generated live music event marketing creative"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 aspect-video bg-[#1E1E1E] sm:translate-y-3">
            <img
              src="/examples/creative-example-3.jpg"
              alt="AI-generated sashimi special marketing creative"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="md:hidden mb-10 relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#1E1E1E] border border-white/10 rounded-xl text-white font-medium"
          >
            <span>{currentModule.name}</span>
            <Icon
              icon={ChevronDown}
              size="sm"
              variant="muted"
              className={`transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {mobileMenuOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-white/10 rounded-xl overflow-hidden shadow-xl">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    activeModule === module.id
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-[#A8B1B9] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {module.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tab Navigation - Bolder styling */}
        <div className="hidden md:block mb-10">
          <div className="flex justify-center gap-1 p-1.5 bg-white/5 rounded-xl max-w-fit mx-auto">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`px-4 lg:px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeModule === module.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {module.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
          {currentModule.features.map((feature, index) => (
            <div key={index} className="flex gap-5 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary-500/20 group-hover:scale-105">
                <Icon icon={feature.icon} size="lg" variant="primary" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-[#A8B1B9] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};
