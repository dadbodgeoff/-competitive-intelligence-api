import { useState, useEffect, useRef, useCallback } from 'react';
import { ReviewAnalysisRequest } from '@/types/analysis';

interface StreamingState {
  status: 'idle' | 'streaming' | 'complete' | 'error';
  analysisId?: string;
  competitors: Array<{
    competitor_id: string;
    competitor_name: string;
    rating: number;
    review_count: number;
    distance_miles: number;
    address: string;
  }>;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    category: 'threat' | 'opportunity' | 'watch';
    confidence: 'high' | 'medium' | 'low';
    proof_quote: string;
    competitor_name?: string;
    competitor_id?: string;
    mention_count: number;
    significance?: number;
  }>;
  progress: number;
  currentStep: string;
  error?: string;
  totalReviews: number;
  insightsCompleted: number;
  totalInsights: number;
}

interface StreamingAnalysisHook {
  state: StreamingState;
  startAnalysis: (request: ReviewAnalysisRequest) => void;
  stopAnalysis: () => void;
  isConnected: boolean;
}

export function useStreamingAnalysis(): StreamingAnalysisHook {
  const [state, setState] = useState<StreamingState>({
    status: 'idle',
    competitors: [],
    insights: [],
    progress: 0,
    currentStep: '',
    totalReviews: 0,
    insightsCompleted: 0,
    totalInsights: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopAnalysis = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const startAnalysis = useCallback((request: ReviewAnalysisRequest) => {
    // Clean up any existing connection
    stopAnalysis();

    setState(prev => ({
      ...prev,
      status: 'streaming',
      progress: 0,
      currentStep: 'Connecting...',
      competitors: [],
      insights: [],
      error: undefined,
      totalReviews: 0,
      insightsCompleted: 0,
      totalInsights: 0,
    }));

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();

    try {
      // Build streaming URL (cookies sent automatically)
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const streamUrl = `${baseUrl}/api/v1/streaming/run/stream`;

      // Create EventSource with POST data (using a workaround)
      // Since EventSource doesn't support POST, we'll use fetch with streaming
      const startStreamingRequest = async () => {
        try {
          const response = await fetch(streamUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify(request),
            credentials: 'include', // Send cookies
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          if (!response.body) {
            throw new Error('No response body for streaming');
          }

          setIsConnected(true);

          // Process streaming response
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let currentEventType = '';

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('event:')) {
                currentEventType = line.substring(6).trim();
                continue;
              }

              if (line.startsWith('data:')) {
                try {
                  const data = JSON.parse(line.substring(5).trim());
                  handleStreamEvent(currentEventType || 'message', data);
                } catch (e) {
                  console.warn('Failed to parse SSE data:', line);
                }
              }
            }
          }

        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Streaming request aborted');
            return;
          }
          
          console.error('Streaming request failed:', error);
          setState(prev => ({
            ...prev,
            status: 'error',
            error: error instanceof Error ? error.message : 'Streaming failed',
          }));
        } finally {
          setIsConnected(false);
        }
      };

      const handleStreamEvent = (eventType: string, data: any) => {

        switch (eventType) {
          case 'analysis_started':
            setState(prev => ({
              ...prev,
              analysisId: data.analysis_id,
              currentStep: 'Analysis started...',
              progress: 5,
            }));
            break;

          case 'competitors_found':
            setState(prev => ({
              ...prev,
              competitors: data.competitors || [],
              currentStep: data.step || 'Competitors found',
              progress: data.progress || 20,
            }));
            break;

          case 'competitor_reviews':
            setState(prev => ({
              ...prev,
              currentStep: data.step || 'Collecting reviews...',
              progress: data.progress || prev.progress,
              totalReviews: data.total_reviews || prev.totalReviews,
            }));
            break;

          case 'llm_analysis_started':
            setState(prev => ({
              ...prev,
              currentStep: data.step || 'Generating competitive insights...',
              progress: data.progress || 70,
              totalReviews: data.total_reviews || prev.totalReviews,
            }));
            break;

          case 'insight_generated':
            const insight = {
              id: data.insight?.id || `insight-${Date.now()}`,
              title: data.insight?.title || '',
              description: data.insight?.description || '',
              category: data.insight?.category || 'opportunity',
              confidence: data.insight?.confidence || 'medium',
              proof_quote: data.insight?.proof_quote || '',
              competitor_name: data.insight?.competitor_source || data.insight?.competitor_name,
              competitor_id: data.insight?.competitor_id,
              mention_count: data.insight?.mention_count || 0,
              significance: data.insight?.significance || 0,
            };
            setState(prev => ({
              ...prev,
              insights: [...prev.insights, insight],
              currentStep: data.step || 'Generating insights...',
              progress: data.progress || prev.progress,
              insightsCompleted: data.insights_completed || prev.insightsCompleted + 1,
              totalInsights: data.total_insights || prev.totalInsights,
            }));
            break;

          case 'analysis_complete':
            console.log('🎯 Analysis complete event received, preserving analysisId:', state.analysisId);
            setState(prev => ({
              ...prev,
              status: 'complete',
              currentStep: 'Analysis complete!',
              progress: 100,
              // Explicitly preserve analysisId
              analysisId: prev.analysisId || data.analysis_id,
            }));
            stopAnalysis();
            break;

          case 'error':
            setState(prev => ({
              ...prev,
              status: 'error',
              error: data.error || 'Analysis failed',
            }));
            stopAnalysis();
            break;

          default:
            console.log('Unknown event type:', eventType, data);
        }
      };

      // Start the streaming request
      startStreamingRequest();

    } catch (error) {
      console.error('Failed to start streaming analysis:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start analysis',
      }));
    }
  }, [stopAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return {
    state,
    startAnalysis,
    stopAnalysis,
    isConnected,
  };
}