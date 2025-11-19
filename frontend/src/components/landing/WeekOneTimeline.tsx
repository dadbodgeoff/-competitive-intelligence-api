import React from 'react';
import { ArrowRight, Archive, Compass, FolderSymlink, Loader2, MessageCircle, Sparkles, UtensilsCrossed } from 'lucide-react';

type TimelineStep = {
  day: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  cta?: { label: string; href: string };
};

const timeline: TimelineStep[] = [
  {
    day: 'Day 0',
    title: 'Upload your test invoice (no account)',
    description:
      'Drag a Sysco or US Foods invoice into the guest uploader. We encrypt, scrub identifiers, and stream price alerts in under a minute.',
    icon: <Loader2 className="h-5 w-5 text-emerald-200 animate-spin" />,
    cta: { label: 'Upload a sample invoice now', href: '#live-demo' },
  },
  {
    day: 'Day 1',
    title: 'Create your account & keep the insights',
    description:
      'Save that parsed invoice, unlock the analytics card, and set tolerance alerts so the next delivery is already monitored.',
    icon: <FolderSymlink className="h-5 w-5 text-cyan-200" />,
  },
  {
    day: 'Day 2',
    title: 'Backfill weekly + bonus uploads',
    description:
      'Use the free weekly upload plus two monthly bonus credits to backlog recent deliveries—more history tightens variance bands.',
    icon: <Archive className="h-5 w-5 text-emerald-200" />,
  },
  {
    day: 'Day 3',
    title: 'Run your menu comparison pass',
    description:
      'Upload your menu and trigger the included Competitor Radar scan to pinpoint pricing gaps and positioning moves on your block.',
    icon: <Compass className="h-5 w-5 text-purple-200" />,
  },
  {
    day: 'Day 4',
    title: 'Spend your review analysis credits',
    description:
      'Run the two bundled review sweeps to surface what guests love and drag at nearby concepts—perfect fodder for pre-shift huddles.',
    icon: <MessageCircle className="h-5 w-5 text-teal-200" />,
  },
  {
    day: 'Day 5-6',
    title: 'Wire recipes to live invoice costs',
    description:
      'Assign each ingredient once. Recipe Brain keeps plate cost locked to your latest vendor price—no spreadsheets, no re-entry.',
    icon: <UtensilsCrossed className="h-5 w-5 text-emerald-200" />,
    cta: { label: 'Watch the recipe demo', href: '#cogs-demo' },
  },
  {
    day: 'Day 7',
    title: 'Opening briefing replaces the legal pad',
    description:
      'Flip open the dashboard to see leaks, wins, and action items. Operators walk in with margin decisions queued before prep starts.',
    icon: <Sparkles className="h-5 w-5 text-emerald-200" />,
  },
];

export const WeekOneTimeline: React.FC = () => {
  return (
    <section className="pt-12">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Week one flyover</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Your first week with RestaurantIQ
          </h2>
          <p className="text-slate-300 text-base md:text-lg">
            From ungated uploads to daily briefings, here’s what operators accomplish in their first seven days.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {timeline.map((step) => (
            <div key={step.day} className="surface-glass-muted border border-white/5 rounded-2xl p-5 space-y-3 hover-lift">
              <div className="flex items-center justify-between text-emerald-200 text-xs uppercase tracking-[0.3em]">
                <span>{step.day}</span>
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
              {step.cta && (
                <a
                  href={step.cta.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-100 transition-colors"
                >
                  {step.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

