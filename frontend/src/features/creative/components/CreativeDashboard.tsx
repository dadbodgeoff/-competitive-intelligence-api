import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { CreativeLayout, type CreativeTab } from './CreativeLayout';
import { ThemeCardImproved } from './ThemeCardImproved';
import { ListContainer } from '@/components/ui';
import { PromptPreviewDrawer } from './PromptPreviewDrawer';
import { GenerationWizard } from './GenerationWizard';
import { CreativeHistoryTable } from './CreativeHistoryTable';
import { CreativeJobDetailPanel } from './CreativeJobDetailPanel';
import { previewTemplate, startGeneration, type StartGenerationRequest } from '../api/nanoBananaClient';
import type {
  CreativeJobDetail,
  CreativeJobSummary,
  TemplatePreviewResponse,
  TemplateSummary,
  ThemeSummary,
} from '../api/types';
import { useNanoThemes } from '../hooks/useNanoThemes';
import { useNanoTemplates } from '../hooks/useNanoTemplates';
import { useNanoJobs } from '../hooks/useNanoJobs';
import { useNanoJob } from '../hooks/useNanoJob';
import { useNanoStream } from '../hooks/useNanoStream';

const CATEGORY_ORDER: CreativeTab[] = ['campaigns', 'social-proof', 'hiring', 'events'];
const CATEGORY_LABELS: Record<CreativeTab, string> = {
  campaigns: 'Menu & Seasonal Campaigns',
  'social-proof': 'Social Proof',
  hiring: 'Talent Acquisition',
  events: 'Events & Promotions',
};

// Helper function to improve theme descriptions for better customer appeal
const enhanceThemeDescription = (theme: ThemeSummary): string => {
  if (!theme.description) return '';
  
  // Map of keywords to more customer-friendly alternatives
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
  };
  
  let enhanced = theme.description;
  Object.entries(improvements).forEach(([old, replacement]) => {
    enhanced = enhanced.replace(new RegExp(old, 'gi'), replacement);
  });
  
  return enhanced;
};

