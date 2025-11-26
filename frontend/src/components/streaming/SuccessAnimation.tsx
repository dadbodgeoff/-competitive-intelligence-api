/**
 * Success Animation Component
 * 
 * Celebratory overlay with confetti for completed operations.
 * Ported from Nano Banana's creative module for use across all streaming operations.
 */

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles } from 'lucide-react';

export interface SuccessAnimationProps {
  /** Whether to show the animation */
  show: boolean;
  /** Main success message */
  message: string;
  /** Optional count to display (e.g., "5 items processed") */
  count?: number;
  /** Label for the count (e.g., "items", "invoices", "reviews") */
  countLabel?: string;
  /** Custom icon emoji (defaults to ✨) */
  icon?: string;
}

export function SuccessAnimation({
  show,
  message,
  count,
  countLabel = 'items',
  icon,
}: SuccessAnimationProps) {
  useEffect(() => {
    if (!show) return;

    // Fire confetti celebration
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="relative">
            {icon ? (
              <span className="text-6xl">{icon}</span>
            ) : (
              <CheckCircle2 className="h-20 w-20 animate-in zoom-in-50 duration-700" />
            )}
            <Sparkles className="h-8 w-8 absolute -top-2 -right-2 animate-pulse text-yellow-300" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Success!</h2>
            <p className="text-lg opacity-90">{message}</p>
            {count !== undefined && (
              <p className="text-sm opacity-75 mt-2">
                {count} {count === 1 ? countLabel.replace(/s$/, '') : countLabel}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
