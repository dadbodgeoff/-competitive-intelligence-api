/**
 * Menu Comparison Results Page
 * Shows parsed competitor menus and allows user to save comparison
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeading } from '@/components/layout/PageHeading';
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
      navigate('/menu-comparison/saved');
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
            <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading results...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !results) {
    return (
      <AppShell maxWidth="wide">
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-semibold mb-2">Failed to load results</p>
            <p className="mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button onClick={() => navigate('/menu-comparison')} className="bg-red-500 hover:bg-red-600">
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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <PageHeading className="mb-2">{results.restaurant_name}</PageHeading>
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <MapPin className="h-4 w-4" />
              <span>{results.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 border">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Analysis Complete
              </Badge>
              <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/30 border">
                {results.competitors.length} Competitors
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowSaveModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
            >
              <Save className="h-4 w-4 mr-2" />
              Save to Account
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card-dark border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {results.competitors.length}
                  </div>
                  <div className="text-sm text-slate-400">Competitors Analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-dark border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <MenuIcon className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{allMenuItems.length}</div>
                  <div className="text-sm text-slate-400">Menu Items Found</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-dark border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <DollarSign className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {categories.length - 1}
                  </div>
                  <div className="text-sm text-slate-400">Menu Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-obsidian/50 border border-white/10">
            <TabsTrigger
              value="insights"
              className="text-sm data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Insights ({results.total_insights})
            </TabsTrigger>
            <TabsTrigger
              value="competitors"
              className="text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"
            >
              <Users className="h-4 w-4 mr-2" />
              Competitors
            </TabsTrigger>
            <TabsTrigger
              value="menus"
              className="text-sm data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"
            >
              <MenuIcon className="h-4 w-4 mr-2" />
              Menu Items ({allMenuItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-6">
            <InsightsView insights={results.insights} />
          </TabsContent>

          <TabsContent value="competitors" className="mt-6">
            <CompetitorsOverview competitors={results.competitors} />
          </TabsContent>

          <TabsContent value="menus" className="mt-6">
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