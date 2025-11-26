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
  // Holiday & Seasonal
  'festive glow': 'warm holiday atmosphere',
  'twinkling lights': 'sparkling holiday lights',
  'cozy warmth': 'inviting comfort',
  'holiday magic': 'festive celebration',
  // Food Photography Terms
  'cheese pull': 'stretchy cheese moment',
  'steam rising': 'fresh-from-the-kitchen steam',
  'sizzle': 'hot-off-the-grill',
  'drizzle': 'elegant sauce pour',
  'golden crust': 'perfectly crispy exterior',
  'char marks': 'beautiful grill lines',
  // Atmosphere Terms
  'ambient lighting': 'warm, inviting glow',
  'natural light': 'bright, fresh lighting',
  'moody atmosphere': 'intimate ambiance',
  'rustic setting': 'charming, authentic backdrop',
  'modern aesthetic': 'clean, contemporary style',
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
  // === HOLIDAY & SEASONAL (Highest Priority) ===
  { keywords: ['christmas', 'xmas', 'festive', 'holiday season', 'holiday_christmas', 'gingerbread', 'fireplace dining', 'cocoa', 'mulled wine'], bestFor: 'Christmas Promotions', icon: '🎄' },
  { keywords: ['new year', 'nye', 'countdown', 'midnight', 'champagne toast', 'new_years'], bestFor: 'New Year\'s Celebrations', icon: '🎆' },
  { keywords: ['thanksgiving', 'turkey', 'harvest feast', 'gratitude'], bestFor: 'Thanksgiving Specials', icon: '🦃' },
  { keywords: ['valentine', 'romantic', 'date night', 'couples', 'anniversary dinner'], bestFor: 'Valentine\'s Day', icon: '💕' },
  { keywords: ['fall', 'autumn', 'pumpkin', 'harvest', 'fall harvest'], bestFor: 'Fall Seasonal Menus', icon: '🍂' },
  { keywords: ['summer', 'patio', 'outdoor', 'sunshine', 'patio season'], bestFor: 'Summer Patio Season', icon: '☀️' },
  { keywords: ['spring', 'fresh', 'garden', 'spring menu'], bestFor: 'Spring Menu Launch', icon: '🌸' },
  { keywords: ['winter', 'cozy', 'warm', 'fireplace', 'comfort'], bestFor: 'Winter Comfort Promos', icon: '❄️' },
  
  // === SPORTS & GAME DAY ===
  { keywords: ['sports', 'game day', 'gameday', 'watch party', 'sports_gameday'], bestFor: 'Sports Watch Parties', icon: '🏈' },
  { keywords: ['football', 'nfl', 'college football', 'tailgate'], bestFor: 'Football Game Day', icon: '🏈' },
  { keywords: ['basketball', 'nba', 'march madness', 'hoops'], bestFor: 'Basketball Events', icon: '🏀' },
  { keywords: ['playoff', 'championship', 'finals', 'big game'], bestFor: 'Playoff Watch Parties', icon: '🏆' },
  { keywords: ['super bowl', 'big game', 'superbowl'], bestFor: 'Super Bowl Events', icon: '🏈' },
  { keywords: ['wings', 'bucket', 'pitcher', 'nachos'], bestFor: 'Game Day Specials', icon: '🍗' },
  
  // === TIME-BASED ===
  { keywords: ['brunch', 'morning', 'breakfast', 'eggs benedict', 'pancake', 'waffle', 'breakfast_brunch'], bestFor: 'Weekend Brunch Promos', icon: '🌅' },
  { keywords: ['happy hour', 'cocktail', 'drink special', 'happy_hour_drinks'], bestFor: 'Happy Hour Specials', icon: '🍸' },
  { keywords: ['dinner', 'evening', 'night', 'supper'], bestFor: 'Dinner Service', icon: '🌙' },
  { keywords: ['lunch', 'midday', 'noon', 'lunch special'], bestFor: 'Lunch Specials', icon: '☀️' },
  { keywords: ['late night', 'after hours', 'midnight', 'late-night'], bestFor: 'Late Night Cravings', icon: '🌃' },
  
  // === MENU TYPES ===
  { keywords: ['seasonal', 'limited', 'special', 'lto', 'daily_specials_lto', 'limited time'], bestFor: 'Limited-Time Offers', icon: '⏰' },
  { keywords: ['new menu', 'launch', 'introducing', 'grand opening'], bestFor: 'New Menu Launches', icon: '🚀' },
  { keywords: ['tasting', 'prix fixe', 'course', 'omakase', 'chef\'s table'], bestFor: 'Tasting Menus', icon: '🍽️' },
  { keywords: ['dessert', 'sweet', 'pastry', 'cake', 'cookie', 'chocolate'], bestFor: 'Dessert Features', icon: '🍰' },
  
  // === RESTAURANT TYPES ===
  { keywords: ['pizza', 'dough', 'oven', 'slice', 'cheese pull', 'pizzeria', 'pizza_restaurant'], bestFor: 'Pizzeria Marketing', icon: '🍕' },
  { keywords: ['coffee', 'latte', 'espresso', 'cafe', 'barista', 'cappuccino'], bestFor: 'Coffee Shop Posts', icon: '☕' },
  { keywords: ['beer', 'brewery', 'tap', 'flight', 'craft', 'ipa', 'ale'], bestFor: 'Brewery & Taproom', icon: '🍺' },
  { keywords: ['bbq', 'smokehouse', 'brisket', 'pitmaster', 'smoked', 'ribs', 'bbq_smokehouse'], bestFor: 'BBQ & Smokehouse', icon: '🔥' },
  { keywords: ['steak', 'grill', 'prime', 'ribeye', 'filet', 'surf and turf'], bestFor: 'Steakhouse Marketing', icon: '🥩' },
  { keywords: ['sushi', 'japanese', 'omakase', 'sake', 'nigiri', 'sashimi'], bestFor: 'Japanese Cuisine', icon: '🍣' },
  { keywords: ['ramen', 'noodle', 'asian', 'pho', 'dim sum', 'asian_comfort'], bestFor: 'Asian Comfort Food', icon: '🍜' },
  { keywords: ['mexican', 'taco', 'burrito', 'margarita', 'taqueria', 'mexican_street_food'], bestFor: 'Mexican Restaurant', icon: '🌮' },
  { keywords: ['italian', 'pasta', 'risotto', 'trattoria'], bestFor: 'Italian Dining', icon: '🍝' },
  { keywords: ['seafood', 'fish', 'oyster', 'lobster', 'crab', 'raw bar', 'seafood_fresh_catch'], bestFor: 'Seafood Restaurant', icon: '🦞' },
  { keywords: ['bakery', 'bread', 'pastries', 'croissant', 'bakery_morning_light'], bestFor: 'Bakery & Patisserie', icon: '🥐' },
  { keywords: ['diner', 'comfort food', 'classic', 'blue plate', 'all-day breakfast'], bestFor: 'Diner & Comfort Food', icon: '🍳' },
  { keywords: ['fine dining', 'fine_dining', 'white tablecloth', 'elegant', 'upscale'], bestFor: 'Fine Dining', icon: '🍷' },
  { keywords: ['fast casual', 'fast_casual', 'counter', 'build your own', 'grab and go'], bestFor: 'Fast Casual', icon: '🍔' },
  { keywords: ['food truck', 'street food', 'mobile', 'festival'], bestFor: 'Food Truck', icon: '🚚' },
  { keywords: ['mediterranean', 'mezze', 'kebab', 'hummus', 'falafel'], bestFor: 'Mediterranean', icon: '🫒' },
  
  // === SOCIAL PROOF ===
  { keywords: ['review', 'testimonial', 'customer', 'social_proof', 'five star', '5 star'], bestFor: 'Customer Testimonials', icon: '⭐' },
  { keywords: ['award', 'recognition', 'best of', 'winner', 'voted'], bestFor: 'Awards & Recognition', icon: '🏆' },
  
  // === HIRING ===
  { keywords: ['hiring', 'job', 'career', 'team', 'recruit', 'join our team', 'now hiring'], bestFor: 'Recruitment Posts', icon: '👥' },
  { keywords: ['chef', 'cook', 'kitchen staff', 'line cook', 'sous chef'], bestFor: 'Kitchen Staff Hiring', icon: '👨‍🍳' },
  
  // === EVENTS ===
  { keywords: ['event', 'party', 'celebration', 'special_events'], bestFor: 'Event Announcements', icon: '🎉' },
  { keywords: ['live music', 'entertainment', 'band', 'dj', 'performer'], bestFor: 'Entertainment Nights', icon: '🎵' },
  { keywords: ['trivia', 'game night', 'quiz', 'bingo'], bestFor: 'Trivia & Game Nights', icon: '🎯' },
  { keywords: ['catering', 'private event', 'group dining', 'private dining', 'banquet'], bestFor: 'Catering & Events', icon: '🎊' },
  { keywords: ['grand opening', 'now open', 'ribbon cutting', 'opening day'], bestFor: 'Grand Opening', icon: '🎊' },
  
  // === PROMOTIONS ===
  { keywords: ['delivery', 'takeout', 'pickup', 'to-go', 'online order', 'delivery_takeout', 'curbside'], bestFor: 'Delivery & Takeout', icon: '🚗' },
  { keywords: ['gift card', 'gift certificate', 'give the gift', 'giftcard', 'giftcards_rewards'], bestFor: 'Gift Card Promos', icon: '🎁' },
  { keywords: ['reward', 'loyalty', 'points', 'member', 'vip', 'rewards program'], bestFor: 'Loyalty Programs', icon: '💎' },
  { keywords: ['weather', 'rain', 'snow', 'cold day', 'hot day', 'rainy day', 'snow day'], bestFor: 'Weather-Based Promos', icon: '🌤️' },
  
  // === CONTENT TYPES ===
  { keywords: ['story', 'stories', 'instagram story', 'vertical', 'instagram_stories', '9:16'], bestFor: 'Instagram Stories', icon: '📱' },
  { keywords: ['square', 'feed', 'instagram post', '1:1', 'instagram_square'], bestFor: 'Instagram Feed Posts', icon: '📸' },
  { keywords: ['facebook', 'fb post', 'facebook_post'], bestFor: 'Facebook Posts', icon: '👍' },
  { keywords: ['behind the scenes', 'bts', 'kitchen action', 'behind_the_scenes'], bestFor: 'Behind-the-Scenes', icon: '🎬' },
  { keywords: ['ugc', 'user generated', 'community', 'repost', 'ugc_operational'], bestFor: 'Community Content', icon: '🤝' },
  
  // === OPERATIONAL ===
  { keywords: ['hours', 'schedule', 'open', 'closed', 'new hours'], bestFor: 'Hours Updates', icon: '🕐' },
  { keywords: ['announcement', 'update', 'news', 'alert'], bestFor: 'Announcements', icon: '📢' },
  { keywords: ['thank you', 'milestone', 'anniversary', 'years of'], bestFor: 'Milestone Celebrations', icon: '🙏' },
  
  // === MISC ===
  { keywords: ['wine', 'sommelier', 'pairing', 'vineyard', 'wine list', 'by the glass'], bestFor: 'Wine Features', icon: '🍷' },
  { keywords: ['craft', 'artisan', 'handmade', 'small batch', 'house-made'], bestFor: 'Artisan Features', icon: '✨' },
  { keywords: ['charcuterie', 'cheese board', 'grazing', 'appetizer platter'], bestFor: 'Charcuterie & Boards', icon: '🧀' },
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
