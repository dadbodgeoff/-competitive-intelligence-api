import { useCallback, useEffect, useRef, useState } from 'react';

type DemoStatus = 'idle' | 'uploading' | 'parsing' | 'ready' | 'error';

interface DemoEvent {
  id: string;
  type: 'info' | 'progress' | 'success' | 'error';
  message: string;
  timestamp: number;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  extended_price: number;
}

interface ParsedInvoiceData {
  invoice_number: string;
  invoice_date: string;
  vendor_name: string;
  subtotal: number;
  tax: number;
  total: number;
  line_items: InvoiceLineItem[];
}

interface ParseMetadata {
  model_used: string;
  parse_time_seconds: number;
  tokens_used: number;
  cost: number;
}

interface GuestDemoState {
  status: DemoStatus;
  events: DemoEvent[];
  sessionId?: string;
  invoiceData?: ParsedInvoiceData;
  parseMetadata?: ParseMetadata;
  error?: string;
  fileName?: string;
}

const STORAGE_KEY = 'guest_invoice_demo';
const API_BASE_URL =
  import.meta.env?.VITE_API_URL ??
  (import.meta.env?.MODE === 'development' ? '' : '');

const DEMO_INVOICE: ParsedInvoiceData = {
  invoice_number: 'INV-10294',
  invoice_date: '2025-02-07',
  vendor_name: 'Sysco Boston',
  subtotal: 1284.45,
  tax: 45.32,
  total: 1329.77,
  line_items: [
    {
      description: 'Chicken Breast Boneless Skinless',
      quantity: 2,
      unit_price: 67.45,
      extended_price: 134.9,
    },
    {
      description: 'Heavy Cream 36%',
      quantity: 3,
      unit_price: 24.15,
      extended_price: 72.45,
    },
    {
      description: 'Avocado Hass 48ct',
      quantity: 1,
      unit_price: 64.8,
      extended_price: 64.8,
    },
    {
      description: 'Fries 3/8" Skin-On 30lb',
      quantity: 2,
      unit_price: 42.1,
      extended_price: 84.2,
    },
  ],
};

const DEMO_METADATA: ParseMetadata = {
  model_used: 'gemini-2.0-flash-exp',
  parse_time_seconds: 18,
  tokens_used: 1940,
  cost: 0.45,
};

type DemoStep = {
  delay: number;
  type: DemoEvent['type'];
  message: string;
  stateUpdate?: (prev: GuestDemoState) => GuestDemoState;
};

