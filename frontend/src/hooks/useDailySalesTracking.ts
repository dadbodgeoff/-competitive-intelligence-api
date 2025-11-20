import { useCallback, useEffect, useMemo, useState } from 'react'

import { useToast } from './use-toast'
import {
  getDailySales,
  getSalesSummary,
  recordDailySales,
  type RecordDailySalesPayload,
} from '@/services/api/menuSalesApi'
import type {
  MenuSalesRecord,
  MenuSalesSummary,
  MenuSalesSummaryTotals,
} from '@/types/menuSales'

export interface DailySalesDraft extends MenuSalesRecord {
  key: string
  isExisting?: boolean
}

const buildKey = (menuItemId: string, priceId?: string | null) =>
  `${menuItemId}::${priceId ?? 'all'}`

const todayISO = () => new Date().toISOString().slice(0, 10)

export function useDailySalesTracking(initialDate?: string) {
  const [saleDate, setSaleDate] = useState<string>(initialDate ?? todayISO())
  const [draftEntries, setDraftEntries] = useState<Record<string, DailySalesDraft>>({})
  const [salesSummary, setSalesSummary] = useState<MenuSalesSummary | null>(null)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [saving, setSaving] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const { toast } = useToast()

  const entries = useMemo(
    () => Object.values(draftEntries).sort((a, b) => a.menu_item_name?.localeCompare(b.menu_item_name ?? '') ?? 0),
    [draftEntries],
  )

  const loadEntries = useCallback(
    async (targetDate: string) => {
      setLoadingEntries(true)
      try {
        const response = await getDailySales(targetDate)
        const map: Record<string, DailySalesDraft> = {}
        for (const entry of response.entries) {
          const key = buildKey(entry.menu_item_id, entry.menu_item_price_id ?? null)
          map[key] = {
            ...entry,
            key,
            isExisting: true,
          }
        }
        setDraftEntries(map)
      } catch (error) {
        console.error('Failed to load daily sales', error)
        toast({
          title: 'Failed to load sales',
          description: error instanceof Error ? error.message : 'Unable to fetch daily sales',
          variant: 'destructive',
        })
        setDraftEntries({})
      } finally {
        setLoadingEntries(false)
      }
    },
    [toast],
  )

  const loadSummary = useCallback(
    async (targetDate: string) => {
      setSummaryLoading(true)
      try {
        const response = await getSalesSummary({ endDate: targetDate })
        setSalesSummary(response)
      } catch (error) {
        console.error('Failed to load sales summary', error)
        toast({
          title: 'Failed to load sales summary',
          description: error instanceof Error ? error.message : 'Unable to fetch sales summary',
          variant: 'destructive',
        })
        setSalesSummary(null)
      } finally {
        setSummaryLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    loadEntries(saleDate)
    loadSummary(saleDate)
  }, [saleDate, loadEntries, loadSummary])

  const addOrUpdateEntry = useCallback(
    (entry: {
      menuItemId: string
      menuItemName: string
      menuItemPriceId?: string | null
      sizeLabel?: string | null
      quantity: number
      unitCogsSnapshot?: number | null
      unitMenuPriceSnapshot?: number | null
    }) => {
      if (!entry.menuItemId) {
        return
      }
      const key = buildKey(entry.menuItemId, entry.menuItemPriceId ?? null)
      setDraftEntries((prev) => {
        const existing = prev[key]
        const updatedQuantity =
          entry.quantity !== undefined
            ? entry.quantity
            : existing
            ? existing.quantity_sold
            : 0

        return {
          ...prev,
          [key]: {
            key,
            id: existing?.id ?? key,
            menu_item_id: entry.menuItemId,
            menu_item_name: entry.menuItemName,
            menu_item_price_id: entry.menuItemPriceId ?? null,
            size_label: entry.sizeLabel ?? existing?.size_label ?? null,
            quantity_sold: updatedQuantity,
            unit_cogs_snapshot: entry.unitCogsSnapshot ?? existing?.unit_cogs_snapshot ?? null,
            unit_menu_price_snapshot:
              entry.unitMenuPriceSnapshot ?? existing?.unit_menu_price_snapshot ?? null,
            total_cogs_snapshot:
              entry.unitCogsSnapshot !== undefined
                ? (entry.unitCogsSnapshot ?? 0) * updatedQuantity
                : existing?.total_cogs_snapshot ?? null,
            total_revenue_snapshot:
              entry.unitMenuPriceSnapshot !== undefined
                ? (entry.unitMenuPriceSnapshot ?? 0) * updatedQuantity
                : existing?.total_revenue_snapshot ?? null,
            gross_profit_snapshot:
              entry.unitCogsSnapshot !== undefined && entry.unitMenuPriceSnapshot !== undefined
                ? (entry.unitMenuPriceSnapshot ?? 0) * updatedQuantity -
                  (entry.unitCogsSnapshot ?? 0) * updatedQuantity
                : existing?.gross_profit_snapshot ?? null,
            metadata: existing?.metadata ?? null,
            isExisting: existing?.isExisting ?? false,
          },
        }
      })
    },
    [],
  )

  const updateEntryQuantity = useCallback((key: string, quantity: number) => {
    setDraftEntries((prev) => {
      const entry = prev[key]
      if (!entry) return prev
      const unitCogs = entry.unit_cogs_snapshot ?? null
      const unitPrice = entry.unit_menu_price_snapshot ?? null
      return {
        ...prev,
        [key]: {
          ...entry,
          quantity_sold: quantity,
          total_cogs_snapshot: unitCogs !== null ? unitCogs * quantity : entry.total_cogs_snapshot,
          total_revenue_snapshot:
            unitPrice !== null ? unitPrice * quantity : entry.total_revenue_snapshot,
          gross_profit_snapshot:
            unitCogs !== null && unitPrice !== null
              ? unitPrice * quantity - unitCogs * quantity
              : entry.gross_profit_snapshot,
        },
      }
    })
  }, [])

  const removeEntry = useCallback((key: string) => {
    setDraftEntries((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const resetEntries = useCallback(() => {
    setDraftEntries({})
  }, [])

  const saveEntries = useCallback(async () => {
    const payload: RecordDailySalesPayload = {
      sale_date: saleDate,
      entries: Object.values(draftEntries).map((entry) => ({
        menu_item_id: entry.menu_item_id,
        menu_item_price_id: entry.menu_item_price_id ?? null,
        quantity_sold: entry.quantity_sold,
        metadata: entry.metadata ?? undefined,
      })),
    }

    if (!payload.entries.length) {
      toast({
        title: 'No entries to save',
        description: 'Add at least one menu item before saving daily sales.',
      })
      return
    }

    setSaving(true)
    try {
      const response = await recordDailySales(payload)
      const map: Record<string, DailySalesDraft> = {}
      for (const record of response.records) {
        const key = buildKey(record.menu_item_id, record.menu_item_price_id ?? null)
        map[key] = {
          ...record,
          key,
          isExisting: true,
        }
      }
      setDraftEntries(map)
      await loadSummary(saleDate)
      toast({
        title: 'Daily sales saved',
        description: 'Food cost spend has been updated for the selected date.',
      })
    } catch (error) {
      console.error('Failed to save daily sales', error)
      toast({
        title: 'Failed to save sales',
        description: error instanceof Error ? error.message : 'Unable to save daily sales',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }, [draftEntries, saleDate, toast, loadSummary])

  const totalsForDate: MenuSalesSummaryTotals | null = useMemo(() => {
    if (!salesSummary) return null
    const match = salesSummary.by_date.find((entry) => entry.sale_date === saleDate)
    return match ?? salesSummary.totals
  }, [saleDate, salesSummary])

  return {
    saleDate,
    setSaleDate,
    entries,
    addOrUpdateEntry,
    updateEntryQuantity,
    removeEntry,
    resetEntries,
    saveEntries,
    loadingEntries,
    saving,
    salesSummary,
    totalsForDate,
    summaryLoading,
    refresh: () => {
      loadEntries(saleDate)
      loadSummary(saleDate)
    },
  }
}

