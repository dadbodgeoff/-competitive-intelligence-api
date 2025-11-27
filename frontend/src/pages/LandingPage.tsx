import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { PremiumHero } from '@/components/landing/PremiumHero';
import { ModuleShowcase } from '@/components/landing/ModuleShowcase';
import { PremiumDemoSection } from '@/components/landing/PremiumDemoSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="text-white min-h-screen bg-[#0A0A0A]">
      <LandingNav />
      
      <PremiumHero />
      <ModuleShowcase />
      <PremiumDemoSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
};
