import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GroupedInsight } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface EnhancedInsightCardProps {
  groupedInsight: GroupedInsight;
  isExpanded: boolean;
  onToggle: () => void;
}

export function EnhancedInsightCard({ groupedInsight, isExpanded, onToggle }: EnhancedInsightCardProps) {
  const { mainInsight, restaurantSources } = groupedInsight;
  const [showSources, setShowSources] = useState(false);

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
        getTypeColor(mainInsight.type || mainInsight.category),
        isExpanded && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(mainInsight.type || mainInsight.category)}</span>
            <CardTitle className="text-base leading-tight">
              {mainInsight.title}
            </CardTitle>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getConfidenceColor(mainInsight.confidence)} variant="outline">
              {mainInsight.confidence}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <CardDescription className="text-sm">
          {mainInsight.description}
        </CardDescription>

        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <h4 className="font-medium text-sm mb-1">Evidence</h4>
              <blockquote className="text-sm italic text-muted-foreground bg-background/50 p-3 rounded border-l-4 border-primary">
                "{mainInsight.proof_quote}"
              </blockquote>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Source: {mainInsight.competitor_name || 'Multiple Sources'}</span>
              <span>{mainInsight.mention_count} mentions</span>
            </div>
          </div>
        )}

        {/* NEW: Restaurant Sources Section */}
        {restaurantSources.length > 0 && (
          <div className="mt-3 border-t pt-3" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              className="text-xs h-6 px-2"
            >
              {showSources ? 'Hide' : 'Show'} Restaurant Sources ({restaurantSources.length})
            </Button>
            
            {showSources && (
              <div className="mt-2 space-y-2">
                {restaurantSources.map((source, idx) => (
                  <div key={idx} className="bg-muted/30 p-2 rounded text-xs border-l-2 border-primary/30">
                    <div className="font-medium text-foreground mb-1">{source.name}</div>
                    <div className="italic text-muted-foreground mb-2">"{source.quote}"</div>
                    <div className="flex justify-between items-center">
                      <Badge 
                        className={cn("text-xs", getConfidenceColor(source.confidence))}
                        variant="outline"
                      >
                        {source.confidence}
                      </Badge>
                      <span className="text-muted-foreground">{source.mentions} mentions</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{mainInsight.type || mainInsight.category}</span>
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