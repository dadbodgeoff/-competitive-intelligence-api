/**
 * Invoice List Page - Professional Edition
 * RestaurantIQ Platform
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeading } from '@/components/layout/PageHeading';
import { InvoiceCard, InvoiceCardHeader, InvoiceCardContent, InvoiceStatusBadge } from '@/design-system/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { parseDataLoadError } from '@/utils/errorMessages';
import { Plus, Search, FileText, Calendar, DollarSign, Loader2, Filter, X } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { EmptyState } from '@/components/ui';

export function InvoiceListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState(10);

  const {
    data: invoiceResponse,
    isLoading,
    isFetching,
    error,
  } = useInvoices(
    { page: 1, perPage: 50 },
    {
      staleTime: 1000 * 60 * 5,
      placeholderData: (previousData) => previousData,
    }
  );

  useEffect(() => {
    if (!error) return;
    const errorDetails = parseDataLoadError(error, 'invoices');
    toast({
      title: errorDetails.title,
      description: errorDetails.description,
      variant: 'destructive',
    });
  }, [error, toast]);

  const invoices = invoiceResponse?.data ?? [];

  // Get unique vendors for filter
  const uniqueVendors = useMemo(() => {
    const vendors = new Set(invoices.map(inv => inv.vendor_name));
    return Array.from(vendors).sort();
  }, [invoices]);

  // Filter and limit invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        invoice.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Vendor filter
    if (selectedVendor !== 'all') {
      filtered = filtered.filter(invoice => invoice.vendor_name === selectedVendor);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus);
    }

    // Limit to displayLimit
    return filtered.slice(0, displayLimit);
  }, [invoices, searchQuery, selectedVendor, selectedStatus, displayLimit]);

  const hasActiveFilters = searchQuery || selectedVendor !== 'all' || selectedStatus !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedVendor('all');
    setSelectedStatus('all');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <PageHeading>Invoices</PageHeading>
            <p className="text-slate-400">
              Manage and review your uploaded invoices
            </p>
          </div>
          <Button
            onClick={() => navigate('/invoices/upload')}
            className="btn-primary shadow-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Invoice
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-card-dark border-white/10">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Search and Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by vendor or invoice number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-obsidian border-white/10 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Vendor Filter */}
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger className="bg-obsidian border-white/10 text-white">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {uniqueVendors.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-obsidian border-white/10 text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="parsed">Parsed</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters & Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <>
                      <Badge variant="outline" className="bg-accent-500/10 text-accent-400 border-accent-500/30">
                        <Filter className="h-3 w-3 mr-1" />
                        {filteredInvoices.length} of {invoices.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-7 text-xs text-slate-400 hover:text-white"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear filters
                      </Button>
                    </>
                  )}
                  {!hasActiveFilters && (
                    <p className="text-sm text-slate-400">
                      Showing {Math.min(displayLimit, invoices.length)} of {invoices.length} invoices
                    </p>
                  )}
                </div>

                {filteredInvoices.length >= displayLimit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDisplayLimit(prev => prev + 10)}
                    className="text-accent-400 hover:text-accent-300"
                  >
                    Load more
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && invoices.length === 0 && (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No invoices yet"
            description="Upload your first invoice to get started tracking prices"
            action={
              <Button
                onClick={() => navigate('/invoices/upload')}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Invoice
              </Button>
            }
          />
        )}

        {/* Invoice Grid */}
        {!isLoading && filteredInvoices.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => navigate(`/invoices/${invoice.id}`)}
                className="cursor-pointer"
              >
              <InvoiceCard variant="interactive">
                <InvoiceCardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {invoice.vendor_name}
                      </h3>
                      <p className="text-sm text-slate-400 font-mono">
                        #{invoice.invoice_number}
                      </p>
                    </div>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </InvoiceCardHeader>
                <InvoiceCardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary-500" />
                    <span className="text-lg font-bold text-primary-500 font-mono">
                      ${invoice.total.toFixed(2)}
                    </span>
                  </div>
                </InvoiceCardContent>
              </InvoiceCard>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && invoices.length > 0 && filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No invoices match your search</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

