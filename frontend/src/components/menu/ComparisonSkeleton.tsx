/**
 * Comparison Results Skeleton Loader
 * 
 * Provides skeleton screens for menu comparison results
 * to improve perceived performance during loading.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ComparisonResultsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 bg-slate-800/50" />
        <Skeleton className="h-5 w-48 bg-slate-800/50" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-32 bg-slate-800/50 rounded-full" />
          <Skeleton className="h-6 w-24 bg-slate-800/50 rounded-full" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card-dark border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-slate-800/50" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-16 bg-slate-800/50" />
                  <Skeleton className="h-4 w-32 bg-slate-800/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-12 w-32 bg-slate-800/50 rounded-lg" />
          <Skeleton className="h-12 w-32 bg-slate-800/50 rounded-lg" />
          <Skeleton className="h-12 w-32 bg-slate-800/50 rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card-dark border-white/10">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4 bg-slate-800/50" />
                    <Skeleton className="h-4 w-full bg-slate-800/50" />
                  </div>
                  <Skeleton className="h-6 w-20 bg-slate-800/50 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full bg-slate-800/50 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CompetitorCardSkeleton() {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48 bg-slate-800/50" />
            <Skeleton className="h-4 w-64 bg-slate-800/50" />
          </div>
          <Skeleton className="h-6 w-16 bg-slate-800/50 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full bg-slate-800/50 rounded-lg" />
          <Skeleton className="h-16 w-full bg-slate-800/50 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MenuItemCardSkeleton() {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48 bg-slate-800/50" />
              <Skeleton className="h-5 w-20 bg-slate-800/50 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full bg-slate-800/50" />
            <Skeleton className="h-3 w-32 bg-slate-800/50" />
          </div>
          <Skeleton className="h-8 w-20 bg-slate-800/50" />
        </div>
      </CardContent>
    </Card>
  );
}

export function InsightCardSkeleton() {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-6 w-64 bg-slate-800/50" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 bg-slate-800/50 rounded-full" />
              <Skeleton className="h-6 w-20 bg-slate-800/50 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-16 w-full bg-slate-800/50" />
          <Skeleton className="h-24 w-full bg-slate-800/50 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
