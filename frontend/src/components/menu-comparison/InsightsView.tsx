import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
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

const insightTypeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  opportunity: { label: 'Opportunity', color: 'text-success-400', bgColor: 'bg-success-400/10' },
  pricing_gap: { label: 'Pricing Gap', color: 'text-accent-400', bgColor: 'bg-accent-400/10' },
  competitive_threat: { label: 'Threat', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  menu_gap: { label: 'Menu Gap', color: 'text-primary-500', bgColor: 'bg-primary-500/10' },
  other: { label: 'Insight', color: 'text-slate-300', bgColor: 'bg-slate-500/10' },
}

export function InsightsView({ insights }: InsightsViewProps) {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())

  if (insights.length === 0) {
    return (
      <Card className="bg-slate-500/5 border-slate-500/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No insights generated yet.</p>
        </CardContent>
      </Card>
    )
  }

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Sort by priority (high first)
  const sortedInsights = [...insights].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  // Group by type
  const groupedInsights = sortedInsights.reduce((acc, insight) => {
    const type = insight.insight_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(insight)
    return acc
  }, {} as Record<string, ComparisonInsight[]>)

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card-dark border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{insights.length}</div>
          <div className="text-xs text-slate-400">Total Insights</div>
        </div>
        <div className="bg-card-dark border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-destructive">
            {insights.filter(i => i.priority && i.priority >= 70).length}
          </div>
          <div className="text-xs text-slate-400">High Priority</div>
        </div>
        <div className="bg-card-dark border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-success-400">
            {groupedInsights['opportunity']?.length || 0}
          </div>
          <div className="text-xs text-slate-400">Opportunities</div>
        </div>
        <div className="bg-card-dark border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-accent-400">
            {groupedInsights['pricing_gap']?.length || 0}
          </div>
          <div className="text-xs text-slate-400">Pricing Gaps</div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-2">
        {sortedInsights.map((insight) => {
          const isExpanded = expandedInsights.has(insight.id)
          const config = insightTypeConfig[insight.insight_type || 'other'] || insightTypeConfig.other
          const evidenceList = toEvidenceList(insight.evidence)

          return (
            <div
              key={insight.id}
              className="border border-white/10 rounded-lg bg-card-dark overflow-hidden"
            >
              {/* Compact Header */}
              <button
                onClick={() => toggleInsight(insight.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}

                {/* Priority Indicator */}
                {insight.priority && insight.priority >= 70 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                )}

                {/* Type Badge */}
                <Badge className={cn("text-[10px] px-1.5 py-0 border-0 flex-shrink-0", config.bgColor, config.color)}>
                  {config.label}
                </Badge>

                {/* Title */}
                <span className="text-sm text-white flex-1 truncate">{insight.title}</span>

                {/* Price Difference */}
                {typeof insight.price_difference === 'number' && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {insight.price_difference > 0 ? (
                      <TrendingUp className="h-3 w-3 text-destructive" />
                    ) : insight.price_difference < 0 ? (
                      <TrendingDown className="h-3 w-3 text-success-400" />
                    ) : (
                      <Minus className="h-3 w-3 text-slate-400" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      insight.price_difference > 0 ? "text-destructive" : "text-success-400"
                    )}>
                      {insight.price_difference > 0 ? '+' : ''}${Math.abs(insight.price_difference).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Confidence */}
                {insight.confidence && (
                  <Badge className="bg-slate-500/10 text-slate-400 border-0 text-[10px] px-1.5 py-0 capitalize flex-shrink-0">
                    {insight.confidence}
                  </Badge>
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
                  {insight.description && (
                    <p className="text-sm text-slate-300">{insight.description}</p>
                  )}

                  {/* Price Comparison */}
                  {(insight.user_item_name || insight.competitor_item_name) && (
                    <div className="grid grid-cols-2 gap-3 p-2.5 bg-obsidian/50 rounded-md border border-white/5">
                      {insight.user_item_name && (
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Your Item</div>
                          <div className="text-sm text-white">{insight.user_item_name}</div>
                          {insight.user_item_price && (
                            <div className="text-sm font-semibold text-primary-500">
                              ${insight.user_item_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                      {insight.competitor_item_name && (
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">
                            {insight.competitor_business_name || 'Competitor'}
                          </div>
                          <div className="text-sm text-white">{insight.competitor_item_name}</div>
                          {insight.competitor_item_price && (
                            <div className="text-sm font-semibold text-accent-400">
                              ${insight.competitor_item_price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evidence */}
                  {evidenceList.length > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Evidence</div>
                      <ul className="space-y-0.5">
                        {evidenceList.map((entry, idx) => (
                          <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                            <span className="text-primary-500 mt-0.5">•</span>
                            <span>{entry}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
