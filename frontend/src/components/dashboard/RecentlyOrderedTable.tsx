import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { dashboardApi, RecentlyOrderedItem } from '@/services/api/dashboardApi';
import { formatDistanceToNow } from 'date-fns';

export function RecentlyOrderedTable() {
  const [items, setItems] = useState<RecentlyOrderedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadItems();
  }, [page]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getRecentlyOrderedItems(page, limit);
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load recently ordered items:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-primary-500" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  if (loading && items.length === 0) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recently Ordered Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recently Ordered Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-400">No items found</p>
            <p className="text-sm text-slate-500 mt-2">
              Upload invoices to see recently ordered items
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card-dark border-white/10">
      <CardContent className="p-0">
        <div className="rounded-lg overflow-hidden border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 bg-card-dark/30 hover:bg-card-dark/30">
                <TableHead className="text-slate-300 font-semibold h-12">Item Name</TableHead>
                <TableHead className="text-slate-300 font-semibold">Vendor</TableHead>
                <TableHead className="text-slate-300 font-semibold text-right">Last Price</TableHead>
                <TableHead className="text-slate-300 font-semibold">Last Ordered</TableHead>
                <TableHead className="text-slate-300 font-semibold text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow
                  key={index}
                  className={`
                    border-white/10 hover:bg-card-dark/70 cursor-pointer transition-colors
                    ${index % 2 === 0 ? 'bg-obsidian/20' : 'bg-transparent'}
                  `}
                >
                  <TableCell className="font-medium text-white py-4">
                    {item.item_description}
                  </TableCell>
                  <TableCell className="text-slate-300">{item.vendor_name}</TableCell>
                  <TableCell className="text-right text-slate-300 font-mono">
                    ${item.last_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {formatDistanceToNow(new Date(item.last_ordered), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {getTrendIcon(item.trend)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!hasPrevPage || loading}
              className="border-white/10 text-slate-300 hover:bg-card-dark"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-slate-400">
              Page {page + 1} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!hasNextPage || loading}
              className="border-white/10 text-slate-300 hover:bg-card-dark"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
