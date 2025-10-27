import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Insight, Competitor, GroupedInsight, RestaurantSource } from '@/types/analysis';
import { EnhancedInsightCard } from './EnhancedInsightCard';
import { cn } from '@/lib/utils';

interface EnhancedInsightsGridProps {
  insights: Insight[];
  competitors: Competitor[];
}

// NEW: Function to group insights by topic and extract restaurant sources
function groupInsightsByTopic(insights: Insight[]): GroupedInsight[] {
  const topicGroups: { [key: string]: Insight[] } = {};
  
  insights.forEach(insight => {
    const topicKey = `${insight.title}_${insight.category}`;
    if (!topicGroups[topicKey]) {
      topicGroups[topicKey] = [];
    }
    topicGroups[topicKey].push(insight);
  });
  
  return Object.entries(topicGroups).map(([, relatedInsights]) => {
    // Find the main insight (prefer "Multiple Sources" or first one)
    const mainInsight = relatedInsights.find(i => 
      i.competitor_name === 'Multiple Sources' || 
      i.competitor_name === null || 
      !i.competitor_name
    ) || relatedInsights[0];
    
    // Extract restaurant-specific sources
    const restaurantSources: RestaurantSource[] = relatedInsights
      .filter(i => i.competitor_name && 
                   i.competitor_name !== 'Multiple Sources' && 
                   i.competitor_name !== null)
      .map(i => ({
        name: i.competitor_name!,
        quote: i.proof_quote,
        confidence: i.confidence,
        mentions: i.mention_count
      }));
    
    return {
      mainInsight,
      relatedInsights,
      restaurantSources
    };
  });
}

interface InsightCardProps {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
}

