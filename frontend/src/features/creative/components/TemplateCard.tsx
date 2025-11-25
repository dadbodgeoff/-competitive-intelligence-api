import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Sparkles, Eye, ImageIcon } from 'lucide-react';
import type { TemplateSummary } from '../api/types';

interface TemplateCardProps {
  template: TemplateSummary;
  isSelected?: boolean;
  onSelect: (template: TemplateSummary) => void;
  onPreview: (template: TemplateSummary) => void;
}

// Map use cases to colors for visual distinction
const useCaseColors: Record<string, string> = {
  'Instagram Post': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Instagram Story': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Delivery App Hero': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Menu Photo': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Catering Promo': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Holiday Promo': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Promo Graphic': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Event Announcement': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Hiring Post': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Social Proof': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Marketing': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  const displayName = template.display_name ?? template.slug.replace(/[-_]/g, ' ');
  const useCase = template.use_case ?? 'Marketing';
  const useCaseClass = useCaseColors[useCase] ?? useCaseColors['Marketing'];
  
  // Get required field count for complexity indicator
  const requiredCount = template.input_schema.required?.length ?? 0;
  const optionalCount = template.input_schema.optional?.length ?? 0;
  
  return (
    <Card
      className={`group flex h-full flex-col border transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'border-primary-400 shadow-lg shadow-primary-500/20 bg-primary-500/5' 
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <CardHeader className="pb-3">
        {/* Use Case Badge */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={`text-xs font-medium ${useCaseClass}`}>
            {useCase}
          </Badge>
          {template.thumbnail_url && (
            <ImageIcon className="w-4 h-4 text-slate-500" />
          )}
        </div>
        
        {/* Template Name */}
        <h3 className="text-lg font-semibold text-white leading-tight">
          {displayName}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pt-0">
        {/* Description - The main selling point */}
        <p className="text-sm text-slate-300 leading-relaxed">
          {template.description ?? 'Professional marketing image customized with your details.'}
        </p>
        
        {/* Best For Tags */}
        {template.best_for && template.best_for.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {template.best_for.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* What You'll Need - Simplified */}
        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-slate-500 mb-2">What you'll provide:</p>
          <div className="flex flex-wrap gap-1.5">
            {(template.input_schema.required ?? []).slice(0, 4).map((field) => (
              <span 
                key={field} 
                className="text-xs px-2 py-1 rounded bg-primary-500/10 text-primary-300 font-medium"
              >
                {formatFieldName(field)}
              </span>
            ))}
            {requiredCount > 4 && (
              <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-500">
                +{requiredCount - 4} more
              </span>
            )}
          </div>
          {optionalCount > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              + {optionalCount} optional {optionalCount === 1 ? 'field' : 'fields'}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4">
        <Button
          variant={isSelected ? 'default' : 'secondary'}
          className={`flex-1 ${isSelected ? 'bg-primary-500' : ''}`}
          onClick={() => onSelect(template)}
        >
          {isSelected ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Selected
            </>
          ) : (
            'Use This'
          )}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPreview(template)}
          title="Preview prompt"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper to format field names nicely
function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/(\d+)/g, ' $1')
    .trim();
}
