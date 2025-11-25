import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { AppShell } from '@/components/layout/AppShell';
import { ContentCard, ListContainer, EmptyState, CategoryBadge, SectionHeader } from '@/components/ui';

interface SavedAnalysis {
  id: string;
  location: string;
  category: string;
  competitor_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function SavedAnalysesPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await apiClient.get('/api/v1/analyses');
      setAnalyses(response.data);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success' as const;
      case 'processing': return 'accent' as const;
      case 'failed': return 'danger' as const;
      default: return 'default' as const;
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
    <AppShell>
      <div className="space-y-6">
        <SectionHeader
          title="Saved Analyses"
          subtitle="Review your past competitive analyses"
          size="lg"
          actions={
            <Link to="/analysis/new">
              <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-primary-500 rounded-full animate-spin" />
            <span>Loading analyses...</span>
          </div>
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="No analyses yet"
            description="Start your first competitive analysis to see it here"
            action={
              <Link to="/analysis/new">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Analysis
                </Button>
              </Link>
            }
          />
        ) : (
          <ListContainer gap="sm" animated>
            {analyses.map((analysis) => (
              <ContentCard
                key={analysis.id}
                title={analysis.location}
                description={`${analysis.competitor_count} competitors • ${formatDate(analysis.created_at)}`}
                icon={<MapPin className="h-5 w-5" />}
                badge={
                  <CategoryBadge variant={getStatusVariant(analysis.status)} size="sm">
                    {analysis.status}
                  </CategoryBadge>
                }
                onClick={() => handleAnalysisClick(analysis)}
                trailing={
                  <span className="text-xs text-slate-500 capitalize">{analysis.category}</span>
                }
              />
            ))}
          </ListContainer>
        )}
      </div>
    </AppShell>
  );
}

