/**
 * Hook for sequential multi-image generation with streaming progress.
 * 
 * This hook handles generating multiple images one at a time,
 * streaming each result back as it completes for a smooth UX.
 */

import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/services/api/client';

export interface PromptConfig {
  template_id?: string;
  user_inputs: Record<string, string>;
  style_preferences?: Record<string, unknown>;
  label?: string;
}

export interface SharedConfig {
  theme_id?: string;
  template_id?: string;
  brand_profile_id?: string;
  style_preferences?: Record<string, unknown>;
  desired_outputs?: {
    dimensions?: string;
    format?: string;
  };
}

export interface GeneratedAsset {
  asset_url: string;
  preview_url: string;
  label: string;
  sequence_index: number;
  job_id?: string;
  quality_score?: number;
}

export interface SequentialGenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  batchId: string | null;
  total: number;
  current: number;
  currentLabel: string;
  assets: GeneratedAsset[];
  successful: number;
  failed: number;
  error: string | null;
  message: string;
}

const initialState: SequentialGenerationState = {
  status: 'idle',
  batchId: null,
  total: 0,
  current: 0,
  currentLabel: '',
  assets: [],
  successful: 0,
  failed: 0,
  error: null,
  message: '',
};

export function useSequentialGeneration() {
  const [state, setState] = useState<SequentialGenerationState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      status: 'idle',
      message: 'Generation cancelled',
    }));
  }, []);

  const generate = useCallback(async (
    prompts: PromptConfig[],
    sharedConfig: SharedConfig,
  ) => {
    // Reset state
    setState({
      ...initialState,
      status: 'generating',
      total: prompts.length,
      message: 'Starting generation...',
    });

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Get auth token
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${apiClient.defaults.baseURL}/api/v1/nano-banana/generate-sequential`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompts,
            shared_config: sharedConfig,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let eventType = '';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6);
            
            if (eventType && eventData) {
              try {
                const data = JSON.parse(eventData);
                handleEvent(eventType, data);
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
              eventType = '';
              eventData = '';
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Cancelled by user
        return;
      }
      
      console.error('Sequential generation error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: (error as Error).message,
        message: 'Generation failed',
      }));
    }
  }, []);

  const handleEvent = useCallback((type: string, data: Record<string, unknown>) => {
    switch (type) {
      case 'started':
        setState(prev => ({
          ...prev,
          batchId: data.batch_id as string,
          total: data.total as number,
          current: 0,
          message: data.message as string,
        }));
        break;

      case 'generating':
        setState(prev => ({
          ...prev,
          current: data.current as number,
          currentLabel: data.label as string,
          message: data.message as string,
        }));
        break;

      case 'image_ready':
        setState(prev => ({
          ...prev,
          current: data.current as number,
          assets: [
            ...prev.assets,
            {
              asset_url: (data.asset as Record<string, unknown>).asset_url as string,
              preview_url: (data.asset as Record<string, unknown>).preview_url as string,
              label: data.label as string,
              sequence_index: (data.asset as Record<string, unknown>).sequence_index as number,
              job_id: data.job_id as string,
              quality_score: (data.asset as Record<string, unknown>).quality_score as number,
            },
          ],
          successful: prev.successful + 1,
          message: data.message as string,
        }));
        break;

      case 'image_failed':
        setState(prev => ({
          ...prev,
          current: data.current as number,
          failed: prev.failed + 1,
          message: data.message as string,
        }));
        break;

      case 'completed':
        setState(prev => ({
          ...prev,
          status: 'completed',
          successful: data.successful as number,
          failed: data.failed as number,
          message: data.message as string,
        }));
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          status: 'error',
          error: data.error as string,
          message: 'Generation failed',
        }));
        break;
    }
  }, []);

  return {
    ...state,
    generate,
    reset,
    cancel,
    isGenerating: state.status === 'generating',
    isComplete: state.status === 'completed',
    hasError: state.status === 'error',
    progress: state.total > 0 ? (state.current / state.total) * 100 : 0,
  };
}
