import React from 'react';
import { CheckCircle2, Shield, Lock, Timer, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InvoiceDemoCard } from '@/components/landing/InvoiceDemoCard';
import { Button } from '@/design-system/shadcn/components/button';

const guaranteePoints = [
  {
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    title: 'Zero-Risk Guarantee',
    description: 'Invoices are encrypted, never shared, delete with one click.',
  },
  {
    icon: <Lock className="w-5 h-5 text-emerald-400" />,
    title: 'Built by operators',
    description: 'I ran restaurants for 10+ years. I’m not selling your data.',
  },
  {
    icon: <Timer className="w-5 h-5 text-emerald-400" />,
    title: 'Real results in 30 seconds',
    description: 'See price alerts, matched items, and savings before signup.',
  },
];

const steps = [
  'Drop any Sysco/US Foods invoice (PDF or photo)',
  'Watch the parser stream live results',
  'Create a free account to save it (optional)',
];

export const LiveDemoSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
        <InvoiceDemoCard />

        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 space-y-8">
          <div>
            <p className="text-sm uppercase tracking-widest text-emerald-400 mb-2">
              Live Demo
            </p>
            <h3 className="text-3xl font-black text-white leading-tight">
              Drop a real invoice. See every penny we find.
            </h3>
            <p className="text-slate-400 mt-3">
              Drag a Sysco/US Foods invoice into the box and watch it parse in real-time.
              No login. No salesperson. Just proof.
            </p>
          </div>

          <div className="space-y-4">
            {guaranteePoints.map((point) => (
              <div
                key={point.title}
                className="flex items-start gap-4 rounded-xl bg-slate-900/60 border border-slate-800 p-4"
              >
                <div className="mt-1">{point.icon}</div>
                <div>
                  <p className="text-white font-semibold">{point.title}</p>
                  <p className="text-slate-400 text-sm">{point.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <p className="text-sm uppercase tracking-widest text-slate-400 mb-3">How it works</p>
            <ul className="space-y-3">
              {steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <Link to="/register" className="block mt-6">
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 text-base font-semibold">
                Create free account to save results
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-slate-500 text-center mt-3">
              Or just drop an invoice above and watch it fly first.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

