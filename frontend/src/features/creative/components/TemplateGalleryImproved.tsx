import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateCard } from './TemplateCard';
import type { TemplateSummary } from '../api/types';

interface TemplateGalleryProps {
  templates: TemplateSummary[] | undefined;
  isLoading: boolean;
  error?: string;
  selectedTemplateId?: string;
  onSelectTemplate: (template: TemplateSummary) => void;
  onPreviewTemplate: (template: TemplateSummary) => void;
  filter: string;
  onFilterChange: (value: string) => void;
}

// Category definitions with descriptions and what users need to provide
const CATEGORIES = {
  // === HOLIDAY & SEASONAL (Top Priority) ===
  holiday: {
    label: '🎄 Holiday & Christmas',
    description: 'Christmas, holiday parties, seasonal celebrations, and festive promotions',
    userNeeds: 'Holiday specials, event dates, festive menu items, party details',
  },
  new_years: {
    label: '🎆 New Year\'s',
    description: 'NYE events, countdown parties, and New Year\'s Day recovery',
    userNeeds: 'Event details, reservation info, countdown specials, NYD brunch',
  },
  seasonal: {
    label: '🍂 Seasonal',
    description: 'Fall harvest, summer patio, spring menus, and seasonal transitions',
    userNeeds: 'Seasonal items, limited-time offers, patio hours, weather-based promos',
  },
  
  // === SPORTS & ENTERTAINMENT ===
  sports: {
    label: '🏈 Sports & Game Day',
    description: 'Watch parties, game day specials, wings, and sports bar energy',
    userNeeds: 'Game times, team matchups, food/drink specials, watch party details',
  },
  
  // === RESTAURANT TYPES ===
  pizza: {
    label: '🍕 Pizza & Italian',
    description: 'Artisan pizza, pasta, and Italian dining promotions',
    userNeeds: 'Menu items, prices, special names, and timing details',
  },
  bar_grill: {
    label: '🍺 Bar & Grill',
    description: 'Nightlife, bar specials, wings, and gastropub vibes',
    userNeeds: 'Drink specials, food items, happy hour times, event details',
  },
  bbq: {
    label: '🔥 BBQ & Smokehouse',
    description: 'Smoked meats, pitmaster specials, and authentic BBQ',
    userNeeds: 'Meat types, smoking times, wood types, platter prices',
  },
  seafood: {
    label: '🦞 Seafood & Raw Bar',
    description: 'Fresh catch, oyster bars, and coastal cuisine',
    userNeeds: 'Catch of the day, market prices, seafood tower details',
  },
  breakfast: {
    label: '🥞 Breakfast & Brunch',
    description: 'Morning specials, brunch menus, and coffee shop promos',
    userNeeds: 'Breakfast items, prices, timing (morning/brunch), special offers',
  },
  healthy_bowls: {
    label: '🥗 Healthy & Bowls',
    description: 'Salads, grain bowls, and health-conscious options',
    userNeeds: 'Bowl names, ingredients, nutritional highlights, prices',
  },
  fast_casual: {
    label: '🍔 Fast Casual',
    description: 'Quick service, street food, and casual dining',
    userNeeds: 'Combo deals, item names, prices, quick service messaging',
  },
  bakery: {
    label: '🥐 Bakery & Cafe',
    description: 'Fresh baked goods, pastries, and cafe culture',
    userNeeds: 'Baked items, daily specials, seasonal offerings, prices',
  },
  cafe: {
    label: '☕ Coffee & Cafe',
    description: 'Coffee drinks, cafe atmosphere, and morning fuel',
    userNeeds: 'Drink names, prices, cafe vibe, morning/afternoon timing',
  },
  fine_dining: {
    label: '🍷 Fine Dining',
    description: 'Upscale dining, wine pairings, and chef specials',
    userNeeds: 'Course descriptions, wine pairings, chef names, event details',
  },
  diner: {
    label: '☕ Diner & Comfort',
    description: 'Classic diner fare and comfort food favorites',
    userNeeds: 'Comfort food items, daily specials, nostalgic messaging',
  },
  asian: {
    label: '🍜 Asian Cuisine',
    description: 'Ramen, noodles, Asian comfort food, and fusion',
    userNeeds: 'Dish names, spice levels, combo options, chef specials',
  },
  sushi: {
    label: '🍣 Sushi & Japanese',
    description: 'Omakase, sushi rolls, and Japanese cuisine',
    userNeeds: 'Roll names, omakase details, chef specials, prices',
  },
  mexican: {
    label: '🌮 Mexican & Tacos',
    description: 'Tacos, burritos, margaritas, and Mexican street food',
    userNeeds: 'Taco types, proteins, prices, taco Tuesday deals, margarita specials',
  },
  steakhouse: {
    label: '🥩 Steakhouse',
    description: 'Premium cuts, butcher specials, and meat-focused dining',
    userNeeds: 'Cut names, weights, prices, preparation styles',
  },
  southern_comfort: {
    label: '🍗 Southern Comfort',
    description: 'Soul food, comfort classics, and southern hospitality',
    userNeeds: 'Comfort dishes, family-style options, southern messaging',
  },
  ice_cream: {
    label: '🍦 Desserts & Ice Cream',
    description: 'Sweet treats, frozen desserts, and bakery items',
    userNeeds: 'Flavor names, prices, seasonal specials, bundle deals',
  },
  
  // === PROMOTIONS & SPECIALS ===
  happy_hour: {
    label: '🍸 Happy Hour & Drinks',
    description: 'Cocktail specials, happy hour deals, and drink features',
    userNeeds: 'Drink names, prices, happy hour times, featured cocktails',
  },
  delivery: {
    label: '🚗 Delivery & Takeout',
    description: 'Online ordering, delivery promos, and takeout specials',
    userNeeds: 'Delivery radius, order minimums, promo codes, pickup times',
  },
  gift_cards: {
    label: '🎁 Gift Cards & Rewards',
    description: 'Gift card promotions, loyalty programs, and bonus offers',
    userNeeds: 'Gift card values, bonus amounts, loyalty perks, redemption details',
  },
  specials: {
    label: '📣 Daily Specials & LTOs',
    description: 'Limited-time offers, daily specials, and menu features',
    userNeeds: 'Special names, prices, availability, limited-time messaging',
  },
  
  // === CONTENT TYPES ===
  stories: {
    label: '📱 Instagram Stories',
    description: 'Vertical story templates for announcements and engagement',
    userNeeds: 'Headlines, key messages, call-to-actions, timing info',
  },
  ugc: {
    label: '🤝 UGC & Community',
    description: 'User-generated content, community features, and customer spotlights',
    userNeeds: 'Customer quotes, photo credits, community highlights',
  },
  behind_scenes: {
    label: '🎬 Behind the Scenes',
    description: 'Kitchen action, team features, and authentic moments',
    userNeeds: 'Team names, kitchen highlights, process details',
  },
  
  // === BUSINESS OPERATIONS ===
  hiring: {
    label: '👥 Hiring & Recruitment',
    description: 'Job postings, team culture, and talent acquisition',
    userNeeds: 'Position names, benefits, team culture, application details',
  },
  social_proof: {
    label: '⭐ Social Proof',
    description: 'Reviews, testimonials, and customer success stories',
    userNeeds: 'Review quotes, customer names, ratings, achievements',
  },
  events: {
    label: '🎉 Events & Promotions',
    description: 'Special events, live music, trivia nights, and celebrations',
    userNeeds: 'Event names, dates, times, special offers, RSVP details',
  },
  operational: {
    label: '📋 Operational Updates',
    description: 'Hours changes, closures, weather alerts, and announcements',
    userNeeds: 'Hours, dates, closure reasons, reopening info',
  },
  
  // === CATCH-ALL ===
  cross_vertical: {
    label: '🎯 Multi-Concept',
    description: 'Versatile templates for any restaurant type',
    userNeeds: 'Flexible - adapts to your specific menu and messaging',
  },
};

