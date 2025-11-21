import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Star, Users, Navigation } from 'lucide-react'

interface Competitor {
  id: string
  business_name: string
  rating?: number
  address?: string
  review_count?: number
  distance_miles?: number
}

interface CompetitorsOverviewProps {
  competitors: Competitor[]
}

export function CompetitorsOverview({ competitors }: CompetitorsOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {competitors.map((competitor) => (
        <Card key={competitor.id} className="bg-card-dark border-white/10">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-lg text-white">{competitor.business_name}</CardTitle>
              {competitor.rating != null && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {competitor.rating.toFixed(1)}
                </div>
              )}
            </div>
            {competitor.address && (
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{competitor.address}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {competitor.review_count && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-slate-400 text-xs">Reviews</div>
                    <div className="text-slate-200 font-semibold">
                      {competitor.review_count.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              {competitor.distance_miles && (
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="w-4 h-4 text-cyan-500" />
                  <div>
                    <div className="text-slate-400 text-xs">Distance</div>
                    <div className="text-cyan-400 font-semibold">{competitor.distance_miles.toFixed(1)} mi</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

