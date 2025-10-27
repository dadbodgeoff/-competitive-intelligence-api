import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Insight, Competitor } from '@/types/analysis';
import { InsightsGrid } from './InsightsGrid';
import { EnhancedInsightsGrid } from './EnhancedInsightsGrid';

interface InsightsGridWrapperProps {
  insights: Insight[];
  competitors: Competitor[];
}

export function InsightsGridWrapper({ insights, competitors }: InsightsGridWrapperProps) {
  const [useEnhanced, setUseEnhanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Optional toggle for testing - can be removed later */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Insights View:</span>
          <Badge variant={useEnhanced ? "default" : "outline"}>
            {useEnhanced ? "Enhanced" : "Original"}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUseEnhanced(!useEnhanced)}
        >
          Switch to {useEnhanced ? "Original" : "Enhanced"}
        </Button>
      </div>

      {/* Render the selected component */}
      {useEnhanced ? (
        <EnhancedInsightsGrid 
          insights={insights} 
          competitors={competitors}
        />
      ) : (
        <InsightsGrid insights={insights} />
      )}
    </div>
  );
}