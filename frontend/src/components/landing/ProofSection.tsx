import React from 'react';
const roadmapColumns = [
  {
    title: 'Shipping now',
    bullets: [
      'Invoice Guard, Recipe Brain, and Competitor Radar are live inside the app.',
      'Guest uploader + sandbox account so you can test everything without a contract.',
    ],
  },
  {
    title: 'Co-building with founders',
    bullets: [
      'Weekly working sessions on reporting, multi-unit dashboards, and automation.',
      'Direct Slack/Zoom access to the team for feedback and support.',
    ],
  },
  {
    title: 'Next on deck',
    bullets: [
      'Team dashboards, export tooling, and deeper vendor scorecards.',
      'SOC2 prep, audit logging, and enterprise permissions for multi-unit groups.',
    ],
  },
];

export const ProofSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Built by operators</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Build it with us, live in production
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            We run our own kitchens on RestaurantIQ, ship updates weekly, and publish the roadmap openly. Join the founding
            cohort to steer what ships next.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="surface-glass-muted border border-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Founder notes</p>
            <h3 className="text-xl font-semibold text-white">“I ran restaurants for 10+ years.”</h3>
            <ul className="text-slate-300 text-sm space-y-2">
              <li>• Closing at 2am then reconciling invoices by hand before payroll.</li>
              <li>• Vendors changing descriptions so price hikes slipped past the team.</li>
              <li>• Paying $500–$2,000/mo for “insights” that still required spreadsheets.</li>
            </ul>
            <p className="text-xs text-emerald-200">— Geoffrey Fernald, Founder</p>
          </div>

          <div className="surface-glass-muted border border-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Founding cohort</p>
            <ul className="text-slate-300 text-sm space-y-2">
              <li>• Use Invoice Guard, Recipe Brain, and Competitor Radar without contracts.</li>
              <li>• Bring real invoices + 15-minute weekly feedback loops.</li>
              <li>• Get roadmap influence and grandfathered pricing.</li>
            </ul>
            <p className="text-xs text-slate-400">
              Ready to join? Create a free account and we’ll onboard you personally.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {roadmapColumns.map((item) => (
            <div key={item.title} className="surface-glass-muted border border-white/10 rounded-2xl p-5 space-y-3 hover-lift text-sm">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {item.title === 'Next on deck' && (
                <a
                  href="mailto:support@restaurantiq.us?subject=Roadmap%20updates"
                  className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  Want roadmap updates? Email us and we&rsquo;ll add you to the list.
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

