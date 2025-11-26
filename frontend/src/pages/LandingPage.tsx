import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { StreamlinedHero } from '@/components/landing/StreamlinedHero';
import { ModuleShowcase } from '@/components/landing/ModuleShowcase';
import { DualDemoSection } from '@/components/landing/DualDemoSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="text-white min-h-screen bg-slate-950">
      <LandingNav />
      
      <StreamlinedHero />
      <ModuleShowcase />
      <DualDemoSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
};
