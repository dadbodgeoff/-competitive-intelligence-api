import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Star } from 'lucide-react';
import type { BrandProfileSummary } from '../api/types';

interface BrandProfileCardProps {
  profile: BrandProfileSummary;
  onEdit: (profile: BrandProfileSummary) => void;
}

export function BrandProfileCard({ profile, onEdit }: BrandProfileCardProps) {
  return (
    <Card className="bg-card-dark border-white/10 hover:border-emerald-500/30 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            {profile.brand_name}
            {profile.is_default && (
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                <Star className="h-3 w-3 mr-1 fill-emerald-400" />
                Default
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(profile)}
            className="text-slate-400 hover:text-white"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Color Palette */}
        {profile.palette && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Color Palette</p>
            <div className="flex gap-2">
              {profile.palette.primary && typeof profile.palette.primary === 'string' ? (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="h-8 w-8 rounded-full border border-white/20"
                    style={{ backgroundColor: profile.palette.primary }}
                  />
                  <span className="text-xs text-slate-500">Primary</span>
                </div>
              ) : null}
              {profile.palette.secondary && typeof profile.palette.secondary === 'string' ? (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="h-8 w-8 rounded-full border border-white/20"
                    style={{ backgroundColor: profile.palette.secondary }}
                  />
                  <span className="text-xs text-slate-500">Secondary</span>
                </div>
              ) : null}
              {profile.palette.accent && typeof profile.palette.accent === 'string' ? (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="h-8 w-8 rounded-full border border-white/20"
                    style={{ backgroundColor: profile.palette.accent }}
                  />
                  <span className="text-xs text-slate-500">Accent</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Typography */}
        {profile.typography && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Typography</p>
            <div className="text-sm text-slate-300">
              {profile.typography.headline && typeof profile.typography.headline === 'string' ? (
                <div>Headline: {profile.typography.headline}</div>
              ) : null}
              {profile.typography.body && typeof profile.typography.body === 'string' ? (
                <div>Body: {profile.typography.body}</div>
              ) : null}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {profile.updated_at && (
          <p className="text-xs text-slate-500">
            Updated {new Date(profile.updated_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
