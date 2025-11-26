/**
 * Streaming Progress Component
 * 
 * Professional milestone-based progress display inspired by Nano Banana's UX.
 * Uses the Icon system for consistent branding with contextual messaging.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Rocket,
  PartyPopper,
  type LucideIcon,
} from 'lucide-react';
import { Icon, type IconVariant } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface Milestone {
  progress: number;
  label: string;
  icon: LucideIcon;
  variant?: IconVariant;
}

export interface StreamingProgressProps {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Current status */
  status: 'starting' | 'processing' | 'completed' | 'error';
  /** Current step description */
  currentStep?: string;
  /** Error message if status is 'error' */
  error?: string;
  /** Whether SSE connection is active */
  isConnected?: boolean;
  /** Elapsed time in seconds */
  elapsedSeconds?: number;
  /** Milestones to display */
  milestones: Milestone[];
  /** Title for the progress card */
  title: string;
  /** Contextual descriptions shown during processing */
  contextualSteps?: string[];
  /** Called when user clicks cancel */
  onCancel?: () => void;
  /** Called when user clicks retry after error */
  onRetry?: () => void;
  /** Additional class names */
  className?: string;
}

export function StreamingProgress({
  progress,
  status,
  currentStep,
  error,
  isConnected = true,
  elapsedSeconds = 0,
  milestones,
  title,
  contextualSteps,
  onCancel,
  onRetry,
  className,
}: StreamingProgressProps) {
  const [showLongWait, setShowLongWait] = useState(false);

  // Show "taking longer than expected" after 30 seconds
  useEffect(() => {
    if (status === 'processing' && elapsedSeconds > 30) {
      setShowLongWait(true);
    } else {
      setShowLongWait(false);
    }
  }, [status, elapsedSeconds]);

  // Find current milestone based on progress
  const currentMilestone = milestones.reduce((prev, curr) =>
    progress >= curr.progress ? curr : prev
  );

  const formatElapsedTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Starting state - immediate feedback
  if (status === 'starting') {
    const startIcon = milestones[0]?.icon || Rocket;
    return (
      <Card className={cn('bg-card-dark border-primary-500/50', className)}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="p-4 rounded-full bg-primary-500/10 border border-primary-500/30">
                <Icon icon={startIcon} size="2xl" variant="primary" animate="pulse" />
              </div>
              <div className="absolute -inset-2 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Starting {title}...</h3>
              <p className="text-slate-400">Preparing your request</p>
            </div>
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className={cn('bg-card-dark border-red-500/50', className)}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
              <Icon icon={AlertCircle} size="xl" variant="error" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{title} Failed</h3>
              <p className="text-sm text-red-400 mt-1">{error || 'Something went wrong'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {onRetry && (
              <Button onClick={onRetry} className="bg-primary-500 hover:bg-primary-600">
                <Icon icon={RefreshCw} size="sm" variant="inherit" className="mr-2" />
                Try Again
              </Button>
            )}
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="border-white/10 text-slate-300">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed state
  if (status === 'completed') {
    return (
      <Card className={cn('bg-card-dark border-primary-500/50', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-full bg-success-500/10 border border-success-500/30">
                <Icon icon={CheckCircle2} size="xl" variant="success" />
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
        </CardContent>
      </Card>
    );
  }

  // Processing state - main progress display
  return (
    <Card className={cn('bg-card-dark border-white/10', className)}>
      <CardContent className="p-6 space-y-6">
        {/* Header with milestone icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-full bg-accent-500/10 border border-accent-500/30">
                <Icon 
                  icon={currentMilestone.icon} 
                  size="xl" 
                  variant={currentMilestone.variant || 'accent'} 
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
              <Icon icon={Wifi} size="sm" variant="primary" />
            ) : (
              <Icon icon={WifiOff} size="sm" variant="error" />
            )}
          </div>
        </div>

        {/* Progress bar with gradient */}
        <div className="space-y-2">
          <div className="relative h-3 bg-obsidian/50 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          
          {/* Milestone indicators */}
          <div className="flex justify-between text-xs text-slate-500">
            {milestones.map((milestone) => (
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

        {/* Current step detail */}
        {currentStep && (
          <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon icon={Loader2} size="md" variant="accent" animate="spin" className="mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Current Step</p>
                <p className="text-sm text-slate-400 mt-1">{currentStep}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contextual steps */}
        {contextualSteps && contextualSteps.length > 0 && (
          <div className="text-xs text-slate-500 space-y-1">
            {contextualSteps.map((step, i) => (
              <p key={i}>• {step}</p>
            ))}
          </div>
        )}

        {/* Long wait warning */}
        {showLongWait && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-sm text-amber-400">
              ⏳ This is taking longer than expected. Please wait...
            </p>
          </div>
        )}

        {/* Cancel button */}
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full border-white/10 text-slate-300 hover:bg-destructive/10 hover:text-destructive hover:border-red-500/30"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
