import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Insight } from '@/types/analysis';

interface ReviewEvidenceSectionProps {
  insights: Insight[];
}

interface EvidenceCardProps {
  insight: Insight;
}

function EvidenceCard({ insight }: EvidenceCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'threat':
        return 'bg-red-100 text-red-800';
      case 'opportunity':
        return 'bg-green-100 text-green-800';
      case 'watch':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {insight.title}
          </CardTitle>
          <div className="flex gap-1">
            <Badge className={getTypeColor(insight.type || insight.category)} variant="outline">
              {insight.type || insight.category}
            </Badge>
            <Badge className={getConfidenceColor(insight.confidence)} variant="outline">
              {insight.confidence}
            </Badge>
          </div>
        </div>
        <CardDescription>
          From {insight.competitor_name || 'Multiple Sources'} • {insight.mention_count} mentions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <blockquote className="text-sm italic text-muted-foreground bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
          "{insight.proof_quote}"
        </blockquote>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <p className="mb-1"><strong>Insight:</strong> {insight.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewEvidenceSection({ insights }: ReviewEvidenceSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'threat' | 'opportunity' | 'watch'>('all');

  if (insights.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No review evidence available. This may happen if competitors have limited review data.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter insights based on search and type
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = searchTerm === '' || 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.proof_quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (insight.competitor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || insight.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const evidenceCounts = {
    all: insights.length,
    threat: insights.filter(i => i.type === 'threat').length,
    opportunity: insights.filter(i => i.type === 'opportunity').length,
    watch: insights.filter(i => i.type === 'watch').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Review Evidence</h2>
          <Badge variant="outline">
            {filteredInsights.length} of {insights.length} insights
          </Badge>
        </div>

        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search insights, quotes, or competitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'threat', 'opportunity', 'watch'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className="text-xs"
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {evidenceCounts[type]}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <Alert>
          <AlertDescription>
            No evidence found matching your search criteria. Try adjusting your search or filter.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredInsights.map((insight, index) => (
            <EvidenceCard
              key={`${insight.title}-${index}`}
              insight={insight}
            />
          ))}
        </div>
      )}

      {/* Summary stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{evidenceCounts.threat}</div>
              <div className="text-sm text-muted-foreground">Threats</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{evidenceCounts.opportunity}</div>
              <div className="text-sm text-muted-foreground">Opportunities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{evidenceCounts.watch}</div>
              <div className="text-sm text-muted-foreground">Watch Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {insights.filter(i => i.confidence === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}