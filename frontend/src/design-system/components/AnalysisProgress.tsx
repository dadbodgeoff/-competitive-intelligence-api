/**
 * Design System - Analysis Progress Component
 * RestaurantIQ Platform
 */

import { Check, Loader2 } from 'lucide-react';
import { cn } from '../utils';

export interface ProgressStep {
  label: string;
  status: 'pending' | 'active' | 'complete';
  duration?: number;
}

export interface AnalysisProgressProps {
  steps: ProgressStep[];
  totalDuration?: number;
  className?: string;
}

export function AnalysisProgress({
  steps,
  totalDuration,
  className,
}: AnalysisProgressProps) {
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-gradient-to-br from-slate-850 to-slate-900 p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Analysis in Progress
        </h3>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 font-mono text-sm">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 p-3 rounded-md transition-all duration-300',
              step.status === 'active' && 'bg-emerald-500/10 border border-emerald-500/20',
              step.status === 'complete' && 'bg-white/5',
              step.status === 'pending' && 'opacity-50'
            )}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {step.status === 'complete' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              {step.status === 'active' && (
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                'flex-1',
                step.status === 'active' && 'text-emerald-400 font-semibold',
                step.status === 'complete' && 'text-slate-400',
                step.status === 'pending' && 'text-slate-500'
              )}
            >
              {step.label}
            </span>

            {/* Duration */}
            {step.duration && step.status === 'complete' && (
              <span className="text-emerald-400 font-semibold text-xs">
                {step.duration}s
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {totalDuration && (
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Time</span>
          <span className="text-emerald-400 font-semibold font-mono">
            {totalDuration}s
          </span>
        </div>
      )}
    </div>
  );
}
