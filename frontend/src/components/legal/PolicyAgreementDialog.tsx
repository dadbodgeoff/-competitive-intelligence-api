import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Loader2, ScrollText } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/design-system/shadcn/components/badge';
import { cn } from '@/lib/utils';
import {
  type PolicyAcceptance,
  type PolicyKey,
  POLICY_METADATA,
} from '@/config/legal';
import { usePolicyDocumentRenderer } from '@/hooks/usePolicyDocumentRenderer';

interface PolicyAgreementDialogProps {
  policy: PolicyKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (acceptance: PolicyAcceptance) => void;
}

export function PolicyAgreementDialog({
  policy,
  open,
  onOpenChange,
  onAccept,
}: PolicyAgreementDialogProps) {
  const metadata = useMemo(() => POLICY_METADATA[policy], [policy]);

  const [renderError, setRenderError] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    canvasContainerRef,
    pageCount,
    renderError: hookRenderError,
    renderState,
  } = usePolicyDocumentRenderer(metadata.file, open);

  useEffect(() => {
    if (!open) {
      setRenderError(null);
      setHasScrolledToBottom(false);
      return;
    }

    setRenderError(hookRenderError);
  }, [hookRenderError, open]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !open) return;

    const handleScroll = () => {
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 48) {
        setHasScrolledToBottom(true);
      }
    };

    element.addEventListener('scroll', handleScroll);

    // run once to cover shorter docs
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [open, renderState]);

  const isAgreeEnabled =
    hasScrolledToBottom && (renderState === 'ready' || renderState === 'error');

  const handleAccept = () => {
    const acceptance: PolicyAcceptance = {
      policy,
      acceptedAt: new Date().toISOString(),
      version: metadata.version,
      shortCode: metadata.shortCode,
      pageCount,
    };
    onAccept(acceptance);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl border border-slate-800 bg-slate-950/95 text-slate-100 sm:max-w-6xl"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
            <FileText className="h-6 w-6 text-primary-500" />
            {metadata.title}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {metadata.description}
          </DialogDescription>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Badge variant="outline" className="border-white/10 text-primary-300">
              Version {metadata.version}
            </Badge>
            {pageCount > 0 && (
              <span className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-slate-500" />
                {pageCount} page{pageCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </DialogHeader>

        <div
          ref={scrollRef}
          className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-6"
        >
          <div
            ref={canvasContainerRef}
            className={cn(
              'flex flex-col items-center',
              renderState === 'loading' && 'opacity-60',
            )}
          >
            {renderState === 'loading' && (
              <div className="flex flex-col items-center gap-2 py-20 text-slate-300">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <p className="text-sm font-medium">Preparing the document…</p>
              </div>
            )}
          </div>

          {renderError && (
            <div className="mt-4 rounded-lg border border-primary-600/40 bg-primary-500/10 p-4 text-sm text-primary-200">
              {renderError}{' '}
              <a
                href={metadata.file}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline hover:text-primary-100"
              >
                Download the PDF
              </a>
              .
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            You must scroll to the end of the document before continuing. Your
            acknowledgement will be recorded with a timestamp.
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:text-white"
              onClick={() => window.open(metadata.file, '_blank', 'noopener')}
            >
              Download PDF
            </Button>
            <Button
              type="button"
              className="bg-primary-500 text-slate-950 hover:bg-primary-400"
              disabled={!isAgreeEnabled}
              onClick={handleAccept}
            >
              {isAgreeEnabled ? 'Agree and Continue' : 'Scroll to the end to agree'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


