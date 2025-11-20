import { apiClient, safeRequest } from './client'
import type {
  ReviewAnalysisRequest,
  AnalysisResponse,
  AnalysisStatus,
  ReviewAnalysisResponse,
} from '@/types/analysis'
import type { LoginCredentials, RegisterData, TokenResponse, User } from '@/types/auth'

function unwrap<T>(result: Awaited<ReturnType<typeof safeRequest<T>>>, fallbackMessage: string): T {
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? fallbackMessage)
  }
  return result.data
}

export async function login(credentials: LoginCredentials) {
  const result = await safeRequest<TokenResponse>(() =>
    apiClient.post('/api/v1/auth/login', credentials)
  )
  return unwrap(result, 'Login failed')
}

export async function register(userData: RegisterData) {
  const result = await safeRequest<{ user: User; message: string }>(() =>
    apiClient.post('/api/v1/auth/register', userData)
  )
  return unwrap(result, 'Registration failed')
}

export async function logout() {
  await safeRequest(() => apiClient.post('/api/v1/auth/logout', undefined))
}

export async function getProfile() {
  const result = await safeRequest<User>(() => apiClient.get('/api/v1/auth/me'))
  return unwrap(result, 'Failed to load profile')
}

export async function createReviewAnalysis(request: ReviewAnalysisRequest) {
  const result = await safeRequest<AnalysisResponse>(() =>
    apiClient.post('/api/v1/analysis/run', {
      ...request,
      analysis_type: 'review',
    })
  )
  return unwrap(result, 'Failed to start analysis')
}

export async function getAnalysisStatus(analysisId: string) {
  const result = await safeRequest<AnalysisStatus>(() =>
    apiClient.get(`/api/v1/analysis/${analysisId}/status`)
  )
  return unwrap(result, 'Failed to fetch analysis status')
}

export async function getReviewAnalysisResults(analysisId: string) {
  const result = await safeRequest<ReviewAnalysisResponse>(() =>
    apiClient.get(`/api/v1/analysis/${analysisId}`)
  )
  return unwrap(result, 'Failed to fetch review analysis results')
}

