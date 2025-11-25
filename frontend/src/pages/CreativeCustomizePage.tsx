import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Info, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GenerationWizard } from '@/features/creative/components/GenerationWizard';
import { GenerationProgress } from '@/features/creative/components/GenerationProgress';
import { AssetGallery } from '@/features/creative/components/AssetGallery';
import { SuccessAnimation } from '@/features/creative/components/SuccessAnimation';
import { useNanoThemes } from '@/features/creative/hooks/useNanoThemes';
import { useNanoTemplates } from '@/features/creative/hooks/useNanoTemplates';
import { useGenerateImage } from '@/features/creative/hooks/useGenerateImage';
import type { CreativeJobDetail, StartGenerationRequest } from '@/features/creative/api/types';

export function CreativeCustomizePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const themeId = searchParams.get('theme');
  const templateId = searchParams.get('template');
  
  const [currentJobId, setCurrentJobId] = useState<string | undefined>();
  const [completedJob, setCompletedJob] = useState<CreativeJobDetail | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);

  const themesQuery = useNanoThemes();
  const templatesQuery = useNanoTemplates(themeId || undefined);
  const generateMutation = useGenerateImage();

  const theme = useMemo(
    () => themesQuery.data?.find((t) => t.id === themeId),
    [themesQuery.data, themeId]
  );

  const template = useMemo(
    () => templatesQuery.data?.find((t) => t.id === templateId),
    [templatesQuery.data, templateId]
  );

  // Redirect if no theme/template specified
  useEffect(() => {
    if (!themeId || !templateId) {
      navigate('/creative/generate');
    }
  }, [themeId, templateId, navigate]);

  const handleGenerate = useCallback(async (payload: StartGenerationRequest) => {
    try {
      // Set a temporary "starting" state immediately for instant feedback
      setCurrentJobId('starting');
      
      const result = await generateMutation.mutateAsync(payload);
      setCurrentJobId(result.job_id);
      
      toast({
        title: 'Generation Started',
        description: 'Your creative assets are being generated...',
      });
    } catch (error) {
      setCurrentJobId(undefined); // Clear the starting state on error
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to start generation',
      });
    }
  }, [generateMutation, toast]);

  const handleGenerationComplete = useCallback((job: CreativeJobDetail) => {
    setCompletedJob(job);
    setCurrentJobId(undefined);
    setShowSuccess(true);
    
    // Hide success animation after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
    
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
    navigate('/creative/generate');
  }, [navigate]);

  const isGenerating = Boolean(currentJobId);
  const hasCompletedJob = Boolean(completedJob);

  if (!theme || !template) {
    return (
      <AppShell maxWidth="wide">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Sparkles className="h-12 w-12 text-primary-500 mx-auto animate-pulse" />
            <p className="text-slate-400">Loading template...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="wide">
      <SuccessAnimation
        show={showSuccess}
        message="Your assets are ready!"
        assetCount={completedJob?.assets.length || 0}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/creative/generate')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
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
          currentJobId === 'starting' ? (
            <Card className="bg-white/5 border-primary-500/50">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Sparkles className="h-12 w-12 text-primary-500 animate-pulse" />
                    <div className="absolute inset-0 animate-ping">
                      <Sparkles className="h-12 w-12 text-primary-500 opacity-20" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Starting Generation...</h3>
                    <p className="text-slate-400">
                      Preparing your creative assets with AI magic ✨
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <GenerationProgress
              jobId={currentJobId}
              onComplete={handleGenerationComplete}
              onError={handleGenerationError}
            />
          )
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

        {/* Template Info & Generation Form */}
        {!isGenerating && !hasCompletedJob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Template Info */}
            <div className="lg:col-span-5 space-y-4">
              {/* Theme Info */}
              <Card className="bg-white/5 border-white/10 sticky top-4">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-5 w-5 text-primary-500" />
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                        Theme
                      </h3>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {(theme as any).display_name || (theme as any).slug || theme.name}
                    </h2>
                    {(theme as any).description && (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {(theme as any).description}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary-500" />
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                        Template
                      </h3>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {template.display_name || template.slug}
                    </h3>
                    {(template as any).description && (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {(template as any).description}
                      </p>
                    )}
                  </div>

                  {/* Template Details */}
                  {((template.input_schema?.required?.length ?? 0) > 0 || (template.input_schema?.optional?.length ?? 0) > 0) && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-slate-400" />
                        <h4 className="text-sm font-semibold text-slate-300">
                          Required Information
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {template.input_schema?.required?.map((field) => (
                          <li key={field} className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                            {field.replace(/[_-]/g, ' ')}
                          </li>
                        ))}
                      </ul>
                      {template.input_schema?.optional && template.input_schema.optional.length > 0 && (
                        <>
                          <h4 className="text-sm font-semibold text-slate-300 mt-4 mb-2">
                            Optional Fields
                          </h4>
                          <ul className="space-y-2">
                            {template.input_schema.optional.map((field) => (
                              <li key={field} className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                {field.replace(/[_-]/g, ' ')}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {(template as any).tags && (template as any).tags.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {(template as any).tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-primary-500/10 text-primary-300 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Generation Form */}
            <div className="lg:col-span-7">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Customize Your Asset
                  </h1>
                  <p className="text-slate-400">
                    Fill in the details below to generate your custom creative asset
                  </p>
                </div>

                <GenerationWizard
                  theme={theme}
                  template={template}
                  isSubmitting={generateMutation.isPending}
                  onGenerate={handleGenerate}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
