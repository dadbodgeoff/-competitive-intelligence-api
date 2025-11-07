import React from 'react';

export const PainPointsSection: React.FC = () => {
  const painPoints = [
    'Manual invoice entry wasting your time?',
    'Struggling to link vendors or track the same item under different names?',
    'Unsure where ingredient price hikes are killing your margins?',
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
          Sound Familiar?
        </h2>
        
        <div className="space-y-4">
          {painPoints.map((point, idx) => (
            <p key={idx} className="text-lg md:text-xl text-slate-300 leading-relaxed">
              {point}
            </p>
          ))}
        </div>

        <div className="pt-8">
          <p className="text-xl md:text-2xl text-emerald-400 font-semibold leading-relaxed">
            No more surprises. Our invoice parser finds, matches, and compares every item—even when vendors change the description.
          </p>
        </div>
      </div>
    </section>
  );
};
