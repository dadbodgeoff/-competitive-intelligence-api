import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveDemoSection } from '@/components/landing/LiveDemoSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { ProofSection } from '@/components/landing/ProofSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { WeekOneTimeline } from '@/components/landing/WeekOneTimeline';

export const LandingPage: React.FC = () => {
  return (
    <div className="text-slate-100 min-h-screen">
      <LandingNav />
      
      <HeroSection />
      <LiveDemoSection />
      <WeekOneTimeline />
      <FeaturesGrid />
      <ProofSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
};
