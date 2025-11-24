// Types for the landing page live demo
export interface DemoTemplate {
  id: string;
  name: string;
  display_name?: string;
  preview_url?: string;
  input_schema?: {
    required?: string[];
    optional?: string[];
    types?: Record<string, string>;
    labels?: Record<string, string>;
    placeholders?: Record<string, string>;
  };
}

export interface DemoGenerationRequest {
  template_id: string;
  inputs: Record<string, string>;
  policies_acknowledged: boolean;
  terms_version: string;
  privacy_version: string;
  consent_timestamp?: string;
}

export interface DemoGenerationResponse {
  success: boolean;
  session_id: string;
  job_id?: string;
  message?: string;
}

export interface DemoJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  preview_url?: string;
  error?: string;
  requires_auth_for_download?: boolean;
}

export interface PolicyConsent {
  acknowledged: boolean;
  terms_version: string;
  privacy_version: string;
  timestamp: string;
}
