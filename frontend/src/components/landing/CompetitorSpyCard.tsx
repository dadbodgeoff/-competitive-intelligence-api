import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/shadcn/components/card';
import { Button } from '@/design-system/shadcn/components/button';
import { Link } from 'react-router-dom';

export const CompetitorSpyCard: React.FC = () => {
  return (
    <Card className="gradient-outline surface-glass-muted overflow-hidden border-amber-500/30">
      <CardHeader className="bg-amber-50/5 border-b border-amber-500/20">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-white">
          🔍 Competitor Radar – Sample Insight
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 md:pt-8 p-6 md:p-8">
        <p className="text-2xl md:text-3xl font-bold text-red-400 mb-3">
          Example: Caesar salad running $2.10 above the block
        </p>
        <p className="text-base md:text-lg text-slate-300 mb-6">
          RestaurantIQ suggested trimming romaine by 1 oz and highlighting your house-made dressing—worth $312/mo in the scenario above.
        </p>
        <p className="text-xs text-slate-500 mb-6 italic">
          This is an anonymized sample of the insight format you&rsquo;ll receive once you run Competitor Radar.
        </p>
        <Link to="/register">
          <Button 
            variant="outline" 
            className="border-2 border-amber-500 hover:bg-amber-500/10 text-amber-400 min-h-[48px] px-6"
          >
            Show me my neighborhood playbook
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
