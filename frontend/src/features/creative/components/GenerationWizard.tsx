import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UsageLimitWarning } from '@/components/common/UsageLimitWarning';
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  BrandProfileSummary,
  StartGenerationRequest,
  TemplateSummary,
  ThemeSummary,
} from '../api/types';
import { useBrandProfiles } from '../hooks/useBrandProfiles';

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
  styleNotes: string;
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

export function GenerationWizard({ theme, template, isSubmitting, onGenerate }: GenerationWizardProps) {
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
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        userInputs: z.record(z.string()),
        desiredOutputs: desiredOutputsSchema,
        styleNotes: z.string().max(2000).optional().default(''),
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
      styleNotes: '',
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
        styleNotes: '',
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
      style_preferences: values.styleNotes
        ? {
            user_notes: values.styleNotes.trim(),
          }
        : undefined,
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

    const input =
      type === 'currency' ? (
        <Input
          type="number"
          step="0.01"
          placeholder={fieldDefaults[field] ?? '$0.00'}
          className="bg-white/5 text-white"
          {...baseProps}
        />
      ) : type === 'integer' ? (
        <Input
          type="number"
          step="1"
          placeholder={fieldDefaults[field] ?? '0'}
          className="bg-white/5 text-white"
          {...baseProps}
        />
      ) : (
        <Input
          type="text"
          placeholder={fieldDefaults[field] ?? ''}
          className="bg-white/5 text-white"
          {...baseProps}
        />
      );

    return (
      <div key={field} className="space-y-2">
        <Label className="text-sm text-slate-200">
          {label}
          {required && <span className="ml-1 text-primary-300">*</span>}
        </Label>
        {input}
      </div>
    );
  };

  if (!theme || !template) {
    return (
      <Card className="border-white/10 bg-white/5 text-slate-200">
        <CardHeader>
          <CardTitle>Select a theme and template to configure generation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Start by picking a creative theme on the left. Once you choose a template, the
            customization form will appear here with the required variables.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            Customize “{template.display_name ?? template.slug}”
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            {requiredFields.map((field) => renderField(field, true))}
            {optionalFields.map((field) => renderField(field, false))}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-slate-200">Variants</Label>
              <Input
                type="number"
                min={1}
                max={10}
                step={1}
                className="bg-white/5 text-white"
                {...register('desiredOutputs.variants')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-200">Dimensions</Label>
              <Input
                type="text"
                placeholder="1024x1024"
                className="bg-white/5 text-white"
                {...register('desiredOutputs.dimensions')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-200">Format</Label>
              <Input
                type="text"
                placeholder="png"
                className="bg-white/5 text-white"
                {...register('desiredOutputs.format')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-200">Aspect Ratio (optional)</Label>
              <Input
                type="text"
                placeholder="4:5"
                className="bg-white/5 text-white"
                {...register('desiredOutputs.aspect_ratio')}
              />
            </div>
          </section>

          <section className="space-y-2">
            <Label className="text-sm text-slate-200">Style Preferences (optional)</Label>
            <Textarea
              rows={4}
              placeholder="Tell the variation engine what to emphasize (lighting, vibe, product focus, etc.)"
              className="resize-none bg-white/5 text-white"
              {...register('styleNotes')}
            />
            <p className="text-xs text-slate-400">
              These notes are appended to the variation engine as hints. Keep it concise for best
              results.
            </p>
          </section>

          <section className="space-y-4 rounded-md border border-white/10 bg-black/30 p-4">
            <div className="space-y-2">
              <Label className="text-sm text-slate-200">Brand styling</Label>
              {brandProfilesQuery.isLoading ? (
                <Skeleton className="h-10 w-full bg-white/10" />
              ) : (
                <Controller
                  control={control}
                  name="brandProfileId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/5 text-white">
                        <SelectValue placeholder="Auto (account default)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (account default)</SelectItem>
                        {brandProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.brand_name}
                            {profile.is_default && (
                              <Badge variant="outline" className="ml-2 uppercase">
                                Default
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom override…</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {brandProfilesQuery.error && (
                <p className="text-sm text-red-300">
                  {brandProfilesQuery.error instanceof Error
                    ? brandProfilesQuery.error.message
                    : 'Failed to load brand profiles'}
                </p>
              )}
            </div>

            {selectedBrandProfile && selectedBrandProfileId !== 'custom' && (
              <div className="space-y-2 rounded-md border border-white/10 bg-white/5 p-3 text-xs text-slate-200">
                <p className="text-sm font-semibold text-white">{selectedBrandProfile.brand_name}</p>
                <div className="flex flex-wrap gap-3">
                  {renderPaletteSwatch('Primary', selectedBrandProfile.palette?.primary)}
                  {renderPaletteSwatch('Secondary', selectedBrandProfile.palette?.secondary)}
                  {renderPaletteSwatch('Accent', selectedBrandProfile.palette?.accent)}
                </div>
              </div>
            )}

            {selectedBrandProfileId === 'custom' && (
              <div className="space-y-4 rounded-md border border-white/10 bg-white/5 p-3">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-200">Brand name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Copper & Flame"
                    className="bg-white/5 text-white"
                    {...register('overrideBrandName')}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-200">Primary color</Label>
                    <Input
                      type="color"
                      className="h-10 w-full bg-white/5"
                      {...register('overridePrimaryColor')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-200">Secondary color</Label>
                    <Input
                      type="color"
                      className="h-10 w-full bg-white/5"
                      {...register('overrideSecondaryColor')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-200">Accent color</Label>
                    <Input
                      type="color"
                      className="h-10 w-full bg-white/5"
                      {...register('overrideAccentColor')}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  We will use these overrides to guide Nano Banana prompt styling. Leave blank to
                  fall back to variation engine defaults.
                </p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>

      {usage.limit && (
        <div className={cn('max-w-2xl', usage.isBlocked && 'animate-pulse')}>
          <UsageLimitWarning limit={usage.limit} featureName="creative generations" />
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={isSubmitting || usage.isBlocked || usage.loading}
          className="bg-primary-500 text-white hover:bg-primary-500"
        >
          {isSubmitting ? 'Generating...' : 'Generate Assets'}
        </Button>
        {usage.loading && <p className="text-sm text-slate-300">Checking usage limits…</p>}
        {formState.errors.desiredOutputs && (
          <p className="text-sm text-red-300">
            {formState.errors.desiredOutputs.message ?? 'Please check output settings.'}
          </p>
        )}
      </div>
    </form>
  );
}


