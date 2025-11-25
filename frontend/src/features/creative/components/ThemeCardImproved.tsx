import { ChevronDown, ChevronRight, Palette, Sparkles, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContentCard, CategoryBadge, getCategoryVariant, ListContainer } from '@/components/ui';
import type { ThemeSummary, TemplateSummary } from '../api/types';
import { cn } from '@/lib/utils';

interface ThemeCardImprovedProps {
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

export function ThemeCardImproved({
  theme,
  templates,
  isExpanded,
  isLoadingTemplates,
  selectedTemplateId,
  onToggle,
  onSelectTemplate,
  onPreviewTemplate,
  showUseTemplateButton = false,
}: ThemeCardImprovedProps) {
  const navigate = useNavigate();

  const handleUseTemplate = (template: TemplateSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/creative/customize?theme=${theme.id}&template=${template.id}`);
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-card overflow-hidden transition-all duration-200 hover:border-white/[0.12]">
      {/* Theme Header - Clickable */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full px-5 py-4 flex items-center gap-4 text-left',
          'transition-colors duration-200',
          'hover:bg-white/[0.02]',
          isExpanded && 'bg-white/[0.02] border-b border-white/[0.06]'
        )}
      >
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center',
          'bg-primary-500/10 border border-primary-500/20',
          'transition-colors duration-200',
          isExpanded && 'bg-primary-500/15'
        )}>
          <Palette className="h-5 w-5 text-primary-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="font-semibold text-white text-base truncate">
              {theme.name}
            </h3>
            <CategoryBadge
              variant={getCategoryVariant(theme.restaurant_vertical || '')}
              size="sm"
            >
              {theme.restaurant_vertical}
            </CategoryBadge>
          </div>
          {theme.description && (
            <p className="text-sm text-slate-400 line-clamp-1">
              {theme.description}
            </p>
          )}
        </div>

        {/* Expand indicator */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center',
          'text-slate-500 transition-all duration-200',
          'hover:bg-white/[0.04] hover:text-slate-300'
        )}>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Expanded Content - Templates */}
      {isExpanded && (
        <div className="px-5 py-4 bg-obsidian-400/30">
          {isLoadingTemplates ? (
            <div className="flex items-center gap-2 py-6 justify-center text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-primary-500 rounded-full animate-spin" />
              <span className="text-sm">Loading templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-slate-500 py-6 text-center">
              No templates available for this theme.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Available Templates
                </span>
                <span className="text-xs text-slate-600 bg-white/[0.04] px-2 py-0.5 rounded">
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </span>
              </div>

              <ListContainer gap="sm" animated>
                {templates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  
                  return (
                    <ContentCard
                      key={template.id}
                      title={template.display_name || template.slug}
                      description={template.description || 'Professional marketing template'}
                      isSelected={isSelected}
                      showArrow={false}
                      onClick={() => onSelectTemplate(template)}
                      badge={
                        isSelected ? (
                          <Badge className="bg-primary-500/20 text-primary-400 border-0 text-xs">
                            Selected
                          </Badge>
                        ) : template.variation_tags?.[0] ? (
                          <CategoryBadge size="sm" variant="default">
                            {template.variation_tags[0]}
                          </CategoryBadge>
                        ) : null
                      }
                      trailing={
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewTemplate(template);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Preview
                          </Button>
                          {showUseTemplateButton && (
                            <Button
                              size="sm"
                              className="h-8 px-3 text-xs bg-primary-500 hover:bg-primary-600 text-white"
                              onClick={(e) => handleUseTemplate(template, e)}
                            >
                              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                              Use
                            </Button>
                          )}
                        </div>
                      }
                    />
                  );
                })}
              </ListContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
