import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Calendar } from 'lucide-react';

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
import {
  type PolicyAcceptance,
  type PolicyKey,
  POLICY_METADATA,
} from '@/config/legal';

interface PolicyAgreementDialogProps {
  policy: PolicyKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (acceptance: PolicyAcceptance) => void;
}

// Simple markdown-like renderer for bold text
function renderContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function PolicyAgreementDialog({
  policy,
  open,
  onOpenChange,
  onAccept,
}: PolicyAgreementDialogProps) {
  const metadata = useMemo(() => POLICY_METADATA[policy], [policy]);
  const { content } = metadata;

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setHasScrolledToBottom(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !open) return;

    const handleScroll = () => {
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 48) {
        setHasScrolledToBottom(true);
      }
    };

    element.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [open]);

  const handleAccept = () => {
    const acceptance: PolicyAcceptance = {
      policy,
      acceptedAt: new Date().toISOString(),
      version: metadata.version,
      shortCode: metadata.shortCode,
      pageCount: content.sections.length,
    };
    onAccept(acceptance);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl border border-slate-800 bg-slate-950/95 text-slate-100"
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
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Effective: {content.effectiveDate}
            </span>
          </div>
        </DialogHeader>

        <div
          ref={scrollRef}
          className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-6"
        >
          {content.sections.map((section, index) => (
            <section key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-primary-500/20 text-primary-300 text-xs font-bold">
                  {index + 1}
                </span>
                {section.title}
              </h3>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-8">
                {renderContent(section.content)}
              </div>
            </section>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            {hasScrolledToBottom 
              ? 'You have reviewed the document. Click to accept.'
              : 'Please scroll to the end of the document to continue.'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-primary-500 text-slate-950 hover:bg-primary-400"
              disabled={!hasScrolledToBottom}
              onClick={handleAccept}
            >
              {hasScrolledToBottom ? 'Agree and Continue' : 'Scroll to the end to agree'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
