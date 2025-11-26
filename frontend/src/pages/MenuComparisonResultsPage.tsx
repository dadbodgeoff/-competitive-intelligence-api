/**
 * Menu Comparison Results Page
 * Shows parsed competitor menus and allows user to save comparison
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppShell } from '@/components/layout/AppShell';
import { InsightsView } from '@/components/menu-comparison/InsightsView';
import { CompetitorsOverview } from '@/components/menu-comparison/CompetitorsOverview';
import { MenuItemsView } from '@/components/menu-comparison/MenuItemsView';
import { SaveComparisonDialog } from '@/components/menu-comparison/SaveComparisonDialog';

import { menuComparisonAPI } from '@/services/api/menuComparisonApi';
import { useToast } from '@/hooks/use-toast';
import type { ParsedMenuItem, SaveComparisonRequest } from '@/types/menuComparison';

import {
  Save,
  AlertCircle,
  CheckCircle2,
  MapPin,
  DollarSign,
  Menu as MenuIcon,
  Download,
  Users,
} from 'lucide-react';

export function MenuComparisonResultsPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({
    report_name: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get analysis results
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['analysis-results', analysisId],
    queryFn: () => menuComparisonAPI.getAnalysisResults(analysisId!),
    enabled: !!analysisId,
    refetchOnMount: 'always',  // Always fetch fresh data on mount
    refetchOnWindowFocus: true,
    staleTime: 0,  // Don't cache - always fetch fresh
  });

  // Save comparison mutation
  const saveMutation = useMutation({
    mutationFn: async (request: SaveComparisonRequest) => {
      return menuComparisonAPI.saveComparison(request);
    },
    onSuccess: () => {
      toast({
        title: "Comparison Saved",
        description: "Your competitor menu comparison has been saved to your account.",
      });
      setShowSaveModal(false);
      navigate('/menu-comparison');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save comparison',
      });
    },
  });

  const handleSave = () => {
    if (!results) return;

    const request: SaveComparisonRequest = {
      analysis_id: analysisId!,
      report_name: saveForm.report_name || `${results.restaurant_name} - Competitor Analysis`,
      notes: saveForm.notes,
    };

    saveMutation.mutate(request);
  };

  if (isLoading) {
    return (
      <AppShell maxWidth="wide">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading results...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !results) {
    return (
      <AppShell maxWidth="wide">
        <Alert variant="destructive" className="bg-destructive/10 border-red-500/50 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-semibold mb-2">Failed to load results</p>
            <p className="mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button onClick={() => navigate('/menu-comparison')} className="bg-destructive hover:bg-red-600">
              Start New Analysis
            </Button>
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  // Get all menu items from competitors
  const allMenuItems: (ParsedMenuItem & { competitor_name: string })[] = [];
  
  // Flatten menu items from all competitors
  results.competitors.forEach(competitor => {
    if (competitor.menu_items && competitor.menu_items.length > 0) {
      competitor.menu_items.forEach(item => {
        allMenuItems.push({
          ...item,
          competitor_name: competitor.business_name
        });
      });
    }
  });
  
  // Get unique categories
  const categories = ['all', ...new Set(allMenuItems.map(item => item.category_name).filter(Boolean))];

  // Filter items
  const filteredItems = allMenuItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category_name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-4">
        {/* Back link */}
        <button
          onClick={() => navigate('/menu-comparison')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
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
              <h1 className="text-xl font-semibold text-white">{results.restaurant_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {results.location}
                </span>
                <Badge className="bg-success-400/10 text-success-400 border-0 text-[10px] px-1.5 py-0">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  Complete
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 border-white/10 text-slate-300 hover:bg-white/5 text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button
              onClick={() => setShowSaveModal(true)}
              size="sm"
              className="h-8 bg-primary-500 hover:bg-primary-400 text-white text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save
            </Button>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card-dark border border-white/10 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary-500/10">
              <Users className="h-4 w-4 text-primary-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{results.competitors.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Competitors</div>
            </div>
          </div>

          <div className="bg-card-dark border border-white/10 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-md bg-accent-500/10">
              <MenuIcon className="h-4 w-4 text-accent-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{allMenuItems.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Menu Items</div>
            </div>
          </div>

          <div className="bg-card-dark border border-white/10 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary-500/10">
              <DollarSign className="h-4 w-4 text-primary-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{categories.length - 1}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Categories</div>
            </div>
          </div>

          <div className="bg-card-dark border border-white/10 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-md bg-success-400/10">
              <AlertCircle className="h-4 w-4 text-success-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{results.total_insights}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Insights</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9 bg-obsidian/50 border border-white/10">
            <TabsTrigger
              value="insights"
              className="text-xs data-[state=active]:bg-primary-500/10 data-[state=active]:text-primary-500"
            >
              <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
              Insights ({results.total_insights})
            </TabsTrigger>
            <TabsTrigger
              value="competitors"
              className="text-xs data-[state=active]:bg-primary-500/10 data-[state=active]:text-primary-500"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Competitors
            </TabsTrigger>
            <TabsTrigger
              value="menus"
              className="text-xs data-[state=active]:bg-accent-500/10 data-[state=active]:text-accent-400"
            >
              <MenuIcon className="h-3.5 w-3.5 mr-1.5" />
              Menu Items ({allMenuItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-4">
            <InsightsView insights={results.insights} />
          </TabsContent>

          <TabsContent value="competitors" className="mt-4">
            <CompetitorsOverview competitors={results.competitors} />
          </TabsContent>

          <TabsContent value="menus" className="mt-4">
            <MenuItemsView
              items={filteredItems}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
            />
          </TabsContent>
        </Tabs>
      </div>

      <SaveComparisonDialog
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        form={saveForm}
        onChange={(updates) => setSaveForm((prev) => ({ ...prev, ...updates }))}
        defaultReportName={`${results.restaurant_name} - Competitor Analysis`}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </AppShell>
  );
}

export default MenuComparisonResultsPage;