import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { LocationAutocomplete } from './LocationAutocomplete';
import { TierSelector } from './TierSelector';
import { reviewAnalysisAPI } from '@/services/ReviewAnalysisAPIService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/monitoring';
import { ReviewAnalysisRequest } from '@/types/analysis';

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
      console.log('🎯 FORM SUBMISSION: Calling API service...');
      
      // Track analysis start
      analytics.analysisStarted({
        restaurant_name: data.restaurant_name,
        category: data.category,
        tier: data.tier,
      });
      
      const result = await reviewAnalysisAPI.createReviewAnalysis(request);
      console.log('🎯 FORM SUBMISSION: API call completed successfully');
      console.log('🎯 FORM SUBMISSION: Final result:', JSON.stringify(result, null, 2));
      
      return result;
    },
    onSuccess: (result) => {
      console.log('🎉 FORM SUCCESS: Analysis creation successful!');
      console.log('🎉 FORM SUCCESS: Result received:', JSON.stringify(result, null, 2));
      console.log('🎉 FORM SUCCESS: Analysis ID:', result.analysis_id);
      console.log('🎉 FORM SUCCESS: Status:', result.status);
      console.log('🎉 FORM SUCCESS: Navigating to progress page...');
      
      toast({
        title: "Analysis Started",
        description: "Your competitor analysis is now running. You'll be redirected to track progress.",
      });
      navigate(`/analysis/${result.analysis_id}/progress`);
    },
    onError: (error) => {
      console.error('💥 FORM ERROR: Analysis creation failed');
      console.error('💥 FORM ERROR: Error details:', error);
      console.error('💥 FORM ERROR: Error type:', typeof error);
      console.error('💥 FORM ERROR: Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      analytics.errorOccurred('Analysis Creation Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to start analysis. Please try again.',
      });
    },
  });

  const onSubmit = async (data: ReviewAnalysisFormData) => {
    createAnalysisMutation.mutate(data);
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
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Analyze Competitors</CardTitle>
          <CardDescription>
            Enter your restaurant details to discover competitor insights from reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {createAnalysisMutation.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {createAnalysisMutation.error instanceof Error 
                  ? createAnalysisMutation.error.message 
                  : 'Analysis failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="restaurant_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Park Ave Pizza"
                        className="h-12 text-base" // Mobile-optimized
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <LocationAutocomplete
                        {...field}
                        placeholder="Enter address or city, state"
                        className="h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select restaurant category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analysis Tier</FormLabel>
                    <FormControl>
                      <TierSelector
                        value={field.value}
                        onChange={field.onChange}
                        userTier={user?.subscription_tier || 'free'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={createAnalysisMutation.isPending}
                >
                  {createAnalysisMutation.isPending 
                    ? 'Starting Analysis...' 
                    : 'Analyze Competitors'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}