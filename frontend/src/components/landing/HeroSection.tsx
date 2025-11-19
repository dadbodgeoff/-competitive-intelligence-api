import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';
import { HeroDemoStream } from '@/components/landing/HeroDemoStream';

export const HeroSection: React.FC = () => {
  return (
    <section id="main-content" className="relative pt-24 md:pt-28 pb-16 px-4 md:px-6 overflow-hidden">
      <div className="absolute -top-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute top-1/2 -left-24 h-[24rem] w-[24rem] rounded-full bg-teal-400/10 blur-[130px] opacity-60 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="surface-glass gradient-outline hover-lift max-w-4xl mx-auto px-8 md:px-12 py-10 md:py-14 text-center space-y-6 md:space-y-8 rounded-3xl">
          <div className="space-y-5">
            <div className="flex justify-center">
              <span className="badge-soft">Upload invoices. Catch leaks. Decide fast.</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-lg">
              Stop losing margin on last week’s prices.
            </h1>
            <div className="space-y-4 text-white/90">
              <p className="text-xl md:text-2xl font-medium leading-relaxed">
                Upload tonight’s Sysco or US Foods invoice and see which items jumped, what they should cost, and the moves to fix it before service.
              </p>
              <p className="text-lg md:text-xl text-emerald-200 font-medium italic">
                Built by an operator who closed at 2am for a decade—no spreadsheets, no handoffs.
              </p>
            </div>
          </div>

          <HeroDemoStream />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button
                size="lg"
                className="cta-button-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border border-white/10"
              >
                Show me my price leaks
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link
              to="/register"
              className="text-slate-200 hover:text-white text-base font-semibold transition-colors flex items-center gap-2"
            >
              Create your account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-slate-200 font-medium pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-300 flex-shrink-0" />
              <span>Encrypted in Supabase storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-300 flex-shrink-0" />
              <span>Delete uploads with one click</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-300 flex-shrink-0" />
              <span>Support direct from an owner-operator</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
