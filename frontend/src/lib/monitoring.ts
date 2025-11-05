import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

// Initialize Sentry for error tracking
export function initSentry() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        new Sentry.BrowserTracing({
          // Set sampling rate for performance monitoring
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/.*\.competitive-intelligence\.com/,
          ],
        }),
      ],
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Filter out non-critical errors in production
        if (import.meta.env.MODE === 'production') {
          if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
            return null; // Ignore chunk load errors (usually network issues)
          }
        }
        return event;
      },
    });
  }
}

// Initialize PostHog for analytics
export function initPostHog() {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      // Disable in development
      loaded: (posthog) => {
        if (import.meta.env.MODE === 'development') {
          posthog.opt_out_capturing();
        }
      },
    });
  }
}

// Analytics tracking functions
export const analytics = {
  // Track user actions
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof posthog !== 'undefined') {
      posthog.capture(event, properties);
    }
  },

  // Identify user
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof posthog !== 'undefined') {
      posthog.identify(userId, properties);
    }
  },

  // Track page views
  pageView: (path: string) => {
    if (typeof posthog !== 'undefined') {
      posthog.capture('$pageview', { $current_url: path });
    }
  },

  // Track analysis events
  analysisStarted: (data: { restaurant_name: string; category: string; tier: string }) => {
    analytics.track('Analysis Started', data);
  },

  analysisCompleted: (data: { 
    analysis_id: string; 
    duration_seconds: number; 
    competitor_count: number;
    insight_count: number;
  }) => {
    analytics.track('Analysis Completed', data);
  },

  csvExported: (data: { analysis_id: string; competitor_count: number }) => {
    analytics.track('CSV Exported', data);
  },

  errorOccurred: (error: string, context?: Record<string, any>) => {
    analytics.track('Error Occurred', { error, ...context });
    
    // Also send to Sentry
    Sentry.captureException(new Error(error), {
      extra: context,
    });
  },
};

// Error boundary component
export const ErrorBoundary = Sentry.withErrorBoundary;