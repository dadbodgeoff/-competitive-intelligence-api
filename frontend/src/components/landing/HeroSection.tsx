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
        <div className="text-center space-y-8 md:space-y-12">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              See Your True Food Costs—Automatically
            </span>
          </h1>
          
          {/* Subheader */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-200 font-semibold leading-relaxed">
              Stop guessing. Let every invoice, ingredient, and portion cost track itself—so you control margins, not paperwork.
            </p>
            <p className="text-lg md:text-xl text-emerald-400 font-medium italic">
              From former operators, for operators. No spreadsheets. No complicated software. Just your numbers, every day.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button 
                size="lg" 
                className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg shadow-lg hover:shadow-xl group bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 min-h-[48px]"
              >
                Try It Free—See It with Your Numbers
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg border-2 border-slate-600 hover:border-emerald-400 min-h-[48px]"
              >
                Or Get a Demo from an Actual Operator
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base text-gray-400 pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>Your data stays private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
