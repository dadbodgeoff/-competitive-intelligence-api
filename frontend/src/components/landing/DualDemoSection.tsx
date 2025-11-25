import React from 'react';
import { Sparkles, DollarSign } from 'lucide-react';
import { CreativeLiveDemo } from '@/features/landing-demo';
import { InvoiceDemoCard } from './InvoiceDemoCard';

export const DualDemoSection: React.FC = () => {
  return (
    <section id="demos" className="py-20 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
            See It In Action
          </h2>
          <p className="text-[#A8B1B9] text-lg max-w-3xl mx-auto">
            Try both of our most powerful features right now—no account required.
          </p>
        </div>

        <div className="space-y-12">
          {/* Creative Demo */}
          <div className="flex flex-col">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/15 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Create Marketing Assets</h3>
              <p className="text-sm text-[#A8B1B9] mt-1">Generate professional images in under 15 seconds</p>
            </div>
            <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-5 md:p-8">
              <CreativeLiveDemo />
            </div>
          </div>

          {/* Invoice Demo */}
          <div className="flex flex-col">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/15 flex items-center justify-center mb-3">
                <DollarSign className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Catch Price Leaks Instantly</h3>
              <p className="text-sm text-[#A8B1B9] mt-1">Upload invoices and surface price anomalies in 30 seconds</p>
            </div>
            <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-5 md:p-8">
              <InvoiceDemoCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
