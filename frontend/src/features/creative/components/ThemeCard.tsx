import { ChevronDown, ChevronRight, Palette, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ThemeSummary, TemplateSummary } from '../api/types';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  theme: ThemeSummary;
  templates: TemplateSummary[];
  isExpanded: boolean;
  isLoadingTemplates: boolean;
  selectedTemplateId?: string;
  onToggle: () => void;
  onSelectTemplate: (template: TemplateSummary) => void;
  onPreviewTemplate: (template: TemplateSummary) => void;
  showUseTemplateButton?: boolean;
}

export function ThemeCard({
  theme,
  templates,
  isExpanded,
  isLoadingTemplates,
  selectedTemplateId,
  onToggle,
  onSelectTemplate,
  onPreviewTemplate,
  showUseTemplateButton = false,
}: ThemeCardProps) {
  const navigate = useNavigate();

  const handleUseTemplate = (template: TemplateSummary) => {
    navigate(`/creative/generate?theme=${theme.id}&template=${template.id}`);
  };

  return (
    <Card className="bg-card-dark border-white/10 hover:border-white/10 transition-all">
      <CardHeader
        className="cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary-500/10 border border-white/10">
              <Palette className="h-5 w-5 text-primary-500" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                {theme.name}
                <Badge variant="outline" className="text-xs border-white/10 text-primary-500">
                  {theme.restaurant_vertical}
                </Badge>
              </CardTitle>
              {theme.description && (
                <CardDescription className="text-slate-400 mt-1">
                  {theme.description}
                </CardDescription>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoadingTemplates ? (
            <div className="text-sm text-slate-400 py-4">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-slate-400 py-4">No templates available for this theme.</div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Available Templates ({templates.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all cursor-pointer',
                      selectedTemplateId === template.id
                        ? 'bg-primary-500/10 border-primary-500 ring-2 ring-primary-500/30'
                        : 'bg-obsidian/50 border-white/10 hover:border-primary-500/50 hover:bg-obsidian/80'
                    )}
                    onClick={() => onSelectTemplate(template)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-white text-sm">
                          {template.display_name || template.slug}
                        </div>
                        {selectedTemplateId === template.id && (
                          <Badge className="bg-primary-500 text-white text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      {template.variation_tags && template.variation_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.variation_tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-white/5 text-slate-400 border-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {template.variation_tags.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-white/5 text-slate-400 border-0"
                            >
                              +{template.variation_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs border-white/10 text-primary-500 hover:bg-primary-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewTemplate(template);
                          }}
                        >
                          View Details
                        </Button>
                        {showUseTemplateButton && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs bg-primary-500 hover:bg-primary-500 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseTemplate(template);
                            }}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Use Template
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
