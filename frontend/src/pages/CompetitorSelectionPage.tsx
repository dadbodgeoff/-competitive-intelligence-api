/**
 * Competitor Selection Page
 * Shows 5 discovered competitors, user selects 2 for analysis
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { menuComparisonAPI } from '@/services/api/menuComparisonApi';
import { useToast } from '@/hooks/use-toast';
import type { CompetitorInfo, SelectCompetitorsRequest } from '@/types/menuComparison';

import {
  TrendingUp,
  ArrowLeft,
  Users,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Star,
  Navigation,
  Phone,
  Globe,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeading } from '@/components/layout/PageHeading';

export function CompetitorSelectionPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);

  // Get analysis status to fetch competitors
  const { data: analysisStatus, isLoading, error } = useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => menuComparisonAPI.getAnalysisStatus(analysisId!),
    enabled: !!analysisId,
    refetchInterval: (query) => {
      // Stop polling if completed or failed
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 2000;
    },
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  // Get analysis results to get competitor details
  const { data: analysisResults } = useQuery({
    queryKey: ['analysis-results', analysisId],
    queryFn: () => menuComparisonAPI.getAnalysisResults(analysisId!),
    enabled: !!analysisId && analysisStatus?.status === 'selecting',
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (request: SelectCompetitorsRequest) => {
      // Navigate to parsing page immediately
      navigate(`/menu-comparison/${analysisId}/parse`);

      // Start the streaming analysis
      return new Promise<void>((resolve, reject) => {
        menuComparisonAPI.analyzeCompetitors(
          request,
          (event) => {
            // Events will be handled by the parsing page
            console.log('Analysis event:', event);
          },
          () => {
            resolve();
          },
          (error) => {
            reject(new Error(error));
          }
        );
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to start analysis',
      });
    },
  });

  const handleCompetitorToggle = (competitorId: string) => {
    setSelectedCompetitors((prev) => {
      if (prev.includes(competitorId)) {
        return prev.filter((id) => id !== competitorId);
      } else if (prev.length < 2) {
        return [...prev, competitorId];
      } else {
        // Replace the first selected competitor
        return [prev[1], competitorId];
      }
    });
  };

  const handleStartAnalysis = () => {
    if (selectedCompetitors.length !== 2) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select exactly 2 competitors to analyze.',
      });
      return;
    }

    const request: SelectCompetitorsRequest = {
      analysis_id: analysisId!,
      competitor_ids: selectedCompetitors as [string, string],
    };

    analyzeMutation.mutate(request);
  };

  if (isLoading) {
    return (
      <AppShell maxWidth="wide">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading competitors...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !analysisStatus) {
    return (
      <AppShell maxWidth="wide">
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-semibold mb-2">Failed to load analysis</p>
            <p className="mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button onClick={() => navigate('/menu-comparison')} className="bg-red-500 hover:bg-red-600">
              Start New Analysis
            </Button>
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const competitors = analysisResults?.competitors || [];

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/menu-comparison"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Search</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold">Restaurant CI</span>
          </Link>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <PageHeading>Select Competitors</PageHeading>
              <p className="text-slate-400 mt-1">
                Choose 2 competitors from the {competitors.length} found near {analysisStatus.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              className={`${
                selectedCompetitors.length === 2
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
              } border`}
            >
              {selectedCompetitors.length}/2 Selected
            </Badge>

            {selectedCompetitors.length === 2 && (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Ready to analyze</span>
              </div>
            )}
          </div>
        </div>

        {competitors.length === 0 ? (
          <Alert className="bg-slate-500/10 border-slate-500/30 text-slate-400">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              No competitors found. Try adjusting your search criteria or location.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((competitor) => (
              <CompetitorSelectionCard
                key={competitor.id}
                competitor={competitor}
                isSelected={selectedCompetitors.includes(competitor.id)}
                onToggle={() => handleCompetitorToggle(competitor.id)}
                disabled={!selectedCompetitors.includes(competitor.id) && selectedCompetitors.length >= 2}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/menu-comparison')}
            className="border-white/10 text-slate-300 hover:bg-white/5"
          >
            Start Over
          </Button>

          <Button
            onClick={handleStartAnalysis}
            disabled={selectedCompetitors.length !== 2 || analyzeMutation.isPending}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
          >
            {analyzeMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting Analysis...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Analyze Selected Competitors
              </span>
            )}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

interface CompetitorSelectionCardProps {
  competitor: CompetitorInfo;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function CompetitorSelectionCard({ competitor, isSelected, onToggle, disabled }: CompetitorSelectionCardProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (rating >= 4.0) return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
    if (rating >= 3.5) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-red-400 bg-red-500/15 border-red-500/30';
  };

  const formatDistance = (miles: number) => {
    if (miles < 1) {
      return `${(miles * 5280).toFixed(0)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/30'
          : disabled
          ? 'bg-slate-500/5 border-slate-500/20 opacity-50 cursor-not-allowed'
          : 'bg-card-dark border-white/10 hover:border-cyan-500/30 hover:-translate-y-1'
      }`}
      onClick={disabled ? undefined : onToggle}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg text-white leading-tight flex-1">
            {competitor.business_name}
          </CardTitle>
          
          {isSelected && (
            <div className="p-1 rounded-full bg-emerald-500">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          )}
          
          {competitor.rating && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border ${getRatingColor(competitor.rating)}`}>
              <Star className="w-3.5 h-3.5 fill-current" />
              {competitor.rating.toFixed(1)}
            </div>
          )}
        </div>

        {competitor.address && (
          <div className="flex items-start gap-2 text-sm text-slate-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{competitor.address}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {competitor.review_count && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-slate-500" />
              <div>
                <div className="text-slate-400 text-xs">Reviews</div>
                <div className="text-slate-200 font-semibold">
                  {competitor.review_count.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {competitor.distance_miles && (
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-cyan-500" />
              <div>
                <div className="text-slate-400 text-xs">Distance</div>
                <div className="text-cyan-400 font-semibold">
                  {formatDistance(competitor.distance_miles)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {competitor.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>Phone</span>
            </div>
          )}
          {competitor.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Website</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CompetitorSelectionPage;