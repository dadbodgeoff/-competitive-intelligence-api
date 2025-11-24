/**
 * Design System - Parse Progress Component
 * RestaurantIQ Platform
 * 
 * Shows real-time parsing progress with status indicators
 */

import { Clock, Sparkles, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../utils';

export interface ParseProgressProps {
  status: 'parsing' | 'validating' | 'ready' | 'error';
  progress: number;
  currentStep: string;
  elapsedSeconds: number;
  isConnected: boolean;
  onCancel?: () => void;
  title?: string;
  className?: string;
}

export function ParseProgress({
  status,
  progress,
  currentStep,
  elapsedSeconds,
  isConnected,
  onCancel,
  title = 'Parsing Invoice',
  className,
}: ParseProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'parsing':
      case 'validating':
        return <Clock className="h-5 w-5 text-accent-500 animate-spin" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-primary-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    const badges = {
      parsing: 'bg-accent-500/10 text-accent-400 border-accent-500/30',
      validating: 'bg-accent-500/10 text-accent-400 border-accent-500/30',
      ready: 'bg-primary-500/10 text-primary-500 border-white/10',
      error: 'bg-destructive/10 text-destructive border-red-500/30',
    };

    const labels = {
      parsing: 'Parsing',
      validating: 'Validating',
      ready: 'Ready',
      error: 'Error',
    };

    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border', badges[status])}>
        {labels[status]}
      </span>
    );
  };

  const formatTimeEstimate = () => {
    if (elapsedSeconds < 20) return '30-60 seconds remaining';
    if (elapsedSeconds < 40) return '10-20 seconds remaining';
    return 'Almost done...';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/20 rounded-full blur-lg animate-pulse" />
            <div className="relative p-3 rounded-full bg-accent-500/10 border border-accent-500/30">
              {getStatusIcon()}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{currentStep}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {isConnected ? (
            <Wifi className="h-5 w-5 text-primary-500" aria-label="Connected" />
          ) : (
            <WifiOff className="h-5 w-5 text-destructive" aria-label="Disconnected" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-obsidian/50">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-accent-400 font-semibold">
            {progress}% complete
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeEstimate()}
          </span>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-obsidian/50 border border-white/10 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-accent-400 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">Current Step</h4>
            <p className="text-sm text-slate-400">{currentStep}</p>
            {elapsedSeconds > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Elapsed: {elapsedSeconds}s
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className={cn(
            'w-full px-4 py-2 rounded-md text-sm font-medium',
            'border border-white/10 text-slate-300',
            'hover:bg-destructive/10 hover:text-destructive hover:border-red-500/30',
            'transition-all duration-200'
          )}
        >
          Cancel Parsing
        </button>
      )}

      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {currentStep}
      </div>
    </div>
  );
}
