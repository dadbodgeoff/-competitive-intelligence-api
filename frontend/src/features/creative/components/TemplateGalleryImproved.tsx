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
    label: '🌮 Fast Casual',
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
  sushi: {
    label: '🍣 Sushi & Japanese',
    description: 'Omakase, sushi rolls, and Japanese cuisine',
    userNeeds: 'Roll names, omakase details, chef specials, prices',
  },
  taqueria: {
    label: '🌮 Tacos & Mexican',
    description: 'Tacos, burritos, and Mexican street food',
    userNeeds: 'Taco types, proteins, prices, taco Tuesday deals',
  },
  steakhouse: {
    label: '🥩 Steakhouse',
    description: 'Premium cuts, butcher specials, and meat-focused dining',
    userNeeds: 'Cut names, weights, prices, preparation styles',
  },
  southern_comfort: {
    label: '🍗 Southern Comfort',
    description: 'Soul food, BBQ, and southern hospitality',
    userNeeds: 'Comfort dishes, family-style options, southern messaging',
  },
  ice_cream: {
    label: '🍦 Desserts & Ice Cream',
    description: 'Sweet treats, frozen desserts, and bakery items',
    userNeeds: 'Flavor names, prices, seasonal specials, bundle deals',
  },
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
    description: 'Special events, seasonal campaigns, and limited offers',
    userNeeds: 'Event names, dates, times, special offers, RSVP details',
  },
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
    
    if (slug.includes('pizza') || slug.includes('italian')) vertical = 'pizza';
    else if (slug.includes('bar') || slug.includes('grill') || slug.includes('beer')) vertical = 'bar_grill';
    else if (slug.includes('breakfast') || slug.includes('brunch')) vertical = 'breakfast';
    else if (slug.includes('bowl') || slug.includes('salad') || slug.includes('healthy')) vertical = 'healthy_bowls';
    else if (slug.includes('taco') || slug.includes('burrito')) vertical = 'taqueria';
    else if (slug.includes('bakery') || slug.includes('pastry') || slug.includes('bread')) vertical = 'bakery';
    else if (slug.includes('cafe') || slug.includes('coffee') || slug.includes('latte')) vertical = 'cafe';
    else if (slug.includes('wine') || slug.includes('fine') || slug.includes('candlelit')) vertical = 'fine_dining';
    else if (slug.includes('diner') || slug.includes('chrome')) vertical = 'diner';
    else if (slug.includes('sushi') || slug.includes('omakase')) vertical = 'sushi';
    else if (slug.includes('steak') || slug.includes('butcher')) vertical = 'steakhouse';
    else if (slug.includes('southern') || slug.includes('comfort') || slug.includes('cast_iron')) vertical = 'southern_comfort';
    else if (slug.includes('ice_cream') || slug.includes('dessert') || slug.includes('frost')) vertical = 'ice_cream';
    else if (slug.includes('hiring') || slug.includes('board_now')) vertical = 'hiring';
    else if (slug.includes('review') || slug.includes('testimonial') || slug.includes('social')) vertical = 'social_proof';
    else if (slug.includes('event') || slug.includes('promotion') || slug.includes('fireside')) vertical = 'events';
    
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
    new Set(['pizza', 'bar_grill', 'hiring', 'social_proof'])
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
            className="text-xs text-emerald-400 hover:text-emerald-300 underline"
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