export function CreativeDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CreativeTab>('campaigns');
  const [restaurantVerticalFilter, setRestaurantVerticalFilter] = useState<string>('all');
  const [selectedThemeId, setSelectedThemeId] = useState<string>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<TemplatePreviewResponse>();
  const [previewError, setPreviewError] = useState<string>();
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string>();

  const themesQuery = useNanoThemes();
  const templatesQuery = useNanoTemplates(selectedThemeId);
  const jobsQuery = useNanoJobs({ page: 1, perPage: 10 });
  const jobDetailQuery = useNanoJob(activeJobId);
  const streamState = useNanoStream(activeJobId);

  const themesByCategory = useMemo(() => {
    const base: Record<CreativeTab, ThemeSummary[]> = {
      campaigns: [],
      'social-proof': [],
      hiring: [],
      events: [],
    };
    (themesQuery.data ?? []).forEach((theme) => {
      const category = (theme.category ?? 'campaigns') as CreativeTab;
      const key = CATEGORY_ORDER.includes(category) ? category : 'campaigns';
      base[key] = [...base[key], theme];
    });
    return base;
  }, [themesQuery.data]);

  // Get unique restaurant verticals for campaigns category
  const restaurantVerticals = useMemo(() => {
    const verticalCounts = new Map<string, number>();
    themesByCategory.campaigns.forEach((theme) => {
      if (theme.restaurant_vertical) {
        const count = verticalCounts.get(theme.restaurant_vertical) || 0;
        verticalCounts.set(theme.restaurant_vertical, count + 1);
      }
    });
    return Array.from(verticalCounts.keys()).sort((a, b) => {
      const countDiff = (verticalCounts.get(b) || 0) - (verticalCounts.get(a) || 0);
      return countDiff !== 0 ? countDiff : a.localeCompare(b);
    });
  }, [themesByCategory.campaigns]);

  // Filter themes by category and restaurant vertical (for campaigns only)
  const filteredThemes = useMemo(() => {
    const categoryThemes = themesByCategory[activeTab] ?? [];
    if (activeTab === 'campaigns' && restaurantVerticalFilter !== 'all') {
      return categoryThemes.filter(
        (theme) => theme.restaurant_vertical === restaurantVerticalFilter
      );
    }
    return categoryThemes;
  }, [themesByCategory, activeTab, restaurantVerticalFilter]);

  const tabCounts = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Partial<Record<CreativeTab, number>>>((acc, category) => {
        acc[category] = themesByCategory[category]?.length ?? 0;
        return acc;
      }, {}),
    [themesByCategory],
  );

  useEffect(() => {
    if (!streamState.error) return;
    toast({
      variant: 'destructive',
      title: 'Streaming interrupted',
      description: streamState.error,
    });
  }, [streamState.error, toast]);

  // Reset vertical filter when changing tabs
  useEffect(() => {
    setRestaurantVerticalFilter('all');
  }, [activeTab]);

  useEffect(() => {
    if (themesQuery.isLoading) return;
    if (filteredThemes.length > 0) return;
    const fallback = CATEGORY_ORDER.find((cat) => (themesByCategory[cat] ?? []).length > 0);
    if (fallback && fallback !== activeTab) {
      setActiveTab(fallback);
    }
  }, [themesQuery.isLoading, filteredThemes.length, themesByCategory, activeTab]);

  // Auto-select theme when tab changes
  useEffect(() => {
    if (filteredThemes.length === 0) {
      setSelectedThemeId(undefined);
      return;
    }
    setSelectedThemeId((previous) => {
      if (!previous) return filteredThemes[0].id;
      const stillExists = filteredThemes.some((theme) => theme.id === previous);
      return stillExists ? previous : filteredThemes[0].id;
    });
  }, [filteredThemes]);

  const selectedTheme = useMemo(
    () => filteredThemes.find((theme) => theme.id === selectedThemeId),
    [filteredThemes, selectedThemeId],
  );

  const templates = templatesQuery.data ?? [];
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  // Scroll to generation form when template is selected
  useEffect(() => {
    if (selectedTemplateId) {
      setTimeout(() => {
        document.getElementById('generation-form')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [selectedTemplateId]);

  const [expandedThemeId, setExpandedThemeId] = useState<string>();

  const handleThemeClick = useCallback((themeId: string) => {
    if (expandedThemeId === themeId) {
      setExpandedThemeId(undefined);
      setSelectedThemeId(undefined);
    } else {
      setExpandedThemeId(themeId);
      setSelectedThemeId(themeId);
      setSelectedTemplateId(undefined);
    }
  }, [expandedThemeId]);

  const handlePreviewTemplate = useCallback(
    async (template: TemplateSummary) => {
      setPreviewingTemplate(template);
      setPreviewLoading(true);
      setPreviewError(undefined);
      setPreviewOpen(true);
      setPreviewData(undefined);
      try {
        const data = await previewTemplate({ template_id: template.id });
        setPreviewData(data);
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : 'Failed to preview template');
      } finally {
        setPreviewLoading(false);
      }
    },
    [],
  );

  const handleGenerate = useCallback(
    async (payload: StartGenerationRequest) => {
      setIsGenerating(true);
      try {
        const response = await startGeneration(payload);
        setActiveJobId(response.job_id);
        toast({
          title: 'Generation started',
          description: 'We are streaming progress from Nano Banana in real-time.',
        });
        jobsQuery.refetch();
      } catch (error) {
        toast({
          title: 'Unable to start job',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [toast, jobsQuery],
  );

  const handleSelectJob = useCallback((job: CreativeJobSummary) => {
    setActiveJobId(job.id);
  }, []);

  const themeSection = themesQuery.isLoading ? (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full bg-white/10" />
      ))}
    </div>
  ) : filteredThemes.length === 0 ? (
    <Alert className="bg-white/5 text-slate-200">
      <AlertTitle>No themes in {CATEGORY_LABELS[activeTab]}</AlertTitle>
      <AlertDescription>
        Switch to another tab to browse available creative content.
      </AlertDescription>
    </Alert>
  ) : null;

  // Restaurant vertical filter component
  const verticalFilterSlot = activeTab === 'campaigns' && restaurantVerticals.length > 0 ? (
    <div className="flex items-center gap-3 mb-4">
      <Filter className="h-4 w-4 text-slate-400" />
      <span className="text-sm text-slate-400">Filter by restaurant type:</span>
      <Select
        value={restaurantVerticalFilter}
        onValueChange={setRestaurantVerticalFilter}
      >
        <SelectTrigger className="w-[200px] bg-obsidian/50 border-white/10 text-white">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="bg-obsidian border-white/10">
          <SelectItem value="all" className="text-white hover:bg-white/10">
            All Types ({themesByCategory.campaigns.length})
          </SelectItem>
          {restaurantVerticals.map((vertical) => {
            const count = themesByCategory.campaigns.filter(
              (t) => t.restaurant_vertical === vertical
            ).length;
            return (
              <SelectItem
                key={vertical}
                value={vertical}
                className="text-white hover:bg-white/10"
              >
                {vertical} ({count})
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  ) : null;

  return (
    <CreativeLayout activeTab={activeTab} onTabChange={setActiveTab} tabCounts={tabCounts} filterSlot={verticalFilterSlot}>
      <div className="space-y-10">
        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-3">
          <Button
            onClick={() => window.location.href = '/creative/brands'}
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5"
          >
            Brand Profiles
          </Button>
          <Button
            onClick={() => window.location.href = '/creative/history'}
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5"
          >
            View History
          </Button>
          <Button
            onClick={() => window.location.href = '/creative/custom'}
            variant="outline"
            className="border-primary-500/50 text-primary-300 hover:bg-primary-500/10"
          >
            <span className="mr-2">🎨</span>
            Custom Prompt
          </Button>
          <Button
            onClick={() => window.location.href = '/creative/generate'}
            className="bg-gradient-to-r bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/25"
          >
            <span className="mr-2">✨</span>
            Use Templates
          </Button>
        </div>

        {themeSection}

        {/* Theme Cards with Expandable Templates */}
        <ListContainer gap="sm" animated>
          {filteredThemes.map((theme) => {
            // Create enhanced theme with better description
            const enhancedTheme = {
              ...theme,
              description: enhanceThemeDescription(theme),
            };
            
            return (
              <ThemeCardImproved
                key={theme.id}
                theme={enhancedTheme}
                templates={theme.id === selectedThemeId ? templates : []}
                isExpanded={expandedThemeId === theme.id}
                isLoadingTemplates={theme.id === selectedThemeId && templatesQuery.isLoading}
                selectedTemplateId={selectedTemplateId}
                onToggle={() => handleThemeClick(theme.id)}
                onSelectTemplate={(template) => {
                  setSelectedTemplateId(template.id);
                  setSelectedThemeId(theme.id);
                }}
                onPreviewTemplate={handlePreviewTemplate}
                showUseTemplateButton={true}
              />
            );
          })}
        </ListContainer>

        {/* Generation Wizard - Only show when template is selected */}
        {selectedTemplate && (
          <div id="generation-form" className="scroll-mt-8">
            <div className="rounded-lg border-2 border-primary-500/50 bg-primary-500/5 p-1">
              <GenerationWizard
                theme={selectedTheme}
                template={selectedTemplate}
                isSubmitting={isGenerating}
                onGenerate={handleGenerate}
              />
            </div>
          </div>
        )}

        <CreativeHistoryTable
          jobs={jobsQuery.data?.data}
          isLoading={jobsQuery.isLoading}
          error={jobsQuery.error instanceof Error ? jobsQuery.error.message : undefined}
          onSelectJob={handleSelectJob}
        />

        <CreativeJobDetailPanel
          job={jobDetailQuery.data as CreativeJobDetail | undefined}
          isLoading={jobDetailQuery.isLoading && Boolean(activeJobId)}
          error={jobDetailQuery.error instanceof Error ? jobDetailQuery.error.message : undefined}
          onClose={() => setActiveJobId(undefined)}
        />
      </div>

      <PromptPreviewDrawer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        templateName={previewingTemplate?.display_name ?? previewingTemplate?.slug}
        preview={previewData}
        isLoading={previewLoading}
        error={previewError}
        onUseTemplate={() => {
          // Redirect to customize page with template pre-selected
          if (previewingTemplate && selectedThemeId) {
            window.location.href = `/creative/customize?theme=${selectedThemeId}&template=${previewingTemplate.id}`;
          }
        }}
      />
    </CreativeLayout>
  );
}


