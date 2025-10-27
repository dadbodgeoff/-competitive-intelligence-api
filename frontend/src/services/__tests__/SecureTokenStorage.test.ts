import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecureTokenStorage } from '../SecureTokenStorage';
import { User } from '@/types/auth';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
});

describe('SecureTokenStorage', () => {
  let tokenStorage: SecureTokenStorage;
  let mockUser: User;
  let mockToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    tokenStorage = new SecureTokenStorage();
    
    mockUser = {
      id: '123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      subscription_tier: 'free',
      created_at: '2023-01-01T00:00:00Z',
    };

    // Create a mock JWT token (header.payload.signature)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: '123', 
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    }));
    const signature = 'mock-signature';
    mockToken = `${header}.${payload}.${signature}`;
  });

  describe('setTokens', () => {
    it('stores tokens and user data correctly', () => {
      tokenStorage.setTokens(mockToken, 'refresh-token', mockUser);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ci_auth_token',
        expect.stringContaining(mockToken)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ci_refresh_token',
        'refresh-token'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ci_user_data',
        JSON.stringify(mockUser)
      );
    });

    it('throws error for invalid JWT format', () => {
      expect(() => {
        tokenStorage.setTokens('invalid-token', 'refresh-token', mockUser);
      }).toThrow('Invalid JWT token format');
    });
  });

  describe('getValidToken', () => {
    it('returns valid token when not expired', () => {
      const tokenData = {
        token: mockToken,
        expiresAt: Date.now() + 3600000, // 1 hour from now
        createdAt: Date.now(),
        userId: '123',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(tokenData));

      const result = tokenStorage.getValidToken();
      expect(result).toBe(mockToken);
    });

    it('returns null for expired token', () => {
      const tokenData = {
        token: mockToken,
        expiresAt: Date.now() - 1000, // 1 second ago
        createdAt: Date.now() - 3600000,
        userId: '123',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(tokenData));

      const result = tokenStorage.getValidToken();
      expect(result).toBeNull();
    });

    it('returns null and clears data for invalid stored data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = tokenStorage.getValidToken();
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ci_auth_token');
    });
  });

  describe('getUser', () => {
    it('returns user data when valid', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = tokenStorage.getUser();
      expect(result).toEqual(mockUser);
    });

    it('returns null for invalid user data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = tokenStorage.getUser();
      expect(result).toBeNull();
    });
  });

  describe('clearAllAuthData', () => {
    it('removes all auth-related data', () => {
      tokenStorage.clearAllAuthData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ci_auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ci_refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ci_user_data');
    });
  });
});