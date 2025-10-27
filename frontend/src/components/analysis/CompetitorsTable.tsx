import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Competitor } from '@/types/analysis';

interface CompetitorsTableProps {
  competitors: Competitor[];
}

export function CompetitorsTable({ competitors }: CompetitorsTableProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800';
    if (rating >= 4.0) return 'bg-blue-100 text-blue-800';
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    }
    return `${distance.toFixed(1)} mi`;
  };

  if (competitors.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No competitors found in the analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Competitor Analysis</h2>
        <Badge variant="outline">
          {competitors.length} competitors
        </Badge>
      </div>

      {/* Mobile-optimized card layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {competitors.map((competitor, index) => (
          <Card key={competitor.competitor_id || competitor.place_id || competitor.id || index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">
                  {competitor.competitor_name || competitor.name || 'Unknown Restaurant'}
                </CardTitle>
                <Badge className={getRatingColor(competitor.rating)}>
                  ⭐ {competitor.rating.toFixed(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p className="truncate">{competitor.address || 'Address not available'}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reviews:</span>
                <span className="font-medium">{competitor.review_count.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium">{formatDistance(competitor.distance_miles)}</span>
              </div>

              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement competitor details view
                    console.log('View competitor details:', competitor.competitor_name || competitor.name);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table view for larger screens */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Rating</th>
                    <th className="text-left p-4 font-medium">Reviews</th>
                    <th className="text-left p-4 font-medium">Distance</th>
                    <th className="text-left p-4 font-medium">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor, index) => (
                    <tr key={competitor.competitor_id || competitor.place_id || competitor.id || index} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{competitor.competitor_name || competitor.name || 'Unknown Restaurant'}</td>
                      <td className="p-4">
                        <Badge className={getRatingColor(competitor.rating)}>
                          ⭐ {competitor.rating.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="p-4">{competitor.review_count.toLocaleString()}</td>
                      <td className="p-4">{formatDistance(competitor.distance_miles)}</td>
                      <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                        {competitor.address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}