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
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // ALWAYS verify auth with backend on mount
    // This is the ONLY source of truth (HTTPOnly cookie)
    const verifyAuth = async () => {
      // Skip if already checking
      if (isVerifying) return;
      
      setIsVerifying(true);
      
      try {
        await checkAuth();
        // If successful, isAuthenticated will be set to true by checkAuth
      } catch (error) {
        // checkAuth already handles setting isAuthenticated to false
        console.log('Auth verification failed');
      } finally {
        setAuthChecked(true);
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [location.pathname]); // Re-verify on route change

  // Show loading while verifying auth
  if (!authChecked || isVerifying) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-white">Verifying authentication...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
