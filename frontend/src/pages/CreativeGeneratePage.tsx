import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeCard } from '@/features/creative/components/ThemeCard';
// import { GenerationWizard } from '@/features/creative/components/GenerationWizard';
import { GenerationProgress } from '@/features/creative/components/GenerationProgress';
import { AssetGallery } from '@/features/creative/components/AssetGallery';
import { PromptPreviewDrawer } from '@/features/creative/components/PromptPreviewDrawer';
import { useNanoThemes } from '@/features/creative/hooks/useNanoThemes';
import { useNanoTemplates } from '@/features/creative/hooks/useNanoTemplates';
// import { useGenerateImage } from '@/features/creative/hooks/useGenerateImage';
import { previewTemplate } from '@/features/creative/api/nanoBananaClient';
import type { TemplateSummary, CreativeJobDetail, TemplatePreviewResponse, ThemeSummary } from '@/features/creative/api/types';

type CreativeTab = 'campaigns' | 'social-proof' | 'hiring' | 'events';

const CATEGORY_ORDER: CreativeTab[] = ['campaigns', 'social-proof', 'hiring', 'events'];
const CATEGORY_LABELS: Record<CreativeTab, string> = {
  campaigns: 'Menu & Seasonal Campaigns',
  'social-proof': 'Social Proof',
  hiring: 'Talent Acquisition',
  events: 'Events & Promotions',
};

