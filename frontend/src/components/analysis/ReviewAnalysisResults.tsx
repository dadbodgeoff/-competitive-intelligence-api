import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CompetitorsTable } from './CompetitorsTable';
import { InsightsGridWrapper } from './InsightsGridWrapper';
import { ReviewEvidenceSection } from './ReviewEvidenceSection';
import { EvidenceReviewsDisplay } from './EvidenceReviewsDisplay';
import { ExportButton } from './ExportButton';
import { PageLoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { reviewAnalysisAPI } from '@/services/ReviewAnalysisAPIService';
import {
  MapPin,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
} from 'lucide-react';


interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

function StatCard({ label, value, description, icon, color = 'text-emerald-400' }: StatCardProps) {
  return (
    <Card className="bg-obsidian/50 border-white/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
          {icon && <div className="text-slate-500">{icon}</div>}
        </div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ReviewAnalysisResultsProps {
  analysisId: string;
}

export function ReviewAnalysisResults({ analysisId }: ReviewAnalysisResultsProps) {
  const navigate = useNavigate();
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis-results', analysisId],
    queryFn: () => reviewAnalysisAPI.getReviewAnalysisResults(analysisId),
    retry: 2,
  });

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="bg-red-500/10 border-red-500/50 text-red-400"
      >
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>
          <p className="font-semibold mb-2">Failed to load analysis results</p>
          <p className="mb-4">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Alert className="bg-slate-500/10 border-slate-500/30 text-slate-400">
        <AlertDescription>
          No analysis data found. The analysis may still be processing.
        </AlertDescription>
      </Alert>
    );
  }

  const highConfidenceInsights = analysis.insights.filter(i => i.confidence === 'high').length;
  const threatCount = analysis.insights.filter(i => i.type === 'threat').length;
  const opportunityCount = analysis.insights.filter(i => i.type === 'opportunity').length;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {analysis.restaurant_name}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <MapPin className="h-4 w-4" />
              <span>{analysis.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/30 border">
                {analysis.category
                  .replace('_', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 border">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/analysis/new')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
            <ExportButton analysis={analysis} />
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-white">Analysis Summary</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Completed on {new Date(analysis.completed_at).toLocaleDateString()} in{' '}
                  {analysis.processing_time_seconds}s
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Competitors Analyzed"
                value={analysis.competitors.length}
                description="Nearby restaurants"
                icon={<Users className="h-5 w-5" />}
                color="text-emerald-400"
              />
              <StatCard
                label="Total Insights"
                value={analysis.insights.length}
                description="Generated insights"
                icon={<Sparkles className="h-5 w-5" />}
                color="text-cyan-400"
              />
              <StatCard
                label="High Confidence"
                value={highConfidenceInsights}
                description="Reliable insights"
                icon={<CheckCircle2 className="h-5 w-5" />}
                color="text-emerald-400"
              />
              <StatCard
                label="Threats / Opportunities"
                value={`${threatCount} / ${opportunityCount}`}
                description="Risk vs reward"
                icon={<TrendingUp className="h-5 w-5" />}
                color={threatCount > opportunityCount ? 'text-red-400' : 'text-emerald-400'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mobile-optimized tabs */}
        <Tabs defaultValue="competitors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-obsidian/50 border border-white/10">
            <TabsTrigger
              value="competitors"
              className="text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"
            >
              <Users className="h-4 w-4 mr-2" />
              Competitors
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="text-sm data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="evidence"
              className="text-sm data-[state=active]:bg-slate-500/10 data-[state=active]:text-slate-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Evidence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="competitors" className="mt-6">
            <CompetitorsTable competitors={analysis.competitors} />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <InsightsGridWrapper
              insights={analysis.insights}
              competitors={analysis.competitors}
            />
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            {analysis.evidence_reviews ? (
              <EvidenceReviewsDisplay
                analysisId={analysisId}
                competitors={analysis.competitors.map(c => ({
                  competitor_id: c.place_id || '',
                  competitor_name: c.name || ''
                }))}
              />
            ) : (
              <ReviewEvidenceSection insights={analysis.insights} />
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
}

// Page component wrapper
export function ReviewAnalysisResultsPage() {
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

  return <ReviewAnalysisResults analysisId={analysisId} />;
}