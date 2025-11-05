/**
 * Saved Comparisons Page
 * Lists user's saved menu comparison reports
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { menuComparisonAPI } from '@/services/api/menuComparisonApi';
import { useToast } from '@/hooks/use-toast';
import type { SavedComparisonSummary, DeleteConfirmation } from '@/types/menuComparison';

import {
  TrendingUp,
  ArrowLeft,
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  BarChart3,
  Trash2,
  Eye,
  AlertTriangle,
  FileText,
  Archive,
} from 'lucide-react';

export function SavedComparisonsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  // Get saved comparisons
  const { data: savedComparisons, isLoading, error } = useQuery({
    queryKey: ['saved-comparisons'],
    queryFn: () => menuComparisonAPI.listSavedComparisons(1, 50),
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Archive comparison mutation
  const archiveMutation = useMutation({
    mutationFn: async (savedId: string) => {
      return menuComparisonAPI.archiveSavedComparison(savedId);
    },
    onSuccess: () => {
      toast({
        title: "Comparison Archived",
        description: "The comparison has been archived successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['saved-comparisons'] });
      setDeleteConfirmation(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Archive Failed",
        description: error instanceof Error ? error.message : 'Failed to archive comparison',
      });
    },
  });

  // Delete analysis cascade mutation
  const deleteMutation = useMutation({
    mutationFn: async (analysisId: string) => {
      return menuComparisonAPI.deleteAnalysisCascade(analysisId);
    },
    onSuccess: (result) => {
      toast({
        title: "Analysis Deleted",
        description: `Deleted analysis and ${result.deleted_counts.competitors} competitors, ${result.deleted_counts.menu_items} menu items.`,
      });
      queryClient.invalidateQueries({ queryKey: ['saved-comparisons'] });
      setDeleteConfirmation(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Failed to delete analysis',
      });
    },
  });

  const handleArchive = (comparison: SavedComparisonSummary) => {
    setDeleteConfirmation({
      type: 'saved_comparison',
      id: comparison.id,
      name: comparison.report_name || `${comparison.restaurant_name} Analysis`,
      relatedData: {
        competitors: comparison.competitors_count,
        menu_items: 0, // Not available in summary
        insights: comparison.insights_count,
      },
    });
  };

  const handleDelete = (comparison: SavedComparisonSummary) => {
    setDeleteConfirmation({
      type: 'analysis',
      id: comparison.analysis_id,
      name: comparison.report_name || `${comparison.restaurant_name} Analysis`,
      relatedData: {
        competitors: comparison.competitors_count,
        menu_items: 0, // Estimated
        insights: comparison.insights_count,
        saved_comparisons: 1,
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'saved_comparison') {
      archiveMutation.mutate(deleteConfirmation.id);
    } else {
      deleteMutation.mutate(deleteConfirmation.id);
    }
  };

  // Filter comparisons
  const filteredComparisons = savedComparisons?.data.filter((comparison: SavedComparisonSummary) =>
    searchTerm === '' ||
    comparison.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comparison.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comparison.report_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading saved comparisons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* Header */}
      <div className="relative border-b border-white/10 bg-card-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              <span className="text-xl font-bold">Restaurant CI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Saved Menu Comparisons
            </h1>
            <p className="text-slate-400">
              View and manage your competitor menu analysis reports
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/menu-comparison')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search comparisons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-obsidian/50 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400 mb-6">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>
              Failed to load saved comparisons. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && filteredComparisons.length === 0 && !searchTerm && (
          <Card className="bg-slate-500/5 border-slate-500/20">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-slate-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">No Saved Comparisons</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                You haven't saved any menu comparisons yet. Start by analyzing your competitors' menus.
              </p>
              <Button
                onClick={() => navigate('/menu-comparison')}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start First Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No search results */}
        {!isLoading && filteredComparisons.length === 0 && searchTerm && (
          <Card className="bg-slate-500/5 border-slate-500/20">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No comparisons found matching "{searchTerm}"</p>
            </CardContent>
          </Card>
        )}

        {/* Comparisons grid */}
        {filteredComparisons.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredComparisons.map((comparison: SavedComparisonSummary) => (
              <ComparisonCard
                key={comparison.id}
                comparison={comparison}
                onView={() => navigate(`/menu-comparison/${comparison.analysis_id}/results`)}
                onArchive={() => handleArchive(comparison)}
                onDelete={() => handleDelete(comparison)}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {savedComparisons?.pagination.has_next && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent className="bg-card-dark border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              {deleteConfirmation?.type === 'saved_comparison' ? 'Archive Comparison' : 'Delete Analysis'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {deleteConfirmation?.type === 'saved_comparison' 
                ? 'This will archive the saved comparison. The underlying analysis data will remain.'
                : 'This will permanently delete the entire analysis and all related data.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {deleteConfirmation && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="font-semibold text-amber-400 mb-2">
                  {deleteConfirmation.name}
                </h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <div>• {deleteConfirmation.relatedData.competitors} competitors</div>
                  <div>• {deleteConfirmation.relatedData.insights} insights</div>
                  {deleteConfirmation.type === 'analysis' && (
                    <>
                      <div>• Estimated menu items will be deleted</div>
                      <div>• All saved comparisons referencing this analysis</div>
                    </>
                  )}
                </div>
              </div>
              
              {deleteConfirmation.type === 'analysis' && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    <strong>Warning:</strong> This action cannot be undone. All competitor menu data and insights will be permanently deleted.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation(null)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={archiveMutation.isPending || deleteMutation.isPending}
              className={deleteConfirmation?.type === 'saved_comparison' 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-red-500 hover:bg-red-600"
              }
            >
              {(archiveMutation.isPending || deleteMutation.isPending) ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {deleteConfirmation?.type === 'saved_comparison' ? 'Archiving...' : 'Deleting...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {deleteConfirmation?.type === 'saved_comparison' ? (
                    <>
                      <Archive className="h-4 w-4" />
                      Archive
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Permanently
                    </>
                  )}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ComparisonCardProps {
  comparison: SavedComparisonSummary;
  onView: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function ComparisonCard({ comparison, onView, onArchive, onDelete }: ComparisonCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="bg-card-dark border-white/10 hover:border-cyan-500/30 transition-all duration-200 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg text-white leading-tight flex-1">
            {comparison.report_name || `${comparison.restaurant_name} Analysis`}
          </CardTitle>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 border text-xs">
            Saved
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin className="w-4 h-4" />
          <span>{comparison.location}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-slate-400 text-xs">Competitors</div>
              <div className="text-slate-200 font-semibold">
                {comparison.competitors_count}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            <div>
              <div className="text-slate-400 text-xs">Insights</div>
              <div className="text-cyan-400 font-semibold">
                {comparison.insights_count}
              </div>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>Created {formatDate(comparison.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onView}
            className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onArchive}
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            <Archive className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SavedComparisonsPage;