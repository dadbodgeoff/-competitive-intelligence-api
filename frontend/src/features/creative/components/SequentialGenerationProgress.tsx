/**
 * Sequential Generation Progress Component
 * 
 * Shows progressive image generation with images appearing one by one.
 * Clean, non-annoying UX that keeps users informed without being intrusive.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ImageIcon,
  Download,
  X,
} from 'lucide-react';
import type { GeneratedAsset, SequentialGenerationState } from '../hooks/useSequentialGeneration';

interface SequentialGenerationProgressProps {
  state: SequentialGenerationState;
  onCancel?: () => void;
  onComplete?: (assets: GeneratedAsset[]) => void;
  onDownload?: (asset: GeneratedAsset) => void;
}

export function SequentialGenerationProgress({
  state,
  onCancel,
  onComplete,
  onDownload,
}: SequentialGenerationProgressProps) {
  const { status, total, current, currentLabel, assets, successful, message } = state;
  
  const isGenerating = status === 'generating';
  const isComplete = status === 'completed';
  const hasError = status === 'error';
  
  // Calculate progress percentage
  const progressPercent = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isGenerating && (
            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
          )}
          {isComplete && (
            <CheckCircle2 className="h-5 w-5 text-success-400" />
          )}
          {hasError && (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          
          <div>
            <h3 className="text-sm font-medium text-white">
              {isGenerating && `Generating ${current} of ${total}...`}
              {isComplete && `Generated ${successful} of ${total} images`}
              {hasError && 'Generation failed'}
            </h3>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
        </div>
        
        {isGenerating && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>
      
      {/* Progress Bar */}
      {isGenerating && (
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      )}
      
      {/* Image Grid - Shows images as they complete */}
      {assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {assets.map((asset, idx) => (
            <Card
              key={asset.sequence_index || idx}
              className="bg-white/5 border-white/10 overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={asset.preview_url || asset.asset_url}
                  alt={asset.label}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {onDownload && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onDownload(asset)}
                      className="h-8"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
                
                {/* Success indicator */}
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-5 w-5 text-success-400 drop-shadow-lg" />
                </div>
              </div>
              
              <CardContent className="p-2">
                <p className="text-xs text-slate-300 truncate">{asset.label}</p>
              </CardContent>
            </Card>
          ))}
          
          {/* Placeholder for currently generating image */}
          {isGenerating && current <= total && (
            <Card className="bg-white/5 border-white/10 border-dashed overflow-hidden">
              <div className="relative aspect-square flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">{currentLabel}</p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Placeholders for remaining images */}
          {isGenerating && Array.from({ length: Math.max(0, total - current - 1) }).map((_, idx) => (
            <Card
              key={`placeholder-${idx}`}
              className="bg-white/5 border-white/10 border-dashed overflow-hidden opacity-50"
            >
              <div className="relative aspect-square flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-slate-600" />
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Completion Actions */}
      {isComplete && onComplete && (
        <div className="flex justify-end">
          <Button
            onClick={() => onComplete(assets)}
            className="bg-primary-500 hover:bg-primary-400"
          >
            Done
          </Button>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{state.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
