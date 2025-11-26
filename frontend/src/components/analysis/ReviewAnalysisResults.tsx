import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

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
import { getReviewAnalysisResults } from '@/services/api/reviewAnalysisApi';
import {
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';


interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  iconBgColor?: string;
}

function StatCard({ label, value, icon, color = 'text-white', iconBgColor = 'bg-primary-500/10' }: StatCardProps) {
  return (
    <div className="bg-card-dark border border-white/10 rounded-lg p-3 flex items-center gap-3">
      {icon && (
        <div className={`p-2 rounded-md ${iconBgColor}`}>
          {icon}
        </div>
      )}
      <div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

interface ReviewAnalysisResultsProps {
  analysisId: string;
}

export function ReviewAnalysisResults({ analysisId }: ReviewAnalysisResultsProps) {
  const navigate = useNavigate();
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis-results', analysisId],
    queryFn: () => getReviewAnalysisResults(analysisId),
    retry: 2,
  });

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="bg-destructive/10 border-red-500/50 text-destructive"
      >
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>
          <p className="font-semibold mb-2">Failed to load analysis results</p>
          <p className="mb-4">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-destructive hover:bg-red-600"
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
    <div className="space-y-4">
        {/* Back link */}
        <button
          onClick={() => navigate('/analysis')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-white">{analysis.restaurant_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {analysis.location}
                </span>
                <Badge className="bg-slate-500/10 text-slate-300 border-0 text-[10px] px-1.5 py-0">
                  {analysis.category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
                <Badge className="bg-success-400/10 text-success-400 border-0 text-[10px] px-1.5 py-0">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  Complete
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/analysis/new')}
              size="sm"
              className="h-8 bg-primary-500 hover:bg-primary-400 text-white text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              New Analysis
            </Button>
            <ExportButton analysis={analysis} />
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Competitors"
            value={analysis.competitors.length}
            icon={<Users className="h-4 w-4 text-primary-500" />}
            iconBgColor="bg-primary-500/10"
          />
          <StatCard
            label="Insights"
            value={analysis.insights.length}
            icon={<Sparkles className="h-4 w-4 text-accent-400" />}
            iconBgColor="bg-accent-500/10"
          />
          <StatCard
            label="High Confidence"
            value={highConfidenceInsights}
            icon={<CheckCircle2 className="h-4 w-4 text-success-400" />}
            iconBgColor="bg-success-400/10"
          />
          <StatCard
            label="Threats / Opps"
            value={`${threatCount} / ${opportunityCount}`}
            icon={<TrendingUp className="h-4 w-4 text-primary-500" />}
            iconBgColor="bg-primary-500/10"
            color={threatCount > opportunityCount ? 'text-destructive' : 'text-white'}
          />
        </div>

        {/* Compact Tabs */}
        <Tabs defaultValue="competitors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9 bg-obsidian/50 border border-white/10">
            <TabsTrigger
              value="competitors"
              className="text-xs data-[state=active]:bg-primary-500/10 data-[state=active]:text-primary-500"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Competitors
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="text-xs data-[state=active]:bg-accent-500/10 data-[state=active]:text-accent-400"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Insights ({analysis.insights.length})
            </TabsTrigger>
            <TabsTrigger
              value="evidence"
              className="text-xs data-[state=active]:bg-slate-500/10 data-[state=active]:text-slate-300"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Evidence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="competitors" className="mt-4">
            <CompetitorsTable competitors={analysis.competitors} />
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <InsightsGridWrapper
              insights={analysis.insights}
              competitors={analysis.competitors}
            />
          </TabsContent>

          <TabsContent value="evidence" className="mt-4">
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