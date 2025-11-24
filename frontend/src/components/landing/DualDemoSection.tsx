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
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Try both of our most powerful features right now—no account required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creative Demo */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create Assets</h3>
                <p className="text-slate-400 text-xs">Generate marketing images in seconds</p>
              </div>
            </div>
            <div className="surface-glass-muted border border-white/5 rounded-2xl p-5 flex-1 flex flex-col min-h-[750px]">
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Generate professional, restaurant-specific marketing images in under 15 seconds with no design skills needed. 
                Simply pick a template, fill in your specials or announcements, and download ready-to-share assets optimized 
                for social and print.
              </p>
              <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <CreativeLiveDemo />
              </div>
            </div>
          </div>

          {/* Invoice Demo */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Catch Price Leaks</h3>
                <p className="text-slate-400 text-xs">Upload and analyze invoices instantly</p>
              </div>
            </div>
            <div className="surface-glass-muted border border-white/5 rounded-2xl p-5 flex-1 flex flex-col min-h-[750px]">
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Upload invoices and automatically parse each line item with 100% invoice accuracy guaranteed. 
                Intelligent matching and price tracking surface historical price changes and anomalies. 
                Flag price leaks early to protect your profit margins.
              </p>
              <div className="flex-1 min-h-0">
                <InvoiceDemoCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
