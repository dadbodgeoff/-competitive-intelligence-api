import axios from 'axios';
import type {
  DemoGenerationRequest,
  DemoGenerationResponse,
  DemoJobStatus,
  DemoTemplate,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance without auth interceptors
const demoClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function startDemoGeneration(
  payload: DemoGenerationRequest
): Promise<DemoGenerationResponse> {
  const response = await demoClient.post<DemoGenerationResponse>(
    '/api/v1/nano-banana/demo/generate',
    payload
  );
  return response.data;
}

export async function getDemoJobStatus(sessionId: string): Promise<DemoJobStatus> {
  const response = await demoClient.get<DemoJobStatus>(
    `/api/v1/nano-banana/demo/jobs/${sessionId}`
  );
  return response.data;
}

export async function streamDemoJob(sessionId: string): Promise<EventSource> {
  const url = `${API_BASE}/api/v1/nano-banana/demo/jobs/${sessionId}/stream`;
  return new EventSource(url);
}

// Fetch public templates (no auth required)
export async function fetchDemoTemplates(): Promise<DemoTemplate[]> {
  const response = await demoClient.get<DemoTemplate[]>('/api/v1/nano-banana/demo/templates');
  return response.data;
}
