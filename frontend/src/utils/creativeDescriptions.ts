/**
 * Creative Module Description Enhancement Utilities
 * 
 * Transforms technical prompt descriptions into customer-friendly marketing copy
 * and adds contextual "Best for" tags to help users understand template purposes.
 */

import type { ThemeSummary, TemplateSummary } from '@/features/creative/api/types';

// ============================================================================
// DESCRIPTION IMPROVEMENTS
// ============================================================================

const DESCRIPTION_IMPROVEMENTS: Record<string, string> = {
  // Technical jargon → Customer-friendly
  'dough artistry': 'artisan dough craftsmanship',
  'fermentation flex': 'perfectly fermented dough',
  'flour explosions': 'flour-dusted details',
  'Latte art POV': 'stunning latte art close-ups',
  'cocoa dust text': 'cocoa powder designs',
  'cafe hustle': 'bustling cafe atmosphere',
  'chalk marker labels': 'hand-written chalk labels',
  'vibrant liquid': 'golden beer tones',
  'brick wall chalkboard': 'rustic brick wall backdrop',
  'multi-course events': 'special tasting menus',
  'Macro': 'Close-up',
  'POV': 'perspective',
  'hero shot': 'eye-catching centerpiece',
  'flat lay': 'overhead arrangement',
  'bokeh': 'soft background blur',
  'mise en place': 'beautifully arranged ingredients',
  'plating': 'elegant presentation',
  'garnish': 'finishing touches',
};

// ============================================================================
// BEST FOR TAGS - Maps theme/template patterns to use cases
// ============================================================================

interface BestForMapping {
  keywords: string[];
  bestFor: string;
  icon: string;
}

