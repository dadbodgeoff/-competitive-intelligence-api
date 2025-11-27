import React, { useCallback, useMemo, useRef, useState } from 'react';
import { 
  ArrowRight, Upload, Loader2, CheckCircle2, AlertTriangle, 
  PlayCircle, ShieldCheck, FileText, Zap, TrendingUp, ChevronRight
} from 'lucide-react';
import { Badge } from '@/design-system/shadcn/components/badge';
import { Button } from '@/design-system/shadcn/components/button';
import { useGuestInvoiceDemo, type GuestPolicyConsentPayload } from '@/hooks/useGuestInvoiceDemo';
import { Link } from 'react-router-dom';
import { PolicyAgreementDialog } from '@/components/legal/PolicyAgreementDialog';
import { POLICY_METADATA, type PolicyAcceptance, type PolicyKey } from '@/config/legal';

const eventColors: Record<string, string> = {
  info: 'text-[#A8B1B9]',
  progress: 'text-[#D4A574]',
  success: 'text-emerald-400',
  error: 'text-red-400',
};

export const InvoiceDemoCardV2: React.FC = () => {
  const { state, uploadInvoice, reset, simulateDemo } = useGuestInvoiceDemo();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [guestConsents, setGuestConsents] = useState<Record<PolicyKey, PolicyAcceptance | null>>({
    terms: null,
    privacy: null,
  });
  const [guestDialogPolicy, setGuestDialogPolicy] = useState<PolicyKey | null>(null);
  const pendingFileRef = useRef<File | null>(null);
  const policyOrder = useMemo(() => ['terms', 'privacy'] as PolicyKey[], []);

  const buildConsentPayload = useCallback(
    (source: Record<PolicyKey, PolicyAcceptance | null> = guestConsents): GuestPolicyConsentPayload | null => {
      if (!source.terms || !source.privacy) return null;
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
      return <Loader2 className="w-8 h-8 text-[#B08968] animate-spin" />;
    }
    if (state.status === 'ready') {
      return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
    }
    if (state.status === 'error') {
      return <AlertTriangle className="w-8 h-8 text-red-400" />;
    }
    return <Upload className="w-8 h-8 text-white" />;
  };

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Invoice Intelligence</h3>
              <p className="text-xs text-[#6B7280]">Catch price leaks instantly</p>
            </div>
          </div>
          
          <Badge 
            className="px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: 'rgba(176, 137, 104, 0.15)',
              border: '1px solid rgba(176, 137, 104, 0.3)',
              color: '#D4A574',
            }}
          >
            ~30 seconds
          </Badge>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/*"
          onChange={handleFileInput}
        />

        {/* Drop Zone */}
        <div
          className={`
            rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          style={{
            borderColor: isDragging ? 'rgba(176, 137, 104, 0.6)' : 'rgba(255, 255, 255, 0.1)',
            backgroundColor: isDragging ? 'rgba(176, 137, 104, 0.08)' : 'rgba(30, 30, 30, 0.4)',
            boxShadow: isDragging ? '0 0 30px rgba(176, 137, 104, 0.15)' : 'none',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.2) 0%, rgba(176, 137, 104, 0.05) 100%)',
                border: '1px solid rgba(176, 137, 104, 0.25)',
              }}
            >
              {renderStatusIcon()}
            </div>
            
            <div>
              <p className="text-lg font-bold text-white mb-1">
                {state.status === 'idle' ? 'Drop your invoice here' : state.fileName || 'Processing…'}
              </p>
              <p className="text-sm text-[#6B7280]">
                {state.status === 'idle'
                  ? 'PDF, JPG, PNG • Sysco, US Foods, Restaurant Depot'
                  : state.status === 'ready'
                    ? 'Invoice analyzed successfully'
                    : state.status === 'error'
                      ? state.error || 'Something went wrong'
                      : 'Scanning line items...'}
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#6B7280] pt-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#B08968]" />
                No manual entry
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#B08968]" />
                Price alerts
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#B08968]" />
                Auto-matching
              </span>
            </div>

            {state.status !== 'idle' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#6B7280] hover:text-white mt-2"
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

        {/* Policy consent - compact */}
        <div 
          className="mt-6 rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-3">
            <ShieldCheck className="h-4 w-4 text-[#B08968]" />
            {allConsentsComplete
              ? 'Policies accepted. Ready to upload.'
              : 'Review policies before uploading.'}
          </div>
          <div className="flex flex-wrap gap-2">
            {policyOrder.map((policy) => {
              const metadata = POLICY_METADATA[policy];
              const consent = guestConsents[policy];

              return (
                <button
                  key={policy}
                  onClick={() => setGuestDialogPolicy(policy)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:bg-white/5"
                  style={{
                    backgroundColor: consent ? 'rgba(176, 137, 104, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: consent 
                      ? '1px solid rgba(176, 137, 104, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <FileText className={`h-3.5 w-3.5 ${consent ? 'text-[#B08968]' : 'text-[#6B7280]'}`} />
                  <span className={consent ? 'text-[#D4A574]' : 'text-[#A8B1B9]'}>
                    {metadata.title}
                  </span>
                  {consent ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[#6B7280]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sample demo button */}
        <div 
          className="mt-4 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <PlayCircle className="w-4 h-4 text-[#B08968]" />
            <span>No invoice handy?</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[#B08968]/30 text-[#D4A574] hover:text-white hover:border-[#B08968]/50 hover:bg-[#B08968]/10"
            onClick={simulateDemo}
            disabled={disabled}
          >
            Watch sample run
          </Button>
        </div>

        {/* Event log */}
        {state.events.length > 0 && (
          <div 
            className="mt-4 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto"
            style={{
              backgroundColor: 'rgba(18, 18, 18, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {state.events.map((event) => (
              <div key={event.id} className={`text-xs ${eventColors[event.type] || 'text-[#6B7280]'}`}>
                <span className="opacity-50 mr-2">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {event.message}
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {state.status === 'ready' && state.invoiceData && (
          <div 
            className="mt-6 rounded-2xl p-6 space-y-6"
            style={{
              background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.1) 0%, rgba(30, 30, 30, 0.8) 100%)',
              border: '1px solid rgba(176, 137, 104, 0.2)',
            }}
          >
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Vendor', value: state.invoiceData.vendor_name },
                { label: 'Invoice #', value: state.invoiceData.invoice_number },
                { label: 'Line Items', value: state.invoiceData.line_items.length },
                { label: 'Total', value: `$${state.invoiceData.total.toFixed(2)}` },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {state.invoiceData.alerts && state.invoiceData.alerts.length > 0 && (
              <div 
                className="rounded-xl p-4 space-y-3"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-red-300 font-semibold">
                    ⚠️ Price Alerts
                  </p>
                  <span className="text-xs text-red-300">
                    {state.invoiceData.alerts.length} flagged
                  </span>
                </div>
                <ul className="space-y-2">
                  {state.invoiceData.alerts.slice(0, 3).map((alert) => (
                    <li 
                      key={alert.item} 
                      className="rounded-lg p-3 text-sm"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                    >
                      <p className="font-semibold text-white">{alert.item} · {alert.change}</p>
                      <p className="text-[#A8B1B9] text-xs mt-1">{alert.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="flex-1">
                <Button 
                  className="w-full h-12 font-semibold text-white"
                  style={{
                    backgroundColor: '#B08968',
                    boxShadow: '0 0 20px rgba(176, 137, 104, 0.3)',
                  }}
                >
                  Save & Get Alerts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1 h-12 border-white/10 text-white hover:bg-white/5" 
                onClick={handleReset}
              >
                Upload Another
              </Button>
            </div>
          </div>
        )}
      </div>

      {guestDialogPolicy && (
        <PolicyAgreementDialog
          policy={guestDialogPolicy}
          open={Boolean(guestDialogPolicy)}
          onOpenChange={(open) => {
            if (!open) setGuestDialogPolicy(null);
          }}
          onAccept={handleGuestPolicyAccepted}
        />
      )}
    </>
  );
};
