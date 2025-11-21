import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import type { ComparisonInsight } from '@/types/menuComparison'

interface InsightsViewProps {
  insights: ComparisonInsight[]
}

function toEvidenceList(evidence?: ComparisonInsight['evidence']): string[] {
  if (!evidence) return []
  if (Array.isArray(evidence)) {
    return evidence.map((entry) => String(entry))
  }
  if (typeof evidence === 'object') {
    return Object.entries(evidence).map(([key, value]) => `${key}: ${String(value)}`)
  }
  return [String(evidence)]
}

export function InsightsView({ insights }: InsightsViewProps) {
  if (insights.length === 0) {
    return (
      <Card className="bg-slate-500/5 border-slate-500/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No insights generated yet.</p>
        </CardContent>
      </Card>
    )
  }

  const groupedInsights = insights.reduce((acc, insight) => {
    const type = insight.insight_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(insight)
    return acc
  }, {} as Record<string, ComparisonInsight[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedInsights).map(([type, typeInsights]) => (
        <div key={type}>
          <h3 className="text-lg font-semibold text-white mb-4 capitalize">
            {type.replace('_', ' ')} ({typeInsights.length})
          </h3>
          <div className="grid gap-4">
            {typeInsights.map((insight) => (
              <Card key={insight.id} className="bg-card-dark border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="text-lg font-semibold text-white">{insight.title}</h4>
                    <div className="flex items-center gap-2">
                      {insight.priority && insight.priority >= 70 && (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/30 border">
                          High Priority
                        </Badge>
                      )}
                      {insight.confidence && (
                        <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/30 border capitalize">
                          {insight.confidence}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {insight.description && <p className="text-slate-300 mb-4">{insight.description}</p>}

                  {(insight.user_item_name || insight.competitor_item_name) && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-obsidian/50 rounded-lg border border-white/5">
                      {insight.user_item_name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Your Item</div>
                          <div className="text-white font-medium">{insight.user_item_name}</div>
                          {insight.user_item_price && (
                            <div className="text-emerald-400 font-semibold">
                              ${insight.user_item_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                      {insight.competitor_item_name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            {insight.competitor_business_name || 'Competitor'}
                          </div>
                          <div className="text-white font-medium">{insight.competitor_item_name}</div>
                          {insight.competitor_item_price && (
                            <div className="text-cyan-400 font-semibold">
                              ${insight.competitor_item_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {typeof insight.price_difference === 'number' && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-400">Price Difference: </span>
                      <span className={insight.price_difference > 0 ? 'text-red-400' : 'text-green-400'}>
                        {insight.price_difference > 0 ? '+' : ''}${Math.abs(insight.price_difference).toFixed(2)}
                        {insight.price_difference_percent != null && (
                          <span className="ml-1">
                            ({insight.price_difference > 0 ? '+' : ''}
                            {insight.price_difference_percent.toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {toEvidenceList(insight.evidence).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="text-xs text-slate-500 mb-2">Evidence:</div>
                      <ul className="space-y-1">
                        {toEvidenceList(insight.evidence).map((entry, idx) => (
                          <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>{entry}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

