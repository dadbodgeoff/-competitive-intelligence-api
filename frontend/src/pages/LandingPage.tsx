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
    <div className="bg-obsidian text-slate-100 min-h-screen relative overflow-hidden">
      {/* Animated food pattern background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
        <div 
          className="w-full h-full bg-repeat animate-slow-drift"
          style={{
            backgroundImage: 'url(/food-pattern.svg)',
            backgroundSize: '800px 800px'
          }}
        />
      </div>
      
      {/* Gradient overlays for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-obsidian/30 to-obsidian pointer-events-none z-0" />
      
      {/* Content */}
      <div className="relative z-10">
        <LandingNav />
        
        <HeroSection />
        
        {/* Demo BEFORE Founder Story - show value first */}
        <section className="py-12 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <InvoiceDemoCard />
          </div>
        </section>
        
        <FounderStoryCard />
        
        <section className="py-20 md:py-28 px-4 md:px-6">
          <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
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
    </div>
  );
};
