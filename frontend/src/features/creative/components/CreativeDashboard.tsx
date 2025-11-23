import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CreativeLayout, type CreativeTab } from './CreativeLayout';
import { TemplateGallery } from './TemplateGallery';
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

export function CreativeDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CreativeTab>('campaigns');
  const [templateFilter, setTemplateFilter] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<TemplatePreviewResponse>();
  const [previewError, setPreviewError] = useState<string>();
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

  const filteredThemes = themesByCategory[activeTab] ?? [];

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

  const themeTiles = (
    <div className="flex flex-wrap gap-3">
      {filteredThemes.map((theme) => (
        <Button
          key={theme.id}
          variant={theme.id === selectedThemeId ? 'default' : 'outline'}
          onClick={() => {
            setSelectedThemeId(theme.id);
            setSelectedTemplateId(undefined);
            setTemplateFilter('');
          }}
        >
          {theme.name}
        </Button>
      ))}
      {filteredThemes.length === 0 && (
        <Alert className="bg-white/5 text-slate-200">
          <AlertTitle>No themes in {CATEGORY_LABELS[activeTab]}</AlertTitle>
          <AlertDescription>
            Switch to another tab to browse available creative content.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const handlePreviewTemplate = useCallback(
    async (template: TemplateSummary) => {
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
    <div className="flex gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-32 bg-white/10" />
      ))}
    </div>
  ) : (
    themeTiles
  );

  return (
    <CreativeLayout activeTab={activeTab} onTabChange={setActiveTab} tabCounts={tabCounts}>
      <div className="space-y-10">
        {themeSection}

        <TemplateGallery
          templates={templates}
          isLoading={templatesQuery.isLoading}
          error={templatesQuery.error instanceof Error ? templatesQuery.error.message : undefined}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={(template) => setSelectedTemplateId(template.id)}
          onPreviewTemplate={handlePreviewTemplate}
          filter={templateFilter}
          onFilterChange={setTemplateFilter}
        />

        <GenerationWizard
          theme={selectedTheme}
          template={selectedTemplate}
          isSubmitting={isGenerating}
          onGenerate={handleGenerate}
        />

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
        templateName={selectedTemplate?.display_name ?? selectedTemplate?.slug}
        preview={previewData}
        isLoading={previewLoading}
        error={previewError}
      />
    </CreativeLayout>
  );
}


