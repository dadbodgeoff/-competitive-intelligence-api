import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, DollarSign, Flame, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlySummaryChart } from './MonthlySummaryChart';
import { TopOrderedItemsChart } from './TopOrderedItemsChart';
import { FastestRisingCostsChart } from './FastestRisingCostsChart';

export function FinancialIntelligenceSection() {
  const [expandedCard, setExpandedCard] = useState<'monthly' | 'ordered' | 'rising' | null>(null);

  const toggleCard = (card: 'monthly' | 'ordered' | 'rising') => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary-500" />
        <h2 className="text-xl font-bold text-white">Financial Intelligence</h2>
      </div>

      {/* Compact Cards - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Summary - Compact */}
        <Card 
          className="bg-card-dark border-white/10 hover:border-white/10 transition-all cursor-pointer"
          onClick={() => toggleCard('monthly')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary-500" />
                <span>This Month</span>
              </div>
              {expandedCard === 'monthly' ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-400">
              Click to {expandedCard === 'monthly' ? 'hide' : 'view'} details
            </div>
          </CardContent>
        </Card>

        {/* Top Ordered - Compact */}
        <Card 
          className="bg-card-dark border-white/10 hover:border-primary-600/30 transition-all cursor-pointer"
          onClick={() => toggleCard('ordered')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary-500" />
                <span>Most Ordered</span>
              </div>
              {expandedCard === 'ordered' ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-400">
              Click to {expandedCard === 'ordered' ? 'hide' : 'view'} details
            </div>
          </CardContent>
        </Card>

        {/* Rising Costs - Compact */}
        <Card 
          className="bg-card-dark border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
          onClick={() => toggleCard('rising')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>Rising Costs</span>
              </div>
              {expandedCard === 'rising' ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-400">
              Click to {expandedCard === 'rising' ? 'hide' : 'view'} details
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expanded Content - Shows Below with Charts */}
      {expandedCard === 'monthly' && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <MonthlySummaryChart />
        </div>
      )}
      {expandedCard === 'ordered' && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <TopOrderedItemsChart />
        </div>
      )}
      {expandedCard === 'rising' && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <FastestRisingCostsChart />
        </div>
      )}
    </div>
  );
}
