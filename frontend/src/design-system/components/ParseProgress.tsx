/**
 * Design System - Parse Progress Component
 * RestaurantIQ Platform
 * 
 * Shows real-time parsing progress with milestone-based visual feedback.
 * Uses the professional Icon system for consistent branding.
 */

import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Loader2,
  FileText,
  Search,
  ClipboardList,
  DollarSign,
  CheckCircle2,
  PartyPopper,
  type LucideIcon,
} from 'lucide-react';
import { Icon, type IconVariant } from '@/components/ui/Icon';
import { cn } from '../utils';

// Milestone configuration for invoice parsing with Lucide icons
const INVOICE_MILESTONES: Array<{
  progress: number;
  label: string;
  icon: LucideIcon;
  variant: IconVariant;
}> = [
  { progress: 0, label: 'Uploading document', icon: FileText, variant: 'primary' },
  { progress: 20, label: 'Extracting text', icon: Search, variant: 'accent' },
  { progress: 40, label: 'Identifying line items', icon: ClipboardList, variant: 'primary' },
  { progress: 60, label: 'Parsing prices', icon: DollarSign, variant: 'accent' },
  { progress: 80, label: 'Validating totals', icon: CheckCircle2, variant: 'success' },
  { progress: 100, label: 'Ready for review', icon: PartyPopper, variant: 'success' },
];

const CONTEXT_STEPS = [
  '• Reading document structure and layout',
  '• Identifying vendor information and invoice number',
  '• Extracting line item descriptions and quantities',
  '• Parsing unit prices and calculating totals',
];

export interface ParseProgressProps {
  status: 'starting' | 'parsing' | 'validating' | 'ready' | 'error';
  progress: number;
  currentStep: string;
  elapsedSeconds: number;
  isConnected: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  error?: string;
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
  onRetry,
  error,
  title = 'Parsing Invoice',
  className,
}: ParseProgressProps) {
  const [showLongWait, setShowLongWait] = useState(false);

  // Show "taking longer than expected" after 30 seconds
  useEffect(() => {
    if ((status === 'parsing' || status === 'validating') && elapsedSeconds > 30) {
      setShowLongWait(true);
    } else {
      setShowLongWait(false);
    }
  }, [status, elapsedSeconds]);

  // Find current milestone based on progress
  const currentMilestone = INVOICE_MILESTONES.reduce((prev, curr) =>
    progress >= curr.progress ? curr : prev
  );

  const formatElapsedTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Starting state - immediate feedback with bouncing dots
  if (status === 'starting') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative">
            <div className="p-4 rounded-full bg-primary-500/10 border border-primary-500/30">
              <Icon icon={INVOICE_MILESTONES[0].icon} size="2xl" variant="primary" animate="pulse" />
            </div>
            <div className="absolute -inset-2 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">Starting {title}...</h3>
            <p className="text-slate-400">Preparing your document</p>
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (status === 'error') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
            <Icon icon={AlertCircle} size="xl" variant="error" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title} Failed</h3>
            <p className="text-sm text-red-400 mt-1">{error || currentStep || 'Something went wrong'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
            >
              <Icon icon={RefreshCw} size="sm" variant="inherit" />
              Try Again
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  // Ready state
  if (status === 'ready') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-full bg-success-500/10 border border-success-500/30">
              <Icon icon={CheckCircle} size="xl" variant="success" />
            </div>
            <div className="absolute -inset-1 bg-success-500/20 rounded-full blur-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title} Complete!</h3>
            <p className="text-sm text-primary-400">
              Finished in {formatElapsedTime(elapsedSeconds)}
            </p>
          </div>
          <Icon icon={PartyPopper} size="lg" variant="success" className="ml-auto" />
        </div>
      </div>
    );
  }

  // Processing state - main progress display with milestones
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with milestone icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-full bg-accent-500/10 border border-accent-500/30">
              <Icon 
                icon={currentMilestone.icon} 
                size="xl" 
                variant={currentMilestone.variant} 
                animate="pulse" 
              />
            </div>
            <div className="absolute -inset-1 bg-accent-500/20 rounded-full blur-lg animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{currentMilestone.label}</h3>
            <p className="text-sm text-slate-400">{progress}% complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{formatElapsedTime(elapsedSeconds)}</span>
          {isConnected ? (
            <Icon icon={Wifi} size="sm" variant="primary" aria-label="Connected" />
          ) : (
            <Icon icon={WifiOff} size="sm" variant="error" aria-label="Disconnected" />
          )}
        </div>
      </div>

      {/* Progress Bar with gradient */}
      <div className="space-y-2">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-obsidian/50">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        
        {/* Milestone indicators */}
        <div className="flex justify-between text-xs text-slate-500">
          {INVOICE_MILESTONES.map((milestone) => (
            <div
              key={milestone.progress}
              className={cn(
                'transition-colors duration-300',
                progress >= milestone.progress ? 'text-primary-500 font-semibold' : ''
              )}
            >
              {milestone.progress}%
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Detail */}
      <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon icon={Loader2} size="md" variant="accent" animate="spin" className="mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">Current Step</h4>
            <p className="text-sm text-slate-400">{currentStep}</p>
          </div>
        </div>
      </div>

      {/* Contextual steps */}
      <div className="text-xs text-slate-500 space-y-1">
        {CONTEXT_STEPS.map((step, i) => (
          <p key={i}>{step}</p>
        ))}
      </div>

      {/* Long wait warning */}
      {showLongWait && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-sm text-amber-400">
            ⏳ This is taking longer than expected. Please wait...
          </p>
        </div>
      )}

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
