import { Card, CardContent } from '@/components/ui/card';
import { AssetCard } from './AssetCard';
import type { CreativeAsset } from '../api/types';

interface AssetGalleryProps {
  assets: CreativeAsset[];
  jobSlug?: string;
}

export function AssetGallery({ assets, jobSlug }: AssetGalleryProps) {
  if (assets.length === 0) {
    return (
      <Card className="bg-slate-500/5 border-slate-500/20">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">No assets generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id || index}
          asset={asset}
          filename={`${jobSlug || 'creative'}_${asset.variant_label || `variant_${index + 1}`}.png`}
        />
      ))}
    </div>
  );
}
