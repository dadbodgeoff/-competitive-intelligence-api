import { useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UsageLimitWarning } from '@/components/common/UsageLimitWarning';
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Wand2,
  ChevronDown,
  Check,
  Zap,
  Image as ImageIcon,
  Type,
  Square,
  RectangleVertical,
  RectangleHorizontal,
  Smartphone,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { StartGenerationRequest } from '../api/types';
import { useBrandProfiles } from '../hooks/useBrandProfiles';

// ============================================================================
// STREAMLINED OPTIONS - Recommended first, more options hidden
// ============================================================================

const LIGHTING_OPTIONS = [
  { value: 'golden_hour', label: 'Golden Hour', icon: '🌅', recommended: true },
  { value: 'studio', label: 'Studio', icon: '💡', recommended: true },
  { value: 'moody', label: 'Moody', icon: '🌙', recommended: true },
  { value: 'natural', label: 'Window Light', icon: '☀️' },
  { value: 'neon', label: 'Neon', icon: '🎆' },
];

const ATMOSPHERE_OPTIONS = [
  { value: 'cozy', label: 'Cozy', icon: '🏠', recommended: true },
  { value: 'upscale', label: 'Upscale', icon: '✨', recommended: true },
  { value: 'vibrant', label: 'Vibrant', icon: '🎉', recommended: true },
  { value: 'rustic', label: 'Rustic', icon: '🪵' },
  { value: 'modern', label: 'Modern', icon: '🏢' },
  { value: 'casual', label: 'Casual', icon: '😊' },
];

const COMPOSITION_OPTIONS = [
  { value: 'hero', label: 'Hero Shot', icon: '🎯', recommended: true },
  { value: 'flat_lay', label: 'Overhead', icon: '📐', recommended: true },
  { value: 'action', label: 'Action', icon: '🎬', recommended: true },
  { value: 'lifestyle', label: 'Lifestyle', icon: '👥' },
  { value: 'close_up', label: 'Close-Up', icon: '🔍' },
];

const TEXTURE_OPTIONS = [
  { value: 'none', label: 'Clean', icon: '✨' },
  { value: 'steam', label: 'Steam', icon: '♨️' },
  { value: 'bokeh', label: 'Bokeh', icon: '💫' },
  { value: 'film_grain', label: 'Film', icon: '🎞️' },
];

const SUBJECT_TYPES = [
  { value: 'food_hero', label: 'Food', icon: '🍕' },
  { value: 'drink', label: 'Drinks', icon: '🍹' },
  { value: 'interior', label: 'Interior', icon: '🏪' },
  { value: 'promo', label: 'Promo', icon: '📢' },
];

// Quick-fill examples that appear as chips
const QUICK_EXAMPLES: Record<string, string[]> = {
  food_hero: [
    'Sizzling steak with herb butter',
    'Wood-fired Margherita pizza',
    'Fresh poke bowl with salmon',
    'Artisan sourdough bread',
  ],
  drink: [
    'Craft cocktail with citrus garnish',
    'Frothy cappuccino with latte art',
    'Cold brew with ice condensation',
    'Craft IPA in frosted glass',
  ],
  interior: [
    'Cozy corner booth with warm lighting',
    'Bustling open kitchen',
    'Elegant bar with mood lighting',
  ],
  promo: [
    'Weekend brunch special',
    'Happy hour announcement',
    'New menu launch',
  ],
};

// ============================================================================
// FORM SCHEMA
// ============================================================================

const customPromptSchema = z.object({
  mainSubject: z.string().min(3, 'Describe what you want to create'),
  subjectType: z.string().default('food_hero'),
  lighting: z.string().default('golden_hour'),
  composition: z.string().default('hero'),
  atmosphere: z.string().default('cozy'),
  texture: z.string().default('none'),
  includeText: z.boolean().default(false),
  headlineText: z.string().optional(),
  subText: z.string().optional(),
  additionalDetails: z.string().optional(),
  variants: z.coerce.number().int().min(1).max(4).default(1),
  dimensions: z.string().default('1024x1024'),
  brandProfileId: z.string().default('auto'),
});

type CustomPromptForm = z.infer<typeof customPromptSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface CustomPromptBuilderProps {
  isSubmitting: boolean;
  onGenerate: (payload: StartGenerationRequest) => Promise<void>;
}