const BEST_FOR_MAPPINGS: BestForMapping[] = [
  // Seasonal & Time-based
  { keywords: ['brunch', 'morning', 'breakfast'], bestFor: 'Weekend Brunch Promos', icon: '🌅' },
  { keywords: ['happy hour', 'cocktail', 'drink'], bestFor: 'Happy Hour Specials', icon: '🍸' },
  { keywords: ['dinner', 'evening', 'night'], bestFor: 'Dinner Service', icon: '🌙' },
  { keywords: ['lunch', 'midday'], bestFor: 'Lunch Specials', icon: '☀️' },
  
  // Menu Types
  { keywords: ['seasonal', 'limited', 'special'], bestFor: 'Limited-Time Offers', icon: '⏰' },
  { keywords: ['new menu', 'launch', 'introducing'], bestFor: 'New Menu Launches', icon: '🚀' },
  { keywords: ['tasting', 'prix fixe', 'course'], bestFor: 'Tasting Menus', icon: '🍽️' },
  { keywords: ['dessert', 'sweet', 'pastry'], bestFor: 'Dessert Features', icon: '🍰' },
  
  // Restaurant Types
  { keywords: ['pizza', 'dough', 'oven'], bestFor: 'Pizzeria Marketing', icon: '🍕' },
  { keywords: ['coffee', 'latte', 'espresso', 'cafe'], bestFor: 'Coffee Shop Posts', icon: '☕' },
  { keywords: ['beer', 'brewery', 'tap', 'flight'], bestFor: 'Brewery & Taproom', icon: '🍺' },
  { keywords: ['steak', 'grill', 'bbq', 'meat'], bestFor: 'Steakhouse & BBQ', icon: '🥩' },
  { keywords: ['sushi', 'japanese', 'ramen'], bestFor: 'Japanese Cuisine', icon: '🍣' },
  { keywords: ['mexican', 'taco', 'burrito'], bestFor: 'Mexican Restaurant', icon: '🌮' },
  { keywords: ['italian', 'pasta', 'risotto'], bestFor: 'Italian Dining', icon: '🍝' },
  { keywords: ['seafood', 'fish', 'oyster'], bestFor: 'Seafood Restaurant', icon: '🦞' },
  { keywords: ['bakery', 'bread', 'pastries'], bestFor: 'Bakery & Patisserie', icon: '🥐' },
  
  // Social Proof
  { keywords: ['review', 'testimonial', 'customer'], bestFor: 'Customer Testimonials', icon: '⭐' },
  { keywords: ['award', 'recognition', 'best'], bestFor: 'Awards & Recognition', icon: '🏆' },
  
  // Hiring
  { keywords: ['hiring', 'job', 'career', 'team'], bestFor: 'Recruitment Posts', icon: '👥' },
  { keywords: ['chef', 'cook', 'kitchen'], bestFor: 'Kitchen Staff Hiring', icon: '👨‍🍳' },
  
  // Events
  { keywords: ['event', 'party', 'celebration'], bestFor: 'Event Announcements', icon: '🎉' },
  { keywords: ['holiday', 'christmas', 'thanksgiving'], bestFor: 'Holiday Promotions', icon: '🎄' },
  { keywords: ['live music', 'entertainment'], bestFor: 'Entertainment Nights', icon: '🎵' },
  { keywords: ['trivia', 'game'], bestFor: 'Trivia & Game Nights', icon: '🎯' },
  
  // New categories for expanded library
  { keywords: ['delivery', 'takeout', 'pickup', 'to-go'], bestFor: 'Delivery & Takeout', icon: '🚗' },
  { keywords: ['sports', 'game day', 'football', 'watch party'], bestFor: 'Sports & Game Day', icon: '🏈' },
  { keywords: ['gift card', 'gift certificate'], bestFor: 'Gift Card Promos', icon: '🎁' },
  { keywords: ['reward', 'loyalty', 'points'], bestFor: 'Loyalty Programs', icon: '💎' },
  { keywords: ['new year', 'nye', 'countdown'], bestFor: 'New Year\'s Celebrations', icon: '🎆' },
  { keywords: ['valentine', 'romantic', 'date night'], bestFor: 'Valentine\'s Day', icon: '💕' },
  { keywords: ['story', 'stories', 'instagram story'], bestFor: 'Instagram Stories', icon: '📱' },
  { keywords: ['square', 'feed', 'instagram post'], bestFor: 'Instagram Feed Posts', icon: '📸' },
  { keywords: ['facebook', 'fb post'], bestFor: 'Facebook Posts', icon: '👍' },
  { keywords: ['behind the scenes', 'bts', 'kitchen'], bestFor: 'Behind-the-Scenes', icon: '🎬' },
  { keywords: ['ugc', 'user generated', 'community'], bestFor: 'Community Content', icon: '🤝' },
  { keywords: ['weather', 'rain', 'snow', 'cold', 'hot'], bestFor: 'Weather-Based Promos', icon: '🌤️' },
  { keywords: ['catering', 'private event', 'group'], bestFor: 'Catering & Events', icon: '🎊' },
  { keywords: ['wine', 'sommelier', 'pairing'], bestFor: 'Wine Features', icon: '🍷' },
  { keywords: ['craft', 'artisan', 'handmade'], bestFor: 'Artisan Features', icon: '✨' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Enhances a theme description to be more customer-friendly
 */
export function enhanceThemeDescription(theme: ThemeSummary): string {
  if (!theme.description) return '';
  
  let enhanced = theme.description;
  Object.entries(DESCRIPTION_IMPROVEMENTS).forEach(([old, replacement]) => {
    enhanced = enhanced.replace(new RegExp(old, 'gi'), replacement);
  });
  
  return enhanced;
}

/**
 * Gets the "Best for" tag for a theme or template based on its content
 */
export function getBestForTag(item: ThemeSummary | TemplateSummary): { bestFor: string; icon: string } | null {
  const searchText = [
    (item as ThemeSummary).name || '',
    (item as TemplateSummary).display_name || '',
    item.description || '',
    (item as TemplateSummary).slug || '',
    (item as ThemeSummary).restaurant_vertical || '',
  ].join(' ').toLowerCase();
  
  for (const mapping of BEST_FOR_MAPPINGS) {
    if (mapping.keywords.some(keyword => searchText.includes(keyword))) {
      return { bestFor: mapping.bestFor, icon: mapping.icon };
    }
  }
  
  return null;
}

/**
 * Gets multiple relevant "Best for" tags (up to limit)
 */
export function getAllBestForTags(item: ThemeSummary | TemplateSummary, limit = 2): Array<{ bestFor: string; icon: string }> {
  const searchText = [
    (item as ThemeSummary).name || '',
    (item as TemplateSummary).display_name || '',
    item.description || '',
    (item as TemplateSummary).slug || '',
    (item as ThemeSummary).restaurant_vertical || '',
  ].join(' ').toLowerCase();
  
  const matches: Array<{ bestFor: string; icon: string }> = [];
  
  for (const mapping of BEST_FOR_MAPPINGS) {
    if (mapping.keywords.some(keyword => searchText.includes(keyword))) {
      matches.push({ bestFor: mapping.bestFor, icon: mapping.icon });
      if (matches.length >= limit) break;
    }
  }
  
  return matches;
}

/**
 * Creates a short, punchy one-liner for a template
 */
export function getTemplateOneLiner(template: TemplateSummary): string {
  const bestFor = getBestForTag(template);
  if (bestFor) {
    return `Perfect for ${bestFor.bestFor.toLowerCase()}`;
  }
  return 'Professional marketing template';
}

/**
 * Enhances a template description to be more customer-friendly
 */
export function enhanceTemplateDescription(template: TemplateSummary): string {
  if (!template.description) {
    return getTemplateOneLiner(template);
  }
  
  let enhanced = template.description;
  Object.entries(DESCRIPTION_IMPROVEMENTS).forEach(([old, replacement]) => {
    enhanced = enhanced.replace(new RegExp(old, 'gi'), replacement);
  });
  
  // Truncate if too long
  if (enhanced.length > 120) {
    enhanced = enhanced.substring(0, 117) + '...';
  }
  
  return enhanced;
}
