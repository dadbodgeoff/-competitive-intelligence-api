import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Insight } from '@/types/analysis';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Lightbulb,
  Eye,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  BarChart3,
} from 'lucide-react';

interface InsightsGridProps {
  insights: Insight[];
}

interface InsightCardProps {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
}

function InsightCard({ insight, isExpanded, onToggle }: InsightCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'threat':
        return {
          bg: 'bg-destructive/5',
          border: 'border-red-500/30',
          text: 'text-destructive',
          badge: 'bg-destructive/10 text-destructive border-red-500/30',
          icon: AlertTriangle,
          hover: 'hover:border-red-500/50',
        };
      case 'opportunity':
        return {
          bg: 'bg-primary-500/5',
          border: 'border-white/10',
          text: 'text-primary-500',
          badge: 'bg-primary-500/10 text-primary-500 border-white/10',
          icon: Lightbulb,
          hover: 'hover:border-primary-500/50',
        };
      case 'watch':
        return {
          bg: 'bg-primary-500/5',
          border: 'border-primary-600/30',
          text: 'text-primary-500',
          badge: 'bg-primary-500/10 text-primary-500 border-primary-600/30',
          icon: Eye,
          hover: 'hover:border-primary-600/50',
        };
      default:
        return {
          bg: 'bg-slate-500/5',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          icon: BarChart3,
          hover: 'hover:border-slate-500/50',
        };
    }
  };

  const getConfidenceConfig = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-accent-500/10 text-accent-400 border-accent-500/30';
      case 'medium':
        return 'bg-primary-500/10 text-primary-500 border-primary-600/30';
      case 'low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const typeConfig = getTypeConfig(insight.type || insight.category);
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 bg-obsidian/50 border-white/10',
        typeConfig.hover,
        typeConfig.bg,
        typeConfig.border,
        isExpanded && 'ring-2 ring-offset-0',
        isExpanded && typeConfig.border.replace('border-', 'ring-')
      )}
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('p-2 rounded-lg', typeConfig.bg)}>
              <TypeIcon className={cn('h-4 w-4', typeConfig.text)} />
            </div>
            <CardTitle className="text-base leading-tight text-white">
              {insight.title}
            </CardTitle>
          </div>
          <Badge
            className={cn(getConfidenceConfig(insight.confidence), 'border shrink-0')}
          >
            {insight.confidence}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <CardDescription className="text-sm text-slate-400">
          {insight.description}
        </CardDescription>

        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div>
              <h4 className="font-semibold text-sm text-white mb-2">Evidence</h4>
              <blockquote
                className={cn(
                  'text-sm italic text-slate-300 p-3 rounded border-l-4',
                  typeConfig.bg,
                  typeConfig.border
                )}
              >
                "{insight.proof_quote}"
              </blockquote>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Source:{' '}
                <span className="text-slate-300">
                  {insight.competitor_name || 'Multiple Sources'}
                </span>
              </span>
              <span className={typeConfig.text}>
                {insight.mention_count} mentions
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Badge className={cn(typeConfig.badge, 'border text-xs')}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {(insight.type || insight.category).charAt(0).toUpperCase() +
              (insight.type || insight.category).slice(1)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/5"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
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
        </div>
      </CardContent>
    </Card>
  );
}

export function InsightsGrid({ insights }: InsightsGridProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'threat' | 'opportunity' | 'watch'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'mentions' | 'significance' | 'alphabetical'>('significance');

  if (insights.length === 0) {
    return (
      <Alert className="bg-slate-500/10 border-slate-500/30 text-slate-400">
        <AlertDescription>
          No insights generated for this analysis. This may happen if competitors
          have limited review data.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter and search insights
  const filteredAndSearchedInsights = insights.filter(insight => {
    const matchesFilter = filter === 'all' || (insight.type || insight.category) === filter;
    const matchesSearch = searchTerm === '' || 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.proof_quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (insight.competitor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort insights
  const sortedInsights = [...filteredAndSearchedInsights].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        const confidenceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return (confidenceOrder[b.confidence] || 0) - (confidenceOrder[a.confidence] || 0);
      case 'mentions':
        return (b.mention_count || 0) - (a.mention_count || 0);
      case 'significance':
        return (b.significance || 0) - (a.significance || 0);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const insightCounts = {
    all: insights.length,
    threat: insights.filter(i => (i.type || i.category) === 'threat').length,
    opportunity: insights.filter(i => (i.type || i.category) === 'opportunity').length,
    watch: insights.filter(i => (i.type || i.category) === 'watch').length,
  };

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search insights, descriptions, or competitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48 h-11 bg-obsidian/50 border-white/10 text-white">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-card-dark border-white/10">
              <SelectItem value="significance" className="text-white hover:bg-white/5">
                Significance
              </SelectItem>
              <SelectItem value="confidence" className="text-white hover:bg-white/5">
                Confidence
              </SelectItem>
              <SelectItem value="mentions" className="text-white hover:bg-white/5">
                Mention Count
              </SelectItem>
              <SelectItem value="alphabetical" className="text-white hover:bg-white/5">
                Alphabetical
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'threat', 'opportunity', 'watch'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
              className={cn(
                'text-xs',
                filter === type
                  ? 'bg-primary-500 hover:bg-primary-500 text-white'
                  : 'border-white/10 text-slate-300 hover:bg-white/5'
              )}
            >
              <Filter className="h-3 w-3 mr-1" />
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              <Badge
                variant="secondary"
                className="ml-2 bg-white/10 text-white border-0"
              >
                {insightCounts[type]}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Showing {sortedInsights.length} of {insights.length} insights
          </span>
        </div>
      </div>

      {sortedInsights.length === 0 ? (
        <Alert className="bg-slate-500/10 border-slate-500/30 text-slate-400">
          <AlertDescription>
            No insights found matching your search criteria. Try adjusting your
            search or filter.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedInsights.map((insight, index) => (
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
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <CardTitle className="text-base text-white">Insights Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-destructive">
                {insightCounts.threat}
              </div>
              <div className="text-sm text-slate-500 mt-1">Threats</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500">
                {insightCounts.opportunity}
              </div>
              <div className="text-sm text-slate-500 mt-1">Opportunities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500">
                {insightCounts.watch}
              </div>
              <div className="text-sm text-slate-500 mt-1">Watch Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-400">
                {insights.filter((i) => i.confidence === 'high').length}
              </div>
              <div className="text-sm text-slate-500 mt-1">High Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}