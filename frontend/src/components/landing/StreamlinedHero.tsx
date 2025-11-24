import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';

export const StreamlinedHero: React.FC = () => {
  return (
    <section id="main-content" className="relative pt-24 md:pt-32 pb-16 px-4 md:px-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute -top-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute top-1/2 -left-24 h-[24rem] w-[24rem] rounded-full bg-teal-400/10 blur-[130px] opacity-60 pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center space-y-6">
          {/* Headline */}
          <h1 className="text-white">
            Built for Operators.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Engineered for Profits.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Designed from the ground up with every workflow carefully audited and every cost meticulously tracked—so you can 
            operate efficiently, move confidently, and protect your margins without the guesswork.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="#demos">
              <Button className="btn-cta-primary">
                See the System in Action
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button className="btn-cta-secondary">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
