import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';
import { HeroShowcase } from './HeroShowcase';

/**
 * Product Hero - Conversion-focused hero with live transformation showcase
 */
export const ProductHero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePos({ x: x * 12, y: y * 12 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="main-content"
      ref={containerRef}
      className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 overflow-hidden min-h-screen flex items-center"
    >
      {/* Enhanced gradient orbs for hero depth */}
      <div
        className="absolute -top-40 right-1/4 w-[700px] h-[700px] rounded-full blur-[180px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176, 137, 104, 0.4) 0%, transparent 60%)',
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div
            className={`text-center lg:text-left space-y-6 transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Headline - operations-focused */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight">
              <span style={{ color: '#F0F0F0' }}>Restaurant Intelligence</span>
              <br />
              <span
                className="relative"
                style={{ color: '#B08968' }}
              >
                That Actually Works
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2"
                  viewBox="0 0 300 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q75 0, 150 4 T300 4"
                    fill="none"
                    stroke="rgba(176, 137, 104, 0.4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: 400,
                      strokeDashoffset: isLoaded ? 0 : 400,
                      transition: 'stroke-dashoffset 1.5s ease-out 0.8s',
                    }}
                  />
                </svg>
              </span>
            </h1>

            {/* Subheadline - operations + intelligence */}
            <p
              className="text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed"
              style={{ color: '#A8B1B9' }}
            >
              Catch vendor price hikes. Generate marketing in seconds. Forecast labor costs. 
              Track every dollar.
              <span className="text-white font-medium block mt-2">
                One platform for the ops that matter.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-12 px-7 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#B08968',
                    boxShadow: '0 0 35px rgba(176, 137, 104, 0.3), 0 10px 25px -8px rgba(176, 137, 104, 0.4)',
                  }}
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Try It Free
                </Button>
              </Link>
              <a href="#demos" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-12 px-7 text-base font-semibold border bg-transparent transition-all duration-300 hover:bg-white/5"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: '#E5E7EB' }}
                >
                  See It Work
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div
              className={`flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-4 transition-all duration-1000 delay-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B7280' }}>
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card</span>
              </div>

              <div className="h-4 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B7280' }}>
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>5 min setup</span>
              </div>
            </div>
          </div>

          {/* Right: Live Showcase */}
          <div
            className={`relative transition-all duration-1000 ease-out delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{
              transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
              transition: 'transform 0.6s ease-out',
            }}
          >
            <HeroShowcase isLoaded={isLoaded} />
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-1500 ${
          isLoaded ? 'opacity-80' : 'opacity-0'
        }`}
      >
        <span 
          className="text-[11px] uppercase tracking-[0.2em] font-medium"
          style={{ color: '#6B7280' }}
        >
          Explore
        </span>
        <div
          className="w-6 h-10 rounded-full flex items-start justify-center p-1.5 relative"
          style={{ 
            border: '2px solid rgba(176, 137, 104, 0.3)',
            background: 'rgba(176, 137, 104, 0.05)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: '#B08968',
              boxShadow: '0 0 8px rgba(176, 137, 104, 0.6)',
              animation: 'scrollBounce 2s ease-in-out infinite',
            }}
          />
        </div>
        {/* Animated chevrons */}
        <div className="flex flex-col items-center -mt-1">
          <svg 
            className="w-4 h-4 text-[#B08968] opacity-60" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ animation: 'chevronBounce 2s ease-in-out infinite' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <svg 
            className="w-4 h-4 text-[#B08968] opacity-40 -mt-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ animation: 'chevronBounce 2s ease-in-out infinite 0.15s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(12px); opacity: 0.4; }
        }
        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(4px); opacity: 0.3; }
        }
      `}</style>
    </section>
  );
};
