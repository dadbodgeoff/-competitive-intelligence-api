import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadGuestInvoice } from '@/services/api/invoicesApi';

type DemoStatus = 'idle' | 'uploading' | 'parsing' | 'ready' | 'error';

export interface DemoEvent {
  id: string;
  type: 'info' | 'progress' | 'success' | 'error';
  message: string;
  timestamp: number;
}

interface InvoiceLineItem {
  item_number?: string;
  description: string;
  quantity: number;
  pack?: string;
  unit_price: number;
  extended_price: number;
  category?: string;
}

interface InvoiceAlert {
  item: string;
  change: string;
  issue: string;
  suggestion: string;
}

interface FuzzyMatchInsight {
  invoice_item: string;
  matched_inventory_item: string;
  confidence: number;
  last_price: number;
}

export interface ParsedInvoiceData {
  invoice_number: string;
  invoice_date: string;
  vendor_name: string;
  subtotal: number;
  tax: number;
  total: number;
  line_items: InvoiceLineItem[];
  alerts?: InvoiceAlert[];
  fuzzy_matches?: FuzzyMatchInsight[];
}

export interface ParseMetadata {
  pipeline_version: string;
  duration_seconds: number;
  line_items_processed: number;
  alerts_generated: number;
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

export interface GuestPolicyConsentPayload {
  terms_version: string;
  privacy_version: string;
  consent_timestamp: string;
}

const STORAGE_KEY = 'guest_invoice_demo';
const API_BASE_URL =
  import.meta.env?.VITE_API_URL ??
  (import.meta.env?.MODE === 'development' ? '' : '');

export const DEMO_INVOICE: ParsedInvoiceData = {
  invoice_number: 'INV-10294',
  invoice_date: '2025-02-07',
  vendor_name: 'Sysco Boston',
  subtotal: 327.3,
  tax: 11.46,
  total: 338.76,
  line_items: [
    {
      item_number: 'MOZZ-FRESH-001',
      description: 'Fresh Mozzarella Cheese',
      quantity: 1,
      pack: '6/5 lb',
      unit_price: 89.4,
      extended_price: 89.4,
      category: 'Refrigerated',
    },
    {
      item_number: 'SAUCE-SANMAR-002',
      description: 'San Marzano Sauce Batch',
      quantity: 2,
      pack: '6/#10',
      unit_price: 31.9,
      extended_price: 63.8,
      category: 'Grocery',
    },
    {
      item_number: 'FLOUR-00-025',
      description: 'Caputo 00 Flour 25 lb',
      quantity: 3,
      pack: '1/25 lb',
      unit_price: 21.5,
      extended_price: 64.5,
      category: 'Dry Goods',
    },
    {
      item_number: 'BASIL-FRESH-004',
      description: 'Fresh Basil Bunch',
      quantity: 1,
      pack: '8/8 oz',
      unit_price: 18.2,
      extended_price: 18.2,
      category: 'Produce',
    },
    {
      item_number: 'OIL-EVOO-005',
      description: 'Extra Virgin Olive Oil',
      quantity: 2,
      pack: '2/3 L',
      unit_price: 45.7,
      extended_price: 91.4,
      category: 'Grocery',
    },
  ],
  alerts: [
    {
      item: 'Fresh Mozzarella Cheese',
      change: '+$6.80 / case',
      issue: 'Paid $89.40 today (previous $82.60). Above tolerance by 3%.',
      suggestion: 'Lock the Grande contract at $83.10 before next delivery.',
    },
    {
      item: 'Extra Virgin Olive Oil',
      change: '+9.2% vs 90-day avg',
      issue: 'Price moved from $41.90 to $45.70 while usage stayed flat.',
      suggestion: 'Switch to your second vendor quote at $42.10.',
    },
    {
      item: 'San Marzano Sauce Batch',
      change: '-$1.80 / case',
      issue: 'Current price dipped below target—opportunity to stock up.',
      suggestion: 'Add two bonus cases to next order and bank the savings.',
    },
  ],
  fuzzy_matches: [
    {
      invoice_item: 'Fresh Mozzarella Cheese',
      matched_inventory_item: 'Grande Whole Milk Mozzarella',
      confidence: 0.95,
      last_price: 82.6,
    },
    {
      invoice_item: 'Extra Virgin Olive Oil',
      matched_inventory_item: 'Partanna EVOO 3L Tin',
      confidence: 0.9,
      last_price: 41.9,
    },
  ],
};

export const DEMO_METADATA: ParseMetadata = {
  pipeline_version: 'riq-pipeline@2025.11.18',
  duration_seconds: 22,
  line_items_processed: 5,
  alerts_generated: 3,
};

type DemoStep = {
  delay: number;
  type: DemoEvent['type'];
  message: string;
  stateUpdate?: (prev: GuestDemoState) => GuestDemoState;
};

export const DEMO_STEPS: DemoStep[] = [
  {
    delay: 250,
    type: 'info',
    message:
      'Step 1 — 🔒 Protecting your data: encrypting upload & scrubbing sensitive info (your invoices stay private and secure)…',
    stateUpdate: (prev) => ({ ...prev, status: 'uploading' }),
  },
  {
    delay: 900,
    type: 'progress',
    message:
      'Step 2 — 📖 Securely extracting your details: pulling vendor, 5 line items, prices, & packs with 99% accuracy (no manual entry needed)…',
    stateUpdate: (prev) => ({ ...prev, status: 'parsing' }),
  },
  {
    delay: 1500,
    type: 'progress',
    message:
      'Step 3 — 🔗 Smart syncing your catalog: auto-linking items to your inventory (matched 5/5 instantly, created 2 new vendor items seamlessly)…',
  },
  {
    delay: 2100,
    type: 'progress',
    message:
      'Step 4 — 💰 Analyzing your pricing: comparing vs. last 90 days (flagged $2.50/unit savings on 5 items—your best vendors highlighted)…',
  },
  {
    delay: 3600,
    type: 'success',
    message:
      'Step 5 — 🚨 Your custom alerts ready: flagged 3 price shifts + 2 savings opportunities (based on your thresholds). Full summary below—your data, your decisions!',
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
    async (file: File, consent?: GuestPolicyConsentPayload) => {
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
        if (consent) {
          formData.append('policies_acknowledged', 'true');
          formData.append('terms_version', consent.terms_version);
          formData.append('privacy_version', consent.privacy_version);
          formData.append('consent_timestamp', consent.consent_timestamp);
        }

        const data = await uploadGuestInvoice(formData);
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

