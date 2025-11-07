import React from 'react';
import { Card, CardContent } from '@/design-system/shadcn/components/card';

export const FounderStoryCard: React.FC = () => {
  return (
    <Card className="max-w-2xl mx-auto -mt-12 shadow-2xl bg-white border-slate-200">
      <CardContent className="p-8 md:p-10 text-center">
        <p className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          I ran restaurants for 10+ years.
        </p>
        <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
          Every tool was too slow, too expensive, too complicated—and built by people who never actually ran a restaurant.
        </p>
        <p className="mt-4 text-base md:text-lg text-slate-900 font-semibold leading-relaxed">
          So I built RestaurantIQ: the tool I begged Toast to create.
        </p>
        <p className="mt-2 text-sm md:text-base text-slate-600">
          Upload an invoice, start tracking today.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          — Geoffrey Fernald, Founder
        </p>
      </CardContent>
    </Card>
  );
};
