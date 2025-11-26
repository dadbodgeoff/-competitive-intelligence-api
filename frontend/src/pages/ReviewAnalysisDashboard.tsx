/**
 * Review Analysis Dashboard
 * Unified entry point for competitor review analysis
 * Shows stats, recent analyses, and quick actions
 * Mirrors MenuComparisonDashboard layout
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { SectionHeader } from '@/components/ui/section-header';
import { ContentCard } from '@/components/ui/content-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatCard } from '@/components/analytics';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';

import {
  Plus,
  Search,
  Users,
  Lightbulb,
  BarChart3,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  MapPin,
  Trash2,
  Eye,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface SavedAnalysis {
  id: string;
  restaurant_name?: string;
  location: string;
  category: string;
  tier?: string;
  competitor_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  insights_generated?: number;
}

export function ReviewAnalysisDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all analyses
  const { data: analyses = [], isLoading, error } = useQuery({
    queryKey: ['user-analyses'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/analysis/analyses');
      return response.data as SavedAnalysis[];
    },
    staleTime: 30000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (analysisId: string) => {
      await apiClient.delete(`/api/v1/analysis/${analysisId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-analyses'] });
      toast({
        title: 'Analysis deleted',
        description: 'The analysis has been removed.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Could not delete the analysis.',
      });
    },
  });

  // Calculate stats
  const totalAnalyses = analyses.length;
  const totalCompetitors = analyses.reduce((sum, a) => sum + (a.competitor_count || 0), 0);
  const totalInsights = analyses.reduce((sum, a) => sum + (a.insights_generated || 0), 0);

  // Filter analyses
  const filteredAnalyses = analyses.filter((analysis) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        analysis.restaurant_name?.toLowerCase().includes(search) ||
        analysis.location?.toLowerCase().includes(search) ||
        analysis.category?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'text-success-400', bgColor: 'bg-success-400/10', borderColor: 'border-success-400/30', icon: CheckCircle2, label: 'Completed' };
      case 'processing':
        return { color: 'text-accent-400', bgColor: 'bg-accent-500/10', borderColor: 'border-accent-500/30', icon: RefreshCw, label: 'Processing' };
      case 'failed':
        return { color: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-red-500/30', icon: AlertTriangle, label: 'Failed' };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', icon: Clock, label: status };
    }
  };

  const handleAnalysisClick = (analysis: SavedAnalysis) => {
    if (analysis.status === 'completed') {
      navigate(`/analysis/${analysis.id}/results`);
    } else if (analysis.status === 'processing') {
      navigate(`/analysis/${analysis.id}/progress`);
    }
  };

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-4">
        {/* Header */}
        <ModulePageHeader
          icon={Search}
          title="Review Analysis"
          description="Discover competitive insights from customer reviews"
          actions={
            <Button
              onClick={() => navigate('/analysis/new')}
              className="bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-400 hover:to-primary-400 text-white shadow-lg shadow-accent-500/25 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Analysis
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Analyses"
            value={totalAnalyses}
            subtitle="Review analyses"
            icon={BarChart3}
            iconColor="text-accent-400"
            isLoading={isLoading}
            delay={0}
            compact
          />
          <StatCard
            title="Competitors Analyzed"
            value={totalCompetitors}
            subtitle="Reviews parsed"
            icon={Users}
            iconColor="text-primary-400"
            isLoading={isLoading}
            delay={1}
            compact
          />
          <StatCard
            title="Insights Generated"
            value={totalInsights}
            subtitle="Actionable insights"
            icon={Lightbulb}
            iconColor="text-success-400"
            isLoading={isLoading}
            delay={2}
            compact
          />
          <StatCard
            title="Avg per Analysis"
            value={totalAnalyses > 0 ? Math.round(totalInsights / totalAnalyses) : 0}
            subtitle="Insights per report"
            icon={TrendingUp}
            iconColor="text-primary-400"
            isLoading={isLoading}
            delay={3}
            compact
          />
        </div>

        {/* Quick Start Card (if no analyses) */}
        {!isLoading && analyses.length === 0 && (
          <Card className="bg-gradient-to-br from-accent-500/10 via-card-dark to-primary-500/10 border-accent-500/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-2xl bg-accent-500/20">
                  <Sparkles className="h-10 w-10 text-accent-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Start Your First Review Analysis
                  </h3>
                  <p className="text-slate-400 mb-4 max-w-lg">
                    Discover what customers are saying about your competitors. Our AI analyzes 
                    reviews to find actionable insights and competitive opportunities.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <MapPin className="h-4 w-4 text-accent-400" />
                      <span>Find nearby competitors</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Search className="h-4 w-4 text-primary-500" />
                      <span>Analyze their reviews</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Lightbulb className="h-4 w-4 text-success-400" />
                      <span>Get strategic insights</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/analysis/new')}
                  size="lg"
                  className="bg-accent-500 hover:bg-accent-400 text-white shadow-lg shadow-accent-500/25"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Start Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyses List */}
        {analyses.length > 0 && (
          <div className="space-y-4">
            <SectionHeader
              title="Your Analyses"
              subtitle={`${filteredAnalyses.length} analysis${filteredAnalyses.length !== 1 ? 'es' : ''}`}
              actions={
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search analyses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-obsidian/50 border-white/10 text-white h-9"
                  />
                </div>
              }
            />

            {/* Tabs for filtering */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-obsidian/50 border border-white/10 h-10">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-accent-500/10 data-[state=active]:text-accent-400"
                >
                  All ({analyses.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="recent" 
                  className="data-[state=active]:bg-accent-500/10 data-[state=active]:text-accent-400"
                >
                  Recent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <AnalysisList 
                  analyses={filteredAnalyses} 
                  onView={handleAnalysisClick}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  formatDate={formatDate}
                  getStatusConfig={getStatusConfig}
                  isDeleting={deleteMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="recent" className="mt-4">
                <AnalysisList 
                  analyses={filteredAnalyses.slice(0, 5)} 
                  onView={handleAnalysisClick}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  formatDate={formatDate}
                  getStatusConfig={getStatusConfig}
                  isDeleting={deleteMutation.isPending}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading your analyses...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-red-500/50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              Failed to load analyses. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppShell>
  );
}


// Analysis List Component
interface AnalysisListProps {
  analyses: SavedAnalysis[];
  onView: (analysis: SavedAnalysis) => void;
  onDelete: (analysisId: string) => void;
  formatDate: (date: string) => string;
  getStatusConfig: (status: string) => { color: string; bgColor: string; borderColor: string; icon: any; label: string };
  isDeleting: boolean;
}

function AnalysisList({ analyses, onView, onDelete, formatDate, getStatusConfig, isDeleting }: AnalysisListProps) {
  if (analyses.length === 0) {
    return (
      <Card className="bg-slate-500/5 border-slate-500/20">
        <CardContent className="p-8 text-center">
          <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No analyses found matching your search.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => {
        const statusConfig = getStatusConfig(analysis.status);
        const StatusIcon = statusConfig.icon;
        
        return (
          <ContentCard
            key={analysis.id}
            title={analysis.restaurant_name || analysis.location}
            description={analysis.location}
            icon={<BarChart3 className="h-5 w-5" />}
            badge={
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border text-xs`}>
                <StatusIcon className={`h-3 w-3 mr-1 ${analysis.status === 'processing' ? 'animate-spin' : ''}`} />
                {statusConfig.label}
              </Badge>
            }
            trailing={
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3 w-3" />
                    <span>{analysis.competitor_count} competitors</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(analysis.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {analysis.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(analysis);
                      }}
                      className="text-slate-400 hover:text-white h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(analysis.id);
                    }}
                    className="text-slate-400 hover:text-destructive h-8 w-8 p-0"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            }
            onClick={() => onView(analysis)}
            showArrow
          />
        );
      })}
    </div>
  );
}

export default ReviewAnalysisDashboard;
