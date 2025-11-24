import { useEffect, useState } from 'react';

const ONBOARDING_STORAGE_KEY = 'onboarding_completed';

interface OnboardingState {
  [featureKey: string]: boolean;
}

/**
 * Hook to manage onboarding state for different features
 * Stores completion state in localStorage
 */
export function useOnboarding(featureKey: string) {
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed this onboarding
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const state: OnboardingState = stored ? JSON.parse(stored) : {};
    
    const hasCompleted = state[featureKey] === true;
    setShouldShow(!hasCompleted);
    setIsLoading(false);
  }, [featureKey]);

  const markAsCompleted = (dontShowAgain: boolean = true) => {
    if (!dontShowAgain) {
      setShouldShow(false);
      return;
    }

    // Store completion state
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const state: OnboardingState = stored ? JSON.parse(stored) : {};
    
    state[featureKey] = true;
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    setShouldShow(false);
  };

  const reset = () => {
    // Remove completion state for this feature
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const state: OnboardingState = stored ? JSON.parse(stored) : {};
    
    delete state[featureKey];
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    setShouldShow(true);
  };

  const showManually = () => {
    setShouldShow(true);
  };

  return {
    shouldShow,
    isLoading,
    markAsCompleted,
    reset,
    showManually,
  };
}
