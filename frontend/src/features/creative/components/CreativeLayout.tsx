import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, History, Palette, Wand2 } from 'lucide-react';
import { TabGroup, TabGroupList, TabGroupTrigger, TabGroupContent } from '@/components/ui';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Button } from '@/components/ui/button';

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
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <ModulePageHeader
        icon={Sparkles}
        title="Creative Studio"
        description="Generate professional marketing assets with AI"
        actions={
          <>
            <Button
              onClick={() => navigate('/creative/history')}
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:bg-white/5 h-8 text-xs"
            >
              <History className="h-3.5 w-3.5 mr-1.5" />
              History
            </Button>
            <Button
              onClick={() => navigate('/creative/brands')}
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:bg-white/5 h-8 text-xs"
            >
              <Palette className="h-3.5 w-3.5 mr-1.5" />
              Brands
            </Button>
            <Button
              onClick={() => navigate('/creative/custom')}
              size="sm"
              className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white h-8 text-xs shadow-lg shadow-primary-500/20"
            >
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              Custom Prompt
            </Button>
          </>
        }
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


