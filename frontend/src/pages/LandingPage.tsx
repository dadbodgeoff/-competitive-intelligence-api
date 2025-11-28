import React, { useEffect, useState } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { ProductHero } from '@/components/landing/ProductHero';
import { ModuleShowcaseV2 } from '@/components/landing/ModuleShowcaseV2';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="text-white min-h-screen bg-[#0A0A0A] relative overflow-x-hidden">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Slow-moving gradient orbs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, rgba(176, 137, 104, 0.4) 0%, transparent 70%)',
            top: '-200px',
            right: '-200px',
            transform: `translate(${Math.sin(scrollY * 0.001) * 30}px, ${scrollY * 0.05}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, rgba(74, 101, 114, 0.5) 0%, transparent 70%)',
            bottom: '20%',
            left: '-150px',
            transform: `translate(${Math.cos(scrollY * 0.001) * 20}px, ${-scrollY * 0.03}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(176, 137, 104, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(176, 137, 104, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <LandingNav />
        <ProductHero />
        <ModuleShowcaseV2 />
        <PricingSection />
        <LandingFooter />
      </div>
    </div>
  );
};
