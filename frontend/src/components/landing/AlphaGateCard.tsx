import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/design-system/shadcn/components/card';
import { Button } from '@/design-system/shadcn/components/button';

export const AlphaGateCard: React.FC = () => {
  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-700 border-slate-600">
      <CardContent className="text-center text-white p-0">
        <p className="text-3xl md:text-4xl font-black mb-6 md:mb-8">
          Free seat. 60 seconds.
        </p>
        <div className="space-y-4">
          <Link to="/register" className="block">
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full bg-white text-slate-900 hover:bg-slate-100 min-h-[48px] text-base md:text-lg"
            >
              Send My Login (no card)
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm md:text-base opacity-80">
          247 operators already inside
        </p>
      </CardContent>
    </Card>
  );
};
