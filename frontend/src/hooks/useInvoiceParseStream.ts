import { useState, useEffect, useRef, useCallback } from 'react';

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  vendor_name: string;
  subtotal: number;
  tax: number;
  total: number;
  line_items: LineItem[];
}

interface LineItem {
  item_number?: string;
  description: string;
  quantity: number;
  pack_size?: string;
  unit_price: number;
  extended_price: number;
  category?: 'DRY' | 'REFRIGERATED' | 'FROZEN';
}

interface ParseMetadata {
  model_used: string;
  parse_time_seconds: number;
  cost: number;
  tokens_used: number;
  confidence: 'high' | 'medium' | 'low';
  corrections_made: number;
}

interface ParseState {
  status: 'idle' | 'uploading' | 'parsing' | 'validating' | 'ready' | 'saving' | 'saved' | 'error';
  invoiceData?: InvoiceData;
  parseMetadata?: ParseMetadata;
  progress: number;
  currentStep: string;
  error?: string;
  fileUrl?: string;
  elapsedSeconds: number;
}

interface UseInvoiceParseStreamReturn {
  state: ParseState;
  startParsing: (fileUrl: string, vendorHint?: string) => void;
  stopParsing: () => void;
  updateLineItem: (index: number, field: keyof LineItem, value: any) => void;
  addLineItem: () => void;
  deleteLineItem: (index: number) => void;
  updateInvoiceHeader: (field: keyof InvoiceData, value: any) => void;
  saveToDatabase: () => Promise<string>;
  isConnected: boolean;
}

