import React from 'react';
import { Card, CardContent } from '@/design-system/shadcn/components/card';

export const FounderStoryCard: React.FC = () => {
  return (
    <Card className="h-full surface-glass rounded-3xl text-left relative overflow-hidden">
      <CardContent className="p-8 md:p-12 space-y-6">
        <div className="space-y-3">
          <span className="badge-soft">Built by an operator</span>
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
            I ran restaurants for 10+ years.
          </h2>
          <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium">
            RestaurantIQ exists because I was done with:
          </p>
        </div>
        <ul className="text-base md:text-lg text-slate-200/90 font-medium space-y-3">
          <li>• Closing at 2am then reconciling invoices by hand before payroll.</li>
          <li>• Vendors changing descriptions so price hikes slipped past the team.</li>
          <li>• Paying $500–$2,000/mo for “insights” that still required spreadsheets.</li>
        </ul>
        <p className="text-base md:text-lg text-slate-200/80 font-medium">
          RestaurantIQ is the system I begged Toast, MarginEdge, and Restaurant365 to build—so I built it myself and kept it honest.
        </p>
        <div className="pt-5 border-t border-white/10">
          <p className="text-sm font-bold text-emerald-200 uppercase tracking-wider">
            — Geoffrey Fernald, Founder
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
