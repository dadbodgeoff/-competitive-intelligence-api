import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAnalysisProgress } from '@/hooks/useAnalysisProgress';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface AnalysisProgressTrackerProps {
  analysisId: string;
}

export function AnalysisProgressTracker({ analysisId }: AnalysisProgressTrackerProps) {
  const navigate = useNavigate();
  const { status, error, isLoading, stopPolling } = useAnalysisProgress(analysisId);

  // Handle completion
  useEffect(() => {
    if (status?.status === 'completed') {
      navigate(`/analysis/${analysisId}/results`);
    }
  }, [status?.status, analysisId, navigate]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Alert variant="destructive">
          <AlertDescription>
            Analysis failed: {error instanceof Error ? error.message : 'Unknown error'}
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                size="sm"
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                size="sm"
              >
                Back to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!status) {
    return <LoadingSkeleton />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return 'Calculating...';
    
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute remaining';
    return `${minutes} minutes remaining`;
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-2xl">Analyzing Competitors</CardTitle>
            <Badge className={getStatusColor(status.status)}>
              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {status.current_step || 'Starting analysis...'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={status.progress_percentage || 0} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{status.progress_percentage || 0}% complete</span>
              <span>{formatTimeRemaining(status.estimated_time_remaining_seconds)}</span>
            </div>
          </div>

          {/* Current Step Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Current Step</h3>
            <p className="text-sm text-muted-foreground">
              {status.current_step || 'Initializing analysis...'}
            </p>
          </div>

          {/* Analysis Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Analysis ID:</span>
              <span className="font-mono text-xs">{analysisId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Started:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full h-12"
              onClick={() => {
                stopPolling();
                navigate('/dashboard');
              }}
            >
              Cancel Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Page component wrapper
export function AnalysisProgressPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  
  if (!analysisId) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Invalid analysis ID. Please start a new analysis.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AnalysisProgressTracker analysisId={analysisId} />;
}