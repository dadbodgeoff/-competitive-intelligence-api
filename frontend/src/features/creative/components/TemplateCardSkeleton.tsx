import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TemplateCardSkeleton() {
  return (
    <Card className="border-white/10 overflow-hidden">
      <Skeleton className="h-48 w-full bg-white/10" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-white/10" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 bg-white/10" />
          <Skeleton className="h-5 w-16 bg-white/10" />
        </div>
        <Skeleton className="h-4 w-1/2 bg-white/10" />
      </CardContent>
    </Card>
  );
}
