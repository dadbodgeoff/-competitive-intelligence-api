/**
 * Menu Comparison Dashboard
 * Unified entry point for competitor menu analysis
 * Shows stats, recent analyses, and quick actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

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
import { UsageLimitWarning, UsageCounter } from '@/components/common/UsageLimitWarning';
import { StatCard } from '@/components/analytics';
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { menuComparisonAPI } from '@/services/api/menuComparisonApi';
import type { SavedComparisonSummary } from '@/types/menuComparison';

import {
  Plus,
  Search,
  Menu as MenuIcon,
  Users,
  Lightbulb,
  BarChart3,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export function MenuComparisonDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Check usage limit
  const { limit, isBlocked } = useUsageLimit('menu_comparison');

  // Fetch saved comparisons
  const { data: savedData, isLoading, error } = useQuery({
    queryKey: ['saved-comparisons'],
    queryFn: () => menuComparisonAPI.listSavedComparisons(1, 50),
    staleTime: 30000,
  });

  const comparisons = savedData?.data || [];
  
  // Calculate stats
  const totalAnalyses = comparisons.length;
  const totalCompetitors = comparisons.reduce((sum, c) => sum + (c.competitors_count || 0), 0);
  const totalInsights = comparisons.reduce((sum, c) => sum + (c.insights_count || 0), 0);

  // Filter comparisons
  const filteredComparisons = comparisons.filter((comparison) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        comparison.restaurant_name?.toLowerCase().includes(search) ||
        comparison.location?.toLowerCase().includes(search) ||
        comparison.report_name?.toLowerCase().includes(search)
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

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-4">
        {/* Header */}
        <ModulePageHeader
          icon={MenuIcon}
          title="Menu Comparison"
          description="Discover competitors, analyze their menus, and find pricing opportunities"
          actions={
            <Button
              onClick={() => navigate('/menu-comparison/new')}
              disabled={isBlocked}
              className="bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-400 hover:to-primary-400 text-white shadow-lg shadow-accent-500/25 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Analysis
            </Button>
          }
        />

        {/* Usage Limit Warning */}
        {limit && <UsageLimitWarning limit={limit} featureName="menu comparisons" />}

        {/* Stats Cards - Enterprise Standard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Analyses"
            value={totalAnalyses}
            subtitle="Competitor comparisons"
            icon={BarChart3}
            iconColor="text-accent-400"
            isLoading={isLoading}
            delay={0}
            compact
          />
          <StatCard
            title="Competitors Analyzed"
            value={totalCompetitors}
            subtitle="Menus parsed"
            icon={Users}
            iconColor="text-primary-400"
            isLoading={isLoading}
            delay={1}
            compact
          />
          <StatCard
            title="Insights Generated"
            value={totalInsights}
            subtitle="Pricing opportunities"
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

        {/* Usage Counter */}
        {limit && limit.allowed && <UsageCounter limit={limit} />}

        {/* Quick Start Card (if no analyses) */}
        {!isLoading && comparisons.length === 0 && (
          <Card className="bg-gradient-to-br from-accent-500/10 via-card-dark to-primary-500/10 border-accent-500/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-2xl bg-accent-500/20">
                  <Sparkles className="h-10 w-10 text-accent-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Start Your First Competitor Analysis
                  </h3>
                  <p className="text-slate-400 mb-4 max-w-lg">
                    Discover what your competitors are charging, find pricing gaps, and identify 
                    opportunities to optimize your menu. Our AI analyzes competitor menus in minutes.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Search className="h-4 w-4 text-accent-400" />
                      <span>Find 5 competitors</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <MenuIcon className="h-4 w-4 text-primary-500" />
                      <span>Parse their menus</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Lightbulb className="h-4 w-4 text-success-400" />
                      <span>Get pricing insights</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/menu-comparison/new')}
                  disabled={isBlocked}
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
        {comparisons.length > 0 && (
          <div className="space-y-4">
            <SectionHeader
              title="Your Analyses"
              subtitle={`${filteredComparisons.length} comparison${filteredComparisons.length !== 1 ? 's' : ''}`}
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
                  All ({comparisons.length})
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
                  comparisons={filteredComparisons} 
                  onView={(id) => navigate(`/menu-comparison/${id}/results`)}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="recent" className="mt-4">
                <AnalysisList 
                  comparisons={filteredComparisons.slice(0, 5)} 
                  onView={(id) => navigate(`/menu-comparison/${id}/results`)}
                  formatDate={formatDate}
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
  comparisons: SavedComparisonSummary[];
  onView: (analysisId: string) => void;
  formatDate: (date: string) => string;
}

function AnalysisList({ comparisons, onView, formatDate }: AnalysisListProps) {
  if (comparisons.length === 0) {
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
      {comparisons.map((comparison) => (
        <ContentCard
          key={comparison.id}
          title={comparison.report_name || `${comparison.restaurant_name} Analysis`}
          description={comparison.location}
          icon={<BarChart3 className="h-5 w-5" />}
          badge={
            <Badge className="bg-accent-500/10 text-accent-400 border-accent-500/30 border text-xs">
              {comparison.insights_count} insights
            </Badge>
          }
          trailing={
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="h-3 w-3" />
                  <span>{comparison.competitors_count} competitors</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(comparison.created_at)}</span>
                </div>
              </div>
            </div>
          }
          onClick={() => onView(comparison.analysis_id)}
          showArrow
        />
      ))}
    </div>
  );
}

export default MenuComparisonDashboard;



