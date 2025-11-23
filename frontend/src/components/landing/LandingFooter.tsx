import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-slate-200 mb-4">RestaurantIQ</h3>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Built by an owner who closed at 2am for a decade.<br/>
            No salespeople will ever call you. Your data stays yours. Cancel anytime.
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto mt-4">
            Security &amp; privacy: uploads are encrypted in Supabase, guest invoices auto-expire after 24 hours, and you can delete anything permanently with one click.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left max-w-2xl mx-auto mb-8">
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Get Started</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  to="/legal/privacy"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
           <div className="col-span-2 md:col-span-2">
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <p className="text-slate-400">
              Questions? <a href="mailto:support@restaurantiq.us" className="text-emerald-400 hover:underline">support@restaurantiq.us</a>
            </p>
          </div>
        </div>

        <Link
          to="/register"
          className="group flex w-full max-w-2xl mx-auto mb-12 items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-left hover:border-emerald-400/50 hover:bg-emerald-500/15 transition-colors"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Free seat available</p>
            <p className="text-base md:text-lg font-semibold text-white mt-1">
              Free seat. 60 seconds to your first insight.
            </p>
          </div>
          <span className="text-emerald-200 text-sm font-semibold group-hover:text-white">
            Send me a login — let’s find margin →
          </span>
        </Link>

        <div className="pt-8 border-t border-slate-900 text-slate-600 text-sm">
          © {currentYear} RestaurantIQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
