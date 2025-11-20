import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsChecking(true);

    const verifyAuth = async () => {
      try {
        await checkAuth();
      } finally {
        if (mounted) {
          setAuthChecked(true);
          setIsChecking(false);
        }
      }
    };

    verifyAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuth, location.pathname]);

  if (!authChecked || isChecking) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-white">Verifying authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
