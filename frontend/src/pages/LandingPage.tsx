import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { FounderStoryCard } from '@/components/landing/FounderStoryCard';
import { InvoiceDemoCard } from '@/components/landing/InvoiceDemoCard';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { CompetitorSpyCard } from '@/components/landing/CompetitorSpyCard';
import { TestimonialSection } from '@/components/landing/TestimonialSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { AlphaGateCard } from '@/components/landing/AlphaGateCard';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-obsidian text-slate-100 min-h-screen">
      <LandingNav />
      
      <HeroSection />
      
      <FounderStoryCard />
      
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
          <InvoiceDemoCard />
          
          <PainPointsSection />
          
          <FeaturesGrid />
          
          <CompetitorSpyCard />
          
          <TestimonialSection />
          
          <PricingSection />
          
          <AlphaGateCard />
        </div>
      </section>
      
      <LandingFooter />
    </div>
  );
};
