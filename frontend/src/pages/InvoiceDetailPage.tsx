/**
 * Invoice Detail Page
 * RestaurantIQ Platform
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { InvoiceCard, InvoiceCardHeader, InvoiceCardContent, InvoiceStatusBadge } from '@/design-system/components';
import { Button } from '@/components/ui/button';
import { InvoiceReviewTable } from '@/components/invoice/InvoiceReviewTable';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';
import { parseDataLoadError, parseDeleteError } from '@/utils/errorMessages';
import { Download, Trash2, Loader2 } from 'lucide-react';

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  vendor_name: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'parsed' | 'reviewed' | 'approved';
  line_items: Array<{
    item_number?: string;
    description: string;
    quantity: number;
    pack_size?: string;
    unit_price: number;
    extended_price: number;
    category?: 'DRY' | 'REFRIGERATED' | 'FROZEN';
  }>;
}

export function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 [DETAIL] InvoiceDetailPage mounted, invoiceId:', invoiceId);
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    console.log('📥 [DETAIL] Fetching invoice:', invoiceId);
    try {
      const endpoint = `/api/v1/invoices/${invoiceId}`;
      console.log('📤 [DETAIL] GET request to:', endpoint);
      
      const response = await apiClient.get(endpoint);
      console.log('✅ [DETAIL] Response received:', {
        status: response.status,
        hasData: !!response.data,
        success: response.data?.success
      });
      
      const data = response.data;
      
      console.log('📦 [DETAIL] Invoice data:', {
        hasInvoice: !!data.invoice,
        hasItems: !!data.items,
        itemsCount: data.items?.length,
        invoice_number: data.invoice?.invoice_number
      });
      
      setInvoice({
        ...data.invoice,
        line_items: data.items || [],
      });
      
      console.log('✅ [DETAIL] Invoice state updated successfully');
    } catch (error) {
      console.error('❌ [DETAIL] Error fetching invoice:', error);
      console.error('❌ [DETAIL] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        response: (error as any)?.response?.data
      });
      
      const errorDetails = parseDataLoadError(error, 'invoice');
      toast({
        title: errorDetails.title,
        description: errorDetails.description,
        variant: 'destructive',
      });
      navigate('/invoices');
    } finally {
      setLoading(false);
      console.log('🏁 [DETAIL] Fetch complete, loading:', false);
    }
  };

  const handleDelete = async () => {
    const confirmMessage = 
      '⚠️ WARNING: This will permanently delete this invoice and all associated inventory items.\n\n' +
      'This action cannot be undone. Are you sure you want to continue?';
    
    if (!confirm(confirmMessage)) return;

    try {
      await apiClient.delete(`/api/v1/invoices/${invoiceId}`);

      toast({
        title: 'Invoice deleted',
        description: 'Invoice has been deleted successfully',
      });

      navigate('/invoices');
    } catch (error) {
      const errorDetails = parseDeleteError(error, 'invoice');
      toast({
        title: errorDetails.title,
        description: errorDetails.description,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Invoice Details</h1>
            <p className="text-slate-400">
              {invoice.vendor_name} • #{invoice.invoice_number}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Invoice Header */}
        <InvoiceCard variant="elevated">
          <InvoiceCardHeader>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Invoice Information</h2>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </InvoiceCardHeader>
          <InvoiceCardContent className="space-y-6">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 text-xs">Invoice Number</span>
                <div className="text-white font-mono font-semibold mt-1">
                  {invoice.invoice_number}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Date</span>
                <div className="text-white font-semibold mt-1">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Vendor</span>
                <div className="text-white font-semibold mt-1">
                  {invoice.vendor_name}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Total</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  ${invoice.total?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-obsidian/50 border border-white/10 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Subtotal</span>
                  <div className="text-white font-mono font-semibold mt-1">
                    ${invoice.subtotal?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Tax</span>
                  <div className="text-white font-mono font-semibold mt-1">
                    ${invoice.tax?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Total</span>
                  <div className="text-emerald-400 font-mono font-bold text-lg mt-1">
                    ${invoice.total?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </InvoiceCardContent>
        </InvoiceCard>

        {/* Line Items */}
        <InvoiceCard variant="elevated">
          <InvoiceCardHeader>
            <h2 className="text-xl font-semibold text-white">
              Line Items ({invoice.line_items.length})
            </h2>
          </InvoiceCardHeader>
          <InvoiceCardContent>
            <InvoiceReviewTable
              lineItems={invoice.line_items}
              onUpdateItem={() => {}}
              onDeleteItem={() => {}}
              onAddItem={() => {}}
              readonly={true}
            />
          </InvoiceCardContent>
        </InvoiceCard>
      </div>
    </AppShell>
  );
}

