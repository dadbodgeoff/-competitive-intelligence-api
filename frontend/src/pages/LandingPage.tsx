import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveDemoSection } from '@/components/landing/LiveDemoSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { ProofSection } from '@/components/landing/ProofSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { CompetitorSpyCard } from '@/components/landing/CompetitorSpyCard';
import { PricingSection } from '@/components/landing/PricingSection';
import { AlphaGateCard } from '@/components/landing/AlphaGateCard';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-obsidian text-slate-100 min-h-screen">
      <LandingNav />
      
      <HeroSection />
      <LiveDemoSection />
      <FeaturesGrid />
      <ProofSection />
      <PainPointsSection />
      <CompetitorSpyCard />
      <PricingSection />
      <AlphaGateCard />
      <LandingFooter />
    </div>
  );
};