const CATEGORY_DESCRIPTIONS: Record<CreativeTab, string> = {
  campaigns: 'Promote seasonal menus, limited-time offers, and special dishes with eye-catching visuals tailored to your restaurant type.',
  'social-proof': 'Showcase customer reviews, testimonials, and social media buzz to build trust and credibility.',
  hiring: 'Attract top talent with professional job postings and team culture highlights.',
  events: 'Announce special events, live music, trivia nights, and celebrations to drive foot traffic.',
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

export function CreativeGeneratePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<CreativeTab>('campaigns');
  const [restaurantVerticalFilter, setRestaurantVerticalFilter] = useState<string>('all');
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>(searchParams.get('theme') || undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(searchParams.get('template') || undefined);
  const [expandedThemeId, setExpandedThemeId] = useState<string | undefined>(searchParams.get('theme') || undefined);
  const [currentJobId, setCurrentJobId] = useState<string | undefined>();
  const [completedJob, setCompletedJob] = useState<CreativeJobDetail | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<TemplatePreviewResponse>();
  const [previewError, setPreviewError] = useState<string>();
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateSummary | null>(null);

  const themesQuery = useNanoThemes();
  const templatesQuery = useNanoTemplates(selectedThemeId);
  // const generateMutation = useGenerateImage();

  const themes = themesQuery.data ?? [];
  const templates = templatesQuery.data ?? [];

  // Group themes by category
  const themesByCategory = useMemo(() => {
    const base: Record<CreativeTab, ThemeSummary[]> = {
      campaigns: [],
      'social-proof': [],
      hiring: [],
      events: [],
    };
    themes.forEach((theme) => {
      const category = (theme.category ?? 'campaigns') as CreativeTab;
      const key = CATEGORY_ORDER.includes(category) ? category : 'campaigns';
      base[key] = [...base[key], theme];
    });
    return base;
  }, [themes]);

  // Get unique restaurant verticals for campaigns category, sorted by count (most to least)
  const restaurantVerticals = useMemo(() => {
    const verticalCounts = new Map<string, number>();
    themesByCategory.campaigns.forEach((theme) => {
      if (theme.restaurant_vertical) {
        const count = verticalCounts.get(theme.restaurant_vertical) || 0;
        verticalCounts.set(theme.restaurant_vertical, count + 1);
      }
    });
    // Sort by count descending, then alphabetically
    return Array.from(verticalCounts.keys()).sort((a, b) => {
      const countDiff = (verticalCounts.get(b) || 0) - (verticalCounts.get(a) || 0);
      return countDiff !== 0 ? countDiff : a.localeCompare(b);
    });
  }, [themesByCategory.campaigns]);

  // Filter themes by category and restaurant vertical (for campaigns only)
  const filteredThemes = useMemo(() => {
    const categoryThemes = themesByCategory[activeTab] ?? [];
    
    // Apply restaurant vertical filter only for campaigns tab
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
  
  // const selectedTheme = useMemo(
  //   () => themes.find((theme) => theme.id === selectedThemeId),
  //   [themes, selectedThemeId],
  // );

  // const selectedTemplate = useMemo(
  //   () => templates.find((template) => template.id === selectedTemplateId),
  //   [templates, selectedTemplateId],
  // );

  // Auto-expand theme if coming from URL params and set correct tab
  useEffect(() => {
    const themeParam = searchParams.get('theme');
    const templateParam = searchParams.get('template');
    if (themeParam) {
      setExpandedThemeId(themeParam);
      setSelectedThemeId(themeParam);
      // Find the theme and set the correct tab
      const theme = themes.find((t) => t.id === themeParam);
      if (theme) {
        const category = (theme.category ?? 'campaigns') as CreativeTab;
        setActiveTab(CATEGORY_ORDER.includes(category) ? category : 'campaigns');
      }
    }
    if (templateParam) {
      setSelectedTemplateId(templateParam);
    }
  }, [searchParams, themes]);

  // Reset vertical filter when changing tabs
  useEffect(() => {
    setRestaurantVerticalFilter('all');
  }, [activeTab]);

  // Auto-select first theme when tab changes
  useEffect(() => {
    if (themesQuery.isLoading) return;
    if (filteredThemes.length === 0) {
      setSelectedThemeId(undefined);
      return;
    }
    // Only auto-select if no theme is currently selected or if selected theme is not in current tab
    if (!selectedThemeId || !filteredThemes.some((t) => t.id === selectedThemeId)) {
      setExpandedThemeId(undefined);
      setSelectedThemeId(undefined);
      setSelectedTemplateId(undefined);
    }
  }, [activeTab, filteredThemes, themesQuery.isLoading, selectedThemeId]);



  const handleThemeClick = useCallback((themeId: string) => {
    if (expandedThemeId === themeId) {
      setExpandedThemeId(undefined);
      setSelectedThemeId(undefined);
      setSelectedTemplateId(undefined);
    } else {
      setExpandedThemeId(themeId);
      setSelectedThemeId(themeId);
      setSelectedTemplateId(undefined);
    }
  }, [expandedThemeId]);

  const handleSelectTemplate = useCallback((template: TemplateSummary, themeId: string) => {
    // Navigate to customize page instead of scrolling
    navigate(`/creative/customize?theme=${themeId}&template=${template.id}`);
  }, [navigate]);

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

  // const handleGenerate = useCallback(async (payload: StartGenerationRequest) => {
  //   try {
  //     const result = await generateMutation.mutateAsync(payload);
  //     setCurrentJobId(result.job_id);
  //     
  //     toast({
  //       title: 'Generation Started',
  //       description: 'Your creative assets are being generated...',
  //     });
  //   } catch (error) {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Generation Failed',
  //       description: error instanceof Error ? error.message : 'Failed to start generation',
  //     });
  //   }
  // }, [generateMutation, toast]);

  const handleGenerationComplete = useCallback((job: CreativeJobDetail) => {
    setCompletedJob(job);
    setCurrentJobId(undefined);
    
    toast({
      title: 'Generation Complete!',
      description: `${job.assets.length} asset(s) ready to download`,
    });
  }, [toast]);

  const handleGenerationError = useCallback((error: string) => {
    toast({
      variant: 'destructive',
      title: 'Generation Failed',
      description: error,
    });
    setCurrentJobId(undefined);
  }, [toast]);

  const handleStartNew = useCallback(() => {
    setSelectedThemeId(undefined);
    setSelectedTemplateId(undefined);
    setExpandedThemeId(undefined);
    setCurrentJobId(undefined);
    setCompletedJob(undefined);
  }, []);

  const isGenerating = Boolean(currentJobId);
  const hasCompletedJob = Boolean(completedJob);

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/creative')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studio
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary-500" />
                Generate Creative Assets
              </h1>
              <p className="text-slate-400 mt-1">
                Create on-brand marketing assets with AI
              </p>
            </div>
          </div>
          {hasCompletedJob && (
            <Button
              onClick={handleStartNew}
              className="bg-primary-500 hover:bg-primary-500"
            >
              Generate Another
            </Button>
          )}
        </div>

        {/* Generation Progress - Show when generating */}
        {isGenerating && currentJobId && (
          <GenerationProgress
            jobId={currentJobId}
            onComplete={handleGenerationComplete}
            onError={handleGenerationError}
          />
        )}

        {/* Completed Assets - Show when done */}
        {hasCompletedJob && completedJob && (
          <div className="rounded-lg border-2 border-primary-500/50 bg-primary-500/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-bold text-white">Your Assets Are Ready!</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Generated {completedJob.assets.length} variant(s) using the{' '}
              <strong>{completedJob.template_slug}</strong> template.
            </p>
            <AssetGallery
              assets={completedJob.assets}
              jobSlug={completedJob.template_slug}
            />
          </div>
        )}

        {/* Category Tabs and Theme Cards */}
        {!isGenerating && !hasCompletedJob && (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as CreativeTab)}
            className="space-y-6"
          >
            <TabsList className="flex flex-wrap gap-2 bg-white/5 p-1">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
                >
                  <span className="mr-2">{label}</span>
                  {typeof tabCounts?.[key as CreativeTab] === 'number' && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
                      {tabCounts[key as CreativeTab]}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4">
              {/* Category Description */}
              <div className="text-slate-300 mb-4">
                {CATEGORY_DESCRIPTIONS[activeTab]}
              </div>

              {/* Restaurant Vertical Filter - Only show for campaigns tab */}
              {activeTab === 'campaigns' && restaurantVerticals.length > 0 && (
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
              )}
              {themesQuery.isLoading ? (
                <div className="text-slate-400">Loading themes...</div>
              ) : filteredThemes.length === 0 ? (
                <div className="text-slate-400 py-8 text-center">
                  No themes available in this category. Try another tab.
                </div>
              ) : (
                filteredThemes.map((theme) => {
                  // Create enhanced theme with better description
                  const enhancedTheme = {
                    ...theme,
                    description: enhanceThemeDescription(theme),
                  };
                  
                  return (
                    <ThemeCard
                      key={theme.id}
                      theme={enhancedTheme}
                      templates={theme.id === selectedThemeId ? templates : []}
                      isExpanded={expandedThemeId === theme.id}
                      isLoadingTemplates={theme.id === selectedThemeId && templatesQuery.isLoading}
                      selectedTemplateId={selectedTemplateId}
                      onToggle={() => handleThemeClick(theme.id)}
                      onSelectTemplate={(template) => handleSelectTemplate(template, theme.id)}
                      onPreviewTemplate={handlePreviewTemplate}
                      showUseTemplateButton={true}
                    />
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}


      </div>

      <PromptPreviewDrawer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        templateName={previewingTemplate?.display_name ?? previewingTemplate?.slug}
        preview={previewData}
        isLoading={previewLoading}
        error={previewError}
        onUseTemplate={() => {
          // Navigate to customize page with the previewed template
          if (previewingTemplate && selectedThemeId) {
            navigate(`/creative/customize?theme=${selectedThemeId}&template=${previewingTemplate.id}`);
          }
        }}
      />
    </AppShell>
  );
}
