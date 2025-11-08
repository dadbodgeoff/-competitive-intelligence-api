import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/shadcn/components/card';
import { Progress } from '@/design-system/shadcn/components/progress';
import { Badge } from '@/design-system/shadcn/components/badge';

interface DemoStage {
  progress: number;
  label: string;
  duration: number;
}

const demoStages: DemoStage[] = [
  { progress: 15, label: 'Reading Sysco invoice PDF...', duration: 600 },
  { progress: 30, label: 'Extracted 47 items across 3 vendors', duration: 800 },
  { progress: 50, label: 'Smart match: "Tom Roma 25#" → "Roma Tomatoes"', duration: 900 },
  { progress: 65, label: 'Price alert: Beef up $0.45/lb (+15%)', duration: 1000 },
  { progress: 80, label: 'Found better price: US Foods $3.95 vs $4.20', duration: 900 },
  { progress: 95, label: 'Updated 12 menu items automatically', duration: 800 },
  { progress: 100, label: '✓ Saved $127 + 22 min vs manual entry', duration: 1200 },
];

export const InvoiceDemoCard: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Drop any invoice here → watch it fly');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAnimating) return;

    let currentStageIndex = 0;
    let timeout: NodeJS.Timeout;

    const runStage = () => {
      if (currentStageIndex < demoStages.length) {
        const stage = demoStages[currentStageIndex];
        setProgress(stage.progress);
        setCurrentStage(stage.label);
        
        timeout = setTimeout(() => {
          currentStageIndex++;
          runStage();
        }, stage.duration);
      } else {
        // Reset after completion
        setTimeout(() => {
          setIsAnimating(false);
          setProgress(0);
          setCurrentStage('Drop any invoice here → watch it fly');
        }, 2000);
      }
    };

    runStage();

    return () => clearTimeout(timeout);
  }, [isAnimating]);

  const startDemo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  };

  return (
    <Card className="p-8 md:p-12 border-2 border-emerald-500/30 hover:border-emerald-500 transition-all bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl shadow-emerald-500/10">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-2">
          See It In Action
        </CardTitle>
        <p className="text-lg md:text-xl text-emerald-400">Watch an invoice transform in real-time</p>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="cursor-pointer group"
          onClick={startDemo}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && startDemo()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg md:text-xl font-semibold text-white mb-1">
                  {isAnimating ? 'Processing...' : 'Click to See What Happens'}
                </p>
                <p className="text-base md:text-lg text-slate-200 font-medium">
                  {currentStage}
                </p>
              </div>
            </div>
            {progress === 100 && (
              <Badge className="bg-emerald-500 text-white px-4 py-2 text-sm font-semibold">
                ✓ Done
              </Badge>
            )}
          </div>
          
          <Progress 
            value={progress} 
            className="h-3 bg-slate-800"
          />
          
          {!isAnimating && (
            <p className="text-base md:text-lg text-center text-slate-400 mt-6 group-hover:text-emerald-400 transition-colors font-medium">
              Click to see how an invoice turns into live intelligence
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
