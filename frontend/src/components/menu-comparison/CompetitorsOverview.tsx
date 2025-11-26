import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Users, Navigation, ExternalLink } from 'lucide-react'

interface Competitor {
  id: string
  business_name: string
  rating?: number
  address?: string
  review_count?: number
  distance_miles?: number
  website?: string
  menu_items?: Array<{ item_name: string }>
}

interface CompetitorsOverviewProps {
  competitors: Competitor[]
}

export function CompetitorsOverview({ competitors }: CompetitorsOverviewProps) {
  return (
    <div className="space-y-3">
      {competitors.map((competitor) => (
        <Card key={competitor.id} className="bg-card-dark border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Name & Address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white truncate">
                    {competitor.business_name}
                  </h3>
                  {competitor.rating != null && (
                    <Badge className="bg-primary-500/15 text-primary-500 border-0 text-xs px-1.5 py-0 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {competitor.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
                {competitor.address && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{competitor.address}</span>
                  </div>
                )}
              </div>

              {/* Right: Stats */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {competitor.review_count != null && (
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">
                      {competitor.review_count.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      reviews
                    </div>
                  </div>
                )}
                {competitor.distance_miles != null && (
                  <div className="text-center">
                    <div className="text-sm font-semibold text-accent-400">
                      {competitor.distance_miles.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      miles
                    </div>
                  </div>
                )}
                {competitor.menu_items && (
                  <div className="text-center">
                    <div className="text-sm font-semibold text-primary-500">
                      {competitor.menu_items.length}
                    </div>
                    <div className="text-[10px] text-slate-500">items</div>
                  </div>
                )}
                {competitor.website && (
                  <a
                    href={competitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    title="Visit website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
