import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { TemplatePreviewResponse } from '../api/types';

interface PromptPreviewDrawerProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  templateName?: string;
  preview?: TemplatePreviewResponse;
  isLoading?: boolean;
  error?: string;
}

export function PromptPreviewDrawer({
  open,
  onOpenChange,
  templateName,
  preview,
  isLoading,
  error,
}: PromptPreviewDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden bg-slate-950/95 text-white">
        <DialogHeader>
          <DialogTitle>{templateName ?? 'Prompt preview'}</DialogTitle>
          <DialogDescription className="text-slate-300">
            Rendered prompt sections and variation notes without dispatching a job. Use this to
            sanity-check variables before running Nano Banana.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[55vh] rounded-md border border-white/10 bg-black/40 p-4">
          {isLoading && <Skeleton className="h-40 w-full bg-white/10" />}
          {!isLoading && error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}
          {!isLoading && !error && preview && (
            <div className="space-y-6">
              {Object.entries(preview.sections).map(([section, text]) => (
                <section key={section} className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    {section}
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                    {text}
                  </pre>
                </section>
              ))}

              {preview.variation_summary && (
                <section className="space-y-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                    Variation Summary
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preview.variation_summary.style_notes?.map((note) => (
                      <Badge key={note} variant="outline" className="border-emerald-400 text-emerald-200">
                        {note}
                      </Badge>
                    ))}
                  </div>
                  {preview.variation_summary.style_suffix && (
                    <p className="text-sm text-emerald-100">
                      {preview.variation_summary.style_suffix}
                    </p>
                  )}
                </section>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


