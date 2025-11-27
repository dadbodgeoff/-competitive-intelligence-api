import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';
import { RestaurantOpsIcon } from './RestaurantOpsIcon';

export const StreamlinedHero: React.FC = () => {
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
      setMousePos({ x: x * 30, y: y * 30 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="main-content"
      ref={containerRef}
      className="relative pt-32 md:pt-40 pb-20 md:pb-28 px-4 md:px-6 overflow-hidden min-h-[85vh] flex items-center"
    >
      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `rgba(176, 137, 104, ${0.15 + Math.random() * 0.25})`,
              animation: `floatUp ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 15}s`,
            }}
          />
        ))}
      </div>

      {/* Morphing gradient orbs with parallax */}
      <div
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176, 137, 104, 0.2) 0%, transparent 70%)',
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          animation: 'morphBlob1 20s ease-in-out infinite',
        }}
      />

      <div
        className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(176, 137, 104, 0.15) 0%, transparent 70%)',
          transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)`,
          transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          animation: 'morphBlob2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(176, 137, 104, 0.1) 0%, transparent 70%)',
          animation: 'pulseGlow 8s ease-in-out infinite',
        }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center space-y-8">
          {/* Animated Restaurant Ops Icon */}
          <div
            className={`flex justify-center transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <RestaurantOpsIcon isLoaded={isLoaded} />
          </div>

          {/* Headline with staggered animation */}
          <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight transition-all duration-1000 delay-150 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span style={{ color: '#E0E0E0' }}>Built for Operators.</span>
            <br />
            <span
              className="relative inline-block"
              style={{ color: '#B08968' }}
            >
              Engineered for Profits.
              {/* Animated underline */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q75 0, 150 6 T300 6"
                  fill="none"
                  stroke="rgba(176, 137, 104, 0.4)"
                  strokeWidth="3"
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
            className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ color: '#A8B1B9' }}
          >
            Your time is money. We help you protect both.
          </p>


          {/* CTA Buttons with glow */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link to="#demos" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto h-14 px-10 text-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: '#B08968',
                  boxShadow: '0 0 40px rgba(176, 137, 104, 0.35), 0 10px 30px -10px rgba(176, 137, 104, 0.5)',
                }}
              >
                See the System in Action
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto h-14 px-10 text-lg font-semibold border-2 bg-transparent transition-all duration-300 hover:bg-white/5 hover:border-[#B08968]/50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.15)', color: '#E0E0E0' }}
              >
                Start Free Trial
              </Button>
            </Link>
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
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes morphBlob1 {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(180deg) scale(1.1);
          }
        }
        @keyframes morphBlob2 {
          0%, 100% {
            border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%;
          }
          50% {
            border-radius: 60% 40% 30% 70% / 40% 60% 40% 60%;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translateX(-50%) scale(1.1);
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
