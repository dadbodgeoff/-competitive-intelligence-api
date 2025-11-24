import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreativeAsset } from '../api/types';

interface AssetCardProps {
  asset: CreativeAsset;
  filename: string;
  onClick?: () => void;
}

export function AssetCard({ asset, filename, onClick }: AssetCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    // Handle both CDN URLs and data URLs
    if (asset.asset_url.startsWith('data:')) {
      // Data URL - trigger download client-side
      const link = document.createElement('a');
      link.href = asset.asset_url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // CDN URL - use download attribute
      const link = document.createElement('a');
      link.href = asset.asset_url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '—';
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <Card 
      className="bg-card-dark border-white/10 overflow-hidden group hover:border-white/10 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-black/40">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-destructive">Failed to load image</p>
          </div>
        )}
        <img
          src={asset.asset_url}
          alt={asset.variant_label || 'Generated asset'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        {imageLoaded && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Full
            </Button>
            <Button
              size="sm"
              className="bg-primary-500 hover:bg-primary-500 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs border-white/20 text-slate-300">
            {asset.variant_label || 'Variant'}
          </Badge>
          <span className="text-xs text-slate-500">
            {asset.width ?? '?'}×{asset.height ?? '?'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{formatFileSize(asset.file_size_bytes)}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-primary-500 hover:text-primary-300 hover:bg-primary-500/10"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
