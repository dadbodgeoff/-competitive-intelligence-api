import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';

/**
 * Premium Hero with Isometric Floating Cards + Chef's Toque
 * BRAND: #B08968 primary | #E0E0E0 text | #A8B1B9 secondary | #121212 bg
 */

// Isometric floating card with glassmorphism
const FloatingCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  orbitRadius: number;
  orbitDuration: number;
  startAngle: number;
  delay: number;
  reverse?: boolean;
}> = ({ icon, label, orbitRadius, orbitDuration, startAngle, delay, reverse }) => {
  return (
    <div
      className="absolute left-1/2 top-1/2 w-0 h-0"
      style={{
        animation: `${reverse ? 'orbitReverse' : 'orbit'} ${orbitDuration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="absolute flex flex-col items-center justify-center gap-1 rounded-2xl backdrop-blur-xl transition-transform duration-300 hover:scale-110 cursor-default"
        style={{
          width: '72px',
          height: '72px',
          transform: `rotate(${startAngle}deg) translateX(${orbitRadius}px) rotate(-${startAngle}deg) translateX(-50%) translateY(-50%)`,
          background: 'linear-gradient(145deg, rgba(176, 137, 104, 0.12) 0%, rgba(18, 18, 18, 0.85) 100%)',
          border: '1px solid rgba(176, 137, 104, 0.25)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        <div className="text-[#B08968]">{icon}</div>
        <span className="text-[10px] font-medium text-[#A8B1B9] tracking-wide">{label}</span>
      </div>
    </div>
  );
};

// Connection line between cards
const ConnectionLine: React.FC<{ delay: number }> = ({ delay }) => (
  <div
    className="absolute left-1/2 top-1/2 w-32 h-px origin-left"
    style={{
      background: 'linear-gradient(90deg, transparent 0%, rgba(176, 137, 104, 0.3) 50%, transparent 100%)',
      animation: `rotateLine 20s linear infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);


export const NeuralKitchenHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

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
      setMousePos({ x: x * 25, y: y * 25 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Module icons
  const icons = {
    invoice: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8M8 10h6M8 14h4" />
      </svg>
    ),
    chart: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="10" width="4" height="11" rx="1" />
        <rect x="10" y="6" width="4" height="15" rx="1" />
        <rect x="17" y="2" width="4" height="19" rx="1" />
      </svg>
    ),
    calendar: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </svg>
    ),
    dollar: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    utensils: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3v7" />
      </svg>
    ),
    sparkle: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
      </svg>
    ),
  };

  return (
    <section
      id="main-content"
      ref={containerRef}
      className="relative pt-24 md:pt-28 pb-16 md:pb-24 px-4 md:px-6 overflow-hidden min-h-[95vh] flex items-center"
    >
      {/* Animated particle field background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `rgba(176, 137, 104, ${0.1 + Math.random() * 0.2})`,
              animation: `floatParticle ${10 + Math.random() * 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs with parallax */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 pointer-events-none"
        style={{
          backgroundColor: 'rgba(176, 137, 104, 0.2)',
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />
      <div
        className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full blur-[130px] opacity-20 pointer-events-none"
        style={{
          backgroundColor: 'rgba(176, 137, 104, 0.15)',
          transform: `translate(${-mousePos.x * 0.2}px, ${-mousePos.y * 0.2}px)`,
          transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />


      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content - YOUR ORIGINAL COPY */}
          <div
            className={`text-center lg:text-left space-y-8 transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                border: '1px solid rgba(176, 137, 104, 0.3)',
                backgroundColor: 'rgba(176, 137, 104, 0.08)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#B08968', animation: 'pulse 2s ease-in-out infinite' }}
              />
              <span className="text-sm font-medium" style={{ color: '#B08968' }}>
                Restaurant Intelligence Platform
              </span>
            </div>

            {/* Headline - YOUR ORIGINAL COPY */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
              <span style={{ color: '#E0E0E0' }}>Built for Operators.</span>
              <br />
              <span style={{ color: '#B08968' }}>Engineered for Profits.</span>
            </h1>

            {/* Subheadline - YOUR ORIGINAL COPY */}
            <p
              className="text-xl md:text-2xl max-w-xl mx-auto lg:mx-0 leading-relaxed"
              style={{ color: '#A8B1B9' }}
            >
              Your time is money. We help you protect both.
            </p>

            {/* CTA Buttons - YOUR ORIGINAL COPY */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-4">
              <Link to="#demos" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 px-8 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: '#B08968',
                    boxShadow: '0 10px 40px -10px rgba(176, 137, 104, 0.5)',
                  }}
                >
                  See the System in Action
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-2 bg-transparent transition-all duration-300 hover:bg-white/5"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#E0E0E0' }}
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Animated Illustration - Chef's Toque with Orbiting Cards */}
          <div
            className={`relative flex items-center justify-center h-[400px] md:h-[500px] transition-all duration-1000 ease-out delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Outer glow ring */}
            <div
              className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(176, 137, 104, 0.08) 0%, transparent 70%)',
                animation: 'pulseRing 4s ease-in-out infinite',
              }}
            />

            {/* Connection lines */}
            {[0, 60, 120, 180, 240, 300].map((_, i) => (
              <ConnectionLine key={i} delay={i * 0.5} />
            ))}

            {/* Center Chef's Toque */}
            <div
              className="relative z-10"
              style={{
                transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
                transition: 'transform 0.4s ease-out',
              }}
            >
              <svg
                className="w-32 h-36 md:w-40 md:h-44"
                viewBox="0 0 100 110"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))' }}
              >
                <defs>
                  <linearGradient id="toqueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F5F5F5" />
                    <stop offset="50%" stopColor="#E8E8E8" />
                    <stop offset="100%" stopColor="#D8D8D8" />
                  </linearGradient>
                  <linearGradient id="toqueShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                  <filter id="toqueShadow" x="-20%" y="-10%" width="140%" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
                  </filter>
                </defs>
                {/* Hat puffs - more realistic */}
                <ellipse cx="20" cy="28" rx="18" ry="16" fill="url(#toqueGradient)" filter="url(#toqueShadow)" />
                <ellipse cx="50" cy="20" rx="22" ry="20" fill="url(#toqueGradient)" filter="url(#toqueShadow)" />
                <ellipse cx="80" cy="28" rx="18" ry="16" fill="url(#toqueGradient)" filter="url(#toqueShadow)" />
                <ellipse cx="35" cy="35" rx="14" ry="12" fill="url(#toqueGradient)" />
                <ellipse cx="65" cy="35" rx="14" ry="12" fill="url(#toqueGradient)" />
                {/* Hat band */}
                <rect x="15" y="45" width="70" height="30" rx="4" fill="url(#toqueGradient)" filter="url(#toqueShadow)" />
                {/* Pleats */}
                <line x1="35" y1="48" x2="35" y2="72" stroke="#C0C0C0" strokeWidth="0.5" />
                <line x1="50" y1="48" x2="50" y2="72" stroke="#C0C0C0" strokeWidth="0.5" />
                <line x1="65" y1="48" x2="65" y2="72" stroke="#C0C0C0" strokeWidth="0.5" />
                {/* Shine overlay */}
                <ellipse cx="40" cy="25" rx="12" ry="8" fill="url(#toqueShine)" />
              </svg>
            </div>


            {/* Orbiting module cards */}
            <FloatingCard
              icon={icons.invoice}
              label="Invoices"
              orbitRadius={140}
              orbitDuration={25}
              startAngle={0}
              delay={0}
            />
            <FloatingCard
              icon={icons.chart}
              label="Analytics"
              orbitRadius={140}
              orbitDuration={25}
              startAngle={60}
              delay={0}
            />
            <FloatingCard
              icon={icons.calendar}
              label="Schedule"
              orbitRadius={140}
              orbitDuration={25}
              startAngle={120}
              delay={0}
            />
            <FloatingCard
              icon={icons.dollar}
              label="COGS"
              orbitRadius={140}
              orbitDuration={25}
              startAngle={180}
              delay={0}
            />
            <FloatingCard
              icon={icons.utensils}
              label="Prep"
              orbitRadius={140}
              orbitDuration={25}
              startAngle={240}
              delay={0}
            />
            <FloatingCard
              icon={icons.sparkle}
              label="Creative"
              orbitRadius={140}
              orbitDuration={25}
              startAngle={300}
              delay={0}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease-out 1.5s',
        }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: '#6B7280' }}>
          Scroll to explore
        </span>
        <div
          className="w-6 h-10 rounded-full flex items-start justify-center p-2"
          style={{ border: '2px solid rgba(255, 255, 255, 0.15)' }}
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
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes rotateLine {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatParticle {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-10px) translateX(-5px); 
            opacity: 0.4;
          }
          75% { 
            transform: translateY(-30px) translateX(15px); 
            opacity: 0.5;
          }
        }
        @keyframes pulseRing {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.8;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12px); }
        }
      `}</style>
    </section>
  );
};
