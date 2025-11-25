import { ReactNode } from 'react';
import { TabGroup, TabGroupList, TabGroupTrigger, TabGroupContent, SectionHeader } from '@/components/ui';

export type CreativeTab = 'campaigns' | 'social-proof' | 'hiring' | 'events';

interface CreativeLayoutProps {
  activeTab: CreativeTab;
  onTabChange: (tab: CreativeTab) => void;
  children: ReactNode;
  tabCounts?: Partial<Record<CreativeTab, number>>;
  /** Optional filter component to show below tabs */
  filterSlot?: ReactNode;
}

const TAB_LABELS: Record<CreativeTab, string> = {
  campaigns: 'Menu & Seasonal Campaigns',
  'social-proof': 'Social Proof',
  hiring: 'Talent Acquisition',
  events: 'Events & Promotions',
};

export function CreativeLayout({ activeTab, onTabChange, children, tabCounts, filterSlot }: CreativeLayoutProps) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Creative Studio"
        subtitle="Generate on-brand Nano Banana assets for campaigns, social proof, hiring, and events. Choose a theme, customize the variables, and publish stunning creative in minutes."
        size="lg"
      />

      <TabGroup
        value={activeTab}
        onValueChange={(value) => onTabChange(value as CreativeTab)}
        className="space-y-6"
      >
        <TabGroupList>
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <TabGroupTrigger
              key={key}
              value={key}
              count={tabCounts?.[key as CreativeTab]}
            >
              {label}
            </TabGroupTrigger>
          ))}
        </TabGroupList>
        <TabGroupContent value={activeTab} className="space-y-6">
          {filterSlot}
          {children}
        </TabGroupContent>
      </TabGroup>
    </div>
  );
}


