import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, ThumbsDown, ThumbsUp, Minus } from 'lucide-react';
import { EvidenceReviews, EvidenceReview } from '@/types/analysis';

interface EvidenceReviewsDisplayProps {
  evidenceReviews: EvidenceReviews;
  restaurantName: string;
}

interface ReviewCardProps {
  review: EvidenceReview;
  sentiment: 'negative' | 'positive' | 'neutral';
}

function ReviewCard({ review, sentiment }: ReviewCardProps) {
  const [showFullText, setShowFullText] = useState(false);
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'negative':
        return 'border-red-200 bg-red-50';
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'neutral':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const displayText = showFullText ? review.full_text : review.text;
  const hasMoreText = review.full_text && review.full_text.length > review.text.length;

  return (
    <Card className={`${getSentimentColor(sentiment)} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSentimentIcon(sentiment)}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm font-medium ml-1">{review.rating}/5</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {review.competitor_name}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <blockquote className="text-sm leading-relaxed">
          "{displayText}"
        </blockquote>
        
        {hasMoreText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullText(!showFullText)}
            className="mt-2 h-auto p-0 text-xs text-primary hover:bg-transparent"
          >
            {showFullText ? 'Show less' : 'Show full review'}
          </Button>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{review.date}</span>
          {review.quality_score && (
            <span>Quality: {(review.quality_score * 100).toFixed(0)}%</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EvidenceReviewsDisplay({ evidenceReviews, restaurantName }: EvidenceReviewsDisplayProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  
  if (!evidenceReviews || Object.keys(evidenceReviews).length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No evidence reviews available. This analysis may have been completed before evidence tracking was implemented.
        </AlertDescription>
      </Alert>
    );
  }

  const competitors = Object.keys(evidenceReviews);
  const totalReviews = competitors.reduce((total, comp) => {
    const reviews = evidenceReviews[comp];
    return total + reviews.negative.length + reviews.positive.length + reviews.neutral.length;
  }, 0);

  const getReviewsForDisplay = () => {
    if (selectedCompetitor === 'all') {
      return evidenceReviews;
    }
    return { [selectedCompetitor]: evidenceReviews[selectedCompetitor] };
  };

  const displayReviews = getReviewsForDisplay();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Evidence Reviews</h2>
            <p className="text-sm text-muted-foreground">
              Reviews used to generate insights for {restaurantName}
            </p>
          </div>
          <Badge variant="outline">
            {totalReviews} evidence reviews
          </Badge>
        </div>

        {/* Competitor filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCompetitor === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCompetitor('all')}
          >
            All Competitors
          </Button>
          {competitors.map((competitor) => {
            const reviews = evidenceReviews[competitor];
            const count = reviews.negative.length + reviews.positive.length + reviews.neutral.length;
            return (
              <Button
                key={competitor}
                variant={selectedCompetitor === competitor ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCompetitor(competitor)}
                className="text-xs"
              >
                {competitor}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Evidence reviews by competitor */}
      <div className="space-y-8">
        {Object.entries(displayReviews).map(([competitorName, reviews]) => (
          <Card key={competitorName}>
            <CardHeader>
              <CardTitle className="text-lg">{competitorName}</CardTitle>
              <CardDescription>
                {reviews.negative.length} negative • {reviews.positive.length} positive • {reviews.neutral.length} neutral reviews
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="negative" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="negative" className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    Negative ({reviews.negative.length})
                  </TabsTrigger>
                  <TabsTrigger value="positive" className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Positive ({reviews.positive.length})
                  </TabsTrigger>
                  <TabsTrigger value="neutral" className="flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Neutral ({reviews.neutral.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="negative" className="mt-4">
                  {reviews.negative.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        No negative reviews found for this competitor.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {reviews.negative.map((review, index) => (
                        <ReviewCard
                          key={`negative-${index}`}
                          review={review}
                          sentiment="negative"
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="positive" className="mt-4">
                  {reviews.positive.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        No positive reviews found for this competitor.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {reviews.positive.map((review, index) => (
                        <ReviewCard
                          key={`positive-${index}`}
                          review={review}
                          sentiment="positive"
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="neutral" className="mt-4">
                  {reviews.neutral.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        No neutral reviews found for this competitor.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {reviews.neutral.map((review, index) => (
                        <ReviewCard
                          key={`neutral-${index}`}
                          review={review}
                          sentiment="neutral"
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {competitors.reduce((sum, comp) => sum + evidenceReviews[comp].negative.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Negative Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {competitors.reduce((sum, comp) => sum + evidenceReviews[comp].positive.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Positive Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {competitors.reduce((sum, comp) => sum + evidenceReviews[comp].neutral.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Neutral Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{competitors.length}</div>
              <div className="text-sm text-muted-foreground">Competitors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}