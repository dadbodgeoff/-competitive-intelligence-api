import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { TemplateSummary } from '../api/types';

interface TemplateCardProps {
  template: TemplateSummary;
  isSelected?: boolean;
  onSelect: (template: TemplateSummary) => void;
  onPreview: (template: TemplateSummary) => void;
}

export function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  return (
    <Card
      className={`flex h-full flex-col border transition ${
        isSelected ? 'border-emerald-400 shadow-lg shadow-emerald-500/20' : 'border-white/10'
      }`}
    >
      <CardHeader>
        <CardTitle className="text-base text-white">
          {template.display_name ?? template.slug.replace(/[-_]/g, ' ')}
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {template.variation_tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {template.variation_tags.length > 3 && (
            <Badge variant="outline">+{template.variation_tags.length - 3}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-sm text-slate-300">
        <div>
          <p className="font-medium text-white">Input Fields</p>
          <ul className="mt-2 space-y-1">
            {(template.input_schema.required ?? []).map((field) => (
              <li key={field} className="flex items-center gap-2 text-xs uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {field}
              </li>
            ))}
            {(template.input_schema.optional ?? []).map((field) => (
              <li key={field} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                {field} <span className="text-slate-500">(optional)</span>
              </li>
            ))}
            {template.input_schema.required?.length === 0 &&
              template.input_schema.optional?.length === 0 && (
                <li className="text-xs text-slate-500">No variables required.</li>
              )}
          </ul>
        </div>
        <p className="text-xs text-slate-400">
          Version {template.prompt_version ?? '1'} • {template.variation_tags.length} style cues
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant={isSelected ? 'default' : 'secondary'}
          className="flex-1"
          onClick={() => onSelect(template)}
        >
          {isSelected ? 'Selected' : 'Use Template'}
        </Button>
        <Button variant="outline" onClick={() => onPreview(template)}>
          Preview Prompt
        </Button>
      </CardFooter>
    </Card>
  );
}


