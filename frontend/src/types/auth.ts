export type AccountRole = 'owner' | 'admin' | 'member';

export interface ModuleAccess {
  module_slug: string;
  can_access: boolean;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  created_at: string;
  account_id: string;
  account_role: AccountRole;
  module_access: ModuleAccess[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  invite_token?: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  invite_token?: string;
  terms_accepted: boolean;
  terms_version: string;
  terms_accepted_at: string;
  privacy_accepted: boolean;
  privacy_version: string;
  privacy_accepted_at: string;
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
  moduleAccess: ModuleAccess[];
}

export interface InviteValidation {
  token: string;
  account_id: string;
  account_name: string | null;
  account_plan?: string | null;
  email: string;
  role: AccountRole;
  status: string;
  expires_at: string;
  accepted_at?: string | null;
  is_expired: boolean;
  is_valid: boolean;
  error?: string;
}