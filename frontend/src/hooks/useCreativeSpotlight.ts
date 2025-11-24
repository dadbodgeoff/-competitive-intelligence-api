/**
 * Hook to manage Creative Module Spotlight visibility
 * Tracks user preference in localStorage and provides show/hide controls
 */
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'creative_spotlight_dismissed';

export const useCreativeSpotlight = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the spotlight
    const dismissed = localStorage.getItem(STORAGE_KEY);
    
    if (!dismissed) {
      // Show spotlight if not dismissed
      setIsVisible(true);
    }
    
    setIsLoading(false);
  }, []);

  const show = () => {
    setIsVisible(true);
  };

  const hide = () => {
    setIsVisible(false);
  };

  const dismissPermanently = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  const reset = () => {
    // For testing or admin purposes
    localStorage.removeItem(STORAGE_KEY);
    setIsVisible(true);
  };

  return {
    isVisible,
    isLoading,
    show,
    hide,
    dismissPermanently,
    reset,
  };
};
