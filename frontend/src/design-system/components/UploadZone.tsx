/**
 * Design System - Upload Zone Component
 * RestaurantIQ Platform
 * 
 * Accessible drag-and-drop file upload zone
 */

import { Upload, Loader2 } from 'lucide-react';
import { cn } from '../utils';

export interface UploadZoneProps {
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  isUploading?: boolean;
  isDragActive?: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
  className?: string;
}

export function UploadZone({
  isUploading,
  isDragActive,
  getRootProps,
  getInputProps,
  className,
}: UploadZoneProps) {
  return (
    <div
      {...getRootProps()}
      role="button"
      aria-label="Upload invoice file"
      tabIndex={0}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer',
        'transition-all duration-200',
        isDragActive && 'border-emerald-500 bg-emerald-500/10',
        !isDragActive && 'border-white/20 hover:border-emerald-500/50 hover:bg-white/5',
        isUploading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
            <p className="text-white font-semibold">Uploading file...</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-emerald-400" />
            <div>
              <p className="text-white font-semibold mb-1">
                {isDragActive ? 'Drop file here' : 'Drop invoice here or click to browse'}
              </p>
              <p className="text-sm text-slate-400">
                PDF, JPG, or PNG • Max 10MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
