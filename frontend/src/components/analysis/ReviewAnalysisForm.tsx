import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning, UsageCounter } from '@/components/common/UsageLimitWarning';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MapPin,
  Tag,
  AlertCircle,
} from 'lucide-react';

import { LocationAutocomplete } from './LocationAutocomplete';
import { TierSelector } from './TierSelector';
import { StreamingAnalysisResults } from './StreamingAnalysisResults';
import { reviewAnalysisAPI } from '@/services/ReviewAnalysisAPIService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/monitoring';
import { ReviewAnalysisRequest } from '@/types/analysis';
import { useState } from 'react';
import { PageLayout } from '../layout/PageLayout';

const reviewAnalysisSchema = z.object({
  restaurant_name: z.string().min(1, 'Restaurant name is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  tier: z.enum(['free', 'premium'], {
    required_error: 'Please select a tier',
  }),
});

type ReviewAnalysisFormData = z.infer<typeof reviewAnalysisSchema>;

export function ReviewAnalysisForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const form = useForm<ReviewAnalysisFormData>({
    resolver: zodResolver(reviewAnalysisSchema),
    defaultValues: {
      restaurant_name: '',
      location: '',
      category: 'restaurant',
      tier: user?.subscription_tier === 'free' ? 'free' : 'premium',
    },
  });

  const [isStreamingMode] = useState(true); // Enable streaming for better UX
  const [analysisRequest, setAnalysisRequest] = useState<ReviewAnalysisRequest | null>(null);

  // Check usage limits for both tiers
  const selectedTier = form.watch('tier');
  const operationType = selectedTier === 'premium' ? 'premium_analysis' : 'free_analysis';
  const { limit, isBlocked } = useUsageLimit(operationType);

  const createAnalysisMutation = useMutation({
    mutationFn: async (data: ReviewAnalysisFormData) => {
      console.log('🎯 FORM SUBMISSION: User submitted analysis form');
      console.log('🎯 FORM SUBMISSION: Form data:', JSON.stringify(data, null, 2));
      
      const request: ReviewAnalysisRequest = {
        ...data,
        analysis_type: 'review',
        competitor_count: data.tier === 'free' ? 2 : 5,
      };
      
      console.log('🎯 FORM SUBMISSION: Built API request:', JSON.stringify(request, null, 2));
      
      // Track analysis start
      analytics.analysisStarted({
        restaurant_name: data.restaurant_name,
        category: data.category,
        tier: data.tier,
      });
      
      if (isStreamingMode) {
        // For streaming mode, we don't call the API here
        // Instead, we set the request and let the streaming component handle it
        setAnalysisRequest(request);
        return { analysis_id: 'streaming', status: 'streaming' };
      } else {
        // Fallback to traditional API call
        console.log('🎯 FORM SUBMISSION: Using traditional API...');
        const result = await reviewAnalysisAPI.createReviewAnalysis(request);
        console.log('🎯 FORM SUBMISSION: API call completed successfully');
        return result;
      }
    },
    onSuccess: (result) => {
      if (!isStreamingMode) {
        console.log('🎉 FORM SUCCESS: Analysis creation successful!');
        toast({
          title: "Analysis Started",
          description: "Your competitor analysis is now running. You'll be redirected to track progress.",
        });
        navigate(`/analysis/${result.analysis_id}/progress`);
      }
      // For streaming mode, success is handled by the streaming component
    },
    onError: (error: any) => {
      console.error('💥 FORM ERROR: Analysis creation failed');
      console.error('💥 FORM ERROR: Error details:', error);
      
      // Check if it's a usage limit error (429)
      const isLimitError = error?.response?.status === 429 || 
                          error?.message?.includes('Usage limit') ||
                          error?.message?.includes('limit exceeded');
      
      analytics.errorOccurred('Analysis Creation Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLimitError,
      });
      
      toast({
        variant: "destructive",
        title: isLimitError ? "Usage Limit Reached" : "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to start analysis. Please try again.',
      });
    },
  });

  const onSubmit = async (data: ReviewAnalysisFormData) => {
    createAnalysisMutation.mutate(data);
  };

  // If we have an analysis request and streaming is enabled, show streaming component
  if (analysisRequest && isStreamingMode) {
    return (
      <StreamingAnalysisResults 
        request={analysisRequest}
        onComplete={(_analysisId) => {
          toast({
            title: "Analysis Complete",
            description: "Your competitor analysis is ready to view. Use the buttons below to navigate.",
          });
          // Don't auto-navigate - let user stay on streaming page to explore results
        }}
        onCancel={() => {
          setAnalysisRequest(null);
        }}
      />
    );
  }

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
    <PageLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analysis', href: '/analysis' },
        { label: 'New' },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        <Card className="bg-card-dark border-white/10 shadow-2xl">
          <CardHeader className="space-y-3 pb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Search className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  Analyze Competitors
                </CardTitle>
                <CardDescription className="text-slate-400 text-base mt-1">
                  Discover insights from competitor reviews in minutes
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Usage Limit Warning */}
            {limit && <UsageLimitWarning limit={limit} featureName={`${selectedTier} analyses`} />}

            {createAnalysisMutation.error && (
              <Alert
                variant="destructive"
                className="bg-red-500/10 border-red-500/50 text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createAnalysisMutation.error instanceof Error
                    ? createAnalysisMutation.error.message
                    : 'Analysis failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Usage Counter */}
            {limit && limit.allowed && <UsageCounter limit={limit} />}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="restaurant_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium flex items-center gap-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        Restaurant Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Park Ave Pizza"
                          className="h-12 text-base bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                          data-testid="restaurant-name"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
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
                          data-testid="location"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-400" />
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base bg-obsidian/50 border-white/10 text-white" data-testid="category">
                            <SelectValue placeholder="Select restaurant category" />
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
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium">
                        Analysis Tier
                      </FormLabel>
                      <FormControl>
                        <TierSelector
                          value={field.value}
                          onChange={field.onChange}
                          userTier={user?.subscription_tier || 'free'}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200"
                    disabled={createAnalysisMutation.isPending || isBlocked}
                  >
                    {createAnalysisMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting Analysis...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Analyze Competitors
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}