const DEMO_STEPS: DemoStep[] = [
  {
    delay: 250,
    type: 'info',
    message: 'Uploading sample invoice “Sysco-Nov.pdf”…',
    stateUpdate: (prev) => ({ ...prev, status: 'uploading' }),
  },
  {
    delay: 900,
    type: 'progress',
    message: 'OCR: reading vendor and invoice number…',
    stateUpdate: (prev) => ({ ...prev, status: 'parsing' }),
  },
  {
    delay: 1500,
    type: 'progress',
    message: 'Matching line items to your catalog…',
  },
  {
    delay: 2100,
    type: 'progress',
    message: 'Calculating price changes vs last invoice…',
  },
  {
    delay: 2900,
    type: 'success',
    message: 'Parsed 38 line items with vendor crosswalk applied.',
  },
  {
    delay: 3600,
    type: 'success',
    message: 'Invoice ready—alerts generated for 6 tracked items.',
    stateUpdate: (prev) => {
      const nextState: GuestDemoState = {
        ...prev,
        status: 'ready',
        invoiceData: DEMO_INVOICE,
        parseMetadata: DEMO_METADATA,
      };

      if (typeof window !== 'undefined') {
        try {
          const payload = {
            invoice_data: DEMO_INVOICE,
            parse_metadata: DEMO_METADATA,
            session_id: prev.sessionId,
            saved_at: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (storageError) {
          console.warn('Failed to persist demo payload:', storageError);
        }
      }

      return nextState;
    },
  },
];

const initialState: GuestDemoState = {
  status: 'idle',
  events: [],
};

const timestampId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function useGuestInvoiceDemo() {
  const [state, setState] = useState<GuestDemoState>(initialState);
  const eventSourceRef = useRef<EventSource | null>(null);
  const demoTimeoutsRef = useRef<number[]>([]);

  const addEvent = useCallback((type: DemoEvent['type'], message: string) => {
    setState(prev => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id: timestampId(),
          type,
          message,
          timestamp: Date.now(),
        },
      ],
    }));
  }, []);

  const cleanupStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const clearDemoTimeouts = useCallback(() => {
    demoTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    demoTimeoutsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    cleanupStream();
    clearDemoTimeouts();
    setState(initialState);
  }, [cleanupStream, clearDemoTimeouts]);

  const startStream = useCallback(
    (sessionId: string) => {
      cleanupStream();

      const streamUrl = `${API_BASE_URL}/api/v1/invoices/guest-parse-stream?session_id=${sessionId}`;
      const source = new EventSource(streamUrl);
      eventSourceRef.current = source;

      addEvent('progress', 'Invoice received. Reading line items…');

      source.addEventListener('parsing_started', (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          addEvent('progress', data.message || 'Processing your invoice…');
          setState(prev => ({ ...prev, status: 'parsing' }));
        } catch (err) {
          console.error('Failed to parse parsing_started event:', err);
        }
      });

      source.addEventListener('parsing_progress', (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          addEvent('progress', data.message || 'Still processing…');
        } catch (err) {
          console.error('Failed to parse parsing_progress event:', err);
        }
      });

      source.addEventListener('parsed_data', (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          addEvent('success', `Parsed ${data.invoice_data?.line_items?.length ?? 0} line items`);
          setState(prev => ({
            ...prev,
            invoiceData: data.invoice_data,
            parseMetadata: data.metadata,
          }));
        } catch (err) {
          console.error('Failed to parse parsed_data event:', err);
        }
      });

      source.addEventListener('validation_complete', (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          addEvent('success', data.message || 'Invoice ready for review');
          setState(prev => {
            const nextState: GuestDemoState = {
              ...prev,
              status: 'ready',
            };

            if (typeof window !== 'undefined' && prev.invoiceData && prev.parseMetadata) {
              const payload = {
                invoice_data: prev.invoiceData,
                parse_metadata: prev.parseMetadata,
                session_id: prev.sessionId,
                saved_at: Date.now(),
              };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
              } catch (storageError) {
                console.warn('Failed to persist guest invoice demo:', storageError);
              }
            }

            return nextState;
          });
        } catch (err) {
          console.error('Failed to parse validation_complete event:', err);
        } finally {
          cleanupStream();
        }
      });

      source.addEventListener('error', () => {
        addEvent('error', 'Connection lost. Please try again.');
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Connection lost. Please try again.',
        }));
        cleanupStream();
      });
    },
    [addEvent, cleanupStream]
  );

  const uploadInvoice = useCallback(
    async (file: File) => {
      try {
        reset();
        setState(prev => ({
          ...prev,
          status: 'uploading',
          fileName: file.name,
        }));

        addEvent('info', 'Uploading invoice…');

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/v1/invoices/guest-upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let detail: string | undefined;
          try {
            const error = await response.json();
            detail = error.detail?.message || error.detail;
          } catch (_) {
            // ignore JSON failures
          }
          throw new Error(detail || 'Upload failed. Please try again.');
        }

        const data = await response.json();
        addEvent('success', 'Upload complete. Parsing now…');
        setState(prev => ({
          ...prev,
          status: 'parsing',
          sessionId: data.session_id,
        }));

        startStream(data.session_id);
      } catch (error) {
        console.error('Guest upload failed:', error);
        addEvent('error', error instanceof Error ? error.message : 'Upload failed');
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        }));
      }
    },
    [addEvent, reset, startStream]
  );

  const simulateDemo = useCallback(() => {
    cleanupStream();
    clearDemoTimeouts();

    const sessionId = `demo-${Date.now()}`;

    setState({
      status: 'uploading',
      events: [],
      sessionId,
      fileName: 'Sample Sysco Invoice.pdf',
    });

    DEMO_STEPS.forEach((step) => {
      const timeoutId = window.setTimeout(() => {
        if (step.stateUpdate) {
          setState(prev => step.stateUpdate!(prev));
        }
        addEvent(step.type, step.message);
      }, step.delay);

      demoTimeoutsRef.current.push(timeoutId);
    });
  }, [addEvent, cleanupStream, clearDemoTimeouts]);

  useEffect(() => {
    return () => {
      cleanupStream();
      clearDemoTimeouts();
    };
  }, [cleanupStream, clearDemoTimeouts]);

  return {
    state,
    uploadInvoice,
    reset,
    simulateDemo,
  };
}

