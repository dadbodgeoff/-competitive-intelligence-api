import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Only load GA in production and if measurement ID is provided
    if (!measurementId || measurementId === 'YOUR_GA4_MEASUREMENT_ID') {
      return;
    }

    // Check if we're in production
    const isProduction = import.meta.env.PROD;
    if (!isProduction) {
      console.log('Google Analytics disabled in development');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', measurementId);

    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, [measurementId]);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
  }
}
