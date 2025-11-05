/**
 * Menu Upload Component
 * RestaurantIQ Platform
 * 
 * Handles file upload, processing, and review workflow for restaurant menus.
 * Uses streaming SSE for real-time progress updates.
 * 
 * @example
 * <MenuUpload onSuccess={(id) => navigate(`/menu/${id}`)} />
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/design-system';
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning, UsageCounter } from '@/components/common/UsageLimitWarning';
import {
  InvoiceCard,
  InvoiceCardHeader,
  InvoiceCardContent,
  InvoiceStatusBadge,
  UploadZone,
  ParseProgress,
} from '@/design-system/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMenuParseStream } from '@/hooks/useMenuParseStream';
import { MenuReviewTable } from './MenuReviewTable';
import {
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Loader2,
} from 'lucide-react';

export interface MenuUploadProps {
  onSuccess?: (menuId: string) => void;
  className?: string;
}

export function MenuUpload({ onSuccess, className }: MenuUploadProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [restaurantHint, setRestaurantHint] = useState('');
  
  const {
    state,
    startParsing,
    stopParsing,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    updateCategory,
    addCategory,
    deleteCategory,
    updateMenuHeader,
    saveToDatabase,
    isConnected,
  } = useMenuParseStream();

  // Check upload limit using centralized hook
  const { limit: uploadLimit, loading: _checkingLimit, isBlocked } = useUsageLimit('menu_upload');

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/v1/menu/upload`, {
      method: 'POST',
      credentials: 'include', // Send cookies
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle usage limit errors specially
      if (response.status === 429) {
        const limitError = error.detail || error;
        throw new Error(limitError.message || 'Usage limit exceeded');
      }
      
      throw new Error(error.detail || 'Upload failed');
    }

    const result = await response.json();
    return result.file_url;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingFile(true);
      
      // Upload file
      const fileUrl = await uploadFile(file);
      
      toast({
        title: 'File uploaded',
        description: 'Processing your menu...',
      });
      
      // Start streaming parse
      startParsing(fileUrl, restaurantHint || undefined);
      
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  }, [restaurantHint, startParsing, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    maxFiles: 1,
    disabled: (state.status !== 'idle' && state.status !== 'error') || isBlocked,
  });

  const handleSave = async () => {
    try {
      const menuId = await saveToDatabase();
      
      toast({
        title: 'Menu saved!',
        description: 'Menu has been saved to database',
      });
      
      // Call success callback or navigate
      if (onSuccess) {
        onSuccess(menuId);
      } else {
        navigate(`/menu/dashboard`);
      }
      
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save menu',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    stopParsing();
    navigate('/dashboard');
  };

  const totalItems = state.menuData?.categories?.reduce((sum, cat) => sum + cat.items.length, 0) || 0;

  return (
    <div className={cn('min-h-screen bg-obsidian', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <div className="relative container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Upload Menu</h1>
            <p className="text-slate-400">
              Upload your menu and we'll extract the data automatically
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleCancel}
            className={cn(
              'border-white/10 text-slate-300',
              'hover:bg-white/5 hover:text-white'
            )}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Usage Limit Warning */}
        {uploadLimit && <UsageLimitWarning limit={uploadLimit} featureName="menu uploads" />}

        {/* Upload Area */}
        {state.status === 'idle' && (
          <InvoiceCard variant="elevated">
            <InvoiceCardHeader>
              <h2 className="text-xl font-semibold text-white mb-1">Upload Menu File</h2>
              <p className="text-sm text-slate-400">
                Drag and drop your menu PDF or image, or click to browse
              </p>
              {uploadLimit && uploadLimit.allowed && (
                <UsageCounter limit={uploadLimit} className="mt-2" />
              )}
            </InvoiceCardHeader>
            <InvoiceCardContent className="space-y-6">
              {/* Restaurant Hint */}
              <div className="space-y-2">
                <Label htmlFor="restaurant" className="text-slate-300">
                  Restaurant Name (Optional)
                </Label>
                <Input
                  id="restaurant"
                  placeholder="e.g., Park Avenue Pizza, Joe's Diner"
                  value={restaurantHint}
                  onChange={(e) => setRestaurantHint(e.target.value)}
                  className="input-field"
                  aria-describedby="restaurant-hint"
                />
                <p id="restaurant-hint" className="text-xs text-slate-500">
                  Providing the restaurant name improves processing accuracy
                </p>
              </div>

              {/* Dropzone */}
              <UploadZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                isUploading={uploadingFile}
                onDrop={onDrop}
                accept={{
                  'application/pdf': ['.pdf'],
                  'image/*': ['.jpg', '.jpeg', '.png'],
                }}
                maxSize={10 * 1024 * 1024}
              />
            </InvoiceCardContent>
          </InvoiceCard>
        )}

        {/* Parsing Progress */}
        {(state.status === 'parsing' || state.status === 'validating') && (
          <InvoiceCard variant="elevated">
            <InvoiceCardContent className="pt-6">
              <ParseProgress
                status={state.status}
                progress={state.progress}
                currentStep={state.currentStep}
                elapsedSeconds={state.elapsedSeconds}
                isConnected={isConnected}
                onCancel={stopParsing}
                title="Processing Menu"
              />
            </InvoiceCardContent>
          </InvoiceCard>
        )}

        {/* Review & Edit */}
        {(state.status === 'ready' || state.status === 'saving') && state.menuData && (
          <>
            {/* Menu Header */}
            <InvoiceCard variant="elevated">
              <InvoiceCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                    <div>
                      <h2 className="text-xl font-semibold text-white">Menu Ready for Review</h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Review and edit the extracted data before saving
                      </p>
                    </div>
                  </div>
                  {state.parseMetadata && (
                    <InvoiceStatusBadge 
                      status={state.parseMetadata.confidence === 'high' ? 'approved' : 'reviewed'} 
                    />
                  )}
                </div>
              </InvoiceCardHeader>
              <InvoiceCardContent className="space-y-6">
                {/* Menu Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs">Restaurant Name</Label>
                    <Input
                      value={state.menuData.restaurant_name}
                      onChange={(e) => updateMenuHeader('restaurant_name', e.target.value)}
                      className="mt-1 input-field"
                      aria-label="Restaurant name"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Menu Type</Label>
                    <Input
                      value={state.menuData.menu_type || ''}
                      onChange={(e) => updateMenuHeader('menu_type', e.target.value)}
                      placeholder="e.g., Dinner, Lunch, Brunch"
                      className="mt-1 input-field"
                      aria-label="Menu type"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Total Items</Label>
                    <div className="mt-1 text-2xl font-bold text-emerald-400 font-mono" aria-label={`Total items: ${totalItems}`}>
                      {totalItems}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Categories</span>
                      <div className="text-white font-semibold mt-1">
                        {state.menuData.categories.length}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Menu Items</span>
                      <div className="text-white font-semibold mt-1">
                        {totalItems}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg Price</span>
                      <div className="text-emerald-400 font-mono font-semibold mt-1">
                        ${totalItems > 0 
                          ? (state.menuData.categories.reduce((sum, cat) => 
                              sum + cat.items.reduce((s, item) => s + (item.prices?.[0]?.price || 0), 0), 0) / totalItems).toFixed(2)
                          : '0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              </InvoiceCardContent>
            </InvoiceCard>

            {/* Menu Items Table */}
            <InvoiceCard variant="elevated">
              <InvoiceCardHeader>
                <h2 className="text-xl font-semibold text-white">
                  Menu Items ({totalItems})
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Click edit to modify any item, or add/remove items as needed
                </p>
              </InvoiceCardHeader>
              <InvoiceCardContent>
                <MenuReviewTable
                  categories={state.menuData.categories}
                  onUpdateItem={updateMenuItem as any}
                  onDeleteItem={deleteMenuItem}
                  onAddItem={addMenuItem}
                  onUpdateCategory={updateCategory}
                  onAddCategory={addCategory}
                  onDeleteCategory={deleteCategory}
                />
              </InvoiceCardContent>
            </InvoiceCard>

            {/* Parse Metadata */}
            {state.parseMetadata && (
              <InvoiceCard>
                <InvoiceCardHeader>
                  <h3 className="text-lg font-semibold text-white">Processing Summary</h3>
                </InvoiceCardHeader>
                <InvoiceCardContent>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Processing Time</span>
                      <div className="font-semibold text-white mt-1">
                        {state.parseMetadata.parse_time_seconds}s
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Items Found</span>
                      <div className="font-semibold text-cyan-400 mt-1">
                        {state.menuData?.menu_items?.length || 0}
                      </div>
                    </div>
                  </div>
                </InvoiceCardContent>
              </InvoiceCard>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className={cn(
                  'border-white/10 text-slate-300',
                  'hover:bg-white/5 hover:text-white'
                )}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={state.status === 'saving'}
                className="btn-primary shadow-emerald"
              >
                {state.status === 'saving' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Menu
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Error State */}
        {state.status === 'error' && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-semibold text-red-400">Processing failed: {state.error}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
