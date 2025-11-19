import React from 'react';
import { CheckCircle2, TrendingUp, DollarSign, Clock, Compass } from 'lucide-react';

const capabilities = [
  {
    label: 'Protect margins',
    title: 'Invoice Guard',
    description: 'Every invoice upload is reconciled against your catalog and tolerance thresholds.',
    bullets: [
      'Auto-matches 100% of line items with fuzzy matching and alias handling.',
      'Flags price creep, unit pack tricks, and delivery-fee shifts in seconds.',
      'Surfaces 7/28/90-day averages alongside the current charge.',
    ],
    icon: <DollarSign className="w-6 h-6 text-emerald-300" />,
    outcome: 'Decide margin fixes before the next truck unloads.',
  },
  {
    label: 'Automate ops',
    title: 'Recipe Brain',
    description: 'Recipes stay tied to live invoice costs—no CSV exports or manual clicks.',
    bullets: [
      'Links ingredients to the latest vendor cost the moment invoices post.',
      'Rebuilds plate and batch cost automatically and highlights overruns.',
      'Notifies chefs when target food cost is breached so they can adjust pars.',
    ],
    icon: <Clock className="w-6 h-6 text-cyan-300" />,
    outcome: 'Prep meetings start with today’s costs, not last week’s spreadsheet.',
  },
  {
    label: 'Win market share',
    title: 'Competitor Radar',
    description: 'See how nearby restaurants price and what guests rave or complain about.',
    bullets: [
      'Pulls menus, pricing, and positioning from 5 competitors in a click.',
      'Summarises reviews so you know what the neighborhood loves or hates.',
      'Recommends price moves, promos, or dishes worth spotlighting.',
    ],
    icon: <Compass className="w-6 h-6 text-purple-300" />,
    outcome: 'Run menu meetings with up-to-date comps and guest sentiment on-screen.',
  },
  {
    label: 'Stay on top of shifts',
    title: 'Opening Briefing',
    description: 'A daily card that shows leaks, wins, and what to act on before doors open.',
    bullets: [
      'Highlights yesterday’s price alerts, new vendor quotes, and menu flags.',
      'Shows savings captured and where attention is still needed.',
      'Built for the opening manager checklist—glance, act, move on.',
    ],
    icon: <TrendingUp className="w-6 h-6 text-emerald-200" />,
    outcome: 'Morning duties become a controlled flyover instead of firefighting.',
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            What you’ll unlock in the first seven days
          </h2>
          <p className="text-slate-300 text-lg">
            RestaurantIQ behaves like an ops partner that never sleeps—guarding margin, feeding your team live numbers, and
            scanning the market so you can move faster than the competition.
          </p>
        </div>

        <div className="grid gap-8 md:gap-10 md:grid-cols-2">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="surface-glass-muted border border-white/5 rounded-3xl p-8 md:p-10 hover-lift"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="badge-soft">{item.label}</span>
                {item.icon}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-slate-300 text-base mb-6">{item.description}</p>
              <ul className="space-y-3 text-slate-200 text-sm">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-100">
                {item.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
