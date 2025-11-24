import { useMemo, useState } from 'react'
import {
  Calendar,
  ChefHat,
  DollarSign,
  Loader2,
  PieChart,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import { InvoiceCard, InvoiceCardContent, InvoiceCardHeader } from '@/design-system/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useDailySalesTracking } from '@/hooks/useDailySalesTracking'
import type { MenuCategory } from '@/hooks/useCOGSOverview'
import type { MenuItemRecipe } from '@/types/menuRecipe'
import { cn } from '@/design-system'

interface FlattenedMenuItem {
  id: string
  name: string
  categoryName: string
  prices: Array<{ id?: string; size?: string | null; price: number }>
}

interface DailySalesPanelProps {
  categories: MenuCategory[]
  recipes: Map<string, MenuItemRecipe>
}

export function DailySalesPanel({ categories, recipes }: DailySalesPanelProps) {
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

  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState<string>('1')

  const allItems = useMemo<FlattenedMenuItem[]>(() => {
    const flattened: FlattenedMenuItem[] = []
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

  const handleAddEntry = () => {
    if (!selectedItem) {
      return
    }

    const parsedQuantity = Number(quantity)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return
    }

    // Auto-select the first price if only one exists
    let priceId = selectedPriceId
    let price = selectedPrice
    if (!priceId && priceOptions.length === 1) {
      priceId = priceOptions[0].id
      price = priceOptions[0]
    }

    // Determine unit COGS from recipe snapshot if available
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

  const resetForm = () => {
    setSelectedItemId('')
    setSelectedPriceId(undefined)
    setQuantity('1')
    refresh()
  }

  return (
    <InvoiceCard variant="elevated">
      <InvoiceCardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent-400">
              <ChefHat className="h-5 w-5" />
              <span className="text-sm uppercase tracking-wide">Daily Sales Tracking</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mt-1">
              Convert menu sales into actual food spend
            </h3>
            <p className="text-sm text-slate-400">
              Log quantities sold to capture real-time COGS and profitability for every dish.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-96">
            <MetricTile
              icon={DollarSign}
              label="Daily Spend"
              value={dailyTotals.total_cogs}
              prefix="$"
            />
            <MetricTile
              icon={PieChart}
              label="Gross Profit"
              value={dailyTotals.total_gross_profit}
              prefix="$"
              valueClass={dailyTotals.total_gross_profit >= 0 ? 'text-primary-500' : 'text-destructive'}
            />
            <MetricTile
              icon={Calendar}
              label="Date"
              value={saleDate}
              isDate
            />
            <MetricTile
              icon={RefreshCw}
              label="Entries"
              value={entries.length}
            />
          </div>
        </div>
      </InvoiceCardHeader>
      <InvoiceCardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
          <div className="space-y-4 rounded-lg border border-white/10 bg-obsidian/60 p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sale Date
            </label>
            <Input
              type="date"
              value={saleDate}
              onChange={(event) => setSaleDate(event.target.value)}
              className="input-field"
              max={new Date().toISOString().slice(0, 10)}
            />

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
                <SelectContent className="bg-obsidian border-white/10">
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

            {priceOptions.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Size / Variant
                </label>
                <Select
                  value={selectedPriceId ?? ''}
                  onValueChange={(value) => setSelectedPriceId(value || undefined)}
                >
                  <SelectTrigger className="w-full bg-obsidian border-white/10 text-white mt-1">
                    <SelectValue placeholder={priceOptions.length > 1 ? 'Select size' : 'All sizes'} />
                  </SelectTrigger>
                  <SelectContent className="bg-obsidian border-white/10">
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
                step="0.1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="input-field mt-1"
              />
            </div>

            <Button
              className="w-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-white/10"
              onClick={handleAddEntry}
              disabled={!selectedItem || saving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Daily Log
            </Button>
          </div>

          <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
                Trailing 14 Day Overview
              </h4>
              {summaryLoading && <Loader2 className="h-4 w-4 text-accent-400 animate-spin" />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryStat
                label="Total Spend"
                value={salesSummary?.totals.total_cogs ?? 0}
                prefix="$"
              />
              <SummaryStat
                label="Total Revenue"
                value={salesSummary?.totals.total_revenue ?? 0}
                prefix="$"
              />
              <SummaryStat
                label="Gross Profit"
                value={salesSummary?.totals.total_gross_profit ?? 0}
                prefix="$"
              />
              <SummaryStat
                label="Items Sold"
                value={salesSummary?.totals.total_quantity ?? 0}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Top Cost Drivers</p>
              <div className="space-y-2">
                {(salesSummary?.top_items ?? []).slice(0, 3).map((item) => (
                  <div
                    key={item.menu_item_id}
                    className="flex items-center justify-between rounded border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-white"
                  >
                    <span className="truncate">
                      {item.menu_item_name ?? 'Menu Item'}{' '}
                      <span className="text-xs text-slate-400">
                        • ${item.total_cogs.toFixed(2)} spend
                      </span>
                    </span>
                    <span className="font-mono text-primary-500">
                      {item.total_quantity.toFixed(1)} sold
                    </span>
                  </div>
                ))}
                {(salesSummary?.top_items ?? []).length === 0 && (
                  <p className="text-sm text-slate-500">No sales logged yet for this range.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 bg-obsidian/70 px-4 py-3">
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
                Daily Entries
              </h4>
              <p className="text-xs text-slate-400">
                Quantities saved here will snapshot COGS for historical accuracy.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300 hover:bg-white/5"
                onClick={resetForm}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="btn-primary shadow-primary"
                onClick={saveEntries}
                disabled={saving || loadingEntries}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Save Daily Sales
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingEntries ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                Loading daily entries...
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No entries logged for {saleDate}. Add menu items to begin tracking spend.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead className="text-left text-slate-300">Menu Item</TableHead>
                    <TableHead className="text-right text-slate-300 w-32">Quantity</TableHead>
                    <TableHead className="text-right text-slate-300 w-32">Unit COGS</TableHead>
                    <TableHead className="text-right text-slate-300 w-32">Unit Price</TableHead>
                    <TableHead className="text-right text-slate-300 w-32">Total Spend</TableHead>
                    <TableHead className="text-right text-slate-300 w-32">Gross Profit</TableHead>
                    <TableHead className="text-right text-slate-300 w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.key} className="border-white/5">
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{entry.menu_item_name}</span>
                          <span className="text-xs text-slate-500">
                            {entry.size_label ? entry.size_label : 'Default'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={entry.quantity_sold}
                          onChange={(event) =>
                            updateEntryQuantity(entry.key, Number(event.target.value))
                          }
                          className="input-field text-right"
                        />
                      </TableCell>
                      <TableCell className="py-3 text-right font-mono text-slate-300">
                        {entry.unit_cogs_snapshot !== null && entry.unit_cogs_snapshot !== undefined
                          ? `$${entry.unit_cogs_snapshot.toFixed(2)}`
                          : '—'}
                      </TableCell>
                      <TableCell className="py-3 text-right font-mono text-slate-300">
                        {entry.unit_menu_price_snapshot !== null &&
                        entry.unit_menu_price_snapshot !== undefined
                          ? `$${entry.unit_menu_price_snapshot.toFixed(2)}`
                          : '—'}
                      </TableCell>
                      <TableCell className="py-3 text-right font-mono text-primary-500">
                        {entry.total_cogs_snapshot !== null && entry.total_cogs_snapshot !== undefined
                          ? `$${entry.total_cogs_snapshot.toFixed(2)}`
                          : '—'}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'py-3 text-right font-mono',
                          (entry.gross_profit_snapshot ?? 0) >= 0
                            ? 'text-primary-500'
                            : 'text-destructive',
                        )}
                      >
                        {entry.gross_profit_snapshot !== null &&
                        entry.gross_profit_snapshot !== undefined
                          ? `$${entry.gross_profit_snapshot.toFixed(2)}`
                          : '—'}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-red-300 hover:bg-destructive/10"
                          onClick={() => removeEntry(entry.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </InvoiceCardContent>
    </InvoiceCard>
  )
}

interface MetricTileProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  prefix?: string
  isDate?: boolean
  valueClass?: string
}

function MetricTile({ icon: Icon, label, value, prefix, isDate, valueClass }: MetricTileProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-lg font-semibold text-white mt-1">
        <span className={valueClass}>
          {isDate ? value : `${prefix ?? ''}${typeof value === 'number' ? value.toFixed(2) : value}`}
        </span>
      </div>
    </div>
  )
}

interface SummaryStatProps {
  label: string
  value: number
  prefix?: string
}

function SummaryStat({ label, value, prefix }: SummaryStatProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/50 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-white">
        {prefix ?? ''}
        {value.toFixed(2)}
      </p>
    </div>
  )
}

