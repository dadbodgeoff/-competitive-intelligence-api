import React from 'react';
import { CheckCircle2, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16 leading-tight">
          What actually happens when you<br/>upload invoices + your menu
        </h2>
        
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full roi-table">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700">
                <th className="text-left py-6 px-8 text-xl font-bold text-slate-300 w-[25%]">What you do</th>
                <th className="text-left py-6 px-8 text-xl font-bold text-emerald-400 w-[45%]">What RestaurantIQ does instantly</th>
                <th className="text-left py-6 px-8 text-xl font-bold text-white w-[30%]">Why it matters every week</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr className="hover:bg-slate-800/80 transition-colors group">
                <td className="py-8 px-8 align-top">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold flex-shrink-0">1</div>
                    <span className="text-lg font-medium text-white">Drop 5–10 invoices</span>
                  </div>
                </td>
                <td className="py-8 px-8 align-top">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      Tracks every item across every vendor
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      Shows last paid, 7/28/90-day averages
                    </li>
                    <li className="flex items-start gap-2 text-white font-medium">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                      Flags price creep immediately
                    </li>
                  </ul>
                </td>
                <td className="py-8 px-8 align-top bg-emerald-900/10 group-hover:bg-emerald-900/20 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
                      <span className="text-xl font-semibold text-emerald-300">
                        Stop playing detective on price creep—RestaurantIQ flags it the day it happens.
                      </span>
                    </div>
                    <p className="text-base text-slate-300">
                      Owners replaced six spreadsheets and a Sunday night audit with one screen.
                    </p>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/80 transition-colors group">
                <td className="py-8 px-8 align-top">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold flex-shrink-0">2</div>
                    <span className="text-lg font-medium text-white">Add your menu once</span>
                  </div>
                </td>
                <td className="py-8 px-8 align-top">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      Links recipes to real invoice prices
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      Calculates true plate cost every single day
                    </li>
                    <li className="flex items-start gap-2 text-white font-medium">
                      <Clock className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                      Updates the second a new invoice lands
                    </li>
                  </ul>
                </td>
                <td className="py-8 px-8 align-top bg-cyan-900/10 group-hover:bg-cyan-900/20 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                      <span className="text-xl font-semibold text-cyan-300">
                        Daily plate cost without exporting a single CSV.
                      </span>
                    </div>
                    <p className="text-base text-slate-300">
                      Chefs keep it open on the line to adjust pars and costing before service.
                    </p>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/80 transition-colors group">
                <td className="py-8 px-8 align-top">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold flex-shrink-0">3</div>
                    <span className="text-lg font-medium text-white">Click one button</span>
                  </div>
                </td>
                <td className="py-8 px-8 align-top">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      Compares your prices to 5 nearby competitors
                    </li>
                    <li className="flex items-start gap-2 text-white font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      Pulls their reviews and tells you what customers love/hate
                    </li>
                  </ul>
                </td>
                <td className="py-8 px-8 align-top bg-purple-900/10 group-hover:bg-purple-900/20 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                      <span className="text-xl font-semibold text-purple-300">
                        Confident price moves with live comps and customer sentiment in one place.
                      </span>
                    </div>
                    <p className="text-base text-slate-300">
                      Teams use it during weekly menu meetings to decide what to promote or raise.
                    </p>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/80 transition-colors group">
                <td className="py-8 px-8 align-top">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-500/30">✓</div>
                    <span className="text-lg font-medium text-white">Nothing else</span>
                  </div>
                </td>
                <td className="py-8 px-8 align-top">
                  <p className="text-lg text-slate-300 italic">
                    Daily dashboard shows exactly where you’re bleeding money
                  </p>
                </td>
                <td className="py-8 px-8 align-top bg-emerald-900/10 group-hover:bg-emerald-900/20 transition-colors">
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-white">
                      Morning briefing replaces the old legal-pad checklist.
                    </p>
                    <p className="text-base text-slate-300">
                      RestaurantIQ becomes part of opening duties—operators glance, act, move on.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
