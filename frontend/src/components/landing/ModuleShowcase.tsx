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
    <section className="relative py-16 md:py-20 px-4 bg-[#0A0A0A] overflow-hidden">
      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#B08968]/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${12 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>
      
      {/* Gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] opacity-10 pointer-events-none bg-[#B08968]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero CTA - Above Images */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Marketing That <span className="text-[#B08968]">Sells</span>
          </h2>
          <p className="text-[#A8B1B9] text-base md:text-lg max-w-2xl mx-auto">
            Generate scroll-stopping content in seconds. No designer needed.
          </p>
        </div>

        {/* Creative Marketing Images - Clean staggered layout */}
        <div className="mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto items-center">
          <div className="rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 aspect-video bg-[#1E1E1E] sm:translate-y-2">
            <img
              src="/examples/creative-example-1.jpg"
              alt="AI-generated Taco Tuesday marketing creative"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="rounded-xl overflow-hidden border-2 border-primary-500/30 hover:border-primary-500/60 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary-500/20 aspect-video bg-[#1E1E1E] relative">
            <img
              src="/examples/creative-example-2.jpg"
              alt="AI-generated live music event marketing creative"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 aspect-video bg-[#1E1E1E] sm:translate-y-2">
            <img
              src="/examples/creative-example-3.jpg"
              alt="AI-generated sashimi special marketing creative"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="md:hidden mb-4 relative">
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

        {/* Desktop Tab Navigation */}
        <div className="hidden md:block">
          <div className="flex justify-center gap-1 p-1.5 bg-white/5 rounded-xl max-w-fit mx-auto">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`px-3 lg:px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
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

        {/* Module Features Grid - 4 Key Points with glassmorphism */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {currentModule.features.map((feature, idx) => {
            const FeatureIcon = feature.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(145deg, rgba(176, 137, 104, 0.05) 0%, rgba(30, 30, 30, 0.6) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 24px -8px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.15) 0%, rgba(176, 137, 104, 0.05) 100%)',
                      border: '1px solid rgba(176, 137, 104, 0.2)',
                    }}
                  >
                    <FeatureIcon className="w-4 h-4 text-[#B08968]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{feature.title}</h4>
                </div>
                <p className="text-xs text-[#A8B1B9] leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
};
