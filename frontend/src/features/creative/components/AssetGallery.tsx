import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AssetCard } from './AssetCard';
import { AssetLightbox } from './AssetLightbox';
import type { CreativeAsset } from '../api/types';

interface AssetGalleryProps {
  assets: CreativeAsset[];
  jobSlug?: string;
}

export function AssetGallery({ assets, jobSlug }: AssetGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleAssetClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDownload = async (asset: CreativeAsset) => {
    try {
      const response = await fetch(asset.asset_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jobSlug || 'creative'}_${asset.variant_label || 'asset'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

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
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset, index) => (
          <AssetCard
            key={asset.id || index}
            asset={asset}
            filename={`${jobSlug || 'creative'}_${asset.variant_label || `variant_${index + 1}`}.png`}
            onClick={() => handleAssetClick(index)}
          />
        ))}
      </div>

      <AssetLightbox
        assets={assets}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onDownload={handleDownload}
      />
    </>
  );
}
