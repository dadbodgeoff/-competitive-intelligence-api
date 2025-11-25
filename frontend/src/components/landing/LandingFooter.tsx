import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#121212]">
      {/* CTA Banner */}
      <div className="py-16 px-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Try Creative Studio Free
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop overpaying vendors. Start creating stunning marketing.
          </h3>
          <p className="text-lg text-[#A8B1B9] mb-8 max-w-2xl mx-auto">
            Upload your first invoice and generate your first marketing image in under 2 minutes. 
            No credit card, no commitment.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-[#A8B1B9]">
                <li>
                  <Link to="/register" className="hover:text-primary-400 transition-colors">
                    Invoice Processing
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-400 transition-colors">
                    Creative Studio
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-400 transition-colors">
                    Recipe Costing
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-primary-400 transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-[#A8B1B9]">
                <li>
                  <Link to="/login" className="hover:text-primary-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-400 transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-[#A8B1B9]">
                <li>
                  <Link to="/legal/privacy" className="hover:text-primary-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/terms" className="hover:text-primary-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-[#A8B1B9]">
                <li>
                  <a 
                    href="mailto:support@restaurantiq.us" 
                    className="hover:text-primary-400 transition-colors"
                  >
                    support@restaurantiq.us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">R</span>
              <span className="text-white font-semibold">RestaurantIQ</span>
            </div>
            <p className="text-[#A8B1B9] text-sm">
              © {currentYear} RestaurantIQ. Built by restaurant operators, for restaurant operators.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
