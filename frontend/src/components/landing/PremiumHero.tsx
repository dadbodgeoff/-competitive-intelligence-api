import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';
import { RestaurantOpsIconV2 } from './RestaurantOpsIconV2';

/**
 * Premium Hero - Split layout with text left, animated icon right
 * Clean, professional, but with impact
 */
export const PremiumHero: React.FC = () => {
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
      setMousePos({ x: x * 20, y: y * 20 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="main-content"
      ref={containerRef}
      className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 overflow-hidden min-h-[90vh] flex items-center"
    >
      {/* Subtle floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `rgba(176, 137, 104, ${0.1 + Math.random() * 0.2})`,
              animation: `floatParticle ${12 + Math.random() * 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs with parallax */}
      <div
        className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-25 pointer-events-none"
        style={{
          backgroundColor: 'rgba(176, 137, 104, 0.3)',
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
          transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />
      <div
        className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{
          backgroundColor: 'rgba(176, 137, 104, 0.2)',
          transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)`,
          transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text content */}
          <div
            className={`text-center lg:text-left space-y-8 transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                border: '1px solid rgba(176, 137, 104, 0.35)',
                backgroundColor: 'rgba(176, 137, 104, 0.1)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#B08968', animation: 'pulse 2s ease-in-out infinite' }}
              />
              <span className="text-sm font-medium" style={{ color: '#D4A574' }}>
                Restaurant Intelligence Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
              <span style={{ color: '#F0F0F0' }}>Built for Operators.</span>
              <br />
              <span 
                className="relative inline-block"
                style={{ color: '#B08968' }}
              >
                Engineered for Profits.
                {/* Animated underline accent */}
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2"
                  viewBox="0 0 300 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q75 0, 150 4 T300 4"
                    fill="none"
                    stroke="rgba(176, 137, 104, 0.5)"
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

            {/* Subheadline */}
            <p
              className="text-xl md:text-2xl max-w-xl mx-auto lg:mx-0 leading-relaxed"
              style={{ color: '#A8B1B9' }}
            >
              Your time is money. We help you protect both.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-4">
              <Link to="#demos" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 px-10 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#B08968',
                    boxShadow: '0 0 50px rgba(176, 137, 104, 0.4), 0 15px 35px -10px rgba(176, 137, 104, 0.5)',
                  }}
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  See It In Action
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 px-10 text-lg font-semibold border-2 bg-transparent transition-all duration-300 hover:bg-white/5 hover:border-[#B08968]/60"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#F0F0F0' }}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div 
              className={`flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 transition-all duration-1000 delay-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Setup in 5 minutes
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Right: Animated Icon */}
          <div
            className={`relative flex items-center justify-center transition-all duration-1000 ease-out delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{
              transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
              transition: 'transform 0.4s ease-out',
            }}
          >
            {/* Glow backdrop */}
            <div 
              className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full blur-[80px] opacity-30"
              style={{ backgroundColor: 'rgba(176, 137, 104, 0.3)' }}
            />
            
            <RestaurantOpsIconV2 isLoaded={isLoaded} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: '#6B7280' }}>
          Scroll
        </span>
        <div
          className="w-6 h-10 rounded-full flex items-start justify-center p-2"
          style={{ border: '2px solid rgba(176, 137, 104, 0.3)' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: '#B08968',
              animation: 'scrollBounce 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-25px) translateX(15px); 
            opacity: 0.6;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12px); }
        }
      `}</style>
    </section>
  );
};
