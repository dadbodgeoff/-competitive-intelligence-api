/**
 * Stat Card Component
 * Animated metric cards with tooltips and trends
 */

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label?: string;
  };
  tooltip?: string;
  isLoading?: boolean;
  className?: string;
  delay?: number;
  compact?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary-400',
  trend,
  tooltip,
  isLoading,
  className,
  delay = 0,
  compact = false,
}: StatCardProps) {
  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-destructive';
    if (trendValue < 0) return 'text-success-400';
    return 'text-slate-400';
  };

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return TrendingUp;
    if (trendValue < 0) return TrendingDown;
    return null;
  };

  const TrendIcon = trend ? getTrendIcon(trend.value) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className={cn('bg-obsidian-400 border-white/10 overflow-hidden relative group h-full', className)}>
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0 relative",
          compact ? "pb-1 pt-3 px-4" : "pb-2"
        )}>
          <div className="flex items-center gap-2">
            <CardTitle className={cn(
              "font-medium text-slate-300",
              compact ? "text-xs" : "text-sm"
            )}>
              {title}
            </CardTitle>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-slate-500 hover:text-slate-300 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Icon className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', iconColor)} />
          </motion.div>
        </CardHeader>
        
        <CardContent className={cn("relative", compact && "px-4 pb-3 pt-0")}>
          {isLoading ? (
            <Skeleton className={cn(compact ? "h-6 w-20" : "h-8 w-24", "bg-white/10")} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: delay * 0.1 + 0.2 }}
            >
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "font-bold text-white",
                  compact ? "text-xl" : "text-2xl"
                )}>{value}</span>
                {trend && TrendIcon && (
                  <span className={cn('flex items-center text-sm', getTrendColor(trend.value))}>
                    <TrendIcon className="h-3 w-3 mr-0.5" />
                    {Math.abs(trend.value).toFixed(1)}%
                  </span>
                )}
              </div>
            </motion.div>
          )}
          
          {subtitle && (
            <p className={cn(
              "text-slate-400 mt-0.5",
              compact ? "text-[10px]" : "text-xs mt-1"
            )}>{subtitle}</p>
          )}
          
          {trend?.label && (
            <p className="text-xs text-slate-500 mt-0.5">{trend.label}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
