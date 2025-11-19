import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/design-system/shadcn/components/button';
import { DEMO_INVOICE, DEMO_METADATA, DEMO_STEPS, DemoEvent } from '@/hooks/useGuestInvoiceDemo';

const COUNTDOWN_SECONDS = 5;
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const eventTone: Record<DemoEvent['type'], string> = {
  info: 'text-slate-300',
  progress: 'text-emerald-300',
  success: 'text-emerald-200',
  error: 'text-red-400',
};

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const HeroDemoStream: React.FC = () => {
  const [countdown, setCountdown] = useState<number | null>(COUNTDOWN_SECONDS);
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);

  const timersRef = useRef<number[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startDemo = useCallback(() => {
    setCountdown(null);
    setHasCompleted(false);
    let accumulatedDelay = 0;

    DEMO_STEPS.forEach((step, index) => {
      accumulatedDelay += step.delay;
      const timeoutId = window.setTimeout(() => {
        setEvents((prev) => {
          if (prev.length && prev[prev.length - 1]?.message === step.message) {
            return prev;
          }

          return [
            ...prev,
            {
              id: createId(),
              type: step.type,
              message: step.message,
              timestamp: Date.now(),
            },
          ];
        });

        if (index === DEMO_STEPS.length - 1) {
          setHasCompleted(true);
        }
      }, accumulatedDelay);

      timersRef.current.push(timeoutId);
    });
  }, []);

  const startSequence = useCallback(() => {
    clearTimers();
    setEvents([]);
    setHasCompleted(false);
    setCountdown(COUNTDOWN_SECONDS);

    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) {
          return prev;
        }

        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          startDemo();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, [clearTimers, startDemo]);

  useEffect(() => {
    startSequence();
    return () => {
      clearTimers();
    };
  }, [clearTimers, startSequence]);

  return (
    <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300 mb-1">Live sample demo</p>
          <p className="text-sm text-slate-300">
            This is the exact stream your operators see while their invoice parses.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white"
          onClick={startSequence}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Replay sample run
        </Button>
      </div>

      {countdown !== null && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 font-semibold">
          Invoice upload demo starting in {countdown === 0 ? '…' : countdown}
        </div>
      )}

      {events.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto text-sm">
          {events.map((event) => (
            <div key={event.id} className={`flex items-start gap-2 ${eventTone[event.type] || 'text-slate-300'}`}>
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
              <span>{event.message}</span>
            </div>
          ))}
        </div>
      )}

      {hasCompleted && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm text-slate-200">
            <div>
              <p className="uppercase tracking-widest text-emerald-300 mb-1">Vendor</p>
              <p className="font-semibold text-white">{DEMO_INVOICE.vendor_name}</p>
            </div>
            <div>
              <p className="uppercase tracking-widest text-emerald-300 mb-1">Invoice #</p>
              <p className="font-semibold text-white">{DEMO_INVOICE.invoice_number}</p>
            </div>
            <div>
              <p className="uppercase tracking-widest text-emerald-300 mb-1">Line items</p>
              <p className="font-semibold text-white">{DEMO_METADATA.line_items_processed}</p>
            </div>
            <div>
              <p className="uppercase tracking-widest text-emerald-300 mb-1">Alerts flagged</p>
              <p className="font-semibold text-white">{DEMO_METADATA.alerts_generated}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">
                Sample line items parsed from the demo invoice
              </p>
              <span className="text-[11px] text-slate-400">
                Showing 5/5 items &middot; actual uploads stay private in your browser
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[11px] md:text-sm text-slate-200">
                <thead className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                  <tr>
                    <th className="py-2 pr-4">Item #</th>
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Pack</th>
                    <th className="py-2 pr-4">Unit</th>
                    <th className="py-2 pr-4">Extended</th>
                    <th className="py-2">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {DEMO_INVOICE.line_items.slice(0, 5).map((item, idx) => (
                    <tr key={`${item.item_number || item.description}-${idx}`}>
                      <td className="py-2 pr-4 font-mono text-[10px] text-slate-400">
                        {item.item_number || `#${idx + 1}`}
                      </td>
                      <td className="py-2 pr-4">{item.description}</td>
                      <td className="py-2 pr-4">{item.quantity}</td>
                      <td className="py-2 pr-4 text-slate-300">{item.pack || '—'}</td>
                      <td className="py-2 pr-4">{currencyFormatter.format(item.unit_price)}</td>
                      <td className="py-2 pr-4">{currencyFormatter.format(item.extended_price)}</td>
                      <td className="py-2 text-slate-300">{item.category || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-slate-500">
        Ready to try it with your own invoice? The live uploader is just below—no login required.
      </p>
    </div>
  );
};


