import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';

export const LandingNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Skip to Main - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[9999] focus:bg-emerald-500 focus:text-white focus:px-6 focus:py-3 focus:font-semibold focus:rounded-br-lg"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <header className="fixed top-0 w-full h-16 bg-gray-900/95 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-2xl">R</span>
              <span className="text-white font-semibold text-lg">RestaurantIQ</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a 
                href="#pricing" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Pricing
              </a>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white h-10">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-10 px-6">
                  Get Started
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-emerald-400 min-h-[44px] min-w-[44px] flex items-center justify-center" 
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-white/10">
            <nav className="flex flex-col p-4 gap-2">
              <a 
                href="#pricing" 
                className="text-slate-400 hover:text-emerald-400 py-3 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link 
                to="/login" 
                className="text-slate-300 py-3 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="text-emerald-400 py-3 font-semibold min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
