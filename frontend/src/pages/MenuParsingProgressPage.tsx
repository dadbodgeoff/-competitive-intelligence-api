/**
 * Menu Parsing Progress Page
 * Shows real-time progress of competitor menu parsing
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeading } from '@/components/layout/PageHeading';

import { menuComparisonAPI } from '@/services/api/menuComparisonApi';
import { useToast } from '@/hooks/use-toast';
// Types imported inline where needed

import {
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { SuccessAnimation } from '@/components/streaming/SuccessAnimation';

// Milestone configuration for menu parsing
const MENU_MILESTONES = [
  { progress: 0, label: 'Initializing', icon: '🚀' },
  { progress: 25, label: 'Fetching competitor 1', icon: '🍽️' },
  { progress: 50, label: 'Fetching competitor 2', icon: '🍔' },
  { progress: 75, label: 'Analyzing differences', icon: '📊' },
  { progress: 100, label: 'Insights ready', icon: '💡' },
];

const CONTEXT_STEPS = [
  '• Accessing competitor website and menu pages',
  '• Extracting menu items, descriptions, and pricing',
  '• Organizing data by categories and sizes',
  '• Generating comparison insights',
];

interface ParseStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message?: string;
  progress?: number;
  duration?: number;
}

export function MenuParsingProgressPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [steps, setSteps] = useState<ParseStep[]>([
    { id: 'setup', label: 'Initializing analysis', status: 'pending' },
    { id: 'competitor1', label: 'Parsing first competitor menu', status: 'pending' },
    { id: 'competitor2', label: 'Parsing second competitor menu', status: 'pending' },
    { id: 'complete', label: 'Analysis complete', status: 'pending' },
  ]);
  
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Starting analysis...');
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showLongWait, setShowLongWait] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Find current milestone based on progress
  const currentMilestone = MENU_MILESTONES.reduce((prev, curr) =>
    overallProgress >= curr.progress ? curr : prev
  );

  // Show "taking longer than expected" after 45 seconds
  useEffect(() => {
    if (!isComplete && !hasError && elapsedTime > 45000) {
      setShowLongWait(true);
    }
  }, [elapsedTime, isComplete, hasError]);

  // Poll analysis status
  const { data: analysisStatus } = useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => menuComparisonAPI.getAnalysisStatus(analysisId!),
    enabled: !!analysisId && !isComplete && !hasError,
    refetchInterval: (query) => {
      // Stop polling when complete
      if (query.state.data?.status === 'completed') {
        return false;
      }
      return 2000;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Handle status updates
  useEffect(() => {
    if (!analysisStatus) return;

    if (analysisStatus.status === 'completed') {
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
      setOverallProgress(100);
      setCurrentMessage('Analysis complete! Redirecting to results...');
      setIsComplete(true);
      setShowSuccess(true);
      
      // Redirect to results after success animation
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/menu-comparison/${analysisId}/results`);
      }, 2500);
    } else if (analysisStatus.status === 'failed') {
      setHasError(true);
      setCurrentMessage(analysisStatus.error_message || 'Analysis failed');
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: analysisStatus.error_message || 'Unknown error occurred',
      });
    } else if (analysisStatus.status === 'analyzing') {
      // Update progress based on current step
      setCurrentMessage(analysisStatus.current_step || 'Processing...');
      
      // Simulate progress based on step
      if (analysisStatus.current_step?.includes('first competitor')) {
        setSteps(prev => prev.map(step => 
          step.id === 'setup' ? { ...step, status: 'complete' } :
          step.id === 'competitor1' ? { ...step, status: 'active', message: analysisStatus.current_step } :
          step
        ));
        setOverallProgress(25);
      } else if (analysisStatus.current_step?.includes('second competitor')) {
        setSteps(prev => prev.map(step => 
          step.id === 'setup' ? { ...step, status: 'complete' } :
          step.id === 'competitor1' ? { ...step, status: 'complete' } :
          step.id === 'competitor2' ? { ...step, status: 'active', message: analysisStatus.current_step } :
          step
        ));
        setOverallProgress(75);
      }
    }
  }, [analysisStatus, analysisId, navigate]);

  // Start streaming analysis when page loads
  useEffect(() => {
    if (!analysisId || isComplete || hasError) return;

    console.log('Starting streaming analysis for:', analysisId);
    
    // Get the analysis to find selected competitors
    menuComparisonAPI.getAnalysisStatus(analysisId).then(async (status) => {
      if (status.status === 'selecting' && status.competitors_selected === 2) {
        // Get the full analysis to find competitor IDs
        const results = await menuComparisonAPI.getAnalysisResults(analysisId);
        const selectedCompetitorIds = results.competitors
          .filter(c => c.is_selected)
          .map(c => c.id);
        
        if (selectedCompetitorIds.length === 2) {
          console.log('Starting analysis with competitors:', selectedCompetitorIds);
          
          // Start the streaming analysis
          menuComparisonAPI.analyzeCompetitors(
            {
              analysis_id: analysisId,
              competitor_ids: selectedCompetitorIds as [string, string],
            },
            (event) => {
              console.log('Analysis event:', event);
              
              // Update UI based on event
              if (event.type === 'parsing_competitor_menu') {
                setCurrentMessage(event.data.message || 'Parsing competitor menu...');
              } else if (event.type === 'competitor_menu_parsed') {
                setCurrentMessage(`Parsed ${event.data.competitor_name}: ${event.data.items_found} items found`);
              } else if (event.type === 'llm_analysis_started') {
                setCurrentMessage('Generating comparison insights...');
              }
            },
            () => {
              console.log('Analysis complete');
              setIsComplete(true);
            },
            (error) => {
              console.error('Analysis error:', error);
              setHasError(true);
              setCurrentMessage(error);
            }
          ).catch(error => {
            console.error('Failed to start streaming:', error);
            setHasError(true);
            setCurrentMessage(error.message || 'Failed to start analysis');
          });
        }
      } else if (status.status === 'analyzing') {
        console.log('Analysis already in progress');
      } else if (status.status === 'completed') {
        setIsComplete(true);
        navigate(`/menu-comparison/${analysisId}/results`);
      }
    }).catch(error => {
      console.error('Failed to get analysis status:', error);
      setHasError(true);
      setCurrentMessage(error.message || 'Failed to start analysis');
    });
  }, [analysisId, isComplete, hasError, navigate]);

  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const getStepIcon = (status: ParseStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-primary-500" />;
      case 'active':
        return <Loader2 className="h-5 w-5 text-accent-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-slate-500" />;
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-obsidian">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="bg-card-dark border-red-500/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Analysis Failed</h3>
                  <p className="text-sm text-red-400 mt-1">{currentMessage}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(`/menu-comparison/${analysisId}/select`)}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/menu-comparison')}
                  className="border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        message="Menu analysis complete!"
        count={2}
        countLabel="competitors analyzed"
        icon="🍽️"
      />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />

      {/* Header */}
      <div className="relative border-b border-white/10 bg-card-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              to={`/menu-comparison/${analysisId}/select`}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Selection</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-white hover:text-primary-500 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold">RestaurantIQ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with milestone emoji */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <span className="text-5xl">{currentMilestone.icon}</span>
              <div className="absolute -inset-2 bg-accent-500/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div className="text-left">
              <PageHeading>{currentMilestone.label}</PageHeading>
              <p className="text-slate-400 mt-1">
                {overallProgress}% complete • {formatElapsedTime(elapsedTime)}
              </p>
            </div>
          </div>

          {/* Overall progress with milestone markers */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="relative h-3 bg-card-dark rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-500 to-primary-500 transition-all duration-500 ease-out"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            {/* Milestone indicators */}
            <div className="flex justify-between text-xs text-slate-500">
              {MENU_MILESTONES.map((milestone) => (
                <div
                  key={milestone.progress}
                  className={`transition-colors duration-300 ${
                    overallProgress >= milestone.progress ? 'text-primary-500 font-semibold' : ''
                  }`}
                >
                  {milestone.progress}%
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <Card className="bg-card-dark border-white/10 shadow-2xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Analysis Progress</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  {currentMessage}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatElapsedTime(elapsedTime)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        step.status === 'complete' ? 'text-primary-500' :
                        step.status === 'active' ? 'text-accent-400' :
                        step.status === 'error' ? 'text-destructive' :
                        'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                      
                      {step.status === 'complete' && (
                        <Badge className="bg-primary-500/10 text-primary-500 border-white/10 border text-xs">
                          Complete
                        </Badge>
                      )}
                      
                      {step.status === 'active' && (
                        <Badge className="bg-accent-500/10 text-accent-400 border-accent-500/30 border text-xs">
                          Processing
                        </Badge>
                      )}
                    </div>
                    
                    {step.message && (
                      <p className="text-sm text-slate-500 mt-1">{step.message}</p>
                    )}
                  </div>
                  
                  {step.duration && (
                    <div className="text-xs text-slate-500">
                      {step.duration.toFixed(1)}s
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Long wait warning */}
        {showLongWait && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-400">
              ⏳ This is taking longer than expected. Menu parsing can take up to 2 minutes for complex menus. Please wait...
            </p>
          </div>
        )}

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-500/5 border-slate-500/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-500" />
                <CardTitle className="text-lg text-white">What We're Doing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-400">
              {CONTEXT_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                    i % 2 === 0 ? 'bg-primary-400' : 'bg-accent-400'
                  }`} />
                  <span>{step.replace('• ', '')}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-500/5 border-slate-500/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent-400" />
                <CardTitle className="text-lg text-white">Next Steps</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                <span>Review competitor menu items and pricing</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-2 flex-shrink-0" />
                <span>Compare against your menu structure</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                <span>Identify pricing gaps and opportunities</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                <span>Save comparison report to your account</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cancel button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/menu-comparison')}
            className="border-white/10 text-slate-300 hover:bg-white/5"
          >
            Cancel Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MenuParsingProgressPage;