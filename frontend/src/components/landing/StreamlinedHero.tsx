import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';

export const StreamlinedHero: React.FC = () => {
  return (
    <section id="main-content" className="relative pt-24 md:pt-32 pb-16 px-4 md:px-6 overflow-hidden">
      {/* Background gradients - BRAND COLORS */}
      <div className="absolute -top-32 -right-20 h-[28rem] w-[28rem] rounded-full blur-[120px] opacity-60 pointer-events-none" style={{ backgroundColor: 'rgba(176, 137, 104, 0.1)' }} />
      <div className="absolute top-1/2 -left-24 h-[24rem] w-[24rem] rounded-full blur-[130px] opacity-50 pointer-events-none" style={{ backgroundColor: 'rgba(176, 137, 104, 0.08)' }} />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-8">
          {/* Headline - BRAND: 32px+ headers */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight" style={{ color: '#E0E0E0' }}>
            Built for Operators.
            <br />
            <span style={{ color: '#B08968' }}>
              Engineered for Profits.
            </span>
          </h1>

          {/* Subheadline - BRAND: Secondary text */}
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed" style={{ color: '#A8B1B9' }}>
            Designed from the ground up with every workflow carefully audited and every cost meticulously tracked—so you can 
            operate efficiently, move confidently, and protect your margins without the guesswork.
          </p>

          {/* CTA - BRAND: Primary CTA color */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="#demos" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-8 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105" style={{ backgroundColor: '#B08968' }}>
                See the System in Action
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-2 bg-transparent transition-all hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#E0E0E0' }}>
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