function InsightCard({ insight, isExpanded, onToggle }: InsightCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'threat':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'opportunity':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'watch':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'threat':
        return '⚠️';
      case 'opportunity':
        return '💡';
      case 'watch':
        return '👀';
      default:
        return '📊';
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        getTypeColor(insight.type || insight.category),
        isExpanded && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(insight.type || insight.category)}</span>
            <CardTitle className="text-base leading-tight">
              {insight.title}
            </CardTitle>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getConfidenceColor(insight.confidence)} variant="outline">
              {insight.confidence}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <CardDescription className="text-sm">
          {insight.description}
        </CardDescription>

        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <h4 className="font-medium text-sm mb-1">Evidence</h4>
              <blockquote className="text-sm italic text-muted-foreground bg-background/50 p-3 rounded border-l-4 border-primary">
                "{insight.proof_quote}"
              </blockquote>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Source: {insight.competitor_name || 'Multiple Sources'}</span>
              <span>{insight.mention_count} mentions</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{insight.type || insight.category}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightSection({ 
  insights, 
  title, 
  description,
  expandedInsight,
  setExpandedInsight,
  useEnhancedCards = false,
  groupedInsights = null
}: {
  insights: Insight[];
  title: string;
  description?: string;
  expandedInsight: string | null;
  setExpandedInsight: (id: string | null) => void;
  useEnhancedCards?: boolean;
  groupedInsights?: GroupedInsight[] | null;
}) {
  const [filter, setFilter] = useState<'all' | 'threat' | 'opportunity' | 'watch'>('all');

  if (insights.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No insights found for this section.
        </AlertDescription>
      </Alert>
    );
  }

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(insight => (insight.type || insight.category) === filter);

  // NEW: Choose which insights to render
  const insightsToRender = useEnhancedCards && groupedInsights 
    ? groupedInsights.filter(gi => 
        filteredInsights.some(fi => fi.id === gi.mainInsight.id)
      )
    : null;

  const insightCounts = {
    all: insights.length,
    threat: insights.filter(i => (i.type || i.category) === 'threat').length,
    opportunity: insights.filter(i => (i.type || i.category) === 'opportunity').length,
    watch: insights.filter(i => (i.type || i.category) === 'watch').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'threat', 'opportunity', 'watch'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
              className="text-xs"
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              <Badge variant="secondary" className="ml-1 text-xs">
                {insightCounts[type]}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <Alert>
          <AlertDescription>
            No {filter} insights found. Try a different filter.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* NEW: Conditional rendering */}
          {useEnhancedCards && insightsToRender ? (
            // Render enhanced cards
            insightsToRender.map((groupedInsight, index) => (
              <EnhancedInsightCard
                key={`${groupedInsight.mainInsight.title}-${index}`}
                groupedInsight={groupedInsight}
                isExpanded={expandedInsight === `${groupedInsight.mainInsight.title}-${index}`}
                onToggle={() => 
                  setExpandedInsight(
                    expandedInsight === `${groupedInsight.mainInsight.title}-${index}` 
                      ? null 
                      : `${groupedInsight.mainInsight.title}-${index}`
                  )
                }
              />
            ))
          ) : (
            // Existing card rendering - completely unchanged
            filteredInsights.map((insight, index) => (
              <InsightCard
                key={`${insight.title}-${index}`}
                insight={insight}
                isExpanded={expandedInsight === `${insight.title}-${index}`}
                onToggle={() => 
                  setExpandedInsight(
                    expandedInsight === `${insight.title}-${index}` 
                      ? null 
                      : `${insight.title}-${index}`
                  )
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function EnhancedInsightsGrid({ insights }: EnhancedInsightsGridProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [useInlineBreakdown, setUseInlineBreakdown] = useState(false); // NEW: Feature flag

  if (insights.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No insights generated for this analysis. This may happen if competitors have limited review data.
        </AlertDescription>
      </Alert>
    );
  }

  // NEW: Add grouped insights processing (only when flag enabled)
  const groupedInsights = useInlineBreakdown 
    ? groupInsightsByTopic(insights)
    : null;

  // Group insights by competitor
  const generalInsights = insights.filter(
    insight => !insight.competitor_name || 
               insight.competitor_name === 'Multiple Sources' || 
               insight.competitor_name === null
  );

  const competitorInsights: { [key: string]: Insight[] } = {};
  
  insights.forEach(insight => {
    if (insight.competitor_name && 
        insight.competitor_name !== 'Multiple Sources' && 
        insight.competitor_name !== null) {
      if (!competitorInsights[insight.competitor_name]) {
        competitorInsights[insight.competitor_name] = [];
      }
      competitorInsights[insight.competitor_name].push(insight);
    }
  });

  const hasCompetitorSpecificInsights = Object.keys(competitorInsights).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Competitive Insights</h2>
        <Badge variant="outline">
          {insights.length} total insights
        </Badge>
      </div>

      {/* NEW: Feature toggle (temporary for testing) */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useInlineBreakdown}
            onChange={(e) => setUseInlineBreakdown(e.target.checked)}
            className="rounded"
          />
          Enable Restaurant Breakdown
        </label>
        <Badge variant={useInlineBreakdown ? "default" : "outline"} className="text-xs">
          {useInlineBreakdown ? "Enhanced" : "Standard"}
        </Badge>
      </div>

      {hasCompetitorSpecificInsights ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">
              Overview ({generalInsights.length})
            </TabsTrigger>
            <TabsTrigger value="by-competitor">
              By Competitor ({Object.keys(competitorInsights).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <InsightSection
              insights={generalInsights}
              title="Market Overview"
              description="Cross-competitor patterns and general market insights"
              expandedInsight={expandedInsight}
              setExpandedInsight={setExpandedInsight}
              useEnhancedCards={useInlineBreakdown}
              groupedInsights={groupedInsights}
            />
          </TabsContent>
          
          <TabsContent value="by-competitor" className="mt-6 space-y-8">
            {Object.entries(competitorInsights).map(([competitorName, compInsights]) => (
              <InsightSection
                key={competitorName}
                insights={compInsights}
                title={competitorName}
                description={`Specific insights about ${competitorName}`}
                expandedInsight={expandedInsight}
                setExpandedInsight={setExpandedInsight}
                useEnhancedCards={useInlineBreakdown}
                groupedInsights={groupedInsights}
              />
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        // Fallback to original layout if no competitor-specific insights
        <InsightSection
          insights={generalInsights}
          title="Market Insights"
          description="Analysis of competitive landscape"
          expandedInsight={expandedInsight}
          setExpandedInsight={setExpandedInsight}
          useEnhancedCards={useInlineBreakdown}
          groupedInsights={groupedInsights}
        />
      )}
    </div>
  );
}