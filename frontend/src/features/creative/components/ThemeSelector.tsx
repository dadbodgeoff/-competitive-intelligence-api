import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemeSummary } from '../api/types';

interface ThemeSelectorProps {
  themes: ThemeSummary[];
  selectedThemeId?: string;
  onSelectTheme: (theme: ThemeSummary) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function ThemeSelector({
  themes,
  selectedThemeId,
  onSelectTheme,
  isLoading,
  error,
}: ThemeSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32 bg-white/10" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-destructive/10 border-red-500/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load themes'}
        </AlertDescription>
      </Alert>
    );
  }

  if (themes.length === 0) {
    return (
      <Card className="bg-slate-500/5 border-slate-500/20">
        <CardContent className="p-8 text-center">
          <Palette className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No themes available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          isSelected={theme.id === selectedThemeId}
          onClick={() => onSelectTheme(theme)}
        />
      ))}
    </div>
  );
}

interface ThemeCardProps {
  theme: ThemeSummary;
  isSelected: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, isSelected, onClick }: ThemeCardProps) {
  const primaryColor = (typeof theme.default_palette?.primary === 'string' ? theme.default_palette.primary : '#10b981');
  const secondaryColor = (typeof theme.default_palette?.secondary === 'string' ? theme.default_palette.secondary : '#0ea5e9');

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:scale-105',
        'bg-card-dark border-white/10',
        isSelected
          ? 'ring-2 ring-primary-500 border-primary-500/50'
          : 'hover:border-white/10',
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-white leading-tight">{theme.name}</h3>
          {isSelected && (
            <Badge className="bg-primary-500/20 text-primary-500 border-white/10">
              Selected
            </Badge>
          )}
        </div>

        {theme.description && (
          <p className="text-sm text-slate-400 line-clamp-2">{theme.description}</p>
        )}

        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full border border-white/20"
            style={{ backgroundColor: primaryColor || '#10b981' }}
          />
          <div
            className="h-6 w-6 rounded-full border border-white/20"
            style={{ backgroundColor: secondaryColor || '#0ea5e9' }}
          />
          <span className="text-xs text-slate-500 ml-auto">
            {theme.restaurant_vertical?.replace('_', ' ')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
