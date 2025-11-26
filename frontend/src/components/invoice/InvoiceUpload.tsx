/**
 * Invoice Upload Component
 * RestaurantIQ Platform
 * 
 * Handles file upload, processing, and review workflow for food service invoices.
 * Uses streaming SSE for real-time progress updates.
 * 
 * @example
 * <InvoiceUpload onSuccess={(id) => navigate(`/invoices/${id}`)} />
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/design-system';
import { useUsageLimit } from '@/hooks/useUsageLimits';
import { UsageLimitWarning, UsageCounter } from '@/components/common/UsageLimitWarning';
import { PageHeading } from '@/components/layout/PageHeading';
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
// Alert components removed - not currently used
import { useToast } from '@/hooks/use-toast';
import { useInvoiceParseStream } from '@/hooks/useInvoiceParseStream';
import { InvoiceReviewTable } from './InvoiceReviewTable';
import { SuccessAnimation } from '@/components/streaming/SuccessAnimation';
import {
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { uploadInvoiceFile } from '@/services/api/invoicesApi';

export interface InvoiceUploadProps {
  onSuccess?: (invoiceId: string) => void;
  className?: string;
}

export function InvoiceUpload({ onSuccess, className }: InvoiceUploadProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [vendorHint, setVendorHint] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    state,
    startParsing,
    stopParsing,
    updateLineItem,
    addLineItem,
    deleteLineItem,
    updateInvoiceHeader,
    saveToDatabase,
    isConnected,
  } = useInvoiceParseStream();

  // Check upload limit using centralized hook
  const { limit: uploadLimit, isBlocked } = useUsageLimit('invoice_upload');

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadInvoiceFile(formData);
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
        description: 'Processing your invoice...',
      });
      
      // Start streaming parse
      startParsing(fileUrl, vendorHint || undefined);
      
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  }, [vendorHint, startParsing, toast]);

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
      const invoiceId = await saveToDatabase();
      
      // Show success animation
      setShowSuccess(true);
      
      toast({
        title: 'Invoice saved!',
        description: 'Invoice has been saved to database',
      });
      
      // Navigate after animation
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess(invoiceId);
        } else {
          navigate(`/invoices/${invoiceId}`);
        }
      }, 2500);
      
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save invoice',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    stopParsing();
    navigate('/invoices');
  };

  return (
    <div className={cn('min-h-screen bg-obsidian', className)}>
      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        message="Invoice saved successfully!"
        count={state.invoiceData?.line_items?.length}
        countLabel="line items"
        icon="📄"
      />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <div className="relative container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <PageHeading>Upload Invoice</PageHeading>
            <p className="text-slate-400">
              Upload your invoice and we'll extract the data automatically
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
        {uploadLimit && <UsageLimitWarning limit={uploadLimit} featureName="invoice uploads" />}

        {/* Upload Area */}
        {state.status === 'idle' && (
          <InvoiceCard variant="elevated">
            <InvoiceCardHeader>
              <h2 className="text-xl font-semibold text-white mb-1">Upload Invoice File</h2>
              <p className="text-sm text-slate-400">
                Drag and drop your invoice PDF or image, or click to browse
              </p>
              {uploadLimit && uploadLimit.allowed && (
                <UsageCounter limit={uploadLimit} className="mt-2" />
              )}
            </InvoiceCardHeader>
            <InvoiceCardContent className="space-y-6">
              {/* Vendor Hint */}
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-slate-300">
                  Vendor Name (Optional)
                </Label>
                <Input
                  id="vendor"
                  placeholder="e.g., Performance Foodservice, Sysco, US Foods"
                  value={vendorHint}
                  onChange={(e) => setVendorHint(e.target.value)}
                  className="input-field"
                  aria-describedby="vendor-hint"
                />
                <p id="vendor-hint" className="text-xs text-slate-500">
                  Providing the vendor name improves parsing accuracy
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
        {(state.status === 'starting' || state.status === 'parsing' || state.status === 'validating') && (
          <InvoiceCard variant="elevated">
            <InvoiceCardContent className="pt-6">
              <ParseProgress
                status={state.status}
                progress={state.progress}
                currentStep={state.currentStep}
                elapsedSeconds={state.elapsedSeconds}
                isConnected={isConnected}
                onCancel={stopParsing}
                onRetry={() => state.fileUrl && startParsing(state.fileUrl, vendorHint)}
                error={state.error}
              />
            </InvoiceCardContent>
          </InvoiceCard>
        )}

        {/* Review & Edit */}
        {(state.status === 'ready' || state.status === 'saving') && state.invoiceData && (
          <>
            {/* Invoice Header */}
            <InvoiceCard variant="elevated">
              <InvoiceCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary-500" aria-hidden="true" />
                    <div>
                      <h2 className="text-xl font-semibold text-white">Invoice Ready for Review</h2>
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
                {/* Invoice Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs">Invoice Number</Label>
                    <Input
                      value={state.invoiceData.invoice_number}
                      onChange={(e) => updateInvoiceHeader('invoice_number', e.target.value)}
                      className="mt-1 input-field font-mono"
                      aria-label="Invoice number"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Date</Label>
                    <Input
                      type="date"
                      value={state.invoiceData.invoice_date}
                      onChange={(e) => updateInvoiceHeader('invoice_date', e.target.value)}
                      className="mt-1 input-field"
                      aria-label="Invoice date"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Vendor</Label>
                    <Input
                      value={state.invoiceData.vendor_name}
                      onChange={(e) => updateInvoiceHeader('vendor_name', e.target.value)}
                      className="mt-1 input-field"
                      aria-label="Vendor name"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Total</Label>
                    <div className="mt-1 text-2xl font-bold text-primary-500 font-mono" aria-label={`Total amount: $${state.invoiceData.total.toFixed(2)}`}>
                      ${state.invoiceData.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Subtotal</span>
                      <div className="text-white font-mono font-semibold mt-1">
                        ${state.invoiceData.subtotal.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Tax</span>
                      <div className="text-white font-mono font-semibold mt-1">
                        ${state.invoiceData.tax.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Total</span>
                      <div className="text-primary-500 font-mono font-bold text-lg mt-1">
                        ${state.invoiceData.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </InvoiceCardContent>
            </InvoiceCard>

            {/* Line Items Table */}
            <InvoiceCard variant="elevated">
              <InvoiceCardHeader>
                <h2 className="text-xl font-semibold text-white">
                  Line Items ({state.invoiceData.line_items.length})
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Click edit to modify any item, or add/remove items as needed
                </p>
              </InvoiceCardHeader>
              <InvoiceCardContent>
                <InvoiceReviewTable
                  lineItems={state.invoiceData.line_items}
                  onUpdateItem={updateLineItem}
                  onDeleteItem={deleteLineItem}
                  onAddItem={addLineItem}
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
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Items Verified</span>
                      <div className="font-semibold text-accent-400 mt-1">
                        {state.invoiceData?.line_items?.length || 0}
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
                className="btn-primary shadow-primary"
              >
                {state.status === 'saving' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Invoice
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Error State */}
        {state.status === 'error' && (
          <InvoiceCard variant="elevated" className="border-red-500/50">
            <InvoiceCardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Processing Failed</h3>
                  <p className="text-sm text-red-400 mt-1">{state.error}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {state.fileUrl && (
                  <Button
                    onClick={() => startParsing(state.fileUrl!, vendorHint)}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </InvoiceCardContent>
          </InvoiceCard>
        )}
      </div>
    </div>
  );
}
