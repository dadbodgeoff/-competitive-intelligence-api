import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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


interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ReviewAnalysisResultsProps {
  analysisId: string;
}

export function ReviewAnalysisResults({ analysisId }: ReviewAnalysisResultsProps) {
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis-results', analysisId],
    queryFn: () => reviewAnalysisAPI.getReviewAnalysisResults(analysisId),
    retry: 2,
  });

  if (isLoading) return <PageLoadingSkeleton />;

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load analysis results: {error instanceof Error ? error.message : 'Unknown error'}
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>
            No analysis data found. The analysis may still be processing.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const highConfidenceInsights = analysis.insights.filter(i => i.confidence === 'high').length;
  const threatCount = analysis.insights.filter(i => i.type === 'threat').length;
  const opportunityCount = analysis.insights.filter(i => i.type === 'opportunity').length;

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{analysis.restaurant_name}</h1>
          <p className="text-muted-foreground">
            Competitive Analysis • {analysis.location}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">
              {analysis.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
            </Badge>
          </div>
        </div>
        <ExportButton analysis={analysis} />
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>
            Completed on {new Date(analysis.completed_at).toLocaleDateString()} 
            in {analysis.processing_time_seconds}s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Competitors Analyzed" 
              value={analysis.competitors.length}
              description="Nearby restaurants"
            />
            <StatCard 
              label="Total Insights" 
              value={analysis.insights.length}
              description="Generated insights"
            />
            <StatCard 
              label="High Confidence" 
              value={highConfidenceInsights}
              description="Reliable insights"
            />
            <StatCard 
              label="Threats vs Opportunities" 
              value={`${threatCount}/${opportunityCount}`}
              description="Threats / Opportunities"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile-optimized tabs */}
      <Tabs defaultValue="competitors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="competitors" className="text-sm">
            Competitors
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-sm">
            Insights
          </TabsTrigger>
          <TabsTrigger value="evidence" className="text-sm">
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
              evidenceReviews={analysis.evidence_reviews}
              restaurantName={analysis.restaurant_name}
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