import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/shadcn/components/card';
import { Button } from '@/design-system/shadcn/components/button';
import { Link } from 'react-router-dom';

export const CompetitorSpyCard: React.FC = () => {
  return (
    <Card className="overflow-hidden border-amber-500/30 bg-slate-900">
      <CardHeader className="bg-amber-50/5 border-b border-amber-500/20">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-white">
          🔍 Spy Report – 2 miles
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 md:pt-8 p-6 md:p-8">
        <p className="text-2xl md:text-3xl font-bold text-red-400 mb-3">
          Your Caesar = $2.10 high
        </p>
        <p className="text-base md:text-lg text-slate-300 mb-6">
          Drop romaine 1 oz → save $312/mo
        </p>
        <Link to="/register">
          <Button 
            variant="outline" 
            className="border-2 border-amber-500 hover:bg-amber-500/10 text-amber-400 min-h-[48px] px-6"
          >
            Show Me Their Menu
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