export function useInvoiceParseStream(): UseInvoiceParseStreamReturn {
  const [state, setState] = useState<ParseState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    elapsedSeconds: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopParsing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const startParsing = useCallback((fileUrl: string, vendorHint?: string) => {
    stopParsing();

    setState(prev => ({
      ...prev,
      status: 'parsing',
      progress: 0,
      currentStep: 'Connecting...',
      invoiceData: undefined,
      parseMetadata: undefined,
      error: undefined,
      fileUrl,
      elapsedSeconds: 0,
    }));

    abortControllerRef.current = new AbortController();

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const params = new URLSearchParams({
        file_url: fileUrl,
        ...(vendorHint && { vendor_hint: vendorHint }),
      });
      const streamUrl = `${baseUrl}/api/v1/invoices/parse-stream?${params}`;

      const startStreamingRequest = async () => {
        try {
          const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
            },
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
            console.log('Parsing request aborted');
            return;
          }
          
          console.error('Streaming request failed:', error);
          setState(prev => ({
            ...prev,
            status: 'error',
            error: error instanceof Error ? error.message : 'Parsing failed',
          }));
        } finally {
          setIsConnected(false);
        }
      };

      const handleStreamEvent = (eventType: string, data: any) => {
        switch (eventType) {
          case 'parsing_started':
            setState(prev => ({
              ...prev,
              currentStep: data.message || 'Processing your invoice...',
              progress: 5,
            }));
            break;

          case 'parsing_progress':
            setState(prev => ({
              ...prev,
              currentStep: data.message || 'Still processing...',
              progress: Math.min(prev.progress + 10, 90),
              elapsedSeconds: data.elapsed_seconds || prev.elapsedSeconds,
            }));
            break;

          case 'parsed_data':
            setState(prev => ({
              ...prev,
              status: 'validating',
              invoiceData: data.invoice_data,
              parseMetadata: data.metadata,
              currentStep: 'Validating data...',
              progress: 95,
            }));
            break;

          case 'validation_complete':
            setState(prev => ({
              ...prev,
              status: 'ready',
              currentStep: 'Invoice ready for review',
              progress: 100,
              parseMetadata: prev.parseMetadata ? {
                ...prev.parseMetadata,
                confidence: data.validation?.confidence || 'medium',
                corrections_made: data.post_processing?.corrections_made || 0,
              } : undefined,
            }));
            stopParsing();
            break;

          case 'error':
            setState(prev => ({
              ...prev,
              status: 'error',
              error: data.message || 'Parsing failed',
            }));
            stopParsing();
            break;

          default:
            console.log('Unknown event type:', eventType, data);
        }
      };

      startStreamingRequest();

    } catch (error) {
      console.error('Failed to start parsing:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start parsing',
      }));
    }
  }, [stopParsing]);

  const updateLineItem = useCallback((index: number, field: keyof LineItem, value: any) => {
    setState(prev => {
      if (!prev.invoiceData) return prev;
      
      const newLineItems = [...prev.invoiceData.line_items];
      newLineItems[index] = { ...newLineItems[index], [field]: value };
      
      // Recalculate extended price if quantity or unit_price changed
      if (field === 'quantity' || field === 'unit_price') {
        newLineItems[index].extended_price = 
          newLineItems[index].quantity * newLineItems[index].unit_price;
      }
      
      // Recalculate totals
      const subtotal = newLineItems.reduce((sum, item) => sum + item.extended_price, 0);
      const tax = prev.invoiceData.tax; // Keep existing tax
      const total = subtotal + tax;
      
      return {
        ...prev,
        invoiceData: {
          ...prev.invoiceData,
          line_items: newLineItems,
          subtotal,
          total,
        },
      };
    });
  }, []);

  const addLineItem = useCallback(() => {
    setState(prev => {
      if (!prev.invoiceData) return prev;
      
      const newItem: LineItem = {
        description: '',
        quantity: 1,
        unit_price: 0,
        extended_price: 0,
      };
      
      return {
        ...prev,
        invoiceData: {
          ...prev.invoiceData,
          line_items: [...prev.invoiceData.line_items, newItem],
        },
      };
    });
  }, []);

  const deleteLineItem = useCallback((index: number) => {
    setState(prev => {
      if (!prev.invoiceData) return prev;
      
      const newLineItems = prev.invoiceData.line_items.filter((_, i) => i !== index);
      const subtotal = newLineItems.reduce((sum, item) => sum + item.extended_price, 0);
      const tax = prev.invoiceData.tax;
      const total = subtotal + tax;
      
      return {
        ...prev,
        invoiceData: {
          ...prev.invoiceData,
          line_items: newLineItems,
          subtotal,
          total,
        },
      };
    });
  }, []);

  const updateInvoiceHeader = useCallback((field: keyof InvoiceData, value: any) => {
    setState(prev => {
      if (!prev.invoiceData) return prev;
      
      return {
        ...prev,
        invoiceData: {
          ...prev.invoiceData,
          [field]: value,
        },
      };
    });
  }, []);

  const saveToDatabase = useCallback(async (): Promise<string> => {
    console.log('🔵 [SAVE] Starting saveToDatabase...');
    
    if (!state.invoiceData || !state.parseMetadata || !state.fileUrl) {
      console.error('❌ [SAVE] Missing required data:', {
        hasInvoiceData: !!state.invoiceData,
        hasParseMetadata: !!state.parseMetadata,
        hasFileUrl: !!state.fileUrl
      });
      throw new Error('No invoice data to save');
    }

    console.log('✅ [SAVE] Data validation passed');
    setState(prev => ({ ...prev, status: 'saving' }));

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const endpoint = `${baseUrl}/api/v1/invoices/save`;
      
      console.log('📤 [SAVE] Sending POST request to:', endpoint);
      console.log('📦 [SAVE] Payload:', {
        invoice_number: state.invoiceData.invoice_number,
        vendor: state.invoiceData.vendor_name,
        items_count: state.invoiceData.line_items?.length,
        status: 'reviewed'
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({
          invoice_data: state.invoiceData,
          parse_metadata: state.parseMetadata,
          file_url: state.fileUrl,
          status: 'reviewed',
        }),
      });

      console.log('📥 [SAVE] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [SAVE] Server error:', error);
        throw new Error(error.detail || 'Failed to save invoice');
      }

      const result = await response.json();
      console.log('✅ [SAVE] Save successful:', {
        invoice_id: result.invoice_id,
        items_saved: result.items_saved,
        success: result.success
      });
      
      setState(prev => ({ ...prev, status: 'saved' }));
      
      console.log('🎉 [SAVE] Returning invoice_id:', result.invoice_id);
      return result.invoice_id;

    } catch (error) {
      console.error('💥 [SAVE] Exception caught:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to save invoice',
      }));
      throw error;
    }
  }, [state.invoiceData, state.parseMetadata, state.fileUrl]);

  useEffect(() => {
    return () => {
      stopParsing();
    };
  }, [stopParsing]);

  return {
    state,
    startParsing,
    stopParsing,
    updateLineItem,
    addLineItem,
    deleteLineItem,
    updateInvoiceHeader,
    saveToDatabase,
    isConnected,
  };
}
