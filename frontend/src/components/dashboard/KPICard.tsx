import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  loading,
  className,
}: KPICardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
