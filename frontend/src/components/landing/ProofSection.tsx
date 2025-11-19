import React from 'react';
import { FounderStoryCard } from '@/components/landing/FounderStoryCard';
import { TestimonialCard } from '@/components/landing/TestimonialCard';

const proofStats = [
  { label: 'Invoices parsed', value: '42,000+' },
  { label: 'Monthly savings spotted', value: '$3.4M+' },
  { label: 'Operators inside', value: '247+' },
];

export const ProofSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Built By Operators</p>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Proof it works in the real world
          </h2>
          <p className="text-slate-400 text-lg">
            We built RestaurantIQ after running our own kitchens. No jargon. No dashboards you never open.
            Just the numbers you need every morning.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <FounderStoryCard />
          <TestimonialCard />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {proofStats.map((stat) => (
            <div key={stat.label} className="bg-slate-900/50 border border-slate-800 rounded-2xl py-6 px-4">
              <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
              <p className="text-sm uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

