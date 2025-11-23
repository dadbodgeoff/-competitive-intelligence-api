import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';

export const LandingNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = `fixed top-0 w-full h-16 z-50 transition-all duration-300 ${
    isScrolled
      ? 'bg-slate-950/75 backdrop-blur-2xl border-b border-emerald-500/20 shadow-[0_10px_40px_-25px_rgba(16,185,129,0.65)]'
      : 'bg-slate-950/40 backdrop-blur-xl border-b border-white/10'
  }`;

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
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 transition-colors hover:text-emerald-300">
              <span className="text-emerald-400 font-bold text-2xl">R</span>
              <span className="text-white font-semibold text-lg">RestaurantIQ</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a 
                href="#pricing" 
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Pricing
              </a>
              <Link
                to="/legal/terms"
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Policies
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white h-10 hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 h-10 px-6 shadow-lg hover:shadow-emerald-500/40">
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
          <div className="md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-emerald-500/20">
            <nav className="flex flex-col p-4 gap-2">
              <a 
                href="#pricing" 
                className="text-slate-300 hover:text-emerald-300 py-3 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link
                to="/legal/terms"
                className="text-slate-200 py-3 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Policies
              </Link>
              <Link 
                to="/login" 
                className="text-slate-200 py-3 min-h-[44px]"
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
