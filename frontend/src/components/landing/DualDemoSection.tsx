import React from 'react';
import { Sparkles, DollarSign } from 'lucide-react';
import { CreativeLiveDemo } from '@/features/landing-demo';
import { InvoiceDemoCard } from './InvoiceDemoCard';

export const DualDemoSection: React.FC = () => {
  return (
    <section id="demos" className="py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="text-[#A8B1B9] text-lg max-w-3xl mx-auto">
            Try both of our most powerful features right now—no account required.
          </p>
        </div>

        <div className="space-y-8">
          {/* Creative Demo - Stacked */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create Marketing Assets</h3>
                <p className="text-sm text-[#A8B1B9]">Generate professional images in under 15 seconds</p>
              </div>
            </div>
            <div className="bg-[#1E1E1E] border border-[#1E1E1E] rounded-xl p-4 md:p-5">
              <CreativeLiveDemo />
            </div>
          </div>

          {/* Invoice Demo - Stacked */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Catch Price Leaks Instantly</h3>
                <p className="text-sm text-[#A8B1B9]">Upload invoices and surface price anomalies in 30 seconds</p>
              </div>
            </div>
            <div className="bg-[#1E1E1E] border border-[#1E1E1E] rounded-xl p-4 md:p-5">
              <InvoiceDemoCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
