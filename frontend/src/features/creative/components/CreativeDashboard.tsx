import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, Wand2, Sparkles, Shield, ArrowRight, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CreativeLayout, type CreativeTab } from './CreativeLayout';
import { ThemeCardImproved } from './ThemeCardImproved';
import { ListContainer } from '@/components/ui';
import { PromptPreviewDrawer } from './PromptPreviewDrawer';
import { UsageQuotaBadge } from './UsageQuotaBadge';
import { previewTemplate } from '../api/nanoBananaClient';
import type {
  TemplatePreviewResponse,
  TemplateSummary,
  ThemeSummary,
} from '../api/types';
import { useNanoThemes } from '../hooks/useNanoThemes';
import { useNanoTemplates } from '../hooks/useNanoTemplates';
import { enhanceThemeDescription } from '@/utils/creativeDescriptions';

const CATEGORY_ORDER: CreativeTab[] = ['campaigns', 'social-proof', 'hiring', 'events'];
const CATEGORY_LABELS: Record<CreativeTab, string> = {
  campaigns: 'Menu & Seasonal Campaigns',
  'social-proof': 'Social Proof',
  hiring: 'Talent Acquisition',
  events: 'Events & Promotions',
};

const CATEGORY_DESCRIPTIONS: Record<CreativeTab, string> = {
  campaigns: 'Promote seasonal menus, limited-time offers, and special dishes with eye-catching visuals.',
  'social-proof': 'Showcase customer reviews, testimonials, and social media buzz to build trust.',
  hiring: 'Attract top talent with professional job postings and team culture highlights.',
  events: 'Announce special events, live music, trivia nights, and celebrations.',
};

// Sub-categories for better organization within campaigns
const CAMPAIGN_SUBCATEGORIES: Record<string, { label: string; icon: string; keywords: string[] }> = {
  seasonal: { label: '🎄 Seasonal & Holidays', icon: '🎄', keywords: ['holiday', 'christmas', 'thanksgiving', 'winter', 'summer', 'spring', 'fall', 'new year', 'valentine', 'easter', 'halloween'] },
  daily_specials: { label: '📅 Daily Specials & LTOs', icon: '📅', keywords: ['daily', 'special', 'lto', 'limited', 'today', 'weekly'] },
  happy_hour: { label: '🍸 Happy Hour & Drinks', icon: '🍸', keywords: ['happy hour', 'cocktail', 'drink', 'beer', 'wine', 'bar'] },
  delivery: { label: '🚗 Delivery & Takeout', icon: '🚗', keywords: ['delivery', 'takeout', 'pickup', 'order online', 'to-go'] },
  sports: { label: '🏈 Sports & Game Day', icon: '🏈', keywords: ['sports', 'game', 'football', 'basketball', 'watch party'] },
  rewards: { label: '🎁 Rewards & Gift Cards', icon: '🎁', keywords: ['reward', 'loyalty', 'gift card', 'points'] },
  brunch: { label: '🥞 Brunch & Breakfast', icon: '🥞', keywords: ['brunch', 'breakfast', 'morning', 'mimosa'] },
  menu_features: { label: '🍽️ Menu Features', icon: '🍽️', keywords: ['menu', 'dish', 'feature', 'signature', 'chef'] },
};

// Helper to determine subcategory from theme
function getThemeSubcategory(theme: ThemeSummary): string {
  const searchText = [theme.name, theme.description, theme.theme_slug].join(' ').toLowerCase();
  
  for (const [key, config] of Object.entries(CAMPAIGN_SUBCATEGORIES)) {
    if (config.keywords.some(kw => searchText.includes(kw))) {
      return key;
    }
  }
  return 'menu_features'; // default
}

// Vertical display names for better UX
const VERTICAL_DISPLAY_NAMES: Record<string, string> = {
  pizza: '🍕 Pizza & Italian',
  bar_grill: '🍺 Bar & Grill',
  fine_dining: '🍷 Fine Dining',
  fast_casual: '🌮 Fast Casual',
  bakery: '🥐 Bakery & Cafe',
  cafe: '☕ Coffee Shop',
  bbq: '🔥 BBQ & Smokehouse',
  seafood: '🦞 Seafood',
  asian: '🍜 Asian Cuisine',
  mexican: '🌯 Mexican',
  breakfast: '🥞 Breakfast & Brunch',
  steakhouse: '🥩 Steakhouse',
  all_verticals: '🎯 All Restaurant Types',
  cross_vertical: '🎯 Multi-Concept',
};

