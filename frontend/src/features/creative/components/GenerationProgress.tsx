import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useNanoStream } from '../hooks/useNanoStream';
import type { CreativeJobDetail } from '../api/types';

interface GenerationProgressProps {
  jobId: string;
  onComplete: (job: CreativeJobDetail) => void;
  onError: (error: string) => void;
}

export function GenerationProgress({ jobId, onComplete, onError }: GenerationProgressProps) {
  const [status, setStatus] = useState<string>('queued');
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('Initializing...');

  const streamState = useNanoStream(jobId);

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
      setMessage('Generation complete!');
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
      setMessage('Processing...');
    }
  }, [streamState.lastEvent, jobId, onComplete, onError]);

  const isComplete = status === 'completed';
  const isFailed = status === 'failed';
  const isProcessing = !isComplete && !isFailed;

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {isProcessing && <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />}
          {isComplete && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          {isFailed && <AlertCircle className="h-5 w-5 text-red-500" />}
          {isComplete ? 'Generation Complete' : isFailed ? 'Generation Failed' : 'Generating...'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{message}</span>
              <span className="text-emerald-400 font-semibold">{progress}%</span>
            </div>
          </>
        )}

        {isComplete && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <AlertDescription className="text-emerald-400">
              Your creative assets are ready! Check them out below.
            </AlertDescription>
          </Alert>
        )}

        {isFailed && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
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
