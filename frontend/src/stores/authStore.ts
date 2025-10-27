import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData } from '@/types/auth';
import { SecureTokenStorage } from '@/services/SecureTokenStorage';
import { reviewAnalysisAPI } from '@/services/ReviewAnalysisAPIService';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const tokenStorage = new SecureTokenStorage();

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  subscriptionTier: 'free',

  // Actions
  login: async (credentials: LoginCredentials) => {
    try {
      console.log('🔵 Login attempt started', { email: credentials.email });
      set({ isLoading: true, error: null });
      
      console.log('🔵 Calling API login...');
      const response = await reviewAnalysisAPI.login(credentials);
      console.log('✅ Login API response received', JSON.stringify(response, null, 2));
      
      // If user object is missing, fetch it
      let user = response.user;
      if (!user) {
        console.log('⚠️ User object missing, fetching profile...');
        reviewAnalysisAPI.setAuthToken(response.access_token);
        user = await reviewAnalysisAPI.getProfile();
        console.log('✅ Profile fetched', user);
      }
      
      // Store tokens securely
      tokenStorage.setTokens(response.access_token, response.refresh_token || '', user);
      
      // Set auth token for future requests
      reviewAnalysisAPI.setAuthToken(response.access_token);
      
      set({
        user: user,
        token: response.access_token,
        isAuthenticated: true,
        subscriptionTier: user.subscription_tier,
        isLoading: false,
        error: null,
      });
      console.log('✅ Login successful, state updated');
    } catch (error) {
      console.error('❌ Login failed', error);
      set({
        user: null,
        token: null,
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
      
      await reviewAnalysisAPI.register(userData);
      
      // Auto-login after successful registration
      await get().login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  logout: () => {
    tokenStorage.clearAllAuthData();
    reviewAnalysisAPI.clearAuthToken();
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      subscriptionTier: 'free',
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      const token = tokenStorage.getValidToken();
      const user = tokenStorage.getUser();
      
      if (token && user) {
        reviewAnalysisAPI.setAuthToken(token);
        
        // Verify token is still valid with backend
        try {
          const currentUser = await reviewAnalysisAPI.getProfile();
          set({
            user: currentUser,
            token,
            isAuthenticated: true,
            subscriptionTier: currentUser.subscription_tier,
            isLoading: false,
          });
        } catch (error: any) {
          // Only logout on actual auth errors (401/403)
          // Keep user logged in for network/server errors (500, timeout, etc.)
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            console.log('🔒 Auth token invalid, logging out');
            get().logout();
          } else {
            console.log('⚠️ Network/server error during auth check, keeping user logged in');
            // Keep existing auth state, just stop loading
            set({ isLoading: false });
          }
        }
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed',
      });
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        get().logout();
        return;
      }

      // Note: Implement refresh endpoint when available
      // For now, just logout and require re-login
      get().logout();
    } catch (error) {
      get().logout();
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Listen for token refresh events
window.addEventListener('token-refresh-needed', () => {
  useAuthStore.getState().refreshToken();
});