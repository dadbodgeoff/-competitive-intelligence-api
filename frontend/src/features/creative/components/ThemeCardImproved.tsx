import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Palette, Sparkles, Eye, Target, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentCard, CategoryBadge, getCategoryVariant, ListContainer } from '@/components/ui';
import type { ThemeSummary, TemplateSummary } from '../api/types';
import { cn } from '@/lib/utils';
import { 
  enhanceThemeDescription, 
  getBestForTag, 
  enhanceTemplateDescription,
  getTemplateOneLiner 
} from '@/utils/creativeDescriptions';

const INITIAL_TEMPLATE_LIMIT = 6;

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
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [templateSearch, setTemplateSearch] = useState('');
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  // Filter and limit templates
  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return templates;
    const query = templateSearch.toLowerCase().trim();
    return templates.filter((t) => {
      const searchText = [
        t.display_name,
        t.slug,
        t.description,
        ...(t.variation_tags || []),
      ].join(' ').toLowerCase();
      return searchText.includes(query);
    });
  }, [templates, templateSearch]);

  const displayedTemplates = useMemo(() => {
    if (showAllTemplates || templateSearch.trim() || filteredTemplates.length <= INITIAL_TEMPLATE_LIMIT) {
      return filteredTemplates;
    }
    return filteredTemplates.slice(0, INITIAL_TEMPLATE_LIMIT);
  }, [filteredTemplates, showAllTemplates, templateSearch]);

  const hasMoreTemplates = filteredTemplates.length > INITIAL_TEMPLATE_LIMIT && !showAllTemplates && !templateSearch.trim();

  const handleUseTemplate = (template: TemplateSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/creative/customize?theme=${theme.id}&template=${template.id}`);
  };

  const toggleDescription = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescriptions(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  // Get enhanced description and best-for tag
  const enhancedDescription = enhanceThemeDescription(theme);
  const bestFor = getBestForTag(theme);

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
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h3 className="font-semibold text-white text-base truncate">
              {theme.name}
            </h3>
            <CategoryBadge
              variant={getCategoryVariant(theme.restaurant_vertical || '')}
              size="sm"
            >
              {theme.restaurant_vertical}
            </CategoryBadge>
            {/* Best For Tag */}
            {bestFor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 text-xs">
                <Target className="h-3 w-3" />
                {bestFor.icon} {bestFor.bestFor}
              </span>
            )}
          </div>
          {enhancedDescription && (
            <p className="text-sm text-slate-400 line-clamp-1">
              {enhancedDescription}
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

              {/* Template search - show when there are many templates */}
              {templates.length > INITIAL_TEMPLATE_LIMIT && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="pl-9 pr-8 h-8 text-sm bg-white/[0.03] border-white/[0.06] text-white placeholder:text-slate-500"
                  />
                  {templateSearch && (
                    <button
                      onClick={() => setTemplateSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* No results message */}
              {templateSearch && filteredTemplates.length === 0 && (
                <div className="text-sm text-slate-500 py-4 text-center">
                  No templates match "{templateSearch}"
                </div>
              )}

              <ListContainer gap="sm" animated>
                {displayedTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  const templateBestFor = getBestForTag(template);
                  const oneLiner = getTemplateOneLiner(template);
                  const fullDescription = enhanceTemplateDescription(template);
                  const isDescExpanded = expandedDescriptions.has(template.id);
                  const hasLongDescription = fullDescription.length > 60;
                  
                  return (
                    <ContentCard
                      key={template.id}
                      title={template.display_name || template.slug}
                      description={
                        <div className="space-y-1">
                          {/* One-liner with best-for */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {templateBestFor && (
                              <span className="text-primary-300 text-xs">
                                {templateBestFor.icon} {oneLiner}
                              </span>
                            )}
                            {!templateBestFor && (
                              <span className="text-slate-400 text-xs">{oneLiner}</span>
                            )}
                          </div>
                          {/* Expandable full description */}
                          {hasLongDescription && (
                            <div>
                              <p className={cn(
                                'text-xs text-slate-500 transition-all',
                                !isDescExpanded && 'line-clamp-1'
                              )}>
                                {fullDescription}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => toggleDescription(template.id, e)}
                                className="text-xs text-primary-400 hover:text-primary-300 mt-0.5"
                              >
                                {isDescExpanded ? 'Show less' : 'Show more'}
                              </button>
                            </div>
                          )}
                          {!hasLongDescription && fullDescription !== oneLiner && (
                            <p className="text-xs text-slate-500">{fullDescription}</p>
                          )}
                        </div>
                      }
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

              {/* Show More / Show Less button for templates */}
              {hasMoreTemplates && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllTemplates(true)}
                    className="text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs"
                  >
                    <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                    Show {filteredTemplates.length - INITIAL_TEMPLATE_LIMIT} more templates
                  </Button>
                </div>
              )}
              {showAllTemplates && filteredTemplates.length > INITIAL_TEMPLATE_LIMIT && !templateSearch.trim() && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllTemplates(false)}
                    className="text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs"
                  >
                    <ChevronRight className="h-3.5 w-3.5 mr-1.5 rotate-[-90deg]" />
                    Show less
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
