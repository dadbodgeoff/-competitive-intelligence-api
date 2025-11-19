import React from 'react';

export const TestimonialCard: React.FC = () => {
  return (
    <div className="surface-glass-muted border border-white/5 rounded-3xl p-8 md:p-12 h-full flex flex-col space-y-6 hover-lift">
      <div>
        <p className="text-sm uppercase tracking-widest text-emerald-300 mb-3">Founding cohort</p>
        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          You&rsquo;ll get hands-on support while we build around your kitchen.
        </h3>
      </div>
      <ul className="space-y-4 text-slate-300 text-base leading-relaxed flex-1">
        <li>
          <span className="text-white font-semibold">What you can use today:</span> Invoice Guard, Recipe Brain, Competitor Radar, and the live uploader without signing a contract.
        </li>
        <li>
          <span className="text-white font-semibold">What we ask from you:</span> real invoices, honest feedback, and a 15-minute weekly touchpoint so we prioritize the right workflows.
        </li>
        <li>
          <span className="text-white font-semibold">What you get:</span> direct access to the builder, roadmap influence, and grandfathered pricing when unlimited plans launch.
        </li>
      </ul>
      <p className="text-sm text-slate-400">
        Ready to be part of the founding cohort? We&rsquo;ll set you up personally after you create a free account.
      </p>
    </div>
  );
};

