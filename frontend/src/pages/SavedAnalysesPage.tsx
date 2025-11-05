import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Users, Sparkles, Calendar } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { AppShell } from '@/components/layout/AppShell';

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'processing':
        return 'text-cyan-400 bg-cyan-500/10';
      case 'failed':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <AppShell>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">Saved Analyses</h1>
            <p className="text-lg text-slate-400">Review your past competitive analyses</p>
          </div>
          <Link to="/analysis/new">
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="text-slate-400 mt-4">Loading analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <Card className="bg-card-dark border-white/10">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-slate-500/10">
                  <Clock className="h-12 w-12 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">No analyses yet</h3>
                  <p className="text-slate-400 mb-6">Start your first competitive analysis to see it here</p>
                  <Link to="/analysis/new">
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <Card
                key={analysis.id}
                className="bg-card-dark border-white/10 hover:border-emerald-500/50 transition-all duration-200 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-white flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        {analysis.location}
                      </CardTitle>
                      <CardDescription className="text-slate-400 capitalize">
                        {analysis.category}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        analysis.status
                      )}`}
                    >
                      {analysis.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{analysis.competitor_count} competitors analyzed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(analysis.created_at)}</span>
                    </div>
                    {analysis.status === 'completed' && (
                      <Link to={`/analysis/${analysis.id}/results`}>
                        <Button className="w-full mt-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                          View Results
                        </Button>
                      </Link>
                    )}
                    {analysis.status === 'processing' && (
                      <Link to={`/analysis/${analysis.id}/progress`}>
                        <Button className="w-full mt-4 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 hover:from-cyan-500/20 hover:to-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                          View Progress
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </AppShell>
  );
}

