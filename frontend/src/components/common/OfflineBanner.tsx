/**
 * OfflineBanner - Network connectivity warning banner
 * 
 * Displays a non-intrusive banner when the user loses internet connection.
 * Automatically hides when connection is restored.
 * 
 * Features:
 * - Animated entrance/exit
 * - Clear messaging
 * - Non-blocking (doesn't prevent app usage)
 * - Auto-dismisses on reconnection with success message
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface OfflineBannerProps {
  /** Optional className for positioning */
  className?: string;
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Track if user was offline
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setDismissed(false); // Reset dismiss when going offline
    }
  }, [isOnline]);

  // Show "reconnected" message briefly when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Don't show anything if online and not showing reconnected message
  if (isOnline && !showReconnected) return null;

  // Don't show if dismissed (only for offline state)
  if (!isOnline && dismissed) return null;

  return (
    <AnimatePresence>
      {(!isOnline || showReconnected) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[100] ${className}`}
        >
          <div
            className={`
              flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium
              ${isOnline 
                ? 'bg-success-500/90 text-white backdrop-blur-sm' 
                : 'bg-amber-500/90 text-amber-950 backdrop-blur-sm'
              }
            `}
          >
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                <span>You're back online!</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 animate-pulse" />
                <span>You're offline. Some features may not work until you reconnect.</span>
                <button
                  onClick={() => setDismissed(true)}
                  className="ml-2 p-1 rounded hover:bg-amber-600/20 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * OfflineOverlay - Full-screen overlay for critical offline scenarios
 * Use this for pages that absolutely require connectivity
 */
export function OfflineOverlay() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-obsidian/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
            <WifiOff className="h-10 w-10 text-amber-500 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No Internet Connection</h2>
        <p className="text-slate-400 mb-6">
          Please check your connection and try again. This page requires an active internet connection to function.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  );
}

export default OfflineBanner;
