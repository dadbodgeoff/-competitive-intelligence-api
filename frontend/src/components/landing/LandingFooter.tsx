import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-emerald-400 font-bold text-2xl">R</span>
              <span className="text-white font-semibold text-lg">RestaurantIQ</span>
            </div>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Built by operators, for operators. Control your food costs without the spreadsheets.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base md:text-lg">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#pricing" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm md:text-base">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm md:text-base">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm md:text-base">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base md:text-lg">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm md:text-base">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm md:text-base">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} RestaurantIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
