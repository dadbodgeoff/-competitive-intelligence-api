/**
 * Example LiveDemoSection using the new CreativeLiveDemo component
 * 
 * Replace your existing LiveDemoSection with this implementation
 * or merge the CreativeLiveDemo component into your existing section.
 */

import React from 'react';
import { CreativeLiveDemo } from '@/features/landing-demo';

export const LiveDemoSection: React.FC = () => {
  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Generate your first creative in seconds. No credit card required.
          </p>
        </div>
        
        {/* Live Demo Component */}
        <CreativeLiveDemo />
        
        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Free demo limited to 3 generations per hour. 
            <a 
              href="/register" 
              className="text-blue-400 hover:text-blue-300 ml-1 underline"
            >
              Create a free account
            </a> 
            {' '}for unlimited access.
          </p>
        </div>
      </div>
    </section>
  );
};
