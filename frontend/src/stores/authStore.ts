import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, User } from '@/types/auth';
import { reviewAnalysisAPI } from '@/services/ReviewAnalysisAPIService';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state - NO PERSISTENCE, auth lives in HTTPOnly cookie only
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  subscriptionTier: 'free',

  // Actions
  login: async (credentials: LoginCredentials) => {
    try {
      console.log('🔵 Login attempt started', { email: credentials.email });
      set({ isLoading: true, error: null });
      
      // Cookies are set automatically by backend
      const response = await reviewAnalysisAPI.login(credentials);
      console.log('✅ Login successful, cookies set by backend');
      
      set({
        user: response.user,
        isAuthenticated: true,
        subscriptionTier: response.user.subscription_tier,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Login failed', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Cookies are set automatically by backend
      const response = await reviewAnalysisAPI.register(userData);
      
      // Response has { user: {...}, message: "..." } structure
      const user = ('user' in response ? response.user : response) as User;
      
      set({
        user: user,
        isAuthenticated: true,
        subscriptionTier: user.subscription_tier,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  logout: async () => {
    // Clear local state first
    set({
      user: null,
      isAuthenticated: false,
      subscriptionTier: 'free',
      isLoading: false,
      error: null,
    });
    
    // Try to call logout API, but don't wait or care if it fails
    try {
      await reviewAnalysisAPI.logout();
    } catch {
      // Ignore errors - we're already logged out locally
    }
  },

  checkAuth: async () => {
    // Don't check auth on initial load - only call this explicitly after login
    // This prevents infinite loops when cookies are expired
    try {
      set({ isLoading: true });
      
      const currentUser = await reviewAnalysisAPI.getProfile();
      
      set({
        user: currentUser,
        isAuthenticated: true,
        subscriptionTier: currentUser.subscription_tier,
        isLoading: false,
      });
    } catch (error: any) {
      // Just clear state, don't call logout API
      set({
        user: null,
        isAuthenticated: false,
        subscriptionTier: 'free',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));