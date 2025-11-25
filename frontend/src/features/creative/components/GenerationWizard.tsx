import { useEffect, useMemo, useState } from 'react';
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
  Square,
  RectangleVertical,
  RectangleHorizontal,
  Smartphone,
  Zap,
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
import type {
  BrandProfileSummary,
  StartGenerationRequest,
  TemplateSummary,
  ThemeSummary,
} from '../api/types';
import { useBrandProfiles } from '../hooks/useBrandProfiles';

// ============================================================================
// STYLE OPTIONS - Modern pill-based selection
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

const VISUAL_STYLE_OPTIONS = [
  { value: 'with_food', label: 'Full Food Photography', icon: '📸', description: 'Complete scene with actual food items' },
  { value: 'text_only', label: 'Text & Graphics Only', icon: '🎨', description: 'Promotional text on styled background' },
];

// ============================================================================
// FORM SCHEMA
// ============================================================================

const desiredOutputsSchema = z.object({
  variants: z.coerce.number().int().min(1).max(10),
  dimensions: z.string().min(3),
  format: z.string().min(2),
  aspect_ratio: z.string().optional(),
});

type DesiredOutputsForm = z.infer<typeof desiredOutputsSchema>;

interface FormValues {
  userInputs: Record<string, string>;
  desiredOutputs: DesiredOutputsForm;
  visualStyle: 'text_only' | 'with_food';
  styleNotes: string;
  lighting: string;
  atmosphere: string;
  composition: string;
  brandProfileId: string;
  overrideBrandName: string;
  overridePrimaryColor: string;
  overrideSecondaryColor: string;
  overrideAccentColor: string;
}

interface GenerationWizardProps {
  theme?: ThemeSummary;
  template?: TemplateSummary;
  isSubmitting: boolean;
  onGenerate: (payload: StartGenerationRequest) => Promise<void>;
}

const DEFAULT_PRIMARY = '#10b981';
const DEFAULT_SECONDARY = '#0ea5e9';
const DEFAULT_ACCENT = '#f97316';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

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

