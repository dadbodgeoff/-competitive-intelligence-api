import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CreativeAsset } from '../api/types';

interface AssetLightboxProps {
  assets: CreativeAsset[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (asset: CreativeAsset) => void;
}

export function AssetLightbox({
  assets,
  initialIndex,
  open,
  onOpenChange,
  onDownload,
}: AssetLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentAsset = assets[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : assets.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < assets.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onOpenChange(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!currentAsset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-white/10">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation buttons */}
        {assets.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Image */}
        <div className="flex items-center justify-center h-full p-8">
          <img
            src={currentAsset.asset_url}
            alt={currentAsset.variant_label || 'Generated asset'}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="font-semibold">
                {currentAsset.variant_label || `Variant ${currentIndex + 1}`}
              </p>
              <p className="text-sm text-slate-300">
                {currentAsset.width} × {currentAsset.height}
                {currentAsset.file_size_bytes && 
                  ` • ${(currentAsset.file_size_bytes / 1024 / 1024).toFixed(2)} MB`
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                {currentIndex + 1} / {assets.length}
              </span>
              <Button
                onClick={() => onDownload(currentAsset)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