// Helper to categorize templates
function categorizeTemplates(templates: TemplateSummary[]) {
  const categorized: Record<string, TemplateSummary[]> = {};
  
  templates.forEach((template) => {
    // Use slug prefix to determine category (e.g., "pizza_" or "bar_grill_")
    let vertical = 'cross_vertical';
    const slug = template.slug.toLowerCase();
    
    // === HOLIDAY & SEASONAL (Check first - highest priority) ===
    if (slug.includes('holiday') || slug.includes('christmas') || slug.includes('xmas') || slug.includes('festive')) {
      vertical = 'holiday';
    }
    else if (slug.includes('nye') || slug.includes('new_year') || slug.includes('new-year') || slug.includes('newyear')) {
      vertical = 'new_years';
    }
    else if (slug.includes('fall') || slug.includes('autumn') || slug.includes('harvest') || slug.includes('patio') || slug.includes('summer') || slug.includes('spring') || slug.includes('seasonal')) {
      vertical = 'seasonal';
    }
    // === SPORTS & GAME DAY ===
    else if (slug.includes('sport') || slug.includes('game-day') || slug.includes('gameday') || slug.includes('game_day') || slug.includes('football') || slug.includes('playoff') || slug.includes('championship') || slug.includes('march-madness') || slug.includes('watch-party') || slug.includes('monday-night') || slug.includes('sunday-funday') || slug.includes('rivalry')) {
      vertical = 'sports';
    }
    // === CONTENT TYPES (Check before restaurant types) ===
    else if (slug.startsWith('story-') || slug.includes('-story-') || slug.includes('_story_') || slug.includes('instagram_story') || slug.includes('instagram-story')) {
      vertical = 'stories';
    }
    else if (slug.includes('ugc') || slug.includes('user-generated') || slug.includes('community-spotlight')) {
      vertical = 'ugc';
    }
    else if (slug.includes('behind') || slug.includes('bts') || slug.includes('kitchen-action')) {
      vertical = 'behind_scenes';
    }
    // === PROMOTIONS & SPECIALS ===
    else if (slug.includes('happy-hour') || slug.includes('happy_hour') || slug.includes('happyhour') || slug.includes('cocktail') || slug.includes('margarita') && !slug.includes('mexican')) {
      vertical = 'happy_hour';
    }
    else if (slug.includes('delivery') || slug.includes('takeout') || slug.includes('take-out') || slug.includes('pickup') || slug.includes('to-go') || slug.includes('online-order')) {
      vertical = 'delivery';
    }
    else if (slug.includes('gift-card') || slug.includes('giftcard') || slug.includes('gift_card') || slug.includes('reward') || slug.includes('loyalty') || slug.includes('points')) {
      vertical = 'gift_cards';
    }
    else if (slug.includes('special') || slug.includes('lto') || slug.includes('limited-time') || slug.includes('daily-special') || slug.includes('menu-feature')) {
      vertical = 'specials';
    }
    else if (slug.includes('weather') || slug.includes('rain') || slug.includes('snow') || slug.includes('cold-day') || slug.includes('hot-day')) {
      vertical = 'operational';
    }
    // === RESTAURANT TYPES ===
    else if (slug.includes('pizza') || slug.includes('italian') || slug.includes('pasta')) {
      vertical = 'pizza';
    }
    else if (slug.includes('bbq') || slug.includes('smokehouse') || slug.includes('smoker') || slug.includes('brisket') || slug.includes('pitmaster') || slug.includes('butcher-paper')) {
      vertical = 'bbq';
    }
    else if (slug.includes('seafood') || slug.includes('fish') || slug.includes('oyster') || slug.includes('lobster') || slug.includes('crab') || slug.includes('raw-bar') || slug.includes('fresh-catch')) {
      vertical = 'seafood';
    }
    else if (slug.includes('bar') || slug.includes('grill') || slug.includes('beer') || slug.includes('wings') || slug.includes('pub') || slug.includes('tavern')) {
      vertical = 'bar_grill';
    }
    else if (slug.includes('breakfast') || slug.includes('brunch') || slug.includes('pancake') || slug.includes('waffle') || slug.includes('eggs') || slug.includes('mimosa')) {
      vertical = 'breakfast';
    }
    else if (slug.includes('bowl') || slug.includes('salad') || slug.includes('healthy') || slug.includes('grain') || slug.includes('acai')) {
      vertical = 'healthy_bowls';
    }
    else if (slug.includes('taco') || slug.includes('burrito') || slug.includes('mexican') || slug.includes('taqueria') || slug.includes('carnitas') || slug.includes('street-food')) {
      vertical = 'mexican';
    }
    else if (slug.includes('ramen') || slug.includes('noodle') || slug.includes('asian') || slug.includes('pho') || slug.includes('bao') || slug.includes('dumpling')) {
      vertical = 'asian';
    }
    else if (slug.includes('bakery') || slug.includes('pastry') || slug.includes('bread') || slug.includes('croissant') || slug.includes('cake')) {
      vertical = 'bakery';
    }
    else if (slug.includes('cafe') || slug.includes('coffee') || slug.includes('latte') || slug.includes('espresso') || slug.includes('cappuccino')) {
      vertical = 'cafe';
    }
    else if (slug.includes('wine') || slug.includes('fine') || slug.includes('candlelit') || slug.includes('tasting') || slug.includes('sommelier') || slug.includes('chefs-table')) {
      vertical = 'fine_dining';
    }
    else if (slug.includes('diner') || slug.includes('chrome') || slug.includes('retro') || slug.includes('classic-american')) {
      vertical = 'diner';
    }
    else if (slug.includes('sushi') || slug.includes('omakase') || slug.includes('japanese') || slug.includes('sake')) {
      vertical = 'sushi';
    }
    else if (slug.includes('steak') || slug.includes('butcher') || slug.includes('prime') || slug.includes('ribeye') || slug.includes('filet')) {
      vertical = 'steakhouse';
    }
    else if (slug.includes('southern') || slug.includes('comfort') || slug.includes('cast_iron') || slug.includes('soul-food') || slug.includes('fried-chicken')) {
      vertical = 'southern_comfort';
    }
    else if (slug.includes('ice_cream') || slug.includes('ice-cream') || slug.includes('dessert') || slug.includes('frost') || slug.includes('gelato') || slug.includes('sweet')) {
      vertical = 'ice_cream';
    }
    else if (slug.includes('fast') || slug.includes('quick') || slug.includes('counter') || slug.includes('grab-and-go') || slug.includes('order-counter')) {
      vertical = 'fast_casual';
    }
    // === BUSINESS OPERATIONS ===
    else if (slug.includes('hiring') || slug.includes('job') || slug.includes('career') || slug.includes('recruit') || slug.includes('join-team') || slug.includes('now-hiring')) {
      vertical = 'hiring';
    }
    else if (slug.includes('review') || slug.includes('testimonial') || slug.includes('social-proof') || slug.includes('rating') || slug.includes('award')) {
      vertical = 'social_proof';
    }
    else if (slug.includes('event') || slug.includes('promotion') || slug.includes('fireside') || slug.includes('live-music') || slug.includes('trivia') || slug.includes('party') || slug.includes('celebration')) {
      vertical = 'events';
    }
    else if (slug.includes('hours') || slug.includes('closed') || slug.includes('closure') || slug.includes('announcement') || slug.includes('update') || slug.includes('alert')) {
      vertical = 'operational';
    }
    
    if (!categorized[vertical]) {
      categorized[vertical] = [];
    }
    categorized[vertical].push(template);
  });
  
  // Sort templates within each category by display name
  Object.keys(categorized).forEach((key) => {
    categorized[key].sort((a, b) => 
      (a.display_name || a.slug).localeCompare(b.display_name || b.slug)
    );
  });
  
  return categorized;
}

