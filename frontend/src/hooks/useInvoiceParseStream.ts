import { useState, useEffect, useRef, useCallback } from 'react';
import { streamSse, type SseConnection } from '@/lib/sse';
import { saveInvoice, type SaveInvoicePayload } from '@/services/api/invoicesApi';
import {
  attachConversionToLineItem,
  type PackConversionResult,
} from '@/utils/invoiceUnits';

interface LineItem {
  item_number?: string;
  description: string;
  quantity: number;
  pack_size?: string;
  unit_price: number;
  extended_price: number;
  category?: 'DRY' | 'REFRIGERATED' | 'FROZEN';
  converted_quantity?: number;
  converted_unit?: string;
  per_pack_quantity?: number;
  per_pack_unit?: string;
  conversion?: PackConversionResult;
}

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  vendor_name: string;
  subtotal: number;
  tax: number;
  total: number;
  line_items: LineItem[];
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

function enhanceLineItem(item: LineItem): LineItem {
  return attachConversionToLineItem<LineItem>(item);
}

function enhanceInvoiceData(invoice: InvoiceData): InvoiceData {
  return {
    ...invoice,
    line_items: invoice.line_items.map(enhanceLineItem),
  };
}

export function useInvoiceParseStream(): UseInvoiceParseStreamReturn {
  const [state, setState] = useState<ParseState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    elapsedSeconds: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<SseConnection | null>(null);

  const stopParsing = useCallback(() => {
    connectionRef.current?.stop();
    connectionRef.current = null;
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

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const params = new URLSearchParams({
        file_url: fileUrl,
        ...(vendorHint && { vendor_hint: vendorHint }),
      });
      const streamUrl = `${baseUrl}/api/v1/invoices/parse-stream?${params}`;

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

          case 'parsed_data': {
            const invoiceData = enhanceInvoiceData(data.invoice_data as InvoiceData);
            setState(prev => ({
              ...prev,
              status: 'validating',
              invoiceData,
              parseMetadata: data.metadata,
              currentStep: 'Validating data...',
              progress: 95,
            }));
            break;
          }

          case 'validation_complete':
            setState(prev => ({
              ...prev,
              status: 'ready',
              currentStep: 'Invoice ready for review',
              progress: 100,
              parseMetadata: prev.parseMetadata
                ? {
                    ...prev.parseMetadata,
                    confidence: data.validation?.confidence || 'medium',
                    corrections_made: data.post_processing?.corrections_made || 0,
                  }
                : undefined,
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

      const connection = streamSse({
        url: streamUrl,
        method: 'GET',
        credentials: 'include',
        onOpen: () => setIsConnected(true),
        onClose: () => setIsConnected(false),
        onEvent: ({ event, data }) => handleStreamEvent(event, data),
        onError: (error) => {
          console.error('Streaming request failed:', error);
          setState(prev => ({
            ...prev,
            status: 'error',
            error: error.message || 'Parsing failed',
          }));
        },
      });

      connection.finished.finally(() => {
        connectionRef.current = null;
      });

      connectionRef.current = connection;

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
      const updatedItem = { ...newLineItems[index], [field]: value } as LineItem;
      
      // Recalculate extended price if quantity or unit_price changed
      if (field === 'quantity' || field === 'unit_price') {
        updatedItem.extended_price = updatedItem.quantity * updatedItem.unit_price;
      }

      newLineItems[index] = enhanceLineItem(updatedItem);
      
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
      
      const newItem: LineItem = enhanceLineItem({
        description: '',
        quantity: 1,
        unit_price: 0,
        extended_price: 0,
      });
      
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
      const payload: SaveInvoicePayload = {
        invoice_data: state.invoiceData,
        parse_metadata: state.parseMetadata,
        file_url: state.fileUrl,
        status: 'reviewed',
      };

      const result = await saveInvoice(payload);
      console.log('✅ [SAVE] Save successful:', result);
      
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
