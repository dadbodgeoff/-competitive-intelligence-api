import React from 'react';
import { Shield, Lock, Timer } from 'lucide-react';
import { InvoiceDemoCard } from '@/components/landing/InvoiceDemoCard';
import { Badge } from '@/design-system/shadcn/components/badge';
import { COGSDemoCard } from '@/components/landing/COGSDemoCard';

const trustBadges = [
  { icon: <Shield className="w-4 h-4" />, label: 'Data stays yours' },
  { icon: <Lock className="w-4 h-4" />, label: 'Operator-built' },
  { icon: <Timer className="w-4 h-4" />, label: 'Action in under a minute' },
];

export const LiveDemoSection: React.FC = () => {
  return (
    <section id="live-demo" className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-8">
          <InvoiceDemoCard />

          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustBadges.map((badge) => (
              <Badge
                key={badge.label}
                className="flex items-center gap-2 bg-white/5 border-white/10 text-slate-100 px-4 py-2 rounded-full"
              >
                {badge.icon}
                <span className="text-sm font-semibold">{badge.label}</span>
              </Badge>
            ))}
          </div>
        </div>

        <COGSDemoCard />
      </div>
    </section>
  );
};