const renderPaletteSwatch = (label: string, value?: unknown) => {
  if (typeof value !== 'string' || value.trim() === '') return null;
  return (
    <div key={label} className="flex items-center gap-2 text-xs text-slate-300">
      <span
        className="h-4 w-4 rounded-full border border-white/20"
        style={{ backgroundColor: value }}
      />
      {label}: {value}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GenerationWizard({ theme, template, isSubmitting, onGenerate }: GenerationWizardProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const requiredFields = useMemo(() => template?.input_schema.required ?? [], [template]);
  const optionalFields = useMemo(() => template?.input_schema.optional ?? [], [template]);
  const fieldTypes = useMemo(() => template?.input_schema.types ?? {}, [template]);
  const fieldDefaults = useMemo(() => template?.input_schema.defaults ?? {}, [template]);

  const {
    register,
    handleSubmit,
    reset,
    formState,
    control,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        userInputs: z.record(z.string()),
        desiredOutputs: desiredOutputsSchema,
        visualStyle: z.enum(['text_only', 'with_food']).default('with_food'),
        styleNotes: z.string().max(2000).optional().default(''),
        lighting: z.string().default('golden_hour'),
        atmosphere: z.string().default('cozy'),
        composition: z.string().default('hero'),
        brandProfileId: z.string().default('auto'),
        overrideBrandName: z.string().max(120).optional(),
        overridePrimaryColor: z.string().optional(),
        overrideSecondaryColor: z.string().optional(),
        overrideAccentColor: z.string().optional(),
      }),
    ),
    defaultValues: {
      userInputs: {},
      desiredOutputs: {
        variants: 1,
        dimensions: '1024x1024',
        format: 'png',
        aspect_ratio: undefined,
      },
      visualStyle: 'with_food',
      styleNotes: '',
      lighting: 'golden_hour',
      atmosphere: 'cozy',
      composition: 'hero',
      brandProfileId: 'auto',
      overrideBrandName: '',
      overridePrimaryColor: DEFAULT_PRIMARY,
      overrideSecondaryColor: DEFAULT_SECONDARY,
      overrideAccentColor: DEFAULT_ACCENT,
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        userInputs: {
          ...(template.input_schema.defaults ?? {}),
        },
        desiredOutputs: {
          variants: 1,
          dimensions: '1024x1024',
          format: 'png',
          aspect_ratio: undefined,
        },
        visualStyle: 'with_food',
        styleNotes: '',
        lighting: 'golden_hour',
        atmosphere: 'cozy',
        composition: 'hero',
        brandProfileId: 'auto',
        overrideBrandName: '',
        overridePrimaryColor: DEFAULT_PRIMARY,
        overrideSecondaryColor: DEFAULT_SECONDARY,
        overrideAccentColor: DEFAULT_ACCENT,
      });
    }
  }, [template, reset]);

  const usage = useUsageLimit('image_generation', false);
  const { checkLimit } = usage;

  useEffect(() => {
    if (template) {
      checkLimit();
    }
  }, [template, checkLimit]);

  const brandProfilesQuery = useBrandProfiles();
  const brandProfiles = brandProfilesQuery.data ?? [];
  const selectedBrandProfileId = watch('brandProfileId');
  const selectedBrandProfile = useMemo<BrandProfileSummary | undefined>(
    () => brandProfiles.find((profile) => profile.id === selectedBrandProfileId),
    [brandProfiles, selectedBrandProfileId],
  );

  const formValues = watch();

  const onSubmit = handleSubmit(async (values) => {
    if (!theme || !template) return;
    const sanitized: Record<string, string> = {};

    [...requiredFields, ...optionalFields].forEach((field) => {
      const value = values.userInputs[field];
      if (typeof value === 'string' && value.trim().length > 0) {
        sanitized[field] = value.trim();
      }
    });

    const payload: StartGenerationRequest = {
      theme_id: theme.id,
      template_id: template.id,
      user_inputs: sanitized,
      desired_outputs: values.desiredOutputs,
      style_preferences: {
        user_notes: values.styleNotes?.trim() || undefined,
        visual_style: values.visualStyle,
        lighting: values.lighting,
        atmosphere: values.atmosphere,
        composition: values.composition,
      },
    };

    if (values.brandProfileId && values.brandProfileId !== 'auto') {
      if (values.brandProfileId === 'custom') {
        const overrides: Record<string, unknown> = {};
        const overrideName = values.overrideBrandName?.trim();
        if (overrideName) {
          overrides.brand_name = overrideName;
        }
        const palette: Record<string, string> = {};
        if (values.overridePrimaryColor) palette.primary = values.overridePrimaryColor;
        if (values.overrideSecondaryColor) palette.secondary = values.overrideSecondaryColor;
        if (values.overrideAccentColor) palette.accent = values.overrideAccentColor;
        if (Object.keys(palette).length > 0) {
          overrides.palette = palette;
        }
        if (Object.keys(overrides).length > 0) {
          payload.brand_overrides = overrides;
        }
      } else {
        payload.brand_profile_id = values.brandProfileId;
      }
    }

    await onGenerate(payload);
  });

  const renderField = (field: string, required: boolean) => {
    const type = fieldTypes[field] ?? 'string';
    const label = field.replace(/[_-]/g, ' ');
    const baseProps = register(`userInputs.${field}`);
    const defaultVal = fieldDefaults[field] ?? '';

    return (
      <div key={field} className="space-y-1.5">
        <Label className="text-sm text-slate-200 capitalize">
          {label}
          {required && <span className="ml-1 text-primary-400">*</span>}
        </Label>
        <Input
          type={type === 'currency' || type === 'integer' ? 'number' : 'text'}
          step={type === 'currency' ? '0.01' : type === 'integer' ? '1' : undefined}
          placeholder={defaultVal}
          className="bg-white/5 text-white border-white/10 focus:border-primary-500"
          {...baseProps}
        />
      </div>
    );
  };

  if (!theme || !template) {
    return (
      <Card className="border-white/10 bg-white/5 text-slate-200">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-primary-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-white mb-2">Select a Template</h3>
          <p className="text-sm text-slate-400">
            Choose a theme and template to start customizing your creative asset.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-300 text-sm">
          <Wand2 className="h-4 w-4" />
          AI-Powered
        </div>
        <h2 className="text-2xl font-bold text-white">Customize Your Asset</h2>
        <p className="text-slate-400 text-sm">
          Fill in the details below to generate your custom creative asset
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Template Fields Card */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              Customize "{template.display_name ?? template.slug}"
            </CardTitle>
            <CardDescription className="text-xs">
              Fill in the required fields for your template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {requiredFields.map((field) => renderField(field, true))}
            </div>
            {optionalFields.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
                {optionalFields.map((field) => renderField(field, false))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Style Card */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Visual Style</CardTitle>
            <CardDescription className="text-xs">
              Choose "Text Only" for specials boards. Choose "With Food" for hero shots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {VISUAL_STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('visualStyle', option.value as 'with_food' | 'text_only')}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all flex-1 min-w-[200px]',
                    formValues.visualStyle === option.value
                      ? 'bg-primary-500/20 border-2 border-primary-500 text-white'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-slate-400">{option.description}</div>
                  </div>
                  {formValues.visualStyle === option.value && (
                    <Check className="h-4 w-4 ml-auto text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Look & Feel Card */}
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
            {/* Atmosphere */}
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

            {/* Lighting */}
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

            {/* Composition */}
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

        {/* Output Settings Card */}
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
                      onClick={() => setValue('desiredOutputs.variants', num)}
                      className={cn(
                        'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                        formValues.desiredOutputs.variants === num
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <ShapeOption
                    label="Square"
                    icon={Square}
                    isSelected={formValues.desiredOutputs.dimensions === '1024x1024'}
                    onSelect={() => setValue('desiredOutputs.dimensions', '1024x1024')}
                  />
                  <ShapeOption
                    label="Portrait"
                    icon={RectangleVertical}
                    isSelected={formValues.desiredOutputs.dimensions === '1024x1280'}
                    onSelect={() => setValue('desiredOutputs.dimensions', '1024x1280')}
                  />
                  <ShapeOption
                    label="Landscape"
                    icon={RectangleHorizontal}
                    isSelected={formValues.desiredOutputs.dimensions === '1280x1024'}
                    onSelect={() => setValue('desiredOutputs.dimensions', '1280x1024')}
                  />
                  <ShapeOption
                    label="Story"
                    icon={Smartphone}
                    isSelected={formValues.desiredOutputs.dimensions === '1080x1920'}
                    onSelect={() => setValue('desiredOutputs.dimensions', '1080x1920')}
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
            {/* Style Notes */}
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm text-slate-200">Style Preferences (optional)</Label>
                <Textarea
                  rows={3}
                  placeholder="Tell the AI what to emphasize (lighting, vibe, product focus, etc.)"
                  className="resize-none bg-white/5 text-white border-white/10"
                  {...register('styleNotes')}
                />
                
                {/* Quick Examples */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Click to use:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Golden hour warmth with natural window light',
                      'Rustic wooden surface with artisan texture',
                      'Cozy and inviting with soft shadows',
                      'Bustling energy with neon reflections',
                    ].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setValue('styleNotes', example)}
                        className="text-xs px-2.5 py-1.5 rounded-md bg-white/5 text-slate-300 
                                   hover:bg-primary-500/20 hover:text-primary-300 
                                   border border-white/10 hover:border-primary-500/30 transition-all"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Profile */}
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm text-slate-200">Brand Styling</Label>
                <Controller
                  control={control}
                  name="brandProfileId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/5 text-white border-white/10">
                        <SelectValue placeholder="Auto (account default)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (account default)</SelectItem>
                        {brandProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.brand_name}
                            {profile.is_default && (
                              <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                            )}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom override…</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                {selectedBrandProfile && selectedBrandProfileId !== 'custom' && (
                  <div className="flex flex-wrap gap-3 p-3 rounded-md bg-white/5 border border-white/10">
                    {renderPaletteSwatch('Primary', selectedBrandProfile.palette?.primary)}
                    {renderPaletteSwatch('Secondary', selectedBrandProfile.palette?.secondary)}
                    {renderPaletteSwatch('Accent', selectedBrandProfile.palette?.accent)}
                  </div>
                )}

                {selectedBrandProfileId === 'custom' && (
                  <div className="space-y-4 p-3 rounded-md bg-white/5 border border-white/10">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">Brand name</Label>
                      <Input
                        type="text"
                        placeholder="e.g. Copper & Flame"
                        className="bg-white/5 text-white border-white/10"
                        {...register('overrideBrandName')}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400">Primary</Label>
                        <Input type="color" className="h-10 w-full" {...register('overridePrimaryColor')} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400">Secondary</Label>
                        <Input type="color" className="h-10 w-full" {...register('overrideSecondaryColor')} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400">Accent</Label>
                        <Input type="color" className="h-10 w-full" {...register('overrideAccentColor')} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Usage Warning */}
        {usage.limit && (
          <UsageLimitWarning limit={usage.limit} featureName="creative generations" />
        )}

        {/* Generate Button */}
        <Button
          type="submit"
          disabled={isSubmitting || usage.isBlocked || usage.loading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-6 text-lg"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate {formValues.desiredOutputs.variants > 1 ? `${formValues.desiredOutputs.variants} Assets` : 'Asset'}
            </>
          )}
        </Button>

        {formState.errors.desiredOutputs && (
          <p className="text-sm text-red-400 text-center">
            {formState.errors.desiredOutputs.message ?? 'Please check output settings.'}
          </p>
        )}
      </form>
    </div>
  );
}
