/**
 * Invoice Detail Page
 * RestaurantIQ Platform - Enhanced with Analytics
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceCard, InvoiceCardHeader, InvoiceCardContent, InvoiceStatusBadge } from '@/design-system/components';
import { Button } from '@/components/ui/button';
import { InvoiceReviewTable } from '@/components/invoice/InvoiceReviewTable';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';
import { parseDataLoadError, parseDeleteError } from '@/utils/errorMessages';
import { useInvoiceInsights } from '@/hooks/useInvoiceAnalytics';
import { Download, Trash2, Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import { attachConversionToLineItem, type PackConversionResult } from '@/utils/invoiceUnits';
import { formatCurrency } from '@/types/analytics';
import { TrendBadge } from '@/components/analytics';

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
    converted_quantity?: number;
    converted_unit?: string;
    per_pack_quantity?: number;
    per_pack_unit?: string;
    conversion?: PackConversionResult;
  }>;
}

type InvoiceLineItem = InvoiceData['line_items'][number];

export function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch price insights for this invoice
  const { data: insights, isLoading: insightsLoading } = useInvoiceInsights(invoiceId, !loading && !!invoice);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const endpoint = `/api/v1/invoices/${invoiceId}`;
      const response = await apiClient.get(endpoint);
      const data = response.data;
      
      const rawLineItems = (data.items || []) as InvoiceLineItem[];
      const lineItems = rawLineItems.map((item) => attachConversionToLineItem(item));

      setInvoice({
        ...data.invoice,
        line_items: lineItems,
      });
    } catch (error) {
      const errorDetails = parseDataLoadError(error, 'invoice');
      toast({
        title: errorDetails.title,
        description: errorDetails.description,
        variant: 'destructive',
      });
      navigate('/invoices');
    } finally {
      setLoading(false);
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
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
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
        <ModulePageHeader
          icon={Download}
          title="Invoice Details"
          description={`${invoice.vendor_name} • #${invoice.invoice_number}`}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300 hover:bg-white/5 h-8 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-red-500/30 text-destructive hover:bg-destructive/10 h-8 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </>
          }
        />

        {/* Price Insights Cards */}
        {!insightsLoading && insights && (insights.alerts > 0 || insights.potential_savings > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Price Alerts Card */}
            {insights.alerts > 0 && (
              <Card className="bg-card-dark border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Price Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-400 mb-2">
                    {insights.alerts} items
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Items with significant price changes from average
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {insights.items.filter(i => i.is_alert).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-white/5 rounded px-2 py-1">
                        <span className="text-slate-300 truncate flex-1 mr-2">{item.description}</span>
                        <TrendBadge value={item.price_change_percent} size="sm" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Savings Opportunities Card */}
            {insights.potential_savings > 0 && (
              <Card className="bg-card-dark border-success-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-success-400" />
                    Savings Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success-400 mb-2">
                    {formatCurrency(insights.potential_savings)}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Potential savings by switching to best prices
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {insights.items.filter(i => i.potential_savings > 0).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-white/5 rounded px-2 py-1">
                        <span className="text-slate-300 truncate flex-1 mr-2">{item.description}</span>
                        <span className="text-success-400 font-medium">
                          Save {formatCurrency(item.potential_savings)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

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
                <div className="text-2xl font-bold text-primary-500 font-mono mt-1">
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
                  <div className="text-primary-500 font-mono font-bold text-lg mt-1">
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

