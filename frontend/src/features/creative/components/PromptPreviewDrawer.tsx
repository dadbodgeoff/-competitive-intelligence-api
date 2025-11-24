import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import type { TemplatePreviewResponse } from '../api/types';

interface PromptPreviewDrawerProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  templateName?: string;
  preview?: TemplatePreviewResponse;
  isLoading?: boolean;
  error?: string;
  onUseTemplate?: () => void;
}

// Helper function to sanitize prompt text for customer-friendly display
function sanitizePromptForDisplay(text: string): string {
  if (!text) return '';
  
  // Remove technical prompt instructions and visual cues
  let sanitized = text
    // Remove "Visual cues:" section and everything after
    .replace(/Visual cues:.*$/is, '')
    // Remove "Emphasize" instructions
    .replace(/Emphasize.*$/is, '')
    // Remove bracketed placeholders but keep the context
    .replace(/\[([^\]]+)\]/g, (_match, content) => {
      // Convert placeholder names to friendly descriptions
      const friendlyNames: Record<string, string> = {
        'headline': 'your headline',
        'item1_name': 'first item',
        'item2_name': 'second item',
        'item3_name': 'third item',
        'cta_line': 'your call-to-action',
        'dish_name': 'your dish name',
        'price': 'price',
        'description': 'description',
        'restaurant_name': 'your restaurant name',
        'tagline': 'your tagline',
        'offer': 'your offer',
        'date': 'event date',
        'time': 'event time',
      };
      return friendlyNames[content] || `your ${content.replace(/_/g, ' ')}`;
    })
    .trim();
  
  // Split into sentences and take only the first 2-3 sentences (the descriptive part)
  const sentences = sanitized.split(/\.\s+/);
  const descriptiveSentences = sentences.slice(0, 3).join('. ');
  
  // Add a period if it doesn't end with one
  return descriptiveSentences.endsWith('.') ? descriptiveSentences : descriptiveSentences + '.';
}

export function PromptPreviewDrawer({
  open,
  onOpenChange,
  templateName,
  preview,
  isLoading,
  error,
  onUseTemplate,
}: PromptPreviewDrawerProps) {
  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden bg-slate-950/95 text-white">
        <DialogHeader>
          <DialogTitle>{templateName ?? 'Template Details'}</DialogTitle>
          <DialogDescription className="text-slate-300">
            Preview what this template will create and see what information you'll need to provide.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] rounded-md border border-white/10 bg-black/40 p-4">
          {isLoading && <Skeleton className="h-40 w-full bg-white/10" />}
          {!isLoading && error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}
          {!isLoading && !error && preview && (
            <div className="space-y-6">
              <section className="space-y-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                  What You'll Create
                </h3>
                <p className="text-sm text-slate-300">
                  This template generates professional marketing images with your custom content.
                </p>
              </section>

              {preview.sections.description && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    {preview.sections.description}
                  </p>
                </section>
              )}

              {preview.variation_summary && preview.variation_summary.style_notes && preview.variation_summary.style_notes.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    Style Elements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preview.variation_summary.style_notes.map((note) => (
                      <Badge key={note} variant="outline" className="border-emerald-400 text-emerald-200">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                  What You'll Get
                </h3>
                <div className="rounded-md bg-slate-900/50 p-4">
                  <p className="text-sm leading-relaxed text-slate-200">
                    {sanitizePromptForDisplay(preview.sections.main || preview.sections.subject || Object.values(preview.sections)[0])}
                  </p>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>
        {!isLoading && !error && preview && onUseTemplate && (
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Close
            </Button>
            <Button
              onClick={handleUseTemplate}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}


