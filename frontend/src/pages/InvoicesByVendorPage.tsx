/**
 * Invoices By Vendor Page
 * Hierarchical view of invoices grouped by vendor
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { useInvoicesByVendor } from '@/hooks/useInvoiceAnalytics';
import { InvoiceStatusBadge } from '@/design-system/components';
import { formatCurrency } from '@/types/analytics';
import { ExportButton } from '@/components/analytics';

export function InvoicesByVendorPage() {
  const navigate = useNavigate();
  const [daysBack, setDaysBack] = useState(90);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());

  const { data, isLoading } = useInvoicesByVendor(daysBack);

  // Filter vendors by search
  const filteredVendors = data?.vendors.filter(vendor =>
    vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleVendor = (vendorName: string) => {
    setExpandedVendors(prev => {
      const next = new Set(prev);
      if (next.has(vendorName)) {
        next.delete(vendorName);
      } else {
        next.add(vendorName);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedVendors(new Set(filteredVendors.map(v => v.vendor_name)));
  };

  const collapseAll = () => {
    setExpandedVendors(new Set());
  };

  // Prepare export data
  const exportData = filteredVendors.flatMap(vendor =>
    vendor.invoices.map(inv => ({
      vendor_name: vendor.vendor_name,
      invoice_number: inv.invoice_number,
      date: inv.date,
      total: inv.total,
      status: inv.status,
      item_count: inv.item_count,
    }))
  );

  const exportColumns = [
    { key: 'vendor_name', header: 'Vendor' },
    { key: 'invoice_number', header: 'Invoice #' },
    { key: 'date', header: 'Date' },
    { key: 'total', header: 'Total' },
    { key: 'status', header: 'Status' },
    { key: 'item_count', header: 'Items' },
  ];

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        {/* Header */}
        <ModulePageHeader
          icon={Building2}
          title="Invoices by Vendor"
          description="Browse invoices organized by supplier"
          actions={
            <>
              <Button
                onClick={() => navigate('/invoices/dashboard')}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 h-8 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Dashboard
              </Button>
              <ExportButton
                data={exportData}
                filename="invoices_by_vendor"
                columns={exportColumns}
              />
            </>
          }
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-card-dark border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-obsidian/70 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
                <Select value={daysBack.toString()} onValueChange={(v) => setDaysBack(parseInt(v))}>
                  <SelectTrigger className="w-32 bg-obsidian/70 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAll}
                    className="text-slate-400 hover:text-white"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAll}
                    className="text-slate-400 hover:text-white"
                  >
                    Collapse All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vendor List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
            ))
          ) : filteredVendors.length === 0 ? (
            <Card className="bg-card-dark border-white/10">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">
                  {searchTerm ? 'No vendors match your search' : 'No invoices found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.vendor_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Collapsible
                  open={expandedVendors.has(vendor.vendor_name)}
                  onOpenChange={() => toggleVendor(vendor.vendor_name)}
                >
                  <Card className="bg-card-dark border-white/10 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary-400" />
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg">
                                {vendor.vendor_name}
                              </CardTitle>
                              <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(vendor.total_spend)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {vendor.invoice_count} invoices
                                </span>
                                <span>
                                  Avg: {formatCurrency(vendor.avg_order)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <div className="text-lg font-bold text-primary-500">
                                {formatCurrency(vendor.total_spend)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {vendor.invoice_count} invoices
                              </div>
                            </div>
                            {expandedVendors.has(vendor.vendor_name) ? (
                              <ChevronDown className="h-5 w-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 border-t border-white/5">
                        <div className="divide-y divide-white/5">
                          {vendor.invoices.map((invoice) => (
                            <div
                              key={invoice.id}
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                              className="flex items-center justify-between py-3 px-2 -mx-2 rounded cursor-pointer hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <div>
                                  <div className="font-mono text-white">
                                    {invoice.invoice_number}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(invoice.date).toLocaleDateString()}
                                    <span>•</span>
                                    {invoice.item_count} items
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <InvoiceStatusBadge status={invoice.status as any} />
                                <div className="text-right">
                                  <div className="font-mono font-medium text-white">
                                    {formatCurrency(invoice.total)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </motion.div>
            ))
          )}
        </div>

        {/* Summary */}
        {!isLoading && filteredVendors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-center text-sm text-slate-500"
          >
            Showing {filteredVendors.length} vendors with{' '}
            {filteredVendors.reduce((sum, v) => sum + v.invoice_count, 0)} invoices
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
