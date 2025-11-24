import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface AlertKPICardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  type: 'negative' | 'positive';
  loading?: boolean;
  linkTo: string;
  subtitle: string;
}

export function AlertKPICard({
  title,
  count,
  icon: Icon,
  type,
  loading,
  linkTo,
  subtitle,
}: AlertKPICardProps) {
  const colorClasses = {
    negative: {
      icon: 'text-destructive bg-destructive/10',
      border: 'hover:border-red-500/50',
      text: 'text-destructive',
    },
    positive: {
      icon: 'text-primary-500 bg-primary-500/10',
      border: 'hover:border-primary-500/50',
      text: 'text-primary-500',
    },
  };

  const colors = colorClasses[type];

  if (loading) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={linkTo} className="block h-full">
      <Card
        className={`bg-card-dark border-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full flex flex-col ${colors.border}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className={`text-3xl font-bold ${colors.text}`}>{count}</div>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
