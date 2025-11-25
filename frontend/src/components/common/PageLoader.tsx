/**
 * PageLoader - Suspense fallback for lazy-loaded routes
 * Shows a branded loading state while chunks are being fetched
 */

import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  /** Optional message to display */
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo/spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-white animate-spin" />
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">{message}</p>
        </div>
        
        {/* Subtle loading bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}

// Add to your CSS or tailwind config:
// @keyframes loading-bar {
//   0% { width: 0%; margin-left: 0; }
//   50% { width: 50%; margin-left: 25%; }
//   100% { width: 0%; margin-left: 100%; }
// }
