import React, { useState } from 'react';

const painPoints = [
  {
    prompt: 'Closing out the night reconciling invoices by hand?',
    solution:
      'Upload invoices the moment the truck leaves. RestaurantIQ reconciles them automatically, flags every variance, and queues anything that needs a vendor call before morning.',
  },
  {
    prompt: 'Chasing down why an ingredient quietly jumped 18% this month?',
    solution:
      'Invoice Guard compares each delivery to your 7/28/90-day baseline and highlights the exact items, vendors, and packaging tricks causing the leak.',
  },
  {
    prompt: 'Guessing whether your menu pricing still beats the spot down the street?',
    solution:
      'Competitor Radar tracks nearby menus, pricing, and guest sentiment so you know what to promote, what to retire, and when you can raise prices with confidence.',
  },
];

export const PainPointsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Does this sound like your week?
          </h2>
          <p className="text-slate-300 text-lg">
            We built the workflow around the highest-leverage headaches restaurant operators face every service.
          </p>
        </div>

        <div className="space-y-4">
          {painPoints.map((item, idx) => {
            const isOpen = idx === activeIndex;
            return (
              <div
                key={item.prompt}
                className="surface-glass-muted border border-white/5 rounded-2xl px-6 py-5 transition-all duration-300 hover:border-emerald-400/40"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left text-lg md:text-xl text-white"
                  onClick={() => setActiveIndex(isOpen ? -1 : idx)}
                >
                  <span>{item.prompt}</span>
                  <span className="text-emerald-300 text-sm font-semibold">
                    {isOpen ? 'Hide' : 'Show fix'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-4 text-slate-300 text-sm md:text-base">
                    {item.solution}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
