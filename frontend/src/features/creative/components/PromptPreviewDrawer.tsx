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
  
  // Technical jargon improvements
  const improvements: Record<string, string> = {
    'dough artistry': 'artisan dough craftsmanship',
    'fermentation flex': 'perfectly fermented dough',
    'flour explosions': 'flour-dusted details',
    'Latte art POV': 'stunning latte art close-ups',
    'cocoa dust text': 'cocoa powder designs',
    'cafe hustle': 'bustling cafe atmosphere',
    'chalk marker labels': 'hand-written chalk labels',
    'vibrant liquid': 'golden beer tones',
    'brick wall chalkboard': 'rustic brick wall backdrop',
    'multi-course events': 'special tasting menus',
    'Macro': 'Close-up',
    'POV': 'perspective',
    'hero shot': 'eye-catching centerpiece',
    'bokeh': 'soft background blur',
  };
  
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
  
  // Apply improvements
  Object.entries(improvements).forEach(([old, replacement]) => {
    sanitized = sanitized.replace(new RegExp(old, 'gi'), replacement);
  });
  
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
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden text-white" style={{ backgroundColor: '#1E1E1E' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#E0E0E0' }}>{templateName ?? 'Template Details'}</DialogTitle>
          <DialogDescription style={{ color: '#A8B1B9' }}>
            Preview what this template will create and see what information you'll need to provide.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh] rounded-md border p-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(18, 18, 18, 0.4)' }}>
          {isLoading && <Skeleton className="h-40 w-full bg-white/10" />}
          {!isLoading && error && (
            <div className="rounded-md border border-red-500/40 bg-destructive/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {!isLoading && !error && preview && (
            <div className="space-y-3">
              <section className="space-y-1.5 rounded-md border p-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(176, 137, 104, 0.05)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#B08968' }}>
                  What You'll Create
                </h3>
                <p className="text-xs leading-snug" style={{ color: '#A8B1B9' }}>
                  This template generates professional marketing images with your custom content.
                </p>
              </section>

              {preview.sections.description && (
                <section className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#B08968' }}>
                    Description
                  </h3>
                  <p className="text-xs leading-snug" style={{ color: '#E0E0E0' }}>
                    {preview.sections.description}
                  </p>
                </section>
              )}

              {preview.variation_summary && preview.variation_summary.style_notes && preview.variation_summary.style_notes.length > 0 && (
                <section className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#B08968' }}>
                    Style Elements
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.variation_summary.style_notes.map((note) => (
                      <Badge key={note} variant="outline" className="text-xs py-0.5 px-2" style={{ borderColor: '#B08968', color: '#B08968' }}>
                        {note}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#B08968' }}>
                  What You'll Get
                </h3>
                <div className="rounded-md p-3" style={{ backgroundColor: 'rgba(18, 18, 18, 0.5)' }}>
                  <p className="text-xs leading-snug" style={{ color: '#E0E0E0' }}>
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
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#A8B1B9' }}
            >
              Close
            </Button>
            <Button
              onClick={handleUseTemplate}
              className="text-white"
              style={{ backgroundColor: '#B08968' }}
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


