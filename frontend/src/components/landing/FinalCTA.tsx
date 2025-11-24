import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 md:py-24 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto text-center">
        <div className="surface-glass gradient-outline p-10 md:p-14 space-y-6">
          <h2 className="text-white">
            Start Running Leaner, Faster, and Smarter
          </h2>
          
          <p className="text-xl text-slate-300">
            Book your personalized demo or start your free trial today—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/register">
              <Button className="btn-cta-primary">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="mailto:support@restaurantiq.com">
              <Button className="btn-cta-secondary">
                <Calendar className="mr-2 w-5 h-5" />
                Book a Demo
              </Button>
            </a>
          </div>

          <p className="text-sm text-slate-400 pt-4">
            Join operators who are already protecting their margins and scaling smarter.
          </p>
        </div>
      </div>
    </section>
  );
};
