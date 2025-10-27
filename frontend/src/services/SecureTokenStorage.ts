import { User } from '@/types/auth';

interface TokenData {
  token: string;
  expiresAt: number;
  createdAt: number;
  userId: string;
}

export class SecureTokenStorage {
  private readonly TOKEN_KEY = 'ci_auth_token';
  private readonly REFRESH_KEY = 'ci_refresh_token';
  private readonly USER_KEY = 'ci_user_data';

  setTokens(accessToken: string, refreshToken: string, user: User): void {
    // Validate token format
    if (!this.isValidJWT(accessToken)) {
      throw new Error('Invalid JWT token format');
    }

    // Store with metadata
    const tokenData: TokenData = {
      token: accessToken,
      expiresAt: this.extractExpiration(accessToken),
      createdAt: Date.now(),
      userId: user.id,
    };

    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Schedule automatic cleanup
    this.scheduleTokenCleanup(tokenData.expiresAt);
  }

  getValidToken(): string | null {
    try {
      const tokenData = JSON.parse(localStorage.getItem(this.TOKEN_KEY) || '{}');
      
      // Check expiration (with 5-minute buffer)
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      if (Date.now() > (tokenData.expiresAt - bufferTime)) {
        this.triggerTokenRefresh();
        return null;
      }

      return tokenData.token;
    } catch {
      this.clearAllAuthData();
      return null;
    }
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  clearAllAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Clear any cached analysis data
    this.clearAnalysisCache();
  }

  private isValidJWT(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3;
  }

  private extractExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return Date.now() + (60 * 60 * 1000); // Default 1 hour
    }
  }

  private scheduleTokenCleanup(expiresAt: number): void {
    const timeUntilExpiry = expiresAt - Date.now();
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        this.clearAllAuthData();
      }, timeUntilExpiry);
    }
  }

  private triggerTokenRefresh(): void {
    // This will be handled by the auth store
    window.dispatchEvent(new CustomEvent('token-refresh-needed'));
  }

  private clearAnalysisCache(): void {
    // Clear any cached analysis data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('analysis_') || key.startsWith('ci_analysis_')) {
        localStorage.removeItem(key);
      }
    });
  }
}