import { useMemo, useState } from 'react';
import { FileText, Calendar, Check } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
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
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
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

  const [hasAgreed, setHasAgreed] = useState(false);

  // Reset checkbox when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setHasAgreed(false);
    }
    onOpenChange(newOpen);
  };

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-6">
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

        {/* Checkbox agreement */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-slate-800 bg-slate-900/50">
          <Checkbox
            id="policy-agreement"
            checked={hasAgreed}
            onCheckedChange={(checked) => setHasAgreed(checked === true)}
            className="mt-0.5 border-slate-600 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
          />
          <label
            htmlFor="policy-agreement"
            className="text-sm text-slate-300 cursor-pointer leading-relaxed"
          >
            I have read and agree to the {metadata.title}. I understand and accept the terms
            outlined in this document.
          </label>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-primary-500 text-slate-950 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasAgreed}
            onClick={handleAccept}
          >
            <Check className="h-4 w-4 mr-2" />
            Agree and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
