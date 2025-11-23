import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateCard } from './TemplateCard';
import type { TemplateSummary } from '../api/types';

interface TemplateGalleryProps {
  templates: TemplateSummary[] | undefined;
  isLoading: boolean;
  error?: string;
  selectedTemplateId?: string;
  onSelectTemplate: (template: TemplateSummary) => void;
  onPreviewTemplate: (template: TemplateSummary) => void;
  filter: string;
  onFilterChange: (value: string) => void;
}

export function TemplateGallery({
  templates,
  isLoading,
  error,
  selectedTemplateId,
  onSelectTemplate,
  onPreviewTemplate,
  filter,
  onFilterChange,
}: TemplateGalleryProps) {
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    const query = filter.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter((template) => {
      const haystack = [
        template.display_name,
        template.slug,
        ...(template.variation_tags ?? []),
        ...(template.input_schema.required ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [templates, filter]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label htmlFor="template-search" className="text-sm text-slate-300">
          Search templates
        </Label>
        <Input
          id="template-search"
          placeholder="Search by name, tag, or field"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          className="w-full bg-white/5 text-white sm:w-72"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load templates</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-lg bg-white/10" />
          ))}
        </div>
      )}

      {!isLoading && filteredTemplates.length === 0 && (
        <Alert variant="secondary" className="bg-white/5 text-slate-200">
          <AlertTitle>No templates found</AlertTitle>
          <AlertDescription>
            Try a different search term or pick another theme to see more creative options.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={onSelectTemplate}
            onPreview={onPreviewTemplate}
          />
        ))}
      </div>
    </section>
  );
}


