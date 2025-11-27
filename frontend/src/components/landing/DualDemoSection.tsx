import React from 'react';
import { Sparkles, DollarSign } from 'lucide-react';
import { CreativeLiveDemo } from '@/features/landing-demo';
import { InvoiceDemoCard } from './InvoiceDemoCard';

export const DualDemoSection: React.FC = () => {
  return (
    <section id="demos" className="py-20 md:py-32 px-4 relative overflow-hidden">
      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#B08968]/15"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${12 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            See It In Action
          </h2>
          <p className="text-[#A8B1B9] text-lg max-w-3xl mx-auto">
            Try both of our most powerful features right now. No account required.
          </p>
        </div>

        <div className="space-y-12">
          {/* Creative Demo */}
          <div className="flex flex-col">
            <div className="flex flex-col items-center text-center mb-6">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.2) 0%, rgba(176, 137, 104, 0.05) 100%)',
                  border: '1px solid rgba(176, 137, 104, 0.25)',
                }}
              >
                <Sparkles className="w-7 h-7 text-[#B08968]" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Create Marketing Assets</h3>
              <p className="text-sm text-[#A8B1B9] mt-1">Generate professional images in under 15 seconds</p>
            </div>
            <div 
              className="rounded-2xl p-5 md:p-8 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(145deg, rgba(176, 137, 104, 0.04) 0%, rgba(30, 30, 30, 0.8) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 40px -12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <CreativeLiveDemo />
            </div>
          </div>

          {/* Invoice Demo */}
          <div className="flex flex-col">
            <div className="flex flex-col items-center text-center mb-6">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.2) 0%, rgba(176, 137, 104, 0.05) 100%)',
                  border: '1px solid rgba(176, 137, 104, 0.25)',
                }}
              >
                <DollarSign className="w-7 h-7 text-[#B08968]" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Catch Price Leaks Instantly</h3>
              <p className="text-sm text-[#A8B1B9] mt-1">Upload invoices and surface price anomalies in 30 seconds</p>
            </div>
            <div 
              className="rounded-2xl p-5 md:p-8 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(145deg, rgba(176, 137, 104, 0.04) 0%, rgba(30, 30, 30, 0.8) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 40px -12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <InvoiceDemoCard />
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-18px) translateX(10px); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
};
