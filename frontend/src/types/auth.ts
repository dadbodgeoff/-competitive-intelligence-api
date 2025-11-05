export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

// Login/Register response (cookies set automatically by backend)
export interface TokenResponse {
  user: User;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
}