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
      ? 'bg-[#0A0A0A]/95 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_40px_-25px_rgba(176,137,104,0.5)]'
      : 'bg-[#0A0A0A]/60 backdrop-blur-xl border-b border-transparent'
  }`;

  return (
    <>
      {/* Skip to Main - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[9999] focus:bg-primary-500 focus:text-white focus:px-6 focus:py-3 focus:font-semibold focus:rounded-br-lg"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Logo - BRAND COLORS */}
            <Link to="/" className="flex items-center gap-2 transition-colors">
              <span className="font-bold text-2xl" style={{ color: '#B08968' }}>R</span>
              <span className="font-semibold text-lg" style={{ color: '#E0E0E0' }}>RestaurantIQ</span>
            </Link>

            {/* Desktop Navigation - BRAND COLORS */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a 
                href="#pricing" 
                className="transition-colors text-sm font-medium"
                style={{ color: '#A8B1B9' }}
              >
                Pricing
              </a>
              <Link
                to="/legal/terms"
                className="transition-colors text-sm font-medium"
                style={{ color: '#A8B1B9' }}
              >
                Policies
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="btn-small hover:bg-white/5" style={{ color: '#A8B1B9' }}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-small text-white font-semibold shadow-lg transition-all" style={{ backgroundColor: '#B08968' }}>
                  Get Started
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button - BRAND COLORS */}
            <button 
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center" 
              style={{ color: '#B08968' }}
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - BRAND COLORS */}
        {mobileMenuOpen && (
          <div className="md:hidden backdrop-blur-xl border-t" style={{ backgroundColor: 'rgba(18, 18, 18, 0.95)', borderColor: 'rgba(176, 137, 104, 0.2)' }}>
            <nav className="flex flex-col p-6 gap-4">
              <a 
                href="#pricing" 
                className="py-3 min-h-[44px]"
                style={{ color: '#A8B1B9' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link
                to="/legal/terms"
                className="py-3 min-h-[44px]"
                style={{ color: '#E0E0E0' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Policies
              </Link>
              <Link 
                to="/login" 
                className="py-3 min-h-[44px]"
                style={{ color: '#E0E0E0' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="py-3 font-semibold min-h-[44px]"
                style={{ color: '#B08968' }}
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