export function CustomPromptBuilder({ isSubmitting, onGenerate }: CustomPromptBuilderProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomPromptForm>({
    resolver: zodResolver(customPromptSchema),
    defaultValues: {
      mainSubject: '',
      subjectType: 'food_hero',
      lighting: 'golden_hour',
      composition: 'hero',
      atmosphere: 'cozy',
      texture: 'none',
      includeText: false,
      headlineText: '',
      subText: '',
      additionalDetails: '',
      variants: 1,
      dimensions: '1024x1024',
      brandProfileId: 'auto',
    },
  });

  const usage = useUsageLimit('image_generation', false);
  const brandProfilesQuery = useBrandProfiles();
  const brandProfiles = brandProfilesQuery.data ?? [];
  
  const formValues = watch();
  const mainSubject = watch('mainSubject');
  
  // Quality score based on input detail
  const qualityScore = useMemo(() => {
    const len = mainSubject?.length || 0;
    if (len < 10) return { level: 'minimal', label: 'Add more detail', color: 'text-slate-500' };
    if (len < 30) return { level: 'basic', label: 'Good start', color: 'text-amber-400' };
    if (len < 60) return { level: 'good', label: 'Nice detail!', color: 'text-green-400' };
    return { level: 'excellent', label: 'Excellent!', color: 'text-primary-400' };
  }, [mainSubject]);

  // Generate preview prompt
  const generatedPrompt = useMemo(() => {
    const lighting = LIGHTING_OPTIONS.find(o => o.value === formValues.lighting);
    const composition = COMPOSITION_OPTIONS.find(o => o.value === formValues.composition);
    const atmosphere = ATMOSPHERE_OPTIONS.find(o => o.value === formValues.atmosphere);
    
    let prompt = '';
    
    if (formValues.mainSubject) {
      prompt += `Photorealistic ${formValues.mainSubject}`;
    } else {
      prompt += 'Photorealistic restaurant marketing image';
    }
    
    if (composition && composition.value !== 'hero') {
      prompt += `, ${composition.label.toLowerCase()} composition`;
    }
    
    if (atmosphere) {
      prompt += `. ${atmosphere.label} atmosphere`;
    }
    
    if (lighting) {
      prompt += `. ${lighting.label} lighting`;
    }
    
    if (formValues.includeText && formValues.headlineText) {
      prompt += `. Text overlay: "${formValues.headlineText}"`;
      if (formValues.subText) {
        prompt += ` with "${formValues.subText}"`;
      }
    }
    
    prompt += '. Professional food photography, magazine-quality.';
    
    return prompt;
  }, [formValues]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: StartGenerationRequest = {
      template_id: 'custom',
      theme_id: 'custom',
      user_inputs: {
        main_subject: values.mainSubject,
        headline: values.headlineText || '',
        sub_text: values.subText || '',
        additional_details: values.additionalDetails || '',
      },
      style_preferences: {
        lighting: values.lighting,
        composition: values.composition,
        atmosphere: values.atmosphere,
        texture: values.texture,
        include_text: values.includeText,
        subject_type: values.subjectType,
        custom_prompt: generatedPrompt,
      },
      desired_outputs: {
        variants: values.variants,
        dimensions: values.dimensions,
        format: 'png',
      },
    };

    if (values.brandProfileId && values.brandProfileId !== 'auto') {
      payload.brand_profile_id = values.brandProfileId;
    }

    await onGenerate(payload);
  });

  // Compact option pill component
  const OptionPill = ({ 
    option, 
    isSelected, 
    onSelect 
  }: { 
    option: { value: string; label: string; icon: string };
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all',
        isSelected 
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
      )}
    >
      <span>{option.icon}</span>
      <span>{option.label}</span>
      {isSelected && <Check className="h-3 w-3 ml-1" />}
    </button>
  );

  // Shape selector with visual icons
  const ShapeOption = ({ 
    label, 
    icon: Icon, 
    isSelected, 
    onSelect 
  }: { 
    label: string;
    icon: React.ElementType;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
        isSelected 
          ? 'bg-primary-500/20 border-2 border-primary-500 text-white' 
          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-300 text-sm">
          <Wand2 className="h-4 w-4" />
          AI-Powered
        </div>
        <h2 className="text-2xl font-bold text-white">Create Your Image</h2>
        <p className="text-slate-400 text-sm">
          Describe what you want, we'll handle the photography magic
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Main Card - Description */}
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-6 space-y-5">
            
            {/* Subject Type - Compact pills */}
            <div className="flex flex-wrap gap-2">
              {SUBJECT_TYPES.map((type) => (
                <OptionPill
                  key={type.value}
                  option={type}
                  isSelected={formValues.subjectType === type.value}
                  onSelect={() => setValue('subjectType', type.value)}
                />
              ))}
            </div>

            {/* Quick Examples - Above textarea */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Zap className="h-3 w-3" />
                <span>Quick start — tap to use:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(QUICK_EXAMPLES[formValues.subjectType] || QUICK_EXAMPLES.food_hero).slice(0, 4).map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setValue('mainSubject', example)}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-white/5 text-slate-300 
                               hover:bg-primary-500/20 hover:text-primary-300 
                               border border-white/10 hover:border-primary-500/30 transition-all"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Description Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-200">
                  Describe your image
                </Label>
                <span className={cn('text-xs transition-colors', qualityScore.color)}>
                  {qualityScore.label}
                </span>
              </div>
              <div className="relative">
                <Textarea
                  rows={3}
                  placeholder="e.g., A perfectly charred Margherita pizza with bubbling mozzarella and fresh basil leaves..."
                  className="resize-none bg-white/5 text-white text-base pr-4 pb-8"
                  {...register('mainSubject')}
                />
                {/* Character indicator */}
                <div className="absolute bottom-2 right-3 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full transition-colors',
                          (mainSubject?.length || 0) >= i * 15 
                            ? 'bg-primary-400' 
                            : 'bg-white/20'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {errors.mainSubject && (
                <p className="text-sm text-red-400">{errors.mainSubject.message}</p>
              )}
            </div>

            {/* Text Overlay Toggle - More prominent */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10">
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-white">Add text overlay</p>
                  <p className="text-xs text-slate-500">Headlines, prices, promos</p>
                </div>
              </div>
              <Controller
                control={control}
                name="includeText"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors',
                      field.value ? 'bg-primary-500' : 'bg-white/20'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                        field.value && 'translate-x-5'
                      )}
                    />
                  </button>
                )}
              />
            </div>
            
            {formValues.includeText && (
              <div className="grid gap-3 sm:grid-cols-2 animate-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Headline</Label>
                  <Input
                    placeholder="Weekend Special"
                    className="bg-white/5 text-white"
                    {...register('headlineText')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Sub-text (optional)</Label>
                  <Input
                    placeholder="$12.99 | Fri-Sun"
                    className="bg-white/5 text-white"
                    {...register('subText')}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Look & Feel - Combined Style + Lighting */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              Look & Feel
            </CardTitle>
            <CardDescription className="text-xs">
              Pick the vibe — we'll handle the technical details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Atmosphere - Recommended first */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 uppercase tracking-wide">Mood</Label>
              <div className="flex flex-wrap gap-2">
                {ATMOSPHERE_OPTIONS.filter(o => o.recommended).map((option) => (
                  <OptionPill
                    key={option.value}
                    option={option}
                    isSelected={formValues.atmosphere === option.value}
                    onSelect={() => setValue('atmosphere', option.value)}
                  />
                ))}
                {showMoreOptions && ATMOSPHERE_OPTIONS.filter(o => !o.recommended).map((option) => (
                  <OptionPill
                    key={option.value}
                    option={option}
                    isSelected={formValues.atmosphere === option.value}
                    onSelect={() => setValue('atmosphere', option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Lighting - Recommended first */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 uppercase tracking-wide">Lighting</Label>
              <div className="flex flex-wrap gap-2">
                {LIGHTING_OPTIONS.filter(o => o.recommended).map((option) => (
                  <OptionPill
                    key={option.value}
                    option={option}
                    isSelected={formValues.lighting === option.value}
                    onSelect={() => setValue('lighting', option.value)}
                  />
                ))}
                {showMoreOptions && LIGHTING_OPTIONS.filter(o => !o.recommended).map((option) => (
                  <OptionPill
                    key={option.value}
                    option={option}
                    isSelected={formValues.lighting === option.value}
                    onSelect={() => setValue('lighting', option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Composition - Recommended first */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 uppercase tracking-wide">Angle</Label>
              <div className="flex flex-wrap gap-2">
                {COMPOSITION_OPTIONS.filter(o => o.recommended).map((option) => (
                  <OptionPill
                    key={option.value}
                    option={option}
                    isSelected={formValues.composition === option.value}
                    onSelect={() => setValue('composition', option.value)}
                  />
                ))}
                {showMoreOptions && COMPOSITION_OPTIONS.filter(o => !o.recommended).map((option) => (
                  <OptionPill
                    key={option.value}
                    option={option}
                    isSelected={formValues.composition === option.value}
                    onSelect={() => setValue('composition', option.value)}
                  />
                ))}
              </div>
            </div>

            {/* More Options Toggle */}
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown className={cn('h-3 w-3 transition-transform', showMoreOptions && 'rotate-180')} />
              {showMoreOptions ? 'Fewer options' : 'More options'}
            </button>
          </CardContent>
        </Card>

        {/* Output Settings - Simplified */}
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* How many */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-400 uppercase tracking-wide">How many?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setValue('variants', num)}
                      className={cn(
                        'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                        formValues.variants === num
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shape */}
              <div className="space-y-2 flex-1">
                <Label className="text-xs text-slate-400 uppercase tracking-wide">Shape</Label>
                <div className="flex gap-2">
                  <ShapeOption
                    label="Square"
                    icon={Square}
                    isSelected={formValues.dimensions === '1024x1024'}
                    onSelect={() => setValue('dimensions', '1024x1024')}
                  />
                  <ShapeOption
                    label="Portrait"
                    icon={RectangleVertical}
                    isSelected={formValues.dimensions === '1024x1280'}
                    onSelect={() => setValue('dimensions', '1024x1280')}
                  />
                  <ShapeOption
                    label="Landscape"
                    icon={RectangleHorizontal}
                    isSelected={formValues.dimensions === '1280x1024'}
                    onSelect={() => setValue('dimensions', '1280x1024')}
                  />
                  <ShapeOption
                    label="Story"
                    icon={Smartphone}
                    isSelected={formValues.dimensions === '1080x1920'}
                    onSelect={() => setValue('dimensions', '1080x1920')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options - Collapsible */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full justify-center py-2"
            >
              <ChevronDown className="h-4 w-4" />
              Advanced options
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Effects */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 uppercase tracking-wide">Effects</Label>
              <div className="flex flex-wrap gap-2">
                {TEXTURE_OPTIONS.map((option) => (
                  <OptionPill
                    key={option.value}
                    option={option}
                    isSelected={formValues.texture === option.value}
                    onSelect={() => setValue('texture', option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 uppercase tracking-wide">Extra details</Label>
              <Textarea
                rows={2}
                placeholder="Rustic wooden table, fresh herbs as garnish, steam rising..."
                className="resize-none bg-white/5 text-white text-sm"
                {...register('additionalDetails')}
              />
            </div>

            {/* Brand Profile */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 uppercase tracking-wide">Brand</Label>
              <Controller
                control={control}
                name="brandProfileId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white/5 text-white">
                      <SelectValue placeholder="Auto (default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (default)</SelectItem>
                      {brandProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.brand_name}
                          {profile.is_default && (
                            <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Preview - What AI will create */}
        {mainSubject && mainSubject.length > 5 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary-500/10 to-transparent border border-primary-500/20">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary-500/20 p-2 mt-0.5">
                <ImageIcon className="h-4 w-4 text-primary-400" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs text-primary-300 font-medium">What we'll create:</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {generatedPrompt}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  ✨ We add professional lighting, composition & quality enhancements
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Warning */}
        {usage.limit && (
          <UsageLimitWarning limit={usage.limit} featureName="creative generations" />
        )}

        {/* Generate Button */}
        <Button
          type="submit"
          disabled={isSubmitting || usage.isBlocked || !formValues.mainSubject}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-6 text-lg"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Creating...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate {formValues.variants > 1 ? `${formValues.variants} Images` : 'Image'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
