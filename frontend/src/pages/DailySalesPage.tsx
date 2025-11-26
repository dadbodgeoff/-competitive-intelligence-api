/**
 * Daily Sales Tracking Page
 * Dedicated page for tracking daily menu item sales with COGS snapshots
 * Elevated from being buried in COGS Dashboard
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subDays, addDays } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Loader2,
  PieChart,
  Plus,
  RefreshCw,
  TrendingUp,
  Trash2,
} from 'lucide-react'

import { AppShell } from '@/components/layout/AppShell'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useDailySalesTracking } from '@/hooks/useDailySalesTracking'
import { useCOGSOverview } from '@/hooks/useCOGSOverview'
import { cn } from '@/lib/utils'

export function DailySalesPage() {
  const navigate = useNavigate()
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState<string>('1')

  const {
    saleDate,
    setSaleDate,
    entries,
    addOrUpdateEntry,
    updateEntryQuantity,
    removeEntry,
    saveEntries,
    loadingEntries,
    saving,
    salesSummary,
    totalsForDate,
    summaryLoading,
    refresh,
  } = useDailySalesTracking()

  const { categories, recipes } = useCOGSOverview()

  // Flatten menu items for selection
  const allItems = useMemo(() => {
    const flattened: Array<{
      id: string
      name: string
      categoryName: string
      prices: Array<{ id?: string; size?: string | null; price: number }>
    }> = []
    for (const category of categories) {
      for (const item of category.items) {
        flattened.push({
          id: item.id,
          name: item.name,
          categoryName: category.name,
          prices: item.prices.map((price) => ({
            id: price.id,
            size: price.size,
            price: price.price,
          })),
        })
      }
    }
    return flattened
  }, [categories])

  const selectedItem = useMemo(
    () => allItems.find((item) => item.id === selectedItemId),
    [allItems, selectedItemId],
  )

  const priceOptions = selectedItem?.prices ?? []
  const selectedPrice = priceOptions.find((price) => price.id === selectedPriceId)

  const dailyTotals = totalsForDate ?? {
    total_quantity: 0,
    total_cogs: 0,
    total_revenue: 0,
    total_gross_profit: 0,
  }

  // Date navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(saleDate)
    const newDate = direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    setSaleDate(format(newDate, 'yyyy-MM-dd'))
  }

  const goToToday = () => {
    setSaleDate(format(new Date(), 'yyyy-MM-dd'))
  }

  // Add entry handler
  const handleAddEntry = () => {
    if (!selectedItem) return

    const parsedQuantity = Number(quantity)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return

    let priceId = selectedPriceId
    let price = selectedPrice
    if (!priceId && priceOptions.length === 1) {
      priceId = priceOptions[0].id
      price = priceOptions[0]
    }

    const recipe = recipes.get(selectedItem.id)
    const unitCogs = recipe?.total_cogs ?? null
    const unitPrice =
      price?.price ??
      (recipe?.menu_item?.prices && recipe.menu_item.prices[0]
        ? recipe.menu_item.prices[0].price
        : null)

    addOrUpdateEntry({
      menuItemId: selectedItem.id,
      menuItemName: selectedItem.name,
      menuItemPriceId: priceId ?? null,
      sizeLabel: price?.size ?? null,
      quantity: parsedQuantity,
      unitCogsSnapshot: unitCogs,
      unitMenuPriceSnapshot: unitPrice,
    })

    setQuantity('1')
    setSelectedPriceId(undefined)
  }

  // Export to CSV
  const handleExport = () => {
    if (entries.length === 0) return

    const headers = ['Menu Item', 'Size', 'Quantity', 'Unit COGS', 'Unit Price', 'Total Spend', 'Gross Profit']
    const rows = entries.map(entry => [
      entry.menu_item_name ?? '',
      entry.size_label ?? 'Default',
      entry.quantity_sold.toString(),
      entry.unit_cogs_snapshot?.toFixed(2) ?? '',
      entry.unit_menu_price_snapshot?.toFixed(2) ?? '',
      entry.total_cogs_snapshot?.toFixed(2) ?? '',
      entry.gross_profit_snapshot?.toFixed(2) ?? '',
    ])

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-sales-${saleDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isToday = saleDate === format(new Date(), 'yyyy-MM-dd')

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-4">
        {/* Header */}
        <ModulePageHeader
          icon={ChefHat}
          title="Daily Sales Tracking"
          description="Log quantities sold to capture real-time COGS and profitability for every dish"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cogs')}
                className="text-slate-400 hover:text-white h-8 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                COGS
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate('prev')}
                className="text-slate-400 hover:text-white h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="pl-9 w-40 h-8 text-xs bg-slate-900 border-white/10 text-white"
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate('next')}
                className="text-slate-400 hover:text-white h-8 w-8"
                disabled={isToday}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className={cn(
                  'h-8 text-xs',
                  isToday && 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                )}
              >
                Today
              </Button>
            </div>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={DollarSign}
            label="Today's Spend"
            value={dailyTotals.total_cogs}
            prefix="$"
            color="text-amber-400"
          />
          <MetricCard
            icon={TrendingUp}
            label="Revenue"
            value={dailyTotals.total_revenue}
            prefix="$"
            color="text-primary-400"
          />
          <MetricCard
            icon={PieChart}
            label="Gross Profit"
            value={dailyTotals.total_gross_profit}
            prefix="$"
            color={dailyTotals.total_gross_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <MetricCard
            icon={ChefHat}
            label="Items Sold"
            value={dailyTotals.total_quantity}
            color="text-slate-300"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          {/* Left Panel - Entry Form */}
          <div className="space-y-4">
            <Card className="bg-card-dark border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary-400" />
                  Add Sale Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Menu Item
                  </label>
                  <Select
                    value={selectedItemId}
                    onValueChange={(value) => {
                      setSelectedItemId(value)
                      setSelectedPriceId(undefined)
                    }}
                  >
                    <SelectTrigger className="w-full bg-obsidian border-white/10 text-white mt-1">
                      <SelectValue placeholder="Select menu item" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 max-h-64">
                      {allItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex flex-col">
                            <span className="text-white">{item.name}</span>
                            <span className="text-xs text-slate-400">{item.categoryName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {priceOptions.length > 1 && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Size / Variant
                    </label>
                    <Select
                      value={selectedPriceId ?? ''}
                      onValueChange={(value) => setSelectedPriceId(value || undefined)}
                    >
                      <SelectTrigger className="w-full bg-obsidian border-white/10 text-white mt-1">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {priceOptions.map((price) => (
                          <SelectItem key={price.id ?? 'default'} value={price.id ?? ''}>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white">{price.size ?? 'Default'}</span>
                              <span className="text-xs text-slate-400">${price.price.toFixed(2)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Quantity Sold
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-obsidian border-white/10 text-white mt-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
                  />
                </div>

                <Button
                  className="w-full bg-primary-600 hover:bg-primary-500"
                  onClick={handleAddEntry}
                  disabled={!selectedItem || saving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Daily Log
                </Button>
              </CardContent>
            </Card>

            {/* 14-Day Summary */}
            <Card className="bg-card-dark border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary-400" />
                  14-Day Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summaryLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <SummaryStat label="Total Spend" value={salesSummary?.totals.total_cogs ?? 0} prefix="$" />
                      <SummaryStat label="Revenue" value={salesSummary?.totals.total_revenue ?? 0} prefix="$" />
                      <SummaryStat label="Profit" value={salesSummary?.totals.total_gross_profit ?? 0} prefix="$" />
                      <SummaryStat label="Items" value={salesSummary?.totals.total_quantity ?? 0} />
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Top Cost Drivers</p>
                      <div className="space-y-1.5">
                        {(salesSummary?.top_items ?? []).slice(0, 3).map((item, idx) => (
                          <div
                            key={item.menu_item_id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-300 truncate flex-1">
                              {idx + 1}. {item.menu_item_name}
                            </span>
                            <span className="text-amber-400 font-mono ml-2">
                              ${item.total_cogs.toFixed(0)}
                            </span>
                          </div>
                        ))}
                        {(salesSummary?.top_items ?? []).length === 0 && (
                          <p className="text-sm text-slate-500">No sales data yet</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Entries Table */}
          <Card className="bg-card-dark border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">
                    Daily Entries for {format(new Date(saleDate), 'MMMM d, yyyy')}
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    {entries.length} item{entries.length !== 1 ? 's' : ''} logged
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={entries.length === 0}
                    className="border-white/10 text-slate-300 hover:bg-white/5"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refresh}
                    className="border-white/10 text-slate-300 hover:bg-white/5"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveEntries}
                    disabled={saving || loadingEntries || entries.length === 0}
                    className="bg-primary-600 hover:bg-primary-500"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Save Sales
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEntries ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Loading entries...
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400 mb-2">No entries for this date</p>
                  <p className="text-sm text-slate-500">
                    Select a menu item and add quantities sold to start tracking
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-slate-300">Menu Item</TableHead>
                        <TableHead className="text-right text-slate-300 w-28">Qty</TableHead>
                        <TableHead className="text-right text-slate-300 w-24">Unit COGS</TableHead>
                        <TableHead className="text-right text-slate-300 w-24">Unit Price</TableHead>
                        <TableHead className="text-right text-slate-300 w-28">Total Spend</TableHead>
                        <TableHead className="text-right text-slate-300 w-28">Profit</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.key} className="border-white/5">
                          <TableCell>
                            <div>
                              <span className="font-medium text-white">{entry.menu_item_name}</span>
                              {entry.size_label && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {entry.size_label}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={entry.quantity_sold}
                              onChange={(e) => updateEntryQuantity(entry.key, Number(e.target.value))}
                              className="w-20 bg-obsidian border-white/10 text-white text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono text-slate-300">
                            {entry.unit_cogs_snapshot != null ? `$${entry.unit_cogs_snapshot.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-slate-300">
                            {entry.unit_menu_price_snapshot != null ? `$${entry.unit_menu_price_snapshot.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-amber-400">
                            {entry.total_cogs_snapshot != null ? `$${entry.total_cogs_snapshot.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className={cn(
                            'text-right font-mono',
                            (entry.gross_profit_snapshot ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {entry.gross_profit_snapshot != null ? `$${entry.gross_profit_snapshot.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEntry(entry.key)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  prefix?: string
  color?: string
}

function MetricCard({ icon: Icon, label, value, prefix = '', color = 'text-white' }: MetricCardProps) {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon className={cn('h-5 w-5', color)} />
          </div>
          <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className={cn('text-xl font-bold font-mono', color)}>
              {prefix}{value.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Summary Stat Component
interface SummaryStatProps {
  label: string
  value: number
  prefix?: string
}

function SummaryStat({ label, value, prefix = '' }: SummaryStatProps) {
  return (
    <div className="rounded-lg bg-obsidian/50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-white font-mono">
        {prefix}{value.toFixed(2)}
      </p>
    </div>
  )
}

export default DailySalesPage


