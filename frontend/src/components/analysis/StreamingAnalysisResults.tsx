import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitorsTable } from './CompetitorsTable';
import { InsightsGrid } from './InsightsGrid';
import { EvidenceReviewsDisplay } from './EvidenceReviewsDisplay';
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis';
import { ReviewAnalysisRequest } from '@/types/analysis';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  TrendingUp,
  MapPin,
  Sparkles,
  Users,
  FileText,
  Loader2,
  Eye,
} from 'lucide-react';

interface StreamingAnalysisResultsProps {
  request: ReviewAnalysisRequest;
  onComplete?: (analysisId: string) => void;
  onCancel?: () => void;
}

export function StreamingAnalysisResults({ 
  request, 
  onComplete, 
  onCancel 
}: StreamingAnalysisResultsProps) {
  const navigate = useNavigate();
  const { state, startAnalysis, stopAnalysis, isConnected } = useStreamingAnalysis();

  // Start analysis when component mounts
  useEffect(() => {
    startAnalysis(request);
    
    // Cleanup on unmount
    return () => {
      stopAnalysis();
    };
  }, [request, startAnalysis, stopAnalysis]);

  // Handle completion
  useEffect(() => {
    if (state.status === 'complete' && state.analysisId) {
      if (onComplete) {
        onComplete(state.analysisId);
      }
      // Don't auto-navigate - let user stay on streaming results to see evidence
      // User can manually navigate if they want
    }
  }, [state.status, state.analysisId, onComplete]);

  const getStatusIcon = () => {
    switch (state.status) {
      case 'streaming':
        return <Clock className="h-5 w-5 text-accent-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatTimeEstimate = () => {
    if (state.progress < 20) return '2-3 minutes remaining';
    if (state.progress < 50) return '1-2 minutes remaining';
    if (state.progress < 80) return '30-60 seconds remaining';
    if (state.progress < 95) return 'Almost done...';
    return 'Finalizing...';
  };

  if (state.status === 'error') {
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
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-semibold">Analysis failed: {state.error}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => startAnalysis(request)}
                    className="bg-destructive hover:bg-red-600"
                  >
                    Retry Analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel || (() => navigate('/dashboard'))}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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

      <div className="relative container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Header with Progress */}
        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg animate-pulse" />
                  <div className="relative p-3 rounded-full bg-primary-500/10 border border-white/10">
                    {getStatusIcon()}
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white mb-1">
                    {request.restaurant_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{request.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${
                    state.status === 'streaming'
                      ? 'bg-accent-500/10 text-accent-400 border-accent-500/30'
                      : state.status === 'complete'
                      ? 'bg-primary-500/10 text-primary-500 border-white/10'
                      : 'bg-destructive/10 text-destructive border-red-500/30'
                  } border font-semibold`}
                >
                  {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
                </Badge>
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-primary-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress value={state.progress} className="h-3 bg-obsidian/50" />
              <div className="flex justify-between text-sm">
                <span className="text-primary-500 font-semibold">
                  {state.progress}% complete
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeEstimate()}
                </span>
              </div>
            </div>

            {/* Current Step */}
            <div className="bg-obsidian/50 border border-white/10 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-accent-400 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Current Step</h3>
                  <p className="text-sm text-slate-400">
                    {state.currentStep || 'Initializing analysis...'}
                  </p>

                  {/* Progress Details */}
                  {state.totalReviews > 0 && (
                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                      <span className="text-slate-500">
                        <span className="text-primary-500 font-semibold">
                          {state.totalReviews}
                        </span>{' '}
                        reviews collected
                      </span>
                      {state.totalInsights > 0 && (
                        <span className="text-slate-500">
                          <span className="text-accent-400 font-semibold">
                            {state.insightsCompleted}/{state.totalInsights}
                          </span>{' '}
                          insights generated
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Confirmation Banner */}
            {state.status === 'complete' && state.analysisId && (
              <Alert className="bg-primary-500/10 border-white/10">
                <CheckCircle className="h-5 w-5 text-primary-500" />
                <AlertDescription className="text-primary-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Analysis Complete & Saved!</p>
                      <p className="text-sm text-primary-500/80 mt-1">
                        Your analysis has been automatically saved and is available in your dashboard.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              {state.status === 'complete' && state.analysisId ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/analysis')}
                    className="border-white/10 text-slate-300 hover:bg-white/5"
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    onClick={() =>
                      navigate(`/analysis/${state.analysisId}/results`)
                    }
                    className="bg-gradient-to-r bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/25"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Results
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    stopAnalysis();
                    onCancel ? onCancel() : navigate('/analysis');
                  }}
                  className="border-white/10 text-slate-300 hover:bg-destructive/10 hover:text-destructive hover:border-red-500/30"
                >
                  Cancel Analysis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Results */}
        {(state.competitors.length > 0 || state.insights.length > 0) && (
          <Card className="bg-card-dark border-white/10 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
                <div>
                  <CardTitle className="text-white">Live Results</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    Results appear as they're generated
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="competitors" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-obsidian/50 border border-white/10">
                  <TabsTrigger
                    value="competitors"
                    className="data-[state=active]:bg-primary-500/10 data-[state=active]:text-primary-500"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Competitors ({state.competitors.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="data-[state=active]:bg-accent-500/10 data-[state=active]:text-accent-400"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Insights ({state.insights.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="evidence"
                    className="data-[state=active]:bg-slate-500/10 data-[state=active]:text-slate-300"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Evidence ({state.totalReviews})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="competitors" className="mt-6">
                  {state.competitors.length > 0 ? (
                    <CompetitorsTable competitors={state.competitors} />
                  ) : (
                    <div className="text-center py-12">
                      <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary-500 animate-spin" />
                      <p className="text-slate-400">Discovering competitors...</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                  {state.insights.length > 0 ? (
                    <InsightsGrid insights={state.insights} />
                  ) : (
                    <div className="text-center py-12">
                      <Loader2 className="h-10 w-10 mx-auto mb-3 text-accent-400 animate-spin" />
                      <p className="text-slate-400">
                        {state.competitors.length > 0
                          ? 'Analyzing competitor reviews...'
                          : 'Waiting for competitors...'}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="evidence" className="mt-6">
                  {(state.totalReviews > 0 || state.status === 'complete') &&
                  state.analysisId ? (
                    <EvidenceReviewsDisplay
                      analysisId={state.analysisId}
                      competitors={state.competitors}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Loader2 className="h-10 w-10 mx-auto mb-3 text-slate-400 animate-spin" />
                      <p className="text-slate-400">
                        {state.competitors.length > 0
                          ? 'Collecting review evidence...'
                          : 'Waiting for competitors...'}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Analysis Details */}
        <Card className="bg-card-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Analysis Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">
                  Tier
                </span>
                <div className="font-semibold text-white capitalize mt-1">
                  {request.tier}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">
                  Category
                </span>
                <div className="font-semibold text-white capitalize mt-1">
                  {request.category?.replace('_', ' ')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">
                  Competitors
                </span>
                <div className="font-semibold text-white mt-1">
                  <span className="text-primary-500">
                    {state.competitors.length}
                  </span>{' '}
                  / {request.tier === 'free' ? 2 : 5}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase tracking-wider">
                  Reviews
                </span>
                <div className="font-semibold text-accent-400 mt-1">
                  {state.totalReviews}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}