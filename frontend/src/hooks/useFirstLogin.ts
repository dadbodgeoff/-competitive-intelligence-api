/**
 * Hook to detect and manage first login experience
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

const FIRST_LOGIN_KEY = 'has_completed_first_login';

export const useFirstLogin = () => {
  const { user } = useAuthStore();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check if user has completed first login flow
    const hasCompletedFirstLogin = localStorage.getItem(
      `${FIRST_LOGIN_KEY}_${user.id}`
    );

    if (!hasCompletedFirstLogin) {
      setIsFirstLogin(true);
    }

    setIsLoading(false);
  }, [user]);

  const markFirstLoginComplete = () => {
    if (user) {
      localStorage.setItem(`${FIRST_LOGIN_KEY}_${user.id}`, 'true');
      setIsFirstLogin(false);
    }
  };

  const resetFirstLogin = () => {
    // For testing purposes
    if (user) {
      localStorage.removeItem(`${FIRST_LOGIN_KEY}_${user.id}`);
      setIsFirstLogin(true);
    }
  };

  return {
    isFirstLogin,
    isLoading,
    markFirstLoginComplete,
    resetFirstLogin,
  };
};
