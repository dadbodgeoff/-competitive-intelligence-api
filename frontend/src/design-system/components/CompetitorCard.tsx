/**
 * Design System - Competitor Card Component
 * RestaurantIQ Platform
 */

import { MapPin, Star, Users, Navigation } from 'lucide-react';
import { cn } from '../utils';

export interface CompetitorCardProps {
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  address: string;
  className?: string;
  onViewDetails?: () => void;
}

export function CompetitorCard({
  name,
  rating,
  reviewCount,
  distance,
  address,
  className,
  onViewDetails,
}: CompetitorCardProps) {
  // Rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-primary-500 bg-primary-500/15 border-white/10';
    if (rating >= 4.0) return 'text-accent-400 bg-accent-500/15 border-accent-500/30';
    if (rating >= 3.5) return 'text-primary-500 bg-primary-500/15 border-primary-600/30';
    return 'text-destructive bg-destructive/15 border-red-500/30';
  };

  // Format distance
  const formatDistance = (miles: number) => {
    if (miles < 1) {
      return `${(miles * 5280).toFixed(0)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-white/10',
        'bg-gradient-to-br from-slate-850 to-slate-900',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent-500/30',
        className
      )}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-slate-100 leading-tight flex-1">
            {name}
          </h3>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border',
              getRatingColor(rating)
            )}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            {rating.toFixed(1)}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-slate-400 mb-4">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{address}</span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-slate-400 text-xs">Reviews</div>
              <div className="text-slate-200 font-semibold">
                {reviewCount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Navigation className="w-4 h-4 text-accent-500" />
            <div>
              <div className="text-slate-400 text-xs">Distance</div>
              <div className="text-accent-400 font-semibold">
                {formatDistance(distance)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {onViewDetails && (
        <div className="px-5 py-3 bg-black/20 border-t border-white/5">
          <button
            onClick={onViewDetails}
            className={cn(
              'w-full px-4 py-2 rounded-md text-sm font-medium',
              'bg-white/5 text-accent-400 border border-accent-400/30',
              'hover:bg-accent-400/10 hover:border-accent-400/50',
              'transition-all duration-200'
            )}
          >
            View Details
          </button>
        </div>
      )}

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-500/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
