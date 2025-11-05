/**
 * Shared API client with cookie-based authentication
 * All requests automatically include httpOnly cookies
 */

import axios, { AxiosInstance } from 'axios';

// Create axios instance with cookie support
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',  // Use empty string - routes already have /api prefix
    withCredentials: true, // Send cookies with every request
    timeout: 120000, // 2 minutes for file uploads and LLM processing
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add response interceptor for automatic token refresh and retries
  client.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // NEVER retry auth endpoints to prevent infinite loops
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      
      // Retry on network errors or 5xx errors (but not for uploads in progress)
      const isRetryableError = 
        error.code === 'ECONNABORTED' || // Timeout
        error.code === 'ERR_NETWORK' || // Network error
        (error.response?.status >= 500 && error.response?.status < 600); // Server errors
      
      const isUploadRequest = originalRequest.method?.toLowerCase() === 'post' && 
                             originalRequest.url?.includes('/upload');
      
      // Retry logic for network/server errors (max 2 retries)
      if (isRetryableError && !isAuthEndpoint && !isUploadRequest) {
        originalRequest._retryCount = originalRequest._retryCount || 0;
        
        if (originalRequest._retryCount < 2) {
          originalRequest._retryCount += 1;
          
          // Exponential backoff: 1s, 2s
          const delay = 1000 * originalRequest._retryCount;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return client(originalRequest);
        }
      }
      
      // If 401 and haven't retried yet, try to refresh (but NOT for any auth endpoints!)
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;

        try {
          await client.post('/api/v1/auth/refresh');
          return client(originalRequest); // Retry original request
        } catch (refreshError) {
          // Refresh failed, redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // If it's a 401 on auth endpoint, just redirect
      if (error.response?.status === 401 && isAuthEndpoint) {
        // Don't redirect on login/register failures
        if (!originalRequest.url?.includes('/login') && !originalRequest.url?.includes('/register')) {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

/**
 * Keepalive ping to prevent cold starts
 * Pings the health endpoint every 5 minutes to keep the server warm
 */
if (typeof window !== 'undefined') {
  // Initial ping after 10 seconds
  setTimeout(() => {
    apiClient.get('/health').catch(() => {
      // Ignore errors - this is just a keepalive
    });
  }, 10000);
  
  // Periodic ping every 5 minutes
  setInterval(() => {
    apiClient.get('/health').catch(() => {
      // Ignore errors - this is just a keepalive
    });
  }, 5 * 60 * 1000);
}

/**
 * Safe API request wrapper with user-friendly error handling
 * 
 * Usage:
 *   const data = await safeRequest(() => apiClient.get('/endpoint'));
 * 
 * Features:
 * - Automatic error logging
 * - User-friendly error messages
 * - Type-safe
 * - Non-breaking (returns error object instead of throwing)
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export async function safeRequest<T>(
  requestFn: () => Promise<{ data: T }>,
  options?: {
    errorMessage?: string;
    onError?: (error: ApiError) => void;
  }
): Promise<ApiResponse<T>> {
  try {
    const response = await requestFn();
    return {
      data: response.data,
      success: true,
    };
  } catch (error: any) {
    // Extract error details
    const apiError: ApiError = {
      message: options?.errorMessage || 
               error.response?.data?.detail || 
               error.response?.data?.message ||
               error.message || 
               'Something went wrong. Please try again.',
      status: error.response?.status,
      code: error.response?.data?.code,
      details: error.response?.data,
    };

    // Call custom error handler if provided
    if (options?.onError) {
      options.onError(apiError);
    }

    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: apiError.status,
        message: apiError.message,
        details: apiError.details,
      });
    }

    return {
      error: apiError,
      success: false,
    };
  }
}

/**
 * Get user-friendly error message based on status code
 */
export function getErrorMessage(status?: number, defaultMessage?: string): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Please log in to continue.',
    403: 'You don\'t have permission to do that.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    422: 'Invalid data provided. Please check your input.',
    429: 'Too many requests. Please slow down.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable.',
    503: 'Service temporarily unavailable.',
  };

  return messages[status || 0] || defaultMessage || 'Something went wrong. Please try again.';
}
