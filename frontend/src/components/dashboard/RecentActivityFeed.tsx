import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, UtensilsCrossed, Search, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'invoice' | 'menu' | 'analysis' | 'comparison';
  title: string;
  timestamp: string;
  status?: 'completed' | 'processing' | 'failed';
  link?: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const activityConfig = {
  invoice: {
    icon: FileText,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  menu: {
    icon: UtensilsCrossed,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  analysis: {
    icon: Search,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  comparison: {
    icon: Search,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
};

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400' },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400' },
  failed: { label: 'Failed', color: 'bg-red-500/10 text-red-400' },
};

export function RecentActivityFeed({ activities, loading }: RecentActivityFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              const content = (
                <div className="flex items-start gap-3 group">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                      {activity.status && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusConfig[activity.status].color} border-0`}
                        >
                          {statusConfig[activity.status].label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );

              return activity.link ? (
                <Link key={activity.id} to={activity.link}>
                  {content}
                </Link>
              ) : (
                <div key={activity.id}>{content}</div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
