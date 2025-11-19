import React from 'react';

export const TestimonialCard: React.FC = () => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 md:p-12 h-full flex flex-col">
      <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-6 flex-1">
        &ldquo;RestaurantIQ killed the Sunday spreadsheet marathon. Our GM opens it during prep, sees what jumped in price, and we adjust pars before doors open. It&rsquo;s part of the shift now.&rdquo;
      </p>
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
          MR
        </div>
        <div>
          <p className="font-semibold text-white text-base md:text-lg">Maya R.</p>
          <p className="text-sm md:text-base">GM, 3-unit fast casual</p>
        </div>
      </div>
    </div>
  );
};

