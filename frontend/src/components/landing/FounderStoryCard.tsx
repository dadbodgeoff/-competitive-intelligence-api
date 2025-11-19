import React from 'react';
import { Card, CardContent } from '@/design-system/shadcn/components/card';

export const FounderStoryCard: React.FC = () => {
  return (
    <Card className="h-full shadow-2xl bg-white border-slate-200 relative z-10">
      <CardContent className="p-8 md:p-12 text-center space-y-5">
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
          I ran restaurants for 10+ years.
        </h2>
        <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
          Every tool was too slow, too expensive, too complicated—and built by people who never actually ran a restaurant.
        </p>
        <p className="text-xl md:text-2xl text-emerald-700 font-bold leading-relaxed italic">
          "So I built RestaurantIQ: the tool I begged Toast to create."
        </p>
        <p className="text-base md:text-lg text-slate-600 font-medium">
          Upload an invoice, start tracking today.
        </p>
        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            — Geoffrey Fernald, Founder
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
