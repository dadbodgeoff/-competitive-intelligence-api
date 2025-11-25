/**
 * Sparkline Component
 * Mini inline charts for table cells
 */

import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'primary' | 'success' | 'destructive' | 'accent';
  showDot?: boolean;
}

const colorMap = {
  primary: { stroke: '#B08968', fill: 'rgba(176, 137, 104, 0.2)' },
  success: { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.2)' },
  destructive: { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },
  accent: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
};

export function Sparkline({ 
  data, 
  width = 80, 
  height = 24, 
  color = 'primary',
  showDot = true 
}: SparklineProps) {
  const { path, areaPath, lastPoint, trend } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', lastPoint: null, trend: 'stable' };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });

    // Create line path
    const linePath = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    // Create area path (for gradient fill)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    // Determine trend
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trendDirection = secondAvg > firstAvg * 1.05 ? 'up' : secondAvg < firstAvg * 0.95 ? 'down' : 'stable';

    return {
      path: linePath,
      areaPath,
      lastPoint: points[points.length - 1],
      trend: trendDirection,
    };
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-slate-500 text-xs"
        style={{ width, height }}
      >
        —
      </div>
    );
  }

  const colors = colorMap[color];
  const trendColor = trend === 'up' ? colorMap.destructive : trend === 'down' ? colorMap.success : colors;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={trendColor.stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trendColor.stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#sparkline-gradient-${color})`}
      />
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={trendColor.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* End dot */}
      {showDot && lastPoint && (
        <>
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="3"
            fill={trendColor.stroke}
          />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="5"
            fill={trendColor.stroke}
            opacity="0.3"
          />
        </>
      )}
    </svg>
  );
}
