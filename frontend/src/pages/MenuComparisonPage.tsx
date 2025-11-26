/**
 * Menu Comparison Page
 * Main entry point for competitor menu comparison feature
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning, UsageCounter } from '@/components/common/UsageLimitWarning';

import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationAutocomplete } from '@/components/analysis/LocationAutocomplete';

import { menuComparisonAPI } from '@/services/api/menuComparisonApi';
import { useToast } from '@/hooks/use-toast';
import type { StartComparisonRequest, MenuComparisonState } from '@/types/menuComparison';

import {
  Search,
  MapPin,
  Tag,
  AlertCircle,
  Users,
  Menu as MenuIcon,
} from 'lucide-react';

const comparisonSchema = z.object({
  restaurant_name: z.string().min(1, 'Restaurant name is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  radius_miles: z.number().min(0.5).max(10).default(3),
});

type ComparisonFormData = z.infer<typeof comparisonSchema>;

interface MenuComparisonPageProps {
  onStateChange?: (state: MenuComparisonState) => void;
}

export function MenuComparisonPage({ onStateChange }: MenuComparisonPageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentState, setCurrentState] = useState<MenuComparisonState>({
    currentStep: 'start',
    discoveryForm: {
      restaurant_name: '',
      location: '',
      category: 'restaurant',
      radius_miles: 3,
    },
    competitors: [],
    selectedCompetitors: [],
    parseProgress: {
      progress: 0,
      message: '',
      isComplete: false,
    },
    isLoading: false,
  });

  // Check usage limit
  const { limit, isBlocked } = useUsageLimit('menu_comparison');

  const form = useForm<ComparisonFormData>({
    resolver: zodResolver(comparisonSchema),
    defaultValues: {
      restaurant_name: '',
      location: '',
      category: 'restaurant',
      radius_miles: 3,
    },
  });

  const discoverMutation = useMutation({
    mutationFn: async (data: ComparisonFormData) => {
      const request: StartComparisonRequest = {
        restaurant_name: data.restaurant_name,
        location: data.location,
        category: data.category,
        radius_miles: data.radius_miles,
      };
      
      return menuComparisonAPI.discoverCompetitors(request);
    },
    onSuccess: (result) => {
      const newState: MenuComparisonState = {
        ...currentState,
        currentStep: 'parse',
        analysisId: result.analysis_id,
        competitors: result.competitors,
        selectedCompetitors: result.selected_competitors || [],
        isLoading: false,
      };
      
      setCurrentState(newState);
      onStateChange?.(newState);
      
      toast({
        title: "Competitors Found & Selected",
        description: `Found ${result.competitors_found} competitors. Auto-selected top 2 based on reviews and ratings. Starting analysis...`,
      });
      
      // Auto-start analysis with selected competitors
      if (result.selected_competitors && result.selected_competitors.length === 2) {
        // Navigate directly to parsing/analysis page
        navigate(`/menu-comparison/${result.analysis_id}/parse`);
      }
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to find competitors';
      
      // Check if it's a usage limit error (429)
      const isLimitError = error?.response?.status === 429 || 
                          errorMessage.includes('Usage limit') ||
                          errorMessage.includes('limit exceeded');
      
      // Check if it's the "no menu" error
      if (errorMessage.includes('No active menu found') || errorMessage.includes('upload your menu')) {
        toast({
          variant: "destructive",
          title: "Menu Required",
          description: "Please upload your restaurant's menu first before comparing with competitors.",
          action: (
            <button
              onClick={() => navigate('/menu/upload')}
              className="px-3 py-2 text-sm bg-white text-slate-900 rounded hover:bg-slate-100"
            >
              Upload Menu
            </button>
          ),
        });
      } else if (isLimitError) {
        toast({
          variant: "destructive",
          title: "Usage Limit Reached",
          description: errorMessage,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Discovery Failed",
          description: errorMessage,
        });
      }
      
      setCurrentState(prev => ({ ...prev, isLoading: false, error: error.message }));
    },
  });

  const onSubmit = async (data: ComparisonFormData) => {
    setCurrentState(prev => ({ 
      ...prev, 
      isLoading: true, 
      currentStep: 'discover',
      discoveryForm: data,
      error: undefined 
    }));
    
    discoverMutation.mutate(data);
  };

  const categories = [
    'restaurant',
    'pizza',
    'burger',
    'fast_food',
    'fine_dining',
    'cafe',
    'bakery',
    'bar',
    'food_truck',
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate('/menu-comparison')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader className="space-y-3 pb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-500/10">
                <MenuIcon className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  New Competitor Analysis
                </CardTitle>
                <CardDescription className="text-slate-400 text-base mt-1">
                  Discover nearby competitors and analyze their menu pricing
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Usage Limit Warning */}
            {limit && <UsageLimitWarning limit={limit} featureName="menu comparisons" />}

            {currentState.error && (
              <Alert
                variant="destructive"
                className="bg-destructive/10 border-red-500/50 text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{currentState.error}</AlertDescription>
              </Alert>
            )}
            
            {/* Usage Counter */}
            {limit && limit.allowed && <UsageCounter limit={limit} />}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="restaurant_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium flex items-center gap-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        Your Restaurant Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Park Ave Pizza"
                          className="h-12 text-base bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <LocationAutocomplete
                          {...field}
                          placeholder="Enter address or city, state"
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200 font-medium flex items-center gap-2">
                          <Tag className="h-4 w-4 text-slate-400" />
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base bg-obsidian/50 border-white/10 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card-dark border-white/10">
                            {categories.map((category) => (
                              <SelectItem
                                key={category}
                                value={category}
                                className="text-white hover:bg-white/5"
                              >
                                {category
                                  .replace('_', ' ')
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="radius_miles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200 font-medium flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          Search Radius (miles)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0.5"
                            max="10"
                            step="0.5"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="h-12 text-base bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/25 transition-all duration-200"
                    disabled={currentState.isLoading || isBlocked}
                  >
                    {currentState.isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Finding Competitors...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Find Competitors
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Info section */}
            <div className="mt-8 p-6 bg-slate-500/5 border border-slate-500/20 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-bold">1</div>
                  <span>We'll find 5 nearby competitors in your area</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center text-xs font-bold">2</div>
                  <span>You select 2 competitors to analyze</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-bold">3</div>
                  <span>We analyze their menus and extract pricing data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-bold">4</div>
                  <span>Review competitor menus and save to your account</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default MenuComparisonPage;

