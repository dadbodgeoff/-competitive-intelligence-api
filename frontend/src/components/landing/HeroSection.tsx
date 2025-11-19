import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';

export const HeroSection: React.FC = () => {
  return (
    <section id="main-content" className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-4 md:px-6 overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 -left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-30 pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-8 md:space-y-10">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white drop-shadow-lg">
            The only tool that actually finds money you’re losing <span className="text-emerald-400">every week</span>
          </h1>
          
          {/* Subheader */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-200 font-medium leading-relaxed">
              I ran restaurants for 10+ years and got screwed by every $500–$2,000/mo platform that promised “insights” but still made me do inventory by hand.
            </p>
            <p className="text-lg md:text-xl text-emerald-400 font-medium italic">
              So I built the one I begged Toast, MarginEdge, and Restaurant365 to make.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/register">
              <Button 
                size="lg" 
                className="cta-button-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-0"
              >
                Try It Free – See Your Numbers Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-base md:text-lg text-slate-400 pt-4 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-400 flex-shrink-0" />
              <span>Your data stays private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
