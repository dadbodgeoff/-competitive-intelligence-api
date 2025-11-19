import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/shadcn/components/card';
import { Badge } from '@/design-system/shadcn/components/badge';
import { Button } from '@/design-system/shadcn/components/button';
import { RefreshCw, AlertTriangle, Play } from 'lucide-react';
import { useCogsDemo } from '@/hooks/useCogsDemo';

const toneClass: Record<string, string> = {
  info: 'text-slate-300',
  progress: 'text-emerald-300',
  success: 'text-emerald-200',
};

export const COGSDemoCard: React.FC = () => {
  const { state, simulateDemo } = useCogsDemo(false);
  const hasRun = state.events.length > 0;
  const isIdle = state.status === 'idle';

  return (
    <Card className="gradient-outline surface-glass rounded-3xl overflow-hidden">
      <CardHeader className="space-y-4 text-center">
        <Badge className="mx-auto bg-emerald-500/20 text-emerald-200 border-emerald-500/30 px-4 py-1 uppercase tracking-[0.35em] text-xs">
          Assign once. Plate cost stays honest.
        </Badge>
        <CardTitle className="text-2xl md:text-4xl font-bold text-white">
          Watch a recipe auto-update to your latest invoice costs.
        </CardTitle>
        <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto">
          Recipe Brain links each ingredient to your invoices. Tap start to watch the Margherita pizza pull today’s vendor
          prices, recalc food cost %, and flag variances in seconds.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={simulateDemo}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border border-white/10"
          >
            <Play className="w-4 h-4 mr-2" />
            {isIdle ? 'Start the demo' : 'Replay sample'}
          </Button>
          {hasRun && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={simulateDemo}
              className="text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run again
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-10">
        <section className="surface-glass-muted border border-white/10 rounded-2xl p-5 space-y-2 max-h-48 overflow-y-auto text-sm shadow-inner-shadow">
          {state.events.length === 0 ? (
            <div className="text-center text-slate-400 text-sm">
              Press “Start the demo” to watch Recipe Brain pull costs and flag variances.
            </div>
          ) : (
            state.events.map((event) => (
              <div key={event.id} className={`${toneClass[event.type] || 'text-slate-300'}`}>
                {event.message}
              </div>
            ))
          )}
        </section>

        {state.metrics && (
          <section className="grid gap-4 md:grid-cols-4">
            {state.metrics.map((metric) => (
              <div
                key={metric.label}
                className="surface-glass-muted border border-emerald-500/25 rounded-2xl px-4 py-4 text-sm text-slate-200 shadow-[0_20px_50px_-45px_rgba(16,185,129,0.8)]"
              >
                <p className="uppercase tracking-widest text-emerald-300 mb-2 text-xs">{metric.label}</p>
                <p className="text-white text-2xl font-semibold">{metric.value}</p>
                {metric.helper && <p className="text-slate-400 text-xs mt-2">{metric.helper}</p>}
              </div>
            ))}
          </section>
        )}

        {state.ingredients && (
          <section className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h3 className="text-lg font-semibold text-white">Ingredient cost roll-up</h3>
              <span className="text-xs text-slate-400">Live costs pulled from your mapped inventory items</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {state.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="surface-glass-muted border border-white/10 rounded-2xl px-4 py-4 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-200">
                    <span className="font-semibold text-white">{ingredient.name}</span>
                    <Badge className="bg-slate-800/70 text-slate-200 border-slate-700/60">{ingredient.portion}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
                    <span>Latest cost: {ingredient.latestCost}</span>
                    {ingredient.previousCost && <span>Prev: {ingredient.previousCost}</span>}
                  </div>
                  {ingredient.variance && (
                    <div className="mt-3 flex items-center gap-2 text-amber-300 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Variance vs last delivery: {ingredient.variance}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="surface-glass-muted border border-emerald-500/30 rounded-2xl px-5 py-5 text-sm text-emerald-200 text-center">
          Ready to wire your own menu? Drop an invoice above—Recipe Brain walks you through linking ingredients and portions
          without ever touching a spreadsheet.
        </div>
      </CardContent>
    </Card>
  );
};