export function TemplateGallery({
  templates,
  isLoading,
  error,
  selectedTemplateId,
  onSelectTemplate,
  onPreviewTemplate,
  filter,
  onFilterChange,
}: TemplateGalleryProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['holiday', 'sports', 'pizza', 'bar_grill', 'stories'])
  );

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    const query = filter.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter((template) => {
      const haystack = [
        template.display_name,
        template.slug,
        ...(template.variation_tags ?? []),
        ...(template.input_schema.required ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [templates, filter]);

  const categorized = useMemo(() => categorizeTemplates(filteredTemplates), [filteredTemplates]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenCategories(new Set(Object.keys(categorized)));
  };

  const collapseAll = () => {
    setOpenCategories(new Set());
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Label htmlFor="template-search" className="text-sm text-slate-300">
            Search templates
          </Label>
          <Input
            id="template-search"
            placeholder="Search by name, category, tag, or field..."
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            className="mt-1 w-full bg-white/5 text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-primary-500 hover:text-primary-300 underline"
          >
            Expand All
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-slate-400 hover:text-slate-300 underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load templates</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-lg bg-white/10" />
          ))}
        </div>
      )}

      {!isLoading && Object.keys(categorized).length === 0 && (
        <Alert variant="secondary" className="bg-white/5 text-slate-200">
          <AlertTitle>No templates found</AlertTitle>
          <AlertDescription>
            Try a different search term or pick another theme to see more creative options.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && Object.keys(categorized).length > 0 && (
        <div className="space-y-3">
          {Object.entries(categorized)
            .sort(([a], [b]) => {
              const order = Object.keys(CATEGORIES);
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([category, categoryTemplates]) => {
              const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES] || {
                label: category,
                description: '',
                userNeeds: '',
              };
              const isOpen = openCategories.has(category);

              return (
                <Card key={category} className="border-white/10 bg-white/5">
                  <CardHeader 
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="text-left">
                          <CardTitle className="text-lg text-white flex items-center gap-2">
                            {categoryInfo.label}
                            <span className="text-xs text-slate-500">
                              ({categoryInfo.userNeeds})
                            </span>
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-400">
                            {categoryInfo.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-slate-300 flex-shrink-0">
                        {categoryTemplates.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  {isOpen && (
                    <CardContent className="pt-0">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {categoryTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            isSelected={selectedTemplateId === template.id}
                            onSelect={onSelectTemplate}
                            onPreview={onPreviewTemplate}
                          />
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </div>
      )}
    </section>
  );
}
