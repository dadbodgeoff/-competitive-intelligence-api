import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAnalysisProgress } from '@/hooks/useAnalysisProgress';
import {
  TrendingUp,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

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

  const getStatusConfig = (statusValue: string) => {
    switch (statusValue) {
      case 'pending':
        return {
          color: 'bg-primary-500/10 text-primary-500 border-primary-600/30',
          icon: Clock,
        };
      case 'running':
        return {
          color: 'bg-accent-500/10 text-accent-400 border-accent-500/30',
          icon: Loader2,
        };
      case 'completed':
        return {
          color: 'bg-primary-500/10 text-primary-500 border-white/10',
          icon: CheckCircle2,
        };
      case 'failed':
        return {
          color: 'bg-destructive/10 text-destructive border-red-500/30',
          icon: XCircle,
        };
      default:
        return {
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          icon: Clock,
        };
    }
  };

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return 'Calculating...';

    const minutes = Math.ceil(seconds / 60);
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute remaining';
    return `${minutes} minutes remaining`;
  };

  if (isLoading || !status) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-obsidian">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 pointer-events-none" />

        <div className="relative container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white hover:text-primary-500 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold">RestaurantIQ</span>
            </Link>
          </div>

          <Alert
            variant="destructive"
            className="bg-destructive/10 border-red-500/50 text-destructive"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              <p className="font-semibold mb-2">Analysis Failed</p>
              <p className="mb-4">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-destructive hover:bg-red-600"
                >
                  Retry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  Back to Dashboard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(status.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />

      {/* Header */}
      <div className="relative border-b border-white/10 bg-card-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white hover:text-primary-500 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-primary-500" />
            <span className="text-xl font-bold">RestaurantIQ</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* Animated icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-4 rounded-full bg-primary-500/10 border border-white/10">
                  <Search className="h-8 w-8 text-primary-500 animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <CardTitle className="text-3xl font-bold text-white">
                  Analyzing Competitors
                </CardTitle>
                <Badge className={`${statusConfig.color} border font-semibold`}>
                  <StatusIcon
                    className={`h-3 w-3 mr-1 ${
                      status.status === 'running' ? 'animate-spin' : ''
                    }`}
                  />
                  {status.status.charAt(0).toUpperCase() +
                    status.status.slice(1)}
                </Badge>
              </div>
              <p className="text-slate-400 text-base">
                {status.current_step || 'Starting analysis...'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress
                value={status.progress_percentage || 0}
                className="h-3 bg-obsidian/50"
              />
              <div className="flex justify-between text-sm">
                <span className="text-primary-500 font-semibold">
                  {status.progress_percentage || 0}% complete
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(
                    status.estimated_time_remaining_seconds
                  )}
                </span>
              </div>
            </div>

            {/* Current Step Details */}
            <div className="bg-obsidian/50 border border-white/10 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-accent-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Current Step
                  </h3>
                  <p className="text-sm text-slate-400">
                    {status.current_step || 'Initializing analysis...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="space-y-3 text-sm border-t border-white/10 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Analysis ID</span>
                <span className="font-mono text-xs text-slate-300 bg-obsidian/50 px-2 py-1 rounded">
                  {analysisId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Started</span>
                <span className="text-slate-300">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full h-12 border-white/10 text-slate-300 hover:bg-destructive/10 hover:text-destructive hover:border-red-500/30 transition-colors"
                onClick={() => {
                  stopPolling();
                  navigate('/dashboard');
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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