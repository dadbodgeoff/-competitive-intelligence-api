import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ColorPalettePicker } from './ColorPalettePicker';
import type { BrandProfileSummary } from '../api/types';

const BRAND_VOICES = ['casual', 'professional', 'playful', 'elegant', 'bold'] as const;
const VISUAL_STYLES = ['rustic', 'modern', 'minimalist', 'vibrant', 'dark_moody'] as const;
const CUISINE_TYPES = [
  'italian', 'mexican', 'asian_fusion', 'american', 'bbq', 'seafood',
  'steakhouse', 'cafe', 'bakery', 'pizza', 'sushi', 'mediterranean', 'other'
] as const;
const ATMOSPHERE_TAGS = ['cozy', 'industrial', 'beachy', 'urban', 'rustic', 'modern', 'elegant', 'casual'] as const;
const TARGET_DEMOGRAPHICS = ['families', 'young_professionals', 'date_night', 'lunch_crowd', 'all_ages'] as const;

// Phase 2 constants
const LOGO_PLACEMENTS = ['top_left', 'top_right', 'center', 'bottom_left', 'bottom_right', 'none'] as const;
const WATERMARK_STYLES = ['subtle', 'prominent', 'none'] as const;
const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin'] as const;
const ASPECT_RATIOS = ['square', 'portrait', 'landscape'] as const;
const COMMON_ALLERGENS = ['dairy', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soy'] as const;
const PROHIBITED_ITEMS = ['alcohol', 'meat', 'pork', 'beef', 'seafood', 'gluten', 'dairy'] as const;

// Phase 3 constants
const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
const HOLIDAYS = [
  'christmas', 'valentines', 'halloween', 'thanksgiving', 'independence_day',
  'mothers_day', 'fathers_day', 'st_patricks', 'easter', 'new_years'
] as const;
const LOCATION_TYPES = ['urban', 'suburban', 'beach', 'mountain', 'rural'] as const;
const REGIONAL_STYLES = [
  'southern', 'new_england', 'southwest', 'pacific_northwest', 'midwest',
  'cajun', 'tex_mex', 'california', 'new_york', 'chicago'
] as const;
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;
const VALUE_PROPOSITIONS = [
  'best_value', 'premium_ingredients', 'quick_affordable', 'fine_dining', 'family_friendly', 'casual_dining'
] as const;

const brandProfileSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required').max(120),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  headline_font: z.string().optional(),
  body_font: z.string().optional(),
  is_default: z.boolean().default(false),
  // Phase 1 fields
  brand_voice: z.string().optional(),
  voice_description: z.string().max(200).optional(),
  visual_styles: z.array(z.string()).default([]),
  cuisine_type: z.string().optional(),
  cuisine_specialties: z.array(z.string()).default([]),
  atmosphere_tags: z.array(z.string()).default([]),
  target_demographic: z.string().optional(),
  // Phase 2 fields
  logo_placement: z.string().default('top_left'),
  logo_watermark_style: z.string().default('subtle'),
  prohibited_elements: z.array(z.string()).default([]),
  allergen_warnings: z.array(z.string()).default([]),
  primary_social_platforms: z.array(z.string()).default([]),
  preferred_aspect_ratios: z.array(z.string()).default([]),
  brand_hashtags: z.array(z.string()).default([]),
  social_media_handle: z.string().optional(),
  // Phase 3 fields
  active_seasons: z.array(z.string()).default([]),
  holiday_participation: z.array(z.string()).default([]),
  seasonal_menu_rotation: z.boolean().default(false),
  location_type: z.string().optional(),
  regional_style: z.string().optional(),
  local_landmarks: z.string().max(200).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('USA'),
  price_range: z.string().optional(),
  value_proposition: z.string().optional(),
  average_check_size: z.number().optional(),
  positioning_statement: z.string().max(300).optional(),
});

type BrandProfileFormData = z.infer<typeof brandProfileSchema>;

