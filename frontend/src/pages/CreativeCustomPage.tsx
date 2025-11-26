import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Wand2, Lightbulb, Palette, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomPromptBuilder } from '@/features/creative/components/CustomPromptBuilder';
import { GenerationProgress } from '@/features/creative/components/GenerationProgress';
import { AssetGallery } from '@/features/creative/components/AssetGallery';
import { SuccessAnimation } from '@/features/creative/components/SuccessAnimation';
import { useGenerateImage } from '@/features/creative/hooks/useGenerateImage';
import type { CreativeJobDetail, StartGenerationRequest } from '@/features/creative/api/types';

export function CreativeCustomPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentJobId, setCurrentJobId] = useState<string | undefined>();
  const [completedJob, setCompletedJob] = useState<CreativeJobDetail | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);

  const generateMutation = useGenerateImage();

  const handleGenerate = useCallback(async (payload: StartGenerationRequest) => {
    try {
      setCurrentJobId('starting');
      
      const result = await generateMutation.mutateAsync(payload);
      
      if (result.status === 'completed') {
        const { getJob } = await import('@/features/creative/api/nanoBananaClient');
        const fullJob = await getJob(result.job_id);
        
        setCompletedJob(fullJob);
        setCurrentJobId(undefined);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        toast({
          title: 'Generation Complete!',
          description: `${fullJob.assets.length} asset(s) ready to download`,
        });
      } else {
        setCurrentJobId(result.job_id);
        toast({
          title: 'Generation Started',
          description: 'Your creative assets are being generated...',
        });
      }
    } catch (error) {
      setCurrentJobId(undefined);
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
    setCompletedJob(undefined);
    setCurrentJobId(undefined);
  }, []);

  const isGenerating = Boolean(currentJobId);
  const hasCompletedJob = Boolean(completedJob);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/creative')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Studio
          </Button>
          {hasCompletedJob && (
            <Button
              onClick={handleStartNew}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Create Another
            </Button>
          )}
        </div>

        {/* Generation Progress */}
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
                    <h3 className="text-xl font-bold text-white">Creating Your Image...</h3>
                    <p className="text-slate-400">
                      Our AI is crafting your custom creation
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

        {/* Completed Assets */}
        {hasCompletedJob && completedJob && (
          <div className="rounded-lg border-2 border-primary-500/50 bg-primary-500/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-bold text-white">Your Custom Creation Is Ready!</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Generated {completedJob.assets.length} variant(s) from your custom prompt.
            </p>
            <AssetGallery
              assets={completedJob.assets}
              jobSlug="custom_prompt"
            />
          </div>
        )}

        {/* Two-Column Layout - Like CreativeCustomizePage */}
        {!isGenerating && !hasCompletedJob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Info Panel */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="bg-white/5 border-white/10 sticky top-4">
                <CardContent className="p-5 space-y-5">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center border border-primary-500/20">
                        <Wand2 className="h-5 w-5 text-primary-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Custom Prompt</h2>
                        <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium">
                          ✨ 3x Quality Boost
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Type anything you want and get professional-quality results. 
                      Our AI automatically adds expert photography techniques, lighting, 
                      and composition that would take hours to describe manually.
                    </p>
                  </div>

                  {/* Tips Section */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-slate-300">Pro Tips</h3>
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                        <span>Be specific about your dish or subject</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                        <span>Mention key ingredients or garnishes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                        <span>Describe the setting or background</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                        <span>Use the quick examples for inspiration</span>
                      </li>
                    </ul>
                  </div>

                  {/* What You Get */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-primary-400" />
                      <h3 className="text-sm font-semibold text-slate-300">What You Get</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-center gap-2">
                        <span className="text-primary-400">✓</span>
                        High-resolution PNG images
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-400">✓</span>
                        Professional food photography style
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-400">✓</span>
                        Multiple size options
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-400">✓</span>
                        Optional text overlays
                      </li>
                    </ul>
                  </div>

                  {/* Quality Guarantee */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-emerald-300">Quality Guaranteed</h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        Every image is validated for clarity, composition, text readability & food appeal before delivery.
                      </p>
                    </div>
                  </div>

                  {/* Brand Profile Note */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4 text-slate-400" />
                      <h3 className="text-sm font-semibold text-slate-300">Brand Styling</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Your brand profile colors and fonts will be applied automatically 
                      when adding text overlays.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-8">
              <CustomPromptBuilder
                isSubmitting={generateMutation.isPending}
                onGenerate={handleGenerate}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
