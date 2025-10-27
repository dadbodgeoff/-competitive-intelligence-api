import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginCredentials, 
  RegisterData, 
  TokenResponse, 
  User 
} from '@/types/auth';
import {
  ReviewAnalysisRequest,
  AnalysisResponse,
  AnalysisStatus,
  ReviewAnalysisResponse
} from '@/types/analysis';

export class ReviewAnalysisAPIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    console.log('🌐 API Service: Making login request to', this.client.defaults.baseURL + '/api/v1/auth/login');
    const response: AxiosResponse<TokenResponse> = await this.client.post('/api/v1/auth/login', credentials);
    console.log('🌐 API Service: Login response received', response.status);
    return response.data;
  }

  async register(userData: RegisterData): Promise<User> {
    const response: AxiosResponse<User> = await this.client.post('/api/v1/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/api/v1/auth/me');
    return response.data;
  }

  // Review analysis endpoints (Module 1 only)
  async createReviewAnalysis(request: ReviewAnalysisRequest): Promise<AnalysisResponse> {
    console.log('🚀 FRONTEND API: Starting analysis request');
    console.log('🚀 FRONTEND API: Request data:', JSON.stringify(request, null, 2));
    console.log('🚀 FRONTEND API: Target URL:', this.client.defaults.baseURL + '/api/v1/analysis/run');
    
    const startTime = Date.now();
    
    try {
      const response: AxiosResponse<AnalysisResponse> = await this.client.post('/api/v1/analysis/run', {
        ...request,
        analysis_type: 'review' // Specify Module 1
      });
      
      const duration = Date.now() - startTime;
      console.log('✅ FRONTEND API: Analysis request successful');
      console.log('✅ FRONTEND API: Response status:', response.status);
      console.log('✅ FRONTEND API: Response time:', duration + 'ms');
      console.log('✅ FRONTEND API: Response headers:', JSON.stringify(response.headers, null, 2));
      console.log('✅ FRONTEND API: Response data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ FRONTEND API: Analysis request failed');
      console.error('❌ FRONTEND API: Error after:', duration + 'ms');
      console.error('❌ FRONTEND API: Error details:', error);
      throw error;
    }
  }

  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatus> {
    const response: AxiosResponse<AnalysisStatus> = await this.client.get(`/api/v1/analysis/${analysisId}/status`);
    return response.data;
  }

  async getReviewAnalysisResults(analysisId: string): Promise<ReviewAnalysisResponse> {
    const response: AxiosResponse<ReviewAnalysisResponse> = await this.client.get(`/api/v1/analysis/${analysisId}`);
    return response.data;
  }

  // Set auth token for requests
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Clear auth token
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Error handling with backend-specific codes
  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const errorCode = error.response?.data?.code;
        const userMessage = this.getErrorMessage(errorCode);
        
        // Log for debugging but show user-friendly message
        console.error('API Error:', error);
        throw new Error(userMessage);
      }
    );
  }

  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      // Review analysis specific errors
      'ANALYSIS_NO_COMPETITORS': 'No competitors found in this area. Try expanding your search radius.',
      'ANALYSIS_QUOTA_EXCEEDED': 'Monthly analysis limit reached. Upgrade to continue analyzing.',
      'GOOGLE_PLACES_QUOTA': 'Service temporarily busy. Please try again in a few minutes.',
      'REVIEW_FETCH_FAILED': 'Unable to fetch competitor reviews. Please try again.',
      
      // Authentication errors
      'AUTH_TOKEN_EXPIRED': 'Session expired. Please log in again.',
      'AUTH_INVALID_CREDENTIALS': 'Invalid email or password.',
      'AUTH_USER_EXISTS': 'An account with this email already exists.',
      'AUTH_WEAK_PASSWORD': 'Password must be at least 8 characters with special characters.',
      
      // Generic fallbacks
      'NETWORK_ERROR': 'Connection problem. Check internet and retry.',
      'SERVER_ERROR': 'Service temporarily unavailable. We\'re working on it.',
    };

    return messages[code] || messages.SERVER_ERROR;
  }
}

// Export singleton instance
export const reviewAnalysisAPI = new ReviewAnalysisAPIService();