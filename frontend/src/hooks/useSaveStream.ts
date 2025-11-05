/**
 * Hook for streaming invoice save and processing
 * Similar to useInvoiceParseStream but for the save phase
 */
import { useState, useCallback } from 'react';

export interface SaveProgress {
  phase: 'saving' | 'inventory' | 'verification' | 'complete';
  message: string;
  currentItem?: number;
  totalItems?: number;
  itemDescription?: string;
  itemStatus?: 'success' | 'failed';
}

export interface SaveResult {
  status: 'success' | 'partial_success' | 'failed';
  invoice_id: string;
  items_processed: number;
  items_failed: number;
  failed_items?: Array<{
    line: number;
    description: string;
    error_type: string;
    error: string;
    pack_size: string;
    action_required: string;
  }>;
  verification?: any;
  metrics?: any;
}

export const useSaveStream = () => {
  const [progress, setProgress] = useState<SaveProgress | null>(null);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveInvoice = useCallback(async (invoiceData: any, sessionId?: string) => {
    setIsProcessing(true);
    setError(null);
    setProgress(null);
    setResult(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/v1/invoices/save-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies automatically
        body: JSON.stringify({
          ...invoiceData,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              console.log('Save stream event:', data);

              // Handle different event types
              switch (data.event) {
                case 'save_started':
                  setProgress({
                    phase: 'saving',
                    message: 'Saving invoice to database...',
                  });
                  break;

                case 'save_complete':
                  setProgress({
                    phase: 'saving',
                    message: 'Invoice saved successfully!',
                  });
                  break;

                case 'inventory_started':
                  setProgress({
                    phase: 'inventory',
                    message: 'Processing into inventory system...',
                  });
                  break;

                case 'vendor_processing':
                  setProgress({
                    phase: 'inventory',
                    message: data.message,
                  });
                  break;

                case 'vendor_ready':
                  setProgress({
                    phase: 'inventory',
                    message: 'Vendor ready, processing items...',
                  });
                  break;

                case 'item_processing':
                  setProgress({
                    phase: 'inventory',
                    message: `Processing item ${data.current} of ${data.total}...`,
                    currentItem: data.current,
                    totalItems: data.total,
                    itemDescription: data.description,
                  });
                  break;

                case 'item_success':
                  setProgress({
                    phase: 'inventory',
                    message: `Item ${data.line} added successfully`,
                    itemStatus: 'success',
                  });
                  break;

                case 'item_failed':
                  setProgress({
                    phase: 'inventory',
                    message: `Item ${data.line} needs attention`,
                    itemStatus: 'failed',
                  });
                  break;

                case 'verification_started':
                  setProgress({
                    phase: 'verification',
                    message: 'Verifying data integrity...',
                  });
                  break;

                case 'verification_complete':
                  setProgress({
                    phase: 'verification',
                    message: 'Verification complete',
                  });
                  break;

                case 'complete':
                  setProgress({
                    phase: 'complete',
                    message: 'Processing complete!',
                  });
                  setResult(data.result);
                  setIsProcessing(false);
                  break;

                case 'error':
                  setError(data.message);
                  setIsProcessing(false);
                  break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Save stream error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(null);
    setResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    saveInvoice,
    progress,
    result,
    isProcessing,
    error,
    reset,
  };
};
