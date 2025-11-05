import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, CheckCircle2, Upload, DollarSign, TrendingDown, ChefHat, ArrowRight, Zap, Shield } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';
import { Badge } from '@/design-system/shadcn/components/badge';
import { Progress } from '@/design-system/shadcn/components/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { id } from 'date-fns/locale';
import { id } from 'date-fns/locale';
import { id } from 'date-fns/locale';
import { id } from 'date-fns/locale';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('Ready to upload');
  const [isAnimating, setIsAnimating] = useState(false);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);

  // Simulated upload animation - shows actual invoice processing value
  useEffect(() => {
    if (!isAnimating) return;

    const stages = [
      { progress: 15, label: 'Reading PDF...', duration: 600 },
      { progress: 35, label: 'Extracted 47 items', duration: 800 },
      { progress: 55, label: 'Auto-corrected 3 math errors', duration: 900 },
      { progress: 75, label: 'Matched to your inventory', duration: 1000 },
      { progress: 100, label: 'Ready to review - saved 25 min of typing', duration: 1200 },
    ];

    let currentStage = 0;
    let timeout: NodeJS.Timeout;

    const runStage = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setUploadProgress(stage.progress);
        setUploadStage(stage.label);
        
        timeout = setTimeout(() => {
          currentStage++;
          runStage();
        }, stage.duration);
      } else {
        // Reset after completion
        setTimeout(() => {
          setIsAnimating(false);
          setUploadProgress(0);
          setUploadStage('Ready to upload');
        }, 2000);
      }
    };

    runStage();

    return () => clearTimeout(timeout);
  }, [isAnimating]);

  const startDemo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  };

  const performanceMetrics = [
    { label: '60 sec', sublabel: 'invoice processing' },
    { label: '58 sec', sublabel: 'menu parsing (97 items)' },
    { label: '2.5 min', sublabel: 'competitor analysis' },
    { label: '150+', sublabel: 'real reviews analyzed' },
  ];

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

  return (
    <div className="bg-obsidian text-slate-100 min-h-screen">
      {/* Skip to Main */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[9999] focus:bg-emerald-500 focus:text-white focus:px-6 focus:py-3 focus:font-semibold focus:rounded-br-lg"
      >
        Skip to main content
      </a>

      {/* Navbar - Simplified */}
      <header className="fixed top-0 w-full h-16 bg-gray-900/95 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-2xl">R</span>
              <span className="text-white font-semibold text-lg">RestaurantIQ</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Pricing
              </a>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Get Started
                </Button>
              </Link>
            </nav>

            <button 
              className="md:hidden text-emerald-400" 
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-white/10">
            <nav className="flex flex-col p-4 gap-2">
              <a href="#proof" className="text-slate-400 hover:text-emerald-400 py-2">Proof</a>
              <a href="#how" className="text-slate-400 hover:text-emerald-400 py-2">How It Works</a>
              <a href="#pricing" className="text-slate-400 hover:text-emerald-400 py-2">Pricing</a>
              <Link to="/login" className="text-slate-300 py-2">Sign In</Link>
              <Link to="/register" className="text-emerald-400 py-2 font-semibold">Get Started</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Pain Points Ticker - Below Header */}
      <div className="fixed top-16 w-full bg-slate-950/80 backdrop-blur-sm border-b border-white/5 z-40 overflow-hidden h-7">
        <div className="flex animate-marquee whitespace-nowrap py-1.5">
          <span className="mx-6 text-xs text-gray-500 italic">25 min/invoice</span>
          <span className="mx-6 text-xs text-gray-600">•</span>
          <span className="mx-6 text-xs text-gray-500 italic">3 hrs updating sheets</span>
          <span className="mx-6 text-xs text-gray-600">•</span>
          <span className="mx-6 text-xs text-gray-500 italic">prices changed months ago</span>
          <span className="mx-6 text-xs text-gray-600">•</span>
          <span className="mx-6 text-xs text-gray-500 italic">25 min/invoice</span>
          <span className="mx-6 text-xs text-gray-600">•</span>
          <span className="mx-6 text-xs text-gray-500 italic">3 hrs updating sheets</span>
          <span className="mx-6 text-xs text-gray-600">•</span>
          <span className="mx-6 text-xs text-gray-500 italic">prices changed months ago</span>
          <span className="mx-6 text-xs text-gray-600">•</span>
        </div>
      </div>

      {/* Hero Section - Redesigned */}
      <section id="main-content" className="relative pt-20 pb-12 px-6 overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 -left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-30 pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center space-y-8 mb-16">
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                We Know You're Tired<br />of This Sh*t
              </span>
            </h1>
            
            <div className="space-y-3 max-w-3xl mx-auto">
              <p className="text-2xl md:text-3xl text-white font-bold">
                What if I told you I could save you at minimum an hour a week?
              </p>
              <p className="text-xl md:text-2xl text-emerald-400 font-semibold italic">
                (Drinks are on me if that's all you save.)
              </p>
            </div>
          </div>

          {/* Animated Upload Demo - MOVED UP */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl transition-all duration-300" />
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white/5 backdrop-blur-md">
              <div 
                className="cursor-pointer group p-6"
                onClick={startDemo}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        {isAnimating ? 'Processing...' : 'Click to See What Happens'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {uploadStage}
                      </p>
                    </div>
                  </div>
                  {uploadProgress === 100 && (
                    <Badge className="bg-emerald-500 text-white px-3 py-1 text-xs">
                      ✓ Done
                    </Badge>
                  )}
                </div>
                
                <Progress 
                  value={uploadProgress} 
                  className="h-2 bg-slate-800"
                />
                
                {!isAnimating && (
                  <p className="text-sm text-center text-gray-500 mt-3 group-hover:text-emerald-400 transition-colors">
                    Click to see how an invoice turns into live costs
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CTAs Below Demo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-lg shadow-emerald hover:shadow-emerald/80 group bg-emerald-500 hover:bg-emerald-600">
                Try It Free Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span>Your data stays private</span>
            </div>
          </div>
        </div>
      </section>

          {/* What You Get - Expandable Features with Glass Cards */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
              Once Your Invoice is Saved
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Price Tracking - Glass Card */}
              <div 
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
                onClick={() => setFeaturesExpanded(!featuresExpanded)}
              >
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <TrendingDown className="h-7 w-7 text-emerald-400" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">Track Every Price Change</h4>
                  <p className="text-base text-gray-400 mb-4">
                    {featuresExpanded ? 'See exactly where your money is going' : 'Click to see how it works'}
                  </p>
                  
                  {featuresExpanded && (
                    <div className="mt-6 space-y-4 text-left animate-in fade-in duration-200">
                      <div className="pl-4 border-l-2 border-emerald-500">
                        <p className="text-base font-semibold text-white">Price History</p>
                        <p className="text-base text-slate-400">
                          "Tomatoes: $2.10 → $2.75 (up 31%)"
                        </p>
                      </div>
                      <div className="pl-4 border-l-2 border-emerald-500">
                        <p className="text-base font-semibold text-white">Vendor Comparison</p>
                        <p className="text-base text-slate-400">
                          "Sysco: $3.20/lb vs US Foods: $2.95/lb"
                        </p>
                      </div>
                      <div className="pl-4 border-l-2 border-emerald-500">
                        <p className="text-base font-semibold text-white">Spike Alerts</p>
                        <p className="text-base text-slate-400">
                          "Beef up 15% - time to negotiate"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Costing - Glass Card */}
              <div 
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
                onClick={() => setFeaturesExpanded(!featuresExpanded)}
              >
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <ChefHat className="h-7 w-7 text-cyan-400" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">Know Your True Food Costs</h4>
                  <p className="text-base text-gray-400 mb-4">
                    {featuresExpanded ? 'Stop guessing what items cost' : 'Click to see how it works'}
                  </p>
                  
                  {featuresExpanded && (
                    <div className="mt-6 space-y-4 text-left animate-in fade-in duration-200">
                      <div className="pl-4 border-l-2 border-cyan-500">
                        <p className="text-base font-semibold text-white">Upload Menu</p>
                        <p className="text-base text-slate-400">
                          "AI extracts items in 58 seconds"
                        </p>
                      </div>
                      <div className="pl-4 border-l-2 border-cyan-500">
                        <p className="text-base font-semibold text-white">Link Ingredients</p>
                        <p className="text-base text-slate-400">
                          "Burger = beef + bun + cheese"
                        </p>
                      </div>
                      <div className="pl-4 border-l-2 border-cyan-500">
                        <p className="text-base font-semibold text-white">See Real Costs</p>
                        <p className="text-base text-slate-400">
                          "Burger costs $4.23 (35% food cost)"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipe-Based COGS Tracking - Glass Card */}
              <div 
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
                onClick={() => setFeaturesExpanded(!featuresExpanded)}
              >
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="h-7 w-7 text-emerald-400" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">Recipe-Based COGS Tracking</h4>
                  <p className="text-base text-gray-300 mb-4">
                    {featuresExpanded ? 'Build recipes, track real costs' : 'Click to see how it works'}
                  </p>
                  
                  {featuresExpanded && (
                    <div className="mt-6 space-y-4 text-left animate-in fade-in duration-200">
                      <div className="pl-4 border-l-2 border-emerald-500">
                        <p className="text-base font-semibold text-white">Build Your Recipes</p>
                        <p className="text-base text-slate-400">
                          "Burger = 6oz beef + bun + 2oz cheese"
                        </p>
                      </div>
                      <div className="pl-4 border-l-2 border-emerald-500">
                        <p className="text-base font-semibold text-white">Auto-Calculate COGS</p>
                        <p className="text-base text-slate-400">
                          "Beef $4.20/lb → Burger costs $4.87"
                        </p>
                      </div>
                      <div className="pl-4 border-l-2 border-emerald-500">
                        <p className="text-base font-semibold text-white">Updates With Every Invoice</p>
                        <p className="text-base text-slate-400">
                          "Beef up 15% → See new COGS instantly"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features - Glass Cards */}
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:border-emerald-400/50 transition-all duration-300">
                <div className="relative z-10">
                  <h4 className="text-base font-bold text-white mb-2">Competitor Review Analysis</h4>
                  <p className="text-sm text-slate-400">
                    150+ reviews in 2.5 min • Find menu gaps • See what customers complain about
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:border-emerald-400/50 transition-all duration-300">
                <div className="relative z-10">
                  <h4 className="text-base font-bold text-white mb-2">Competitor Menu Comparison</h4>
                  <p className="text-sm text-slate-400">
                    Upload their menu • Compare pricing • Find opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white px-8 py-3 text-lg shadow-lg">
                Try It Free Now
              </Button>
            </Link>
            
            <p className="text-sm text-gray-400 mt-4">
              No credit card • 60 seconds to start
            </p>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section id="proof" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-3">
            Real Numbers, Not Marketing Fluff
          </h2>
          <p className="text-center text-gray-400 mb-12">Actual performance from real restaurant use</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {performanceMetrics.map((metric, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:border-emerald-400/50 transition-all duration-300 text-center">
                <div className="relative z-10">
                  <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400 mb-2">
                    {metric.label}
                  </div>
                  <div className="text-sm text-slate-300 font-medium">{metric.sublabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Before/After Table - Glass Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 hover:border-emerald-400/50 transition-all duration-300 shadow-xl">
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-8 text-center">Time Saved Per Week</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-white/10">
                    <th className="pb-4 text-slate-300 font-semibold text-base">Task</th>
                    <th className="pb-4 text-slate-300 font-semibold text-base">Old Way</th>
                    <th className="pb-4 text-emerald-400 font-semibold text-base">RestaurantIQ</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-white/10">
                    <td className="py-4 font-medium">Invoice entry</td>
                    <td className="py-4 text-slate-400">25 min</td>
                    <td className="py-4 text-emerald-400 font-bold text-lg">60 sec</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-4 font-medium">Menu costing</td>
                    <td className="py-4 text-slate-400">3 hours</td>
                    <td className="py-4 text-emerald-400 font-bold text-lg">
                      Auto-updated
                      <div className="text-xs text-slate-500 italic mt-1 font-normal">once recipes are set</div>
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-4 font-medium">Competitor research</td>
                    <td className="py-4 text-slate-400">4+ hours</td>
                    <td className="py-4 text-emerald-400 font-bold text-lg">2.5 min</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Monthly software cost</td>
                    <td className="py-4 text-slate-400">$200-500</td>
                    <td className="py-4 text-emerald-400 font-bold text-lg">$0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>



      {/* Founder Quote - Glass Card */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-10 hover:border-emerald-400/50 transition-all duration-300 shadow-xl">
            <div className="relative z-10">
              <div className="flex items-start gap-6">
                <div className="hidden md:block w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Built by Someone Who Got Tired of Overpaying
                  </h3>
                  <p className="text-lg text-slate-300 mb-4 leading-relaxed">
                    "I ran restaurants for 10+ years. Every tool was too slow, too expensive, too complicated—and built by people who never actually ran a restaurant."
                  </p>
                  <p className="text-lg text-emerald-400 font-semibold mb-4">
                    So I built RestaurantIQ: Upload an invoice, see your savings in 60 seconds.
                  </p>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <p className="font-semibold text-white">Geoffrey Fernald</p>
                      <p className="text-sm">Founder, Former Restaurant Owner</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-3">
            Simple Pricing. No Surprises.
          </h2>
          <p className="text-center text-gray-400 mb-12">Start free. Upgrade when you're ready.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier - Glass Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-400/50 transition-all duration-300">
              <div className="relative z-10 p-8">
                <div className="text-center mb-6">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-4 px-4 py-1">
                    Free Forever
                  </Badge>
                  <div className="text-5xl font-bold text-white mb-2">$0</div>
                  <p className="text-sm text-gray-400">Perfect to test it out</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {freeTierFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/register" className="block">
                  <Button size="lg" variant="outline" className="w-full border-2 border-white/20 hover:border-emerald-400 hover:bg-emerald-500/10 text-white">
                    Start Free Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium Tier - Glass Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 shadow-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent before:opacity-100 before:transition-opacity before:duration-500">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 text-sm font-bold shadow-lg">
                  UNLIMITED
                </Badge>
              </div>
              <div className="relative z-10 p-8 pt-12">
                <div className="text-center mb-6">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 px-4 py-1">
                    Coming Soon
                  </Badge>
                  <div className="text-4xl font-bold text-white mb-2">Pricing TBD</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {premiumFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href="mailto:Geoffrey@restaurantiq.us?subject=Early%20Access%20Request%20-%20Premium%20Plan&body=Hi%20Geoffrey%2C%0A%0AI'm%20interested%20in%20getting%20early%20access%20to%20RestaurantIQ's%20premium%20plan.%0A%0ARestaurant%20Name%3A%20%0AYour%20Name%3A%20%0APhone%20Number%3A%20%0A%0AWhat%20I'm%20most%20excited%20about%3A%20%0A%0AThanks%21"
                  className="block"
                >
                  <Button size="lg" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white shadow-lg">
                    Get Early Access
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Lifetime Membership Offer */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-white/5 backdrop-blur-md border-2 border-emerald-400/50 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="relative z-10 text-center">
                <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 text-sm font-bold shadow-lg mb-4">
                  LIMITED OFFER
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Lifetime Membership for 5 Restaurants
                </h3>
                <p className="text-lg text-slate-300 mb-6">
                  Be one of the first 5 restaurants to join and get <span className="text-emerald-400 font-bold">lifetime unlimited access</span> — no monthly fees, ever.
                </p>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white px-8 py-3 text-lg shadow-lg">
                    Claim Your Lifetime Spot
                  </Button>
                </Link>
                <p className="text-sm text-gray-400 mt-4">
                  First come, first served • No credit card required to start
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Collapsible Accordion */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
            Common Questions
          </h2>
          
          <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-white text-lg">Is this actually free?</AccordionTrigger>
                <AccordionContent>
                  Yes. Free tier is real. No credit card, no tricks. If you need more, upgrade.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-white text-lg">How accurate is the invoice scanning?</AccordionTrigger>
                <AccordionContent>
                  Really good. Not perfect. You review before saving. Takes 60 seconds instead of 25 minutes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-white text-lg">Will this work with my vendors?</AccordionTrigger>
                <AccordionContent>
                  Probably. We handle Sysco, US Foods, local distributors, weird formats. If it's a PDF or photo, we can read it.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-white text-lg">Do I have to change how I work?</AccordionTrigger>
                <AccordionContent>
                  Nope. Upload invoices, link recipes, done. It works around you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-white text-lg">What if I hate it?</AccordionTrigger>
                <AccordionContent>
                  Delete your account. No hard feelings. We're not for everyone.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-white text-lg">How long to set up?</AccordionTrigger>
                <AccordionContent>
                  10 minutes to upload your first invoice. 30 minutes to link your menu recipes. Then it just works.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Stop Overpaying Today
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-4">
            Upload one invoice. See where you're losing money.
          </p>
          <p className="text-gray-400 mb-8">
            Takes 60 seconds. Free forever. No credit card.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white text-lg px-10 py-6 shadow-2xl">
              Find Your Savings Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-slate-900/50 backdrop-blur-md border-t border-white/10 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2025 RestaurantIQ. Built by owners. For owners.</p>
          <p className="mt-2">
            <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">Privacy</a>
            {' · '}
            <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">Terms</a>
            {' · '}
            <a href="mailto:hello@restaurantiq.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">Contact</a>
          </p>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-3 z-[1200]">
        <Link to="/register" className="block">
          <Button size="lg" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white shadow-lg">
            Start Free
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
