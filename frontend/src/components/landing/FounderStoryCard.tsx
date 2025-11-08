import React from 'react';
import { Card, CardContent } from '@/design-system/shadcn/components/card';

export const FounderStoryCard: React.FC = () => {
  return (
    <section className="py-16 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/20">
        <CardContent className="p-10 md:p-12 text-center">
          <p className="text-3xl md:text-4xl font-bold text-white leading-tight">
            I ran restaurants for 10+ years.
          </p>
          <p className="mt-6 text-xl md:text-2xl text-slate-300 leading-relaxed">
            Every tool was too slow, too expensive, too complicated—and built by people who never actually ran a restaurant.
          </p>
          <p className="mt-6 text-xl md:text-2xl text-emerald-400 font-semibold leading-relaxed">
            So I built RestaurantIQ: the tool I begged Toast to create.
          </p>
          <p className="mt-4 text-lg md:text-xl text-slate-400">
            Upload an invoice, start tracking today.
          </p>
          <p className="mt-8 text-base md:text-lg text-slate-500 italic">
            — Geoffrey Fernald, Founder
          </p>
        </CardContent>
      </Card>
    </section>
  );
};
