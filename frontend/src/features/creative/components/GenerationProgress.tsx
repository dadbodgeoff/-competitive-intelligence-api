import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useNanoStream } from '../hooks/useNanoStream';
import type { CreativeJobDetail } from '../api/types';

interface GenerationProgressProps {
  jobId: string;
  onComplete: (job: CreativeJobDetail) => void;
  onError: (error: string) => void;
}

const MILESTONES = [
  { progress: 0, label: 'Initializing...', icon: '🎨' },
  { progress: 20, label: 'Analyzing brand', icon: '🔍' },
  { progress: 40, label: 'Creating composition', icon: '✨' },
  { progress: 60, label: 'Rendering image', icon: '🖼️' },
  { progress: 80, label: 'Applying effects', icon: '🎭' },
  { progress: 100, label: 'Finalizing', icon: '✅' },
];

export function GenerationProgress({ jobId, onComplete, onError }: GenerationProgressProps) {
  const [status, setStatus] = useState<string>('queued');
  const [progress, setProgress] = useState<number>(0);

  const streamState = useNanoStream(jobId);
  
  const currentMilestone = MILESTONES.reduce((prev, curr) => 
    progress >= curr.progress ? curr : prev
  );

  useEffect(() => {
    if (streamState.error) {
      setStatus('failed');
      onError(streamState.error);
    }
  }, [streamState.error, onError]);

  useEffect(() => {
    if (streamState.lastEvent === 'job_complete') {
      setStatus('completed');
      setProgress(100);
      // Fetch final job data
      import('../api/nanoBananaClient').then(({ getJob }) => {
        getJob(jobId).then(onComplete).catch(() => {});
      });
    } else if (streamState.lastEvent === 'job_failed') {
      setStatus('failed');
      onError('Generation failed');
    } else if (streamState.lastEvent === 'status') {
      setStatus('processing');
      setProgress(50); // Estimate
    }
  }, [streamState.lastEvent, jobId, onComplete, onError]);

  const isComplete = status === 'completed';
  const isFailed = status === 'failed';
  const isProcessing = !isComplete && !isFailed;

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {isProcessing && <Loader2 className="h-5 w-5 animate-spin text-primary-500" />}
          {isComplete && <CheckCircle2 className="h-5 w-5 text-primary-500" />}
          {isFailed && <AlertCircle className="h-5 w-5 text-red-500" />}
          {isComplete ? 'Generation Complete' : isFailed ? 'Generation Failed' : 'Generating...'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentMilestone.icon}</span>
              <div>
                <p className="text-lg font-semibold text-white">
                  {currentMilestone.label}
                </p>
                <p className="text-sm text-slate-400">
                  {progress}% complete
                </p>
              </div>
            </div>
            
            {/* Progress bar with gradient */}
            <div className="relative h-3 bg-card-dark rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r bg-primary-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            
            {/* Milestone indicators */}
            <div className="flex justify-between text-xs text-slate-500">
              {MILESTONES.map((milestone) => (
                <div
                  key={milestone.progress}
                  className={`
                    transition-colors duration-300
                    ${progress >= milestone.progress ? 'text-primary-500 font-semibold' : ''}
                  `}
                >
                  {milestone.progress}%
                </div>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <Alert className="bg-primary-500/10 border-white/10">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <AlertDescription className="text-primary-500">
              Your creative assets are ready! Check them out below.
            </AlertDescription>
          </Alert>
        )}

        {isFailed && (
          <Alert variant="destructive" className="bg-destructive/10 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {streamState.error || 'Something went wrong during generation'}
            </AlertDescription>
          </Alert>
        )}

        {isProcessing && streamState.isOpen && (
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Assembling prompt with your inputs</p>
            <p>• Applying variation engine for uniqueness</p>
            <p>• Generating image with Vertex AI Imagen</p>
            <p>• Uploading to storage and creating download links</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
