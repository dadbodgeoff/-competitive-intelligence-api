/**
 * Theme Test Page
 * Visual verification of all theme components and utilities
 */

import React from 'react';

export const ThemeTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian p-8">
      <div className="max-w-wide mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gradient-primary">
            RestaurantIQ Theme Library
          </h1>
          <p className="text-secondary text-lg">
            Complete dark mode design system test page
          </p>
        </div>

        {/* Colors Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Brand Colors</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-emerald-500 rounded-lg"></div>
              <p className="text-sm text-tertiary">Emerald 500</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-cyan-500 rounded-lg"></div>
              <p className="text-sm text-tertiary">Cyan 500</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-slate-850 rounded-lg border border-default"></div>
              <p className="text-sm text-tertiary">Slate 850</p>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">Heading 1 - 3rem</h1>
            <h2 className="text-4xl font-bold">Heading 2 - 2.25rem</h2>
            <h3 className="text-3xl font-bold">Heading 3 - 1.875rem</h3>
            <h4 className="text-2xl font-bold">Heading 4 - 1.5rem</h4>
            <h5 className="text-xl font-bold">Heading 5 - 1.25rem</h5>
            <h6 className="text-lg font-bold">Heading 6 - 1.125rem</h6>
            <p className="text-base text-secondary">
              Body text - Inter font family with smooth antialiasing
            </p>
            <code className="font-mono text-sm bg-slate-800 px-2 py-1 rounded">
              Monospace - JetBrains Mono
            </code>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-ghost">Ghost Button</button>
            <button className="btn-primary" disabled>Disabled</button>
          </div>
        </section>

        {/* Badges Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge-confidence-high">High Confidence</span>
            <span className="badge-confidence-medium">Medium Confidence</span>
            <span className="badge-confidence-low">Low Confidence</span>
            <span className="badge-opportunity">Opportunity</span>
            <span className="badge-threat">Threat</span>
            <span className="badge-watch">Watch</span>
          </div>
        </section>

        {/* Form Elements Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Form Elements</h2>
          <div className="space-y-4 max-w-md">
            <input
              type="text"
              placeholder="Input field"
              className="input-field"
            />
            <input
              type="text"
              placeholder="Focused input"
              className="input-field"
              autoFocus
            />
            <textarea
              placeholder="Textarea"
              className="input-field"
              rows={3}
            />
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-elevated p-6">
              <h3 className="text-xl font-semibold mb-2">Elevated Card</h3>
              <p className="text-secondary">
                Standard card with elevation and border
              </p>
            </div>
            <div className="card-interactive p-6">
              <h3 className="text-xl font-semibold mb-2">Interactive Card</h3>
              <p className="text-secondary">
                Hover to see the lift effect
              </p>
            </div>
          </div>
        </section>

        {/* Animations Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-850 p-4 rounded-lg animate-fade-in">
              <p className="text-sm text-center">Fade In</p>
            </div>
            <div className="bg-slate-850 p-4 rounded-lg animate-slide-up">
              <p className="text-sm text-center">Slide Up</p>
            </div>
            <div className="bg-slate-850 p-4 rounded-lg animate-scale-in">
              <p className="text-sm text-center">Scale In</p>
            </div>
            <div className="bg-slate-850 p-4 rounded-lg animate-pulse">
              <p className="text-sm text-center">Pulse</p>
            </div>
          </div>
        </section>

        {/* Hover Effects Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Hover Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-850 p-6 rounded-lg hover-lift">
              <p className="text-center">Hover Lift</p>
            </div>
            <div className="bg-slate-850 p-6 rounded-lg hover-glow">
              <p className="text-center">Hover Glow</p>
            </div>
            <div className="bg-slate-850 p-6 rounded-lg hover-scale">
              <p className="text-center">Hover Scale</p>
            </div>
          </div>
        </section>

        {/* Gradients Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold mb-6">Gradients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-primary p-8 rounded-lg">
              <p className="text-white font-semibold">Primary Gradient</p>
            </div>
            <div className="bg-gradient-secondary p-8 rounded-lg">
              <p className="text-white font-semibold">Secondary Gradient</p>
            </div>
            <div className="bg-gradient-accent p-8 rounded-lg">
              <p className="text-white font-semibold">Accent Gradient</p>
            </div>
            <div className="bg-gradient-card p-8 rounded-lg">
              <p className="text-white font-semibold">Card Gradient</p>
            </div>
          </div>
        </section>

        {/* Shadows Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Shadows</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-850 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-center">Small</p>
            </div>
            <div className="bg-slate-850 p-4 rounded-lg shadow-md">
              <p className="text-sm text-center">Medium</p>
            </div>
            <div className="bg-slate-850 p-4 rounded-lg shadow-lg">
              <p className="text-sm text-center">Large</p>
            </div>
            <div className="bg-slate-850 p-4 rounded-lg shadow-xl">
              <p className="text-sm text-center">XL</p>
            </div>
          </div>
        </section>

        {/* Skeleton Loading Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Skeleton Loading</h2>
          <div className="space-y-3">
            <div className="skeleton h-4 w-3/4"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-5/6"></div>
          </div>
        </section>

        {/* Semantic Colors Section */}
        <section className="card-elevated p-8">
          <h2 className="text-3xl font-bold mb-6">Semantic Colors</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
              <p style={{ color: 'var(--success-text)' }}>Success message</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
              <p style={{ color: 'var(--error-text)' }}>Error message</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
              <p style={{ color: 'var(--warning-text)' }}>Warning message</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
              <p style={{ color: 'var(--info-text)' }}>Info message</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThemeTest;
