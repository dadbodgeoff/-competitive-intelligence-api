/**
 * Design System - Tier Selector Component
 * RestaurantIQ Platform
 */

import { Check } from 'lucide-react';
import { cn } from '../utils';

export interface TierFeature {
  label: string;
  included: boolean;
}

export interface Tier {
  id: string;
  name: string;
  price: number;
  badge?: string;
  features: TierFeature[];
  recommended?: boolean;
}

export interface TierSelectorProps {
  tiers: Tier[];
  selectedTierId?: string;
  onSelect: (tierId: string) => void;
  className?: string;
}

export function TierSelector({
  tiers,
  selectedTierId,
  onSelect,
  className,
}: TierSelectorProps) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {tiers.map((tier) => {
        const isSelected = selectedTierId === tier.id;
        const isRecommended = tier.recommended;

        return (
          <div
            key={tier.id}
            className={cn(
              'relative rounded-xl border-2 transition-all duration-300 cursor-pointer',
              'bg-gradient-to-br from-slate-850 to-slate-900',
              isSelected
                ? 'border-primary-500 shadow-primary scale-105'
                : 'border-white/10 hover:border-white/10 hover:-translate-y-1',
              isRecommended && !isSelected && 'border-accent-500/50'
            )}
            onClick={() => onSelect(tier.id)}
          >
            {/* Recommended Badge */}
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg">
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Selected Checkmark */}
            {isSelected && (
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="p-8">
              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-slate-100 mb-2">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-primary-500">
                  ${tier.price}
                </span>
                <span className="text-slate-400 ml-2">/ analysis</span>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li
                    key={index}
                    className={cn(
                      'flex items-start gap-3 text-sm',
                      feature.included ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-600">✕</span>
                    )}
                    <span className={!feature.included ? 'line-through' : ''}>
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                className={cn(
                  'w-full mt-8 px-6 py-3 rounded-lg font-semibold transition-all duration-200',
                  isSelected
                    ? 'bg-primary-500 text-white shadow-primary'
                    : 'bg-white/5 text-accent-400 border border-accent-400/30 hover:bg-accent-400/10'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(tier.id);
                }}
              >
                {isSelected ? 'Selected' : 'Select Plan'}
              </button>
            </div>

            {/* Glow effect for recommended */}
            {isRecommended && (
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent rounded-xl pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}
