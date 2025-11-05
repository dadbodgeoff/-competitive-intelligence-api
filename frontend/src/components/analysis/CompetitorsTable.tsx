import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Competitor } from '@/types/analysis';
import { Star, MapPin, MessageSquare, Navigation, Eye } from 'lucide-react';

interface CompetitorsTableProps {
  competitors: Competitor[];
}

export function CompetitorsTable({ competitors }: CompetitorsTableProps) {
  const getRatingConfig = (rating: number) => {
    if (rating >= 4.5)
      return {
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        textColor: 'text-emerald-400',
      };
    if (rating >= 4.0)
      return {
        color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        textColor: 'text-cyan-400',
      };
    if (rating >= 3.5)
      return {
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        textColor: 'text-amber-400',
      };
    return {
      color: 'bg-red-500/10 text-red-400 border-red-500/30',
      textColor: 'text-red-400',
    };
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    }
    return `${distance.toFixed(1)} mi`;
  };

  if (competitors.length === 0) {
    return (
      <Card className="bg-obsidian/50 border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">No competitors found in the analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile-optimized card layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {competitors.map((competitor, index) => {
          const ratingConfig = getRatingConfig(competitor.rating);
          return (
            <Card
              key={
                competitor.competitor_id ||
                competitor.place_id ||
                competitor.id ||
                index
              }
              className="bg-obsidian/50 border-white/10 hover:border-emerald-500/30 transition-all duration-200 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-tight text-white group-hover:text-emerald-400 transition-colors">
                    {competitor.competitor_name ||
                      competitor.name ||
                      'Unknown Restaurant'}
                  </CardTitle>
                  <Badge className={`${ratingConfig.color} border font-semibold shrink-0`}>
                    <Star className="h-3 w-3 mr-1" />
                    {competitor.rating.toFixed(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">
                    {competitor.address || 'Address not available'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>Reviews</span>
                  </div>
                  <span className="font-semibold text-white">
                    {competitor.review_count.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Navigation className="h-4 w-4" />
                    <span>Distance</span>
                  </div>
                  <span className="font-semibold text-cyan-400">
                    {formatDistance(competitor.distance_miles)}
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/10 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                    onClick={() => {
                      // TODO: Implement competitor details view
                      console.log(
                        'View competitor details:',
                        competitor.competitor_name || competitor.name
                      );
                    }}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop table view for larger screens */}
      <div className="hidden lg:block">
        <Card className="bg-obsidian/50 border-white/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-slate-300 text-sm">
                      Name
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-300 text-sm">
                      Rating
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-300 text-sm">
                      Reviews
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-300 text-sm">
                      Distance
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-300 text-sm">
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor, index) => {
                    const ratingConfig = getRatingConfig(competitor.rating);
                    return (
                      <tr
                        key={
                          competitor.competitor_id ||
                          competitor.place_id ||
                          competitor.id ||
                          index
                        }
                        className="border-b border-white/5 hover:bg-emerald-500/5 transition-colors"
                      >
                        <td className="p-4 font-medium text-white">
                          {competitor.competitor_name ||
                            competitor.name ||
                            'Unknown Restaurant'}
                        </td>
                        <td className="p-4">
                          <Badge className={`${ratingConfig.color} border font-semibold`}>
                            <Star className="h-3 w-3 mr-1" />
                            {competitor.rating.toFixed(1)}
                          </Badge>
                        </td>
                        <td className="p-4 text-white">
                          {competitor.review_count.toLocaleString()}
                        </td>
                        <td className="p-4 text-cyan-400 font-medium">
                          {formatDistance(competitor.distance_miles)}
                        </td>
                        <td className="p-4 text-sm text-slate-400 max-w-xs truncate">
                          {competitor.address}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}