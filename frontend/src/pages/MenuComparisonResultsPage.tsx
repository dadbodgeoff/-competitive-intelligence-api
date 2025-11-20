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
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeading } from '@/components/layout/PageHeading';

import { menuComparisonAPI } from '@/services/api/menuComparisonApi';
import { useToast } from '@/hooks/use-toast';
import type { ParsedMenuItem, SaveComparisonRequest } from '@/types/menuComparison';

import {
  Save,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Star,
  Users,
  Navigation,
  DollarSign,
  Menu as MenuIcon,
  Filter,
  Search,
  Download,
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

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="bg-card-dark border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Save Competitor Analysis</DialogTitle>
            <DialogDescription className="text-slate-400">
              Save this comparison to your account for future reference
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">
                Report Name
              </label>
              <Input
                value={saveForm.report_name}
                onChange={(e) => setSaveForm((prev) => ({ ...prev, report_name: e.target.value }))}
                placeholder={`${results.restaurant_name} - Competitor Analysis`}
                className="bg-obsidian/50 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">
                Notes (Optional)
              </label>
              <Textarea
                value={saveForm.notes}
                onChange={(e) => setSaveForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this analysis..."
                className="bg-obsidian/50 border-white/10 text-white"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveModal(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {saveMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Analysis
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// Competitors overview component
function CompetitorsOverview({ competitors }: { competitors: any[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {competitors.map((competitor) => (
        <Card key={competitor.id} className="bg-card-dark border-white/10">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-lg text-white">
                {competitor.business_name}
              </CardTitle>
              {competitor.rating && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {competitor.rating.toFixed(1)}
                </div>
              )}
            </div>
            {competitor.address && (
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{competitor.address}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
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
                      {competitor.distance_miles.toFixed(1)} mi
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Menu items view component
function MenuItemsView({ 
  items, 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories 
}: {
  items: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: (string | undefined)[];
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-obsidian/50 border-white/10 text-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-obsidian/50 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu items */}
      {items.length === 0 ? (
        <Card className="bg-slate-500/5 border-slate-500/20">
          <CardContent className="p-8 text-center">
            <MenuIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No menu items found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item, index) => (
            <MenuItemCard key={`${item.competitor_name}-${index}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// Menu item card component
function MenuItemCard({ item }: { item: any }) {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">{item.item_name}</h3>
              {item.category_name && (
                <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/30 border text-xs">
                  {item.category_name}
                </Badge>
              )}
            </div>
            
            {item.description && (
              <p className="text-slate-400 text-sm mb-3">{item.description}</p>
            )}
            
            <div className="text-xs text-slate-500">
              From: {item.competitor_name}
            </div>
          </div>
          
          <div className="text-right">
            {item.size_variants && item.size_variants.length > 0 ? (
              <div className="space-y-1">
                {item.size_variants.map((variant: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="text-slate-400">{variant.size || 'Regular'}: </span>
                    <span className="text-emerald-400 font-semibold">${variant.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : item.base_price ? (
              <div className="text-lg font-semibold text-emerald-400">
                ${item.base_price.toFixed(2)}
              </div>
            ) : (
              <div className="text-slate-500 text-sm">Price not available</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Insights view component
function InsightsView({ insights }: { insights: any[] }) {
  if (insights.length === 0) {
    return (
      <Card className="bg-slate-500/5 border-slate-500/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No insights generated yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Group insights by type
  const groupedInsights = insights.reduce((acc, insight) => {
    const type = insight.insight_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(insight);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedInsights).map(([type, typeInsights]) => (
        <div key={type}>
          <h3 className="text-lg font-semibold text-white mb-4 capitalize">
            {type.replace('_', ' ')} ({(typeInsights as any[]).length})
          </h3>
          <div className="grid gap-4">
            {(typeInsights as any[]).map((insight: any) => (
              <Card key={insight.id} className="bg-card-dark border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="text-lg font-semibold text-white">{insight.title}</h4>
                    <div className="flex items-center gap-2">
                      {insight.priority >= 70 && (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/30 border">
                          High Priority
                        </Badge>
                      )}
                      <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/30 border capitalize">
                        {insight.confidence}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-4">{insight.description}</p>
                  
                  {(insight.user_item_name || insight.competitor_item_name) && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-obsidian/50 rounded-lg border border-white/5">
                      {insight.user_item_name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Your Item</div>
                          <div className="text-white font-medium">{insight.user_item_name}</div>
                          {insight.user_item_price && (
                            <div className="text-emerald-400 font-semibold">
                              ${insight.user_item_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                      {insight.competitor_item_name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            {insight.competitor_business_name || 'Competitor'}
                          </div>
                          <div className="text-white font-medium">{insight.competitor_item_name}</div>
                          {insight.competitor_item_price && (
                            <div className="text-cyan-400 font-semibold">
                              ${insight.competitor_item_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {insight.price_difference && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-400">Price Difference: </span>
                      <span className={insight.price_difference > 0 ? 'text-red-400' : 'text-green-400'}>
                        {insight.price_difference > 0 ? '+' : ''}${Math.abs(insight.price_difference).toFixed(2)}
                        {insight.price_difference_percent && (
                          <span className="ml-1">
                            ({insight.price_difference > 0 ? '+' : ''}{insight.price_difference_percent.toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  
                  {insight.evidence && insight.evidence.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="text-xs text-slate-500 mb-2">Evidence:</div>
                      <ul className="space-y-1">
                        {insight.evidence.map((item: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MenuComparisonResultsPage;