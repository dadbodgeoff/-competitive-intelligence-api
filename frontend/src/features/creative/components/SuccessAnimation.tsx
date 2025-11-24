import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  message: string;
  assetCount: number;
}

export function SuccessAnimation({ show, message, assetCount }: SuccessAnimationProps) {
  useEffect(() => {
    if (!show) return;

    // Fire confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-br bg-primary-500 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="relative">
            <CheckCircle2 className="h-20 w-20 animate-in zoom-in-50 duration-700" />
            <Sparkles className="h-8 w-8 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Success!</h2>
            <p className="text-lg opacity-90">{message}</p>
            <p className="text-sm opacity-75 mt-2">
              {assetCount} {assetCount === 1 ? 'asset' : 'assets'} generated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
