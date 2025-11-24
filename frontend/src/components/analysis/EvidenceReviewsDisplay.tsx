import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Star,
  Clock,
  User,
  Search,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  competitor_id: string;
  competitor_name?: string;
  author_name: string;
  rating: number;
  text: string;
  review_date: string;
  source: string;
  quality_score?: number;
}

interface EvidenceReviewsDisplayProps {
  analysisId?: string;
  competitors: Array<{
    competitor_id: string;
    competitor_name: string;
  }>;
}

interface ReviewCardProps {
  review: Review;
  competitorName: string;
}

function ReviewCard({ review, competitorName }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-4 w-4',
          i < rating ? 'text-primary-500 fill-current' : 'text-slate-600'
        )}
      />
    ));
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="bg-obsidian/50 border-white/10 hover:border-white/10 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold text-white">
              {competitorName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 text-slate-400">
              <User className="h-3 w-3" />
              <span className="text-xs">{review.author_name}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span className="text-xs">{formatDate(review.review_date)}</span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
            <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/30 border text-xs">
              {review.source}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            {isExpanded ? review.text : truncateText(review.text)}
          </p>

          <div className="flex items-center justify-between pt-2">
            {review.quality_score && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Quality:</span>
                <Badge className="bg-accent-500/10 text-accent-400 border-accent-500/30 border">
                  {Math.round(review.quality_score * 100)}%
                </Badge>
              </div>
            )}

            {review.text.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/5"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    More
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EvidenceReviewsDisplay({ analysisId, competitors }: EvidenceReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  useEffect(() => {
    console.log('🔍 EvidenceReviewsDisplay useEffect triggered, analysisId:', analysisId);
    
    if (!analysisId) {
      console.log('❌ No analysisId provided to EvidenceReviewsDisplay');
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Fetching reviews for analysis: ${analysisId}`);
        
        const response = await apiClient.get(`/api/v1/streaming/${analysisId}/reviews`);
        console.log(`📡 Reviews API response status: ${response.status}`);
        
        const data = response.data;
        console.log(`✅ Successfully received data with ${data.reviews?.length || 0} reviews`);
        
        // Debug: Check first review structure
        if (data.reviews && data.reviews.length > 0) {
          console.log('🔍 First review sample:', data.reviews[0]);
          console.log('🔍 competitor_name:', data.reviews[0].competitor_name);
          console.log('🔍 competitor_id:', data.reviews[0].competitor_id);
        }

        setReviews(data.reviews || []);
        console.log(`🎯 Set ${data.reviews?.length || 0} reviews in state`);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
        console.error(`❌ Error fetching reviews:`, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary-500 animate-spin" />
        <p className="text-slate-400">Loading review evidence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="bg-destructive/10 border-red-500/50 text-destructive"
      >
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Alert className="bg-slate-500/10 border-slate-500/30 text-slate-400">
        <AlertDescription>
          No review evidence available. This may happen if competitors have
          limited review data or if the analysis is still in progress.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' || 
      review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompetitor = selectedCompetitor === 'all' || 
      review.competitor_id === selectedCompetitor;
    
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === 'high' && review.rating >= 4) ||
      (ratingFilter === 'medium' && review.rating === 3) ||
      (ratingFilter === 'low' && review.rating <= 2);
    
    return matchesSearch && matchesCompetitor && matchesRating;
  });

  // Get competitor name for review
  const getCompetitorName = (review: Review) => {
    // Use competitor_name from review if available (already provided by API)
    if (review.competitor_name) {
      return review.competitor_name;
    }
    // Fallback to looking up by competitor_id
    const competitor = competitors.find(c => c.competitor_id === review.competitor_id);
    return competitor?.competitor_name || 'Unknown Competitor';
  };

  // Stats
  const reviewStats = {
    total: reviews.length,
    high: reviews.filter(r => r.rating >= 4).length,
    medium: reviews.filter(r => r.rating === 3).length,
    low: reviews.filter(r => r.rating <= 2).length,
    avgRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20"
            />
          </div>

          <Select
            value={selectedCompetitor}
            onValueChange={setSelectedCompetitor}
          >
            <SelectTrigger className="w-48 h-11 bg-obsidian/50 border-white/10 text-white">
              <SelectValue placeholder="All Competitors" />
            </SelectTrigger>
            <SelectContent className="bg-card-dark border-white/10">
              <SelectItem value="all" className="text-white hover:bg-white/5">
                All Competitors
              </SelectItem>
              {competitors.map((competitor) => (
                <SelectItem
                  key={competitor.competitor_id}
                  value={competitor.competitor_id}
                  className="text-white hover:bg-white/5"
                >
                  {competitor.competitor_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-40 h-11 bg-obsidian/50 border-white/10 text-white">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent className="bg-card-dark border-white/10">
              <SelectItem value="all" className="text-white hover:bg-white/5">
                All Ratings
              </SelectItem>
              <SelectItem value="high" className="text-white hover:bg-white/5">
                4-5 Stars
              </SelectItem>
              <SelectItem value="medium" className="text-white hover:bg-white/5">
                3 Stars
              </SelectItem>
              <SelectItem value="low" className="text-white hover:bg-white/5">
                1-2 Stars
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent-400" />
            <CardTitle className="text-base text-white">Review Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-accent-400">
                {reviewStats.total}
              </div>
              <div className="text-sm text-slate-500 mt-1">Total Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500">
                {reviewStats.high}
              </div>
              <div className="text-sm text-slate-500 mt-1">4-5 Stars</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500">
                {reviewStats.medium}
              </div>
              <div className="text-sm text-slate-500 mt-1">3 Stars</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-destructive">
                {reviewStats.low}
              </div>
              <div className="text-sm text-slate-500 mt-1">1-2 Stars</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {reviewStats.avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-slate-500 mt-1">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <Alert className="bg-slate-500/10 border-slate-500/30 text-slate-400">
          <AlertDescription>
            No reviews found matching your search criteria. Try adjusting your
            filters.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              competitorName={getCompetitorName(review)}
            />
          ))}
        </div>
      )}
    </div>
  );
}