interface BrandProfileFormProps {
  profile?: BrandProfileSummary;
  onSubmit: (data: BrandProfileFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function BrandProfileForm({
  profile,
  onSubmit,
  onCancel,
  isSubmitting,
}: BrandProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BrandProfileFormData>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      brand_name: profile?.brand_name || '',
      primary_color: (profile?.palette?.primary as string) || '#10b981',
      secondary_color: (profile?.palette?.secondary as string) || '#0ea5e9',
      accent_color: (profile?.palette?.accent as string) || '#f97316',
      headline_font: (profile?.typography?.headline as string) || '',
      body_font: (profile?.typography?.body as string) || '',
      is_default: profile?.is_default || false,
      brand_voice: profile?.brand_voice || '',
      voice_description: profile?.voice_description || '',
      visual_styles: profile?.visual_styles || [],
      cuisine_type: profile?.cuisine_type || '',
      cuisine_specialties: profile?.cuisine_specialties || [],
      atmosphere_tags: profile?.atmosphere_tags || [],
      target_demographic: profile?.target_demographic || '',
      // Phase 2 defaults
      logo_placement: profile?.logo_placement || 'top_left',
      logo_watermark_style: profile?.logo_watermark_style || 'subtle',
      prohibited_elements: profile?.prohibited_elements || [],
      allergen_warnings: profile?.allergen_warnings || [],
      primary_social_platforms: profile?.primary_social_platforms || [],
      preferred_aspect_ratios: profile?.preferred_aspect_ratios || [],
      brand_hashtags: profile?.brand_hashtags || [],
      social_media_handle: profile?.social_media_handle || '',
      // Phase 3 defaults
      active_seasons: profile?.active_seasons || [],
      holiday_participation: profile?.holiday_participation || [],
      seasonal_menu_rotation: profile?.seasonal_menu_rotation || false,
      location_type: profile?.location_type || '',
      regional_style: profile?.regional_style || '',
      local_landmarks: profile?.local_landmarks || '',
      city: profile?.city || '',
      state: profile?.state || '',
      country: profile?.country || 'USA',
      price_range: profile?.price_range || '',
      value_proposition: profile?.value_proposition || '',
      average_check_size: profile?.average_check_size || undefined,
      positioning_statement: profile?.positioning_statement || '',
    },
  });

  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');
  const accentColor = watch('accent_color');
  const isDefault = watch('is_default');
  const visualStyles = watch('visual_styles');
  const cuisineSpecialties = watch('cuisine_specialties');
  const atmosphereTags = watch('atmosphere_tags');
  // Phase 2 watch
  const prohibitedElements = watch('prohibited_elements');
  const allergenWarnings = watch('allergen_warnings');
  const socialPlatforms = watch('primary_social_platforms');
  const aspectRatios = watch('preferred_aspect_ratios');
  const brandHashtags = watch('brand_hashtags');
  // Phase 3 watch
  const activeSeasons = watch('active_seasons');
  const holidayParticipation = watch('holiday_participation');
  const seasonalMenuRotation = watch('seasonal_menu_rotation');

  const toggleArrayValue = (
    field: 'visual_styles' | 'cuisine_specialties' | 'atmosphere_tags' | 'prohibited_elements' | 'allergen_warnings' | 'primary_social_platforms' | 'preferred_aspect_ratios' | 'active_seasons' | 'holiday_participation',
    value: string
  ) => {
    const currentValues = watch(field);
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            {profile ? 'Edit Brand Profile' : 'Create Brand Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-200">
              Brand Name <span className="text-emerald-300">*</span>
            </Label>
            <Input
              {...register('brand_name')}
              placeholder="e.g., Copper & Flame"
              className="bg-white/5 border-white/10 text-white"
            />
            {errors.brand_name && (
              <p className="text-sm text-red-400">{errors.brand_name.message}</p>
            )}
          </div>

          {/* Color Palette */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-200">
              Color Palette <span className="text-emerald-300">*</span>
            </Label>
            <ColorPalettePicker
              primary={primaryColor}
              secondary={secondaryColor}
              accent={accentColor}
              onPrimaryChange={(color) => setValue('primary_color', color)}
              onSecondaryChange={(color) => setValue('secondary_color', color)}
              onAccentChange={(color) => setValue('accent_color', color)}
            />
            {(errors.primary_color || errors.secondary_color || errors.accent_color) && (
              <p className="text-sm text-red-400">Please provide valid hex colors</p>
            )}
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <Label className="text-sm text-slate-200">Typography (Optional)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Headline Font</Label>
                <Input
                  {...register('headline_font')}
                  placeholder="e.g., Bebas Neue"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Body Font</Label>
                <Input
                  {...register('body_font')}
                  placeholder="e.g., Open Sans"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          {/* Brand Voice & Tone */}
          <div className="space-y-4">
            <Label className="text-sm text-slate-200">Brand Voice & Personality</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Voice Style</Label>
                <select
                  {...register('brand_voice')}
                  className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                >
                  <option value="">Select voice...</option>
                  {BRAND_VOICES.map((voice) => (
                    <option key={voice} value={voice} className="bg-slate-900">
                      {voice.charAt(0).toUpperCase() + voice.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Target Audience</Label>
                <select
                  {...register('target_demographic')}
                  className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                >
                  <option value="">Select audience...</option>
                  {TARGET_DEMOGRAPHICS.map((demo) => (
                    <option key={demo} value={demo} className="bg-slate-900">
                      {demo.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Voice Description (Optional)</Label>
              <Textarea
                {...register('voice_description')}
                placeholder="e.g., Family-friendly and warm, or Upscale and sophisticated"
                className="bg-white/5 border-white/10 text-white resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Visual Style */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-200">Visual Style Preferences</Label>
            <div className="flex flex-wrap gap-2">
              {VISUAL_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleArrayValue('visual_styles', style)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    visualStyles.includes(style)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {style.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine Type */}
          <div className="space-y-4">
            <Label className="text-sm text-slate-200">Cuisine & Specialties</Label>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Primary Cuisine Type</Label>
              <select
                {...register('cuisine_type')}
                className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
              >
                <option value="">Select cuisine...</option>
                {CUISINE_TYPES.map((cuisine) => (
                  <option key={cuisine} value={cuisine} className="bg-slate-900">
                    {cuisine.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Specialties (Optional)</Label>
              <Input
                placeholder="e.g., Wood-fired pizza, Craft cocktails, Vegan options"
                className="bg-white/5 border-white/10 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && !cuisineSpecialties.includes(value)) {
                      setValue('cuisine_specialties', [...cuisineSpecialties, value]);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              {cuisineSpecialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {cuisineSpecialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-md flex items-center gap-1"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => setValue('cuisine_specialties', cuisineSpecialties.filter(s => s !== specialty))}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Atmosphere */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-200">Atmosphere & Ambiance</Label>
            <div className="flex flex-wrap gap-2">
              {ATMOSPHERE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleArrayValue('atmosphere_tags', tag)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    atmosphereTags.includes(tag)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Phase 2: Logo & Branding */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-emerald-400">Logo & Branding (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Logo Placement</Label>
                  <select
                    {...register('logo_placement')}
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                  >
                    {LOGO_PLACEMENTS.map((placement) => (
                      <option key={placement} value={placement} className="bg-slate-900">
                        {placement.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Watermark Style</Label>
                  <select
                    {...register('logo_watermark_style')}
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                  >
                    {WATERMARK_STYLES.map((style) => (
                      <option key={style} value={style} className="bg-slate-900">
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase 2: Compliance & Restrictions */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-emerald-400">Compliance & Restrictions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-200">Prohibited Elements</Label>
                <p className="text-xs text-slate-500">Select items to avoid in generated images</p>
                <div className="flex flex-wrap gap-2">
                  {PROHIBITED_ITEMS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayValue('prohibited_elements', item)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        prohibitedElements.includes(item)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {item.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-200">Allergen Warnings</Label>
                <p className="text-xs text-slate-500">Select allergens to highlight</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGENS.map((allergen) => (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleArrayValue('allergen_warnings', allergen)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        allergenWarnings.includes(allergen)
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {allergen.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase 2: Social Media Preferences */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-emerald-400">Social Media Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-200">Primary Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => toggleArrayValue('primary_social_platforms', platform)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        socialPlatforms.includes(platform)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-200">Preferred Aspect Ratios</Label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => toggleArrayValue('preferred_aspect_ratios', ratio)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        aspectRatios.includes(ratio)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {ratio.charAt(0).toUpperCase() + ratio.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Social Media Handle</Label>
                <Input
                  {...register('social_media_handle')}
                  placeholder="@yourrestaurant"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Brand Hashtags</Label>
                <Input
                  placeholder="Press Enter to add hashtags"
                  className="bg-white/5 border-white/10 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      let value = e.currentTarget.value.trim();
                      if (value && !brandHashtags.includes(value)) {
                        if (!value.startsWith('#')) value = '#' + value;
                        setValue('brand_hashtags', [...brandHashtags, value]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                {brandHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandHashtags.map((hashtag) => (
                      <span
                        key={hashtag}
                        className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-md flex items-center gap-1"
                      >
                        {hashtag}
                        <button
                          type="button"
                          onClick={() => setValue('brand_hashtags', brandHashtags.filter(h => h !== hashtag))}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Phase 3: Seasonal & Events */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-emerald-400">Seasonal & Events (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-200">Active Seasons</Label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((season) => (
                    <button
                      key={season}
                      type="button"
                      onClick={() => toggleArrayValue('active_seasons', season)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        activeSeasons.includes(season)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-200">Holiday Participation</Label>
                <div className="flex flex-wrap gap-2">
                  {HOLIDAYS.map((holiday) => (
                    <button
                      key={holiday}
                      type="button"
                      onClick={() => toggleArrayValue('holiday_participation', holiday)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        holidayParticipation.includes(holiday)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {holiday.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seasonal_menu_rotation"
                  checked={seasonalMenuRotation}
                  onCheckedChange={(checked) => setValue('seasonal_menu_rotation', checked as boolean)}
                  className="border-white/20"
                />
                <Label htmlFor="seasonal_menu_rotation" className="text-sm text-slate-200 cursor-pointer">
                  Seasonal menu rotation
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Phase 3: Location Context */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-emerald-400">Location Context (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">City</Label>
                  <Input
                    {...register('city')}
                    placeholder="e.g., Austin"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">State</Label>
                  <Input
                    {...register('state')}
                    placeholder="e.g., TX"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Country</Label>
                  <Input
                    {...register('country')}
                    placeholder="USA"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Location Type</Label>
                  <select
                    {...register('location_type')}
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                  >
                    <option value="">Select type...</option>
                    {LOCATION_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-slate-900">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Regional Style</Label>
                  <select
                    {...register('regional_style')}
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                  >
                    <option value="">Select style...</option>
                    {REGIONAL_STYLES.map((style) => (
                      <option key={style} value={style} className="bg-slate-900">
                        {style.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Local Landmarks / Description</Label>
                <Textarea
                  {...register('local_landmarks')}
                  placeholder="e.g., Near the waterfront, Downtown historic district"
                  className="bg-white/5 border-white/10 text-white resize-none"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Phase 3: Price Positioning */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-emerald-400">Price Positioning (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Price Range</Label>
                  <select
                    {...register('price_range')}
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                  >
                    <option value="">Select range...</option>
                    {PRICE_RANGES.map((range) => (
                      <option key={range} value={range} className="bg-slate-900">
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Value Proposition</Label>
                  <select
                    {...register('value_proposition')}
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
                  >
                    <option value="">Select proposition...</option>
                    {VALUE_PROPOSITIONS.map((prop) => (
                      <option key={prop} value={prop} className="bg-slate-900">
                        {prop.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Positioning Statement</Label>
                <Textarea
                  {...register('positioning_statement')}
                  placeholder="e.g., Farm-to-table dining in the heart of downtown"
                  className="bg-white/5 border-white/10 text-white resize-none"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Default Profile */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={isDefault}
              onCheckedChange={(checked) => setValue('is_default', checked as boolean)}
              className="border-white/20"
            />
            <Label
              htmlFor="is_default"
              className="text-sm text-slate-200 cursor-pointer"
            >
              Set as default brand profile
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {isSubmitting ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-white/10 text-slate-300 hover:bg-white/5"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
