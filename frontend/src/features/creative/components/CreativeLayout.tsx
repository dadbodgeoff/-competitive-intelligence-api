import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CreativeTab = 'campaigns' | 'social-proof' | 'hiring' | 'events';

interface CreativeLayoutProps {
  activeTab: CreativeTab;
  onTabChange: (tab: CreativeTab) => void;
  children: ReactNode;
  tabCounts?: Partial<Record<CreativeTab, number>>;
}

const TAB_LABELS: Record<CreativeTab, string> = {
  campaigns: 'Menu & Seasonal Campaigns',
  'social-proof': 'Social Proof',
  hiring: 'Talent Acquisition',
  events: 'Events & Promotions',
};

export function CreativeLayout({ activeTab, onTabChange, children, tabCounts }: CreativeLayoutProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Creative Studio</h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Generate on-brand Nano Banana assets for campaigns, social proof, hiring, and events.
          Choose a theme, customize the variables, and publish stunning creative in minutes.
        </p>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as CreativeTab)}
        className="space-y-6"
      >
        <TabsList className="flex flex-wrap gap-2 bg-white/5 p-1">
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <span className="mr-2">{label}</span>
              {typeof tabCounts?.[key as CreativeTab] === 'number' && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
                  {tabCounts[key as CreativeTab]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="space-y-6">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}


