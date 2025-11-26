/**
 * useOnlineStatus - Network connectivity detection hook
 * 
 * Provides real-time online/offline status with:
 * - Initial state from navigator.onLine
 * - Event listeners for online/offline events
 * - Automatic cleanup on unmount
 * 
 * Usage:
 *   const isOnline = useOnlineStatus();
 *   if (!isOnline) return <OfflineBanner />;
 */

import { useState, useEffect, useCallback } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // SSR safety check
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return isOnline;
}

/**
 * useNetworkStatus - Extended network status with additional info
 * 
 * Provides:
 * - isOnline: boolean
 * - wasOffline: boolean (true if user was offline during this session)
 * - lastOnlineAt: Date | null
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineAt: null as Date | null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineAt: new Date(),
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}

export default useOnlineStatus;
