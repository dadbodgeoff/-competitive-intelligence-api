import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowRight, Upload, Loader2, CheckCircle2, AlertTriangle, PlayCircle, ShieldCheck, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/shadcn/components/card';
import { Badge } from '@/design-system/shadcn/components/badge';
import { Button } from '@/design-system/shadcn/components/button';
import { useGuestInvoiceDemo, type GuestPolicyConsentPayload } from '@/hooks/useGuestInvoiceDemo';
import { Link } from 'react-router-dom';
import { PolicyAgreementDialog } from '@/components/legal/PolicyAgreementDialog';
import { POLICY_METADATA, type PolicyAcceptance, type PolicyKey } from '@/config/legal';

const eventColors: Record<string, string> = {
  info: 'text-[#A8B1B9]',
  progress: 'text-primary-300',
  success: 'text-primary-500',
  error: 'text-destructive',
};

export const InvoiceDemoCard: React.FC = () => {
  const { state, uploadInvoice, reset, simulateDemo } = useGuestInvoiceDemo();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [guestConsents, setGuestConsents] = useState<Record<PolicyKey, PolicyAcceptance | null>>({
    terms: null,
    privacy: null,
  });
  const [guestDialogPolicy, setGuestDialogPolicy] = useState<PolicyKey | null>(null);
  const pendingFileRef = useRef<File | null>(null);
  const consentFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [],
  );
  const policyOrder = useMemo(() => ['terms', 'privacy'] as PolicyKey[], []);

  const buildConsentPayload = useCallback(
    (source: Record<PolicyKey, PolicyAcceptance | null> = guestConsents): GuestPolicyConsentPayload | null => {
      if (!source.terms || !source.privacy) {
        return null;
      }
      return {
        terms_version: source.terms.version,
        privacy_version: source.privacy.version,
        consent_timestamp: new Date().toISOString(),
      };
    },
    [guestConsents],
  );

  const determineMissingPolicy = useCallback(
    (consents: Record<PolicyKey, PolicyAcceptance | null>): PolicyKey | null => {
      if (!consents.terms) return 'terms';
      if (!consents.privacy) return 'privacy';
      return null;
    },
    [],
  );

  const allConsentsComplete = useMemo(
    () => Boolean(guestConsents.terms && guestConsents.privacy),
    [guestConsents],
  );

  const handleReset = useCallback(() => {
    pendingFileRef.current = null;
    setGuestDialogPolicy(null);
    reset();
  }, [reset]);

  const disabled = state.status === 'uploading' || state.status === 'parsing';

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files[0]) return;
      if (disabled) return;

      const file = files[0];
      const pendingPolicy = determineMissingPolicy(guestConsents);

      if (pendingPolicy) {
        pendingFileRef.current = file;
        setGuestDialogPolicy(pendingPolicy);
        return;
      }

      const consentPayload = buildConsentPayload();
      if (!consentPayload) {
        pendingFileRef.current = file;
        setGuestDialogPolicy('terms');
        return;
      }

      uploadInvoice(file, consentPayload);
    },
    [buildConsentPayload, determineMissingPolicy, disabled, guestConsents, uploadInvoice]
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleGuestPolicyAccepted = useCallback(
    (acceptance: PolicyAcceptance) => {
      const updatedConsents: Record<PolicyKey, PolicyAcceptance | null> = {
        ...guestConsents,
        [acceptance.policy]: acceptance,
      };
      setGuestConsents(updatedConsents);

      const missingPolicy = determineMissingPolicy(updatedConsents);
      const hasPendingFile = Boolean(pendingFileRef.current);

      if (missingPolicy && hasPendingFile && missingPolicy !== acceptance.policy) {
        setGuestDialogPolicy(missingPolicy);
        return;
      }

      if (!missingPolicy && hasPendingFile) {
        const fileToUpload = pendingFileRef.current;
        pendingFileRef.current = null;
        const payload = buildConsentPayload(updatedConsents);
        if (fileToUpload && payload) {
          uploadInvoice(fileToUpload, payload);
        }
      }

      if (!hasPendingFile || !missingPolicy) {
        setGuestDialogPolicy(null);
      }
    },
    [buildConsentPayload, determineMissingPolicy, guestConsents, uploadInvoice]
  );

  const renderStatusIcon = () => {
    if (state.status === 'uploading' || state.status === 'parsing') {
      return <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />;
    }
    if (state.status === 'ready') {
      return <CheckCircle2 className="w-10 h-10 text-primary-500" />;
    }
    if (state.status === 'error') {
      return <AlertTriangle className="w-10 h-10 text-destructive" />;
    }
    return <Upload className="w-12 h-12 text-white" />;
  };

  return (
    <>
      <Card className="w-full border border-[#1E1E1E] bg-[#1E1E1E]">
      <CardHeader className="text-center space-y-1.5 pb-3">
        <Badge className="mx-auto bg-primary-500/20 text-primary-500 border-white/10 px-3 py-1 text-xs">
          Start parsing in under a minute
        </Badge>
        <CardTitle className="text-xl md:text-2xl font-bold text-white">
          Drop a real invoice. Watch the alerts stream live.
        </CardTitle>
        <p className="text-[#A8B1B9] text-sm">
          PDFs or photos from Sysco, US Foods, Restaurant Depot, etc. We’ll parse it and surface the problems in ~30 seconds.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/*"
          onChange={handleFileInput}
        />

        <div
          className={`rounded-xl border-2 border-dashed transition-all duration-300 p-5 text-center space-y-2 ${
            disabled
              ? 'border-[#1E1E1E] bg-[#1E1E1E]/60'
              : isDragging
                ? 'border-primary-400 bg-primary-500/10'
                : 'border-[#1E1E1E] hover:border-primary-400 bg-[#1E1E1E]/40'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br bg-primary-500 flex items-center justify-center shadow-lg">
              {renderStatusIcon()}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">
                {state.status === 'idle' ? 'Drop your invoice here' : state.fileName || 'Processing…'}
              </p>
              <p className="text-[#A8B1B9]">
                {state.status === 'idle'
                  ? 'PDFs, JPGs, PNGs · Max 10MB · Sysco, US Foods, Restaurant Depot'
                  : state.status === 'ready'
                    ? 'Invoice analyzed successfully'
                    : state.status === 'error'
                      ? state.error || 'Something went wrong'
                      : 'Auditing line items and costs…'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-[#A8B1B9] text-sm font-medium pt-2">
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-45" /> No spreadsheet clean-up
              </span>
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-45" /> No manual entry
              </span>
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-45" /> No pricing games
              </span>
            </div>
            {state.status !== 'idle' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#A8B1B9] hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  handleReset();
                }}
              >
                Start over
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#1E1E1E] bg-[#1E1E1E]/60 p-3 space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm text-[#A8B1B9]">
            <ShieldCheck className="h-4 w-4 text-primary-500" />
            {allConsentsComplete
              ? 'Thanks for acknowledging our policies. You can upload whenever you’re ready.'
              : 'Before uploading, review and agree to our policies so you know exactly how the demo handles your data.'}
          </div>
          <div className="space-y-3">
            {policyOrder.map((policy) => {
              const metadata = POLICY_METADATA[policy];
              const consent = guestConsents[policy];
              const acceptedDisplay = consent
                ? (() => {
                    try {
                      return consentFormatter.format(new Date(consent.acceptedAt));
                    } catch {
                      return consent.acceptedAt;
                    }
                  })()
                : null;

              return (
                <div
                  key={policy}
                  className="flex flex-col gap-2 rounded-xl border border-[#1E1E1E] bg-[#121212]/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-sm font-medium text-[#E0E0E0]">
                      <FileText className="h-4 w-4 text-primary-500" />
                      {metadata.title}
                    </span>
                    <span className="text-xs text-[#A8B1B9]">
                      Version {metadata.version}{' '}
                      {acceptedDisplay ? `· Accepted ${acceptedDisplay}` : '· Action required'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        consent
                          ? 'border-white/10 bg-primary-500/20 text-primary-200'
                          : 'border-primary-600/40 bg-primary-500/10 text-primary-200'
                      }
                    >
                      {consent ? 'Accepted' : 'Required'}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#1E1E1E] text-[#E0E0E0] hover:text-white"
                      onClick={() => setGuestDialogPolicy(policy)}
                    >
                      {consent ? 'View' : 'Review'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1E1E1E]/60 border border-[#1E1E1E] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 text-[#A8B1B9] text-sm">
            <PlayCircle className="w-5 h-5 text-primary-500" />
            <span>Want to see how it works before uploading?</span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-white/10 text-primary-300 hover:text-white hover:border-primary-400"
            onClick={simulateDemo}
            disabled={disabled}
          >
            Watch a sample run
          </Button>
        </div>

        {state.events.length > 0 && (
          <div className="bg-[#1E1E1E]/80 border border-[#1E1E1E] rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
            {state.events.map((event) => (
              <div key={event.id} className={`text-sm ${eventColors[event.type] || 'text-[#A8B1B9]'}`}>
                <span className="opacity-60 mr-2">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {event.message}
              </div>
            ))}
          </div>
        )}

        {state.status === 'ready' && state.invoiceData && (
          <div className="bg-primary-500/10 border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap gap-6 text-white">
              <div>
                <p className="text-sm uppercase tracking-widest text-primary-300 mb-1">Vendor</p>
                <p className="text-xl font-bold">{state.invoiceData.vendor_name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-primary-300 mb-1">Invoice #</p>
                <p className="text-xl font-bold">{state.invoiceData.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-primary-300 mb-1">Line items</p>
                <p className="text-xl font-bold">{state.invoiceData.line_items.length}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-primary-300 mb-1">Total</p>
                <p className="text-xl font-bold">${state.invoiceData.total.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-primary-200 text-sm">
              We saved this preview in your browser. Create a free account to keep it forever and unlock price alerts.
            </p>

            {state.invoiceData.alerts && state.invoiceData.alerts.length > 0 && (
              <div className="bg-[#1E1E1E]/80 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm uppercase tracking-widest text-primary-300">
                    Flagged price changes
                  </p>
                  <span className="text-xs text-primary-200">
                    {state.invoiceData.alerts.length} items outside tolerance
                  </span>
                </div>
                <ul className="space-y-3 text-[#E0E0E0] text-sm">
                  {state.invoiceData.alerts.map((alert) => (
                    <li key={alert.item} className="border border-white/10 rounded-lg p-3 bg-primary-500/5">
                      <p className="font-semibold text-primary-200">{alert.item} &middot; {alert.change}</p>
                      <p className="text-[#E0E0E0] mt-1">{alert.issue}</p>
                      <p className="text-[#A8B1B9] mt-1 italic">{alert.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {state.invoiceData.fuzzy_matches && state.invoiceData.fuzzy_matches.length > 0 && (
              <div className="bg-[#1E1E1E]/80 border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-sm uppercase tracking-widest text-primary-300">
                  Catalog matches we confirmed for you
                </p>
                <ul className="space-y-2 text-[#E0E0E0] text-sm">
                  {state.invoiceData.fuzzy_matches.map((match) => (
                    <li key={match.invoice_item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-[#1E1E1E] rounded-lg p-3 bg-[#1E1E1E]/60">
                      <div>
                        <p className="font-semibold text-white">{match.invoice_item}</p>
                        <p className="text-[#A8B1B9] text-xs">
                          Matched to: {match.matched_inventory_item}
                        </p>
                      </div>
                      <div className="text-[#A8B1B9] text-xs sm:text-right">
                        <p>Confidence {Math.round(match.confidence * 100)}%</p>
                        <p>Last paid ${match.last_price.toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="flex-1">
                <Button className="w-full bg-white text-[#121212] hover:bg-white/90">
                  Save this invoice (free)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" className="flex-1 border-[#1E1E1E] text-white" onClick={handleReset}>
                Upload another invoice
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      </Card>
      {guestDialogPolicy && (
        <PolicyAgreementDialog
          policy={guestDialogPolicy}
          open={Boolean(guestDialogPolicy)}
          onOpenChange={(open) => {
            if (!open) {
              setGuestDialogPolicy(null);
            }
          }}
          onAccept={handleGuestPolicyAccepted}
        />
      )}
    </>
  );
};
