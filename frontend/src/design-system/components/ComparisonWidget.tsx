/**
 * Design System - Comparison Widget Component
 * RestaurantIQ Platform
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../utils';

export interface ComparisonMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export interface ComparisonRestaurant {
  name: string;
  avatar?: string;
  metrics: ComparisonMetric[];
}

export interface ComparisonWidgetProps {
  restaurants: [ComparisonRestaurant, ComparisonRestaurant];
  className?: string;
}

export function ComparisonWidget({
  restaurants,
  className,
}: ComparisonWidgetProps) {
  const [restaurant1, restaurant2] = restaurants;

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-gradient-to-br from-slate-850 to-slate-900 p-6',
        className
      )}
    >
      {/* Header */}
      <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-white/10">
        {restaurants.map((restaurant, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-xl font-bold text-emerald-400 border border-emerald-500/30">
              {restaurant.avatar || restaurant.name.charAt(0)}
            </div>
            {/* Name */}
            <div>
              <h3 className="font-semibold text-slate-100">{restaurant.name}</h3>
              <p className="text-xs text-slate-500">Restaurant {index + 1}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Comparison */}
      <div className="space-y-4">
        {restaurant1.metrics.map((metric, index) => {
          const metric2 = restaurant2.metrics[index];

          return (
            <div key={index} className="grid grid-cols-2 gap-6">
              {/* Restaurant 1 Metric */}
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  {metric.label}
                </div>
                <div className="text-2xl font-bold text-slate-100 mb-1">
                  {metric.value}
                </div>
                {metric.trend && metric.trendValue && (
                  <div
                    className={cn(
                      'flex items-center justify-center gap-1 text-xs font-medium',
                      metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metric.trendValue}
                  </div>
                )}
              </div>

              {/* Restaurant 2 Metric */}
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  {metric2.label}
                </div>
                <div className="text-2xl font-bold text-slate-100 mb-1">
                  {metric2.value}
                </div>
                {metric2.trend && metric2.trendValue && (
                  <div
                    className={cn(
                      'flex items-center justify-center gap-1 text-xs font-medium',
                      metric2.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {metric2.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metric2.trendValue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
