import React from 'react';

export const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="hidden md:block w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-6">
                "Finally, a tool that thinks like an operator. We spotted a $2,000 monthly ingredient markup and streamlined ordering—without leaving the floor."
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-px h-8 bg-slate-600" />
                <div>
                  <p className="font-semibold text-white text-base md:text-lg">Alex P.</p>
                  <p className="text-sm md:text-base">Restaurant Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
