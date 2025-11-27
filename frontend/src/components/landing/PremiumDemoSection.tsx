import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, DollarSign, ArrowRight, ChevronRight } from 'lucide-react';
import { CreativeLiveDemoV2 } from '@/features/landing-demo';
import { InvoiceDemoCardV2 } from './InvoiceDemoCardV2';

type DemoTab = 'creative' | 'invoice';

/**
 * Premium Demo Section - Matches the hero's visual language
 * Tabbed interface for cleaner UX, premium glassmorphism styling
 */
export const PremiumDemoSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('creative');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const tabs = [
    {
      id: 'creative' as DemoTab,
      label: 'AI Creative Studio',
      icon: Sparkles,
      tagline: 'Generate marketing images in 15 seconds',
      gradient: 'from-amber-500/20 to-orange-500/10',
    },
    {
      id: 'invoice' as DemoTab,
      label: 'Invoice Intelligence',
      icon: DollarSign,
      tagline: 'Catch price leaks in 30 seconds',
      gradient: 'from-emerald-500/20 to-teal-500/10',
    },
  ];

  return (
    <section 
      id="demos" 
      ref={sectionRef}
      className="py-24 md:py-32 px-4 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orb */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] opacity-20"
          style={{ backgroundColor: 'rgba(176, 137, 104, 0.2)' }}
        />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(176, 137, 104, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(176, 137, 104, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div 
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              border: '1px solid rgba(176, 137, 104, 0.3)',
              backgroundColor: 'rgba(176, 137, 104, 0.08)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: '#D4A574' }}>
              Try It Now — No Account Required
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: '#D4A574' }} />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span style={{ color: '#F0F0F0' }}>See the </span>
            <span style={{ color: '#B08968' }}>Magic</span>
            <span style={{ color: '#F0F0F0' }}> Live</span>
          </h2>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#A8B1B9' }}>
            Don't take our word for it. Try both features right here, right now.
          </p>
        </div>

        {/* Tab switcher */}
        <div 
          className={`flex justify-center mb-8 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div 
            className="inline-flex p-1.5 rounded-2xl"
            style={{
              backgroundColor: 'rgba(30, 30, 30, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.3)',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm
                    transition-all duration-300 ease-out
                    ${isActive ? 'text-white' : 'text-[#A8B1B9] hover:text-white'}
                  `}
                >
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.25) 0%, rgba(176, 137, 104, 0.1) 100%)',
                        border: '1px solid rgba(176, 137, 104, 0.3)',
                        boxShadow: '0 0 20px rgba(176, 137, 104, 0.2)',
                      }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[#D4A574]' : ''}`} />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active tab tagline */}
        <div 
          className={`text-center mb-8 transition-all duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
            {tabs.find(t => t.id === activeTab)?.tagline}
          </p>
        </div>

        {/* Demo container */}
        <div 
          className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div 
            className="rounded-3xl p-1"
            style={{
              background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.2) 0%, rgba(176, 137, 104, 0.05) 50%, rgba(176, 137, 104, 0.1) 100%)',
            }}
          >
            <div 
              className="rounded-[22px] p-6 md:p-10"
              style={{
                background: 'linear-gradient(180deg, rgba(24, 24, 24, 0.95) 0%, rgba(18, 18, 18, 0.98) 100%)',
                boxShadow: '0 25px 80px -20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Demo content with smooth transition */}
              <div className="relative min-h-[500px]">
                <div 
                  className={`transition-all duration-500 ${
                    activeTab === 'creative' 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 translate-x-[-20px] absolute inset-0 pointer-events-none'
                  }`}
                >
                  {activeTab === 'creative' && <CreativeLiveDemoV2 />}
                </div>
                
                <div 
                  className={`transition-all duration-500 ${
                    activeTab === 'invoice' 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 translate-x-[20px] absolute inset-0 pointer-events-none'
                  }`}
                >
                  {activeTab === 'invoice' && <InvoiceDemoCardV2 />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div 
          className={`text-center mt-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            Ready to transform your restaurant operations?
          </p>
          <a 
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.03]"
            style={{
              backgroundColor: '#B08968',
              boxShadow: '0 0 40px rgba(176, 137, 104, 0.3), 0 10px 30px -10px rgba(176, 137, 104, 0.4)',
            }}
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