export function CreativeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CreativeTab>('campaigns');
  const [restaurantVerticalFilter, setRestaurantVerticalFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<TemplatePreviewResponse>();
  const [previewError, setPreviewError] = useState<string>();
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateSummary | null>(null);

  const themesQuery = useNanoThemes();
  const templatesQuery = useNanoTemplates(selectedThemeId);
  
  // Initial display limit for themes
  const INITIAL_THEME_LIMIT = 12;

  const themesByCategory = useMemo(() => {
    const base: Record<CreativeTab, ThemeSummary[]> = {
      campaigns: [],
      'social-proof': [],
      hiring: [],
      events: [],
    };
    (themesQuery.data ?? []).forEach((theme) => {
      const category = (theme.category ?? 'campaigns') as CreativeTab;
      const key = CATEGORY_ORDER.includes(category) ? category : 'campaigns';
      base[key] = [...base[key], theme];
    });
    return base;
  }, [themesQuery.data]);

  // Get unique restaurant verticals for campaigns category
  const restaurantVerticals = useMemo(() => {
    const verticalCounts = new Map<string, number>();
    themesByCategory.campaigns.forEach((theme) => {
      if (theme.restaurant_vertical) {
        const count = verticalCounts.get(theme.restaurant_vertical) || 0;
        verticalCounts.set(theme.restaurant_vertical, count + 1);
      }
    });
    return Array.from(verticalCounts.keys()).sort((a, b) => {
      const countDiff = (verticalCounts.get(b) || 0) - (verticalCounts.get(a) || 0);
      return countDiff !== 0 ? countDiff : a.localeCompare(b);
    });
  }, [themesByCategory.campaigns]);

  // Get subcategory counts for campaigns
  const subcategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    themesByCategory.campaigns.forEach((theme) => {
      const subcat = getThemeSubcategory(theme);
      counts.set(subcat, (counts.get(subcat) || 0) + 1);
    });
    return counts;
  }, [themesByCategory.campaigns]);

  // Filter themes by category, vertical, subcategory, and search
  const filteredThemes = useMemo(() => {
    let categoryThemes = themesByCategory[activeTab] ?? [];
    
    // Apply restaurant vertical filter (campaigns only)
    if (activeTab === 'campaigns' && restaurantVerticalFilter !== 'all') {
      categoryThemes = categoryThemes.filter(
        (theme) => theme.restaurant_vertical === restaurantVerticalFilter
      );
    }
    
    // Apply subcategory filter (campaigns only)
    if (activeTab === 'campaigns' && subcategoryFilter !== 'all') {
      categoryThemes = categoryThemes.filter(
        (theme) => getThemeSubcategory(theme) === subcategoryFilter
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      categoryThemes = categoryThemes.filter((theme) => {
        const searchText = [
          theme.name,
          theme.description,
          theme.theme_slug,
          theme.restaurant_vertical,
        ].join(' ').toLowerCase();
        return searchText.includes(query);
      });
    }
    
    return categoryThemes;
  }, [themesByCategory, activeTab, restaurantVerticalFilter, subcategoryFilter, searchQuery]);

  // Themes to display (with "show more" logic)
  const displayedThemes = useMemo(() => {
    if (showAllThemes || searchQuery.trim() || filteredThemes.length <= INITIAL_THEME_LIMIT) {
      return filteredThemes;
    }
    return filteredThemes.slice(0, INITIAL_THEME_LIMIT);
  }, [filteredThemes, showAllThemes, searchQuery]);



  const tabCounts = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Partial<Record<CreativeTab, number>>>((acc, category) => {
        acc[category] = themesByCategory[category]?.length ?? 0;
        return acc;
      }, {}),
    [themesByCategory],
  );

  // Reset filters when changing tabs
  useEffect(() => {
    setRestaurantVerticalFilter('all');
    setSubcategoryFilter('all');
    setSearchQuery('');
    setShowAllThemes(false);
  }, [activeTab]);

  useEffect(() => {
    if (themesQuery.isLoading) return;
    if (filteredThemes.length > 0) return;
    const fallback = CATEGORY_ORDER.find((cat) => (themesByCategory[cat] ?? []).length > 0);
    if (fallback && fallback !== activeTab) {
      setActiveTab(fallback);
    }
  }, [themesQuery.isLoading, filteredThemes.length, themesByCategory, activeTab]);

  // Auto-select theme when tab changes
  useEffect(() => {
    if (filteredThemes.length === 0) {
      setSelectedThemeId(undefined);
      return;
    }
    setSelectedThemeId((previous) => {
      if (!previous) return undefined;
      const stillExists = filteredThemes.some((theme) => theme.id === previous);
      return stillExists ? previous : undefined;
    });
  }, [filteredThemes]);

  const templates = templatesQuery.data ?? [];

  const [expandedThemeId, setExpandedThemeId] = useState<string>();

  const handleThemeClick = useCallback((themeId: string) => {
    if (expandedThemeId === themeId) {
      setExpandedThemeId(undefined);
      setSelectedThemeId(undefined);
    } else {
      setExpandedThemeId(themeId);
      setSelectedThemeId(themeId);
      setSelectedTemplateId(undefined);
    }
  }, [expandedThemeId]);

  const handlePreviewTemplate = useCallback(
    async (template: TemplateSummary) => {
      setPreviewingTemplate(template);
      setPreviewLoading(true);
      setPreviewError(undefined);
      setPreviewOpen(true);
      setPreviewData(undefined);
      try {
        const data = await previewTemplate({ template_id: template.id });
        setPreviewData(data);
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : 'Failed to preview template');
      } finally {
        setPreviewLoading(false);
      }
    },
    [],
  );

  // Clear all filters
  const clearFilters = () => {
    setRestaurantVerticalFilter('all');
    setSubcategoryFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = restaurantVerticalFilter !== 'all' || subcategoryFilter !== 'all' || searchQuery.trim();

  const themeSection = themesQuery.isLoading ? (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full bg-white/10" />
      ))}
    </div>
  ) : filteredThemes.length === 0 ? (
    <Alert className="bg-white/5 text-slate-200">
      <AlertTitle>
        {hasActiveFilters ? 'No matching themes' : `No themes in ${CATEGORY_LABELS[activeTab]}`}
      </AlertTitle>
      <AlertDescription>
        {hasActiveFilters ? (
          <span>
            Try adjusting your filters or{' '}
            <button onClick={clearFilters} className="text-primary-400 hover:text-primary-300 underline">
              clear all filters
            </button>{' '}
            to see more options.
          </span>
        ) : (
          'Switch to another tab to browse available creative content.'
        )}
      </AlertDescription>
    </Alert>
  ) : null;

  // Enhanced filter component with search, subcategory, and vertical filters
  const verticalFilterSlot = activeTab === 'campaigns' ? (
    <div className="space-y-4 mb-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search themes by name, style, or cuisine..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400" />
        
        {/* Subcategory filter */}
        <Select
          value={subcategoryFilter}
          onValueChange={setSubcategoryFilter}
        >
          <SelectTrigger className="w-[200px] bg-obsidian/50 border-white/10 text-white text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-obsidian border-white/10 max-h-[300px]">
            <SelectItem value="all" className="text-white hover:bg-white/10">
              📋 All Categories
            </SelectItem>
            {Object.entries(CAMPAIGN_SUBCATEGORIES).map(([key, config]) => {
              const count = subcategoryCounts.get(key) || 0;
              if (count === 0) return null;
              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="text-white hover:bg-white/10"
                >
                  {config.label} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Restaurant type filter */}
        {restaurantVerticals.length > 0 && (
          <Select
            value={restaurantVerticalFilter}
            onValueChange={setRestaurantVerticalFilter}
          >
            <SelectTrigger className="w-[200px] bg-obsidian/50 border-white/10 text-white text-sm">
              <SelectValue placeholder="All Restaurant Types" />
            </SelectTrigger>
            <SelectContent className="bg-obsidian border-white/10 max-h-[300px]">
              <SelectItem value="all" className="text-white hover:bg-white/10">
                🎯 All Restaurant Types
              </SelectItem>
              {restaurantVerticals.map((vertical) => {
                const count = themesByCategory.campaigns.filter(
                  (t) => t.restaurant_vertical === vertical
                ).length;
                const displayName = VERTICAL_DISPLAY_NAMES[vertical] || vertical;
                return (
                  <SelectItem
                    key={vertical}
                    value={vertical}
                    className="text-white hover:bg-white/10"
                  >
                    {displayName} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-400 hover:text-white hover:bg-white/5 h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}

        {/* Results count */}
        <span className="text-xs text-slate-500 ml-auto">
          {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {subcategoryFilter !== 'all' && (
            <Badge variant="secondary" className="bg-primary-500/20 text-primary-300 border-0">
              {CAMPAIGN_SUBCATEGORIES[subcategoryFilter]?.label || subcategoryFilter}
              <button onClick={() => setSubcategoryFilter('all')} className="ml-1.5 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {restaurantVerticalFilter !== 'all' && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-0">
              {VERTICAL_DISPLAY_NAMES[restaurantVerticalFilter] || restaurantVerticalFilter}
              <button onClick={() => setRestaurantVerticalFilter('all')} className="ml-1.5 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchQuery.trim() && (
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-0">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="ml-1.5 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  ) : (
    // Simple search for non-campaigns tabs
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={`Search ${CATEGORY_LABELS[activeTab].toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-obsidian/50 border-white/10 text-white placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {searchQuery.trim() && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-slate-500">
            {filteredThemes.length} result{filteredThemes.length !== 1 ? 's' : ''} found
          </span>
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-0 text-xs">
            "{searchQuery}"
            <button onClick={() => setSearchQuery('')} className="ml-1.5 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <CreativeLayout activeTab={activeTab} onTabChange={setActiveTab} tabCounts={tabCounts} filterSlot={verticalFilterSlot}>
      <div className="space-y-6">
        {/* PROMINENT Custom Prompt Card - The Hidden Gem */}
        <Card className="relative overflow-hidden border-primary-500/30 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-primary-500/5">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent animate-pulse" />
          
          <CardContent className="relative p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center border border-primary-500/20 shadow-lg shadow-primary-500/10">
                  <Wand2 className="h-7 w-7 text-primary-300" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Create with Custom Prompt</h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium">
                      ✨ 3x Quality Boost
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Describe anything you want — our AI adds professional photography magic automatically
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      Quality validated
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      Pro lighting & composition
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/creative/custom')} 
                className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 group"
                size="lg"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Start Creating
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage quota and category description */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <UsageQuotaBadge />
          <p className="text-sm text-slate-400">
            {CATEGORY_DESCRIPTIONS[activeTab]}
          </p>
        </div>

        {themeSection}

        {/* Theme Cards with Expandable Templates */}
        <ListContainer gap="sm" animated>
          {displayedThemes.map((theme) => {
            // Create enhanced theme with better description
            const enhancedTheme = {
              ...theme,
              description: enhanceThemeDescription(theme),
            };
            
            return (
              <ThemeCardImproved
                key={theme.id}
                theme={enhancedTheme}
                templates={theme.id === selectedThemeId ? templates : []}
                isExpanded={expandedThemeId === theme.id}
                isLoadingTemplates={theme.id === selectedThemeId && templatesQuery.isLoading}
                selectedTemplateId={selectedTemplateId}
                onToggle={() => handleThemeClick(theme.id)}
                onSelectTemplate={(template) => {
                  // Navigate directly to customize page
                  navigate(`/creative/customize?theme=${theme.id}&template=${template.id}`);
                }}
                onPreviewTemplate={handlePreviewTemplate}
                showUseTemplateButton={true}
              />
            );
          })}
        </ListContainer>

        {/* Show More / Show Less button */}
        {filteredThemes.length > INITIAL_THEME_LIMIT && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAllThemes(!showAllThemes)}
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              {showAllThemes ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show All {filteredThemes.length} Themes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <PromptPreviewDrawer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        templateName={previewingTemplate?.display_name ?? previewingTemplate?.slug}
        preview={previewData}
        isLoading={previewLoading}
        error={previewError}
        onUseTemplate={() => {
          // Redirect to customize page with template pre-selected
          if (previewingTemplate && selectedThemeId) {
            navigate(`/creative/customize?theme=${selectedThemeId}&template=${previewingTemplate.id}`);
          }
        }}
      />
    </CreativeLayout>
  );
}
