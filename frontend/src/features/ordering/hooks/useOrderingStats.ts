/**
 * Ordering Stats Hook
 * Computes summary statistics from predictions and patterns
 */

import { useMemo } from 'react'
import type { OrderingPrediction, DeliveryPattern } from '@/types/ordering'

interface OrderingStats {
  totalItemsToOrder: number
  totalForecastQuantity: number
  uniqueVendors: number
  deliveriesThisWeek: number
  lowConfidenceItems: number
  avgConfidence: number
  nextDeliveryDate: Date | null
  itemsByVendor: Map<string, OrderingPrediction[]>
}

export function useOrderingStats(
  predictions: OrderingPrediction[],
  patterns: DeliveryPattern[]
): OrderingStats {
  return useMemo(() => {
    const vendorSet = new Set<string>()
    const itemsByVendor = new Map<string, OrderingPrediction[]>()
    let totalQuantity = 0
    let lowConfidenceCount = 0
    let confidenceSum = 0
    let confidenceCount = 0
    let nextDelivery: Date | null = null

    const today = new Date()
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    predictions.forEach((prediction) => {
      // Track vendors
      if (prediction.vendor_name) {
        vendorSet.add(prediction.vendor_name)
        const existing = itemsByVendor.get(prediction.vendor_name) || []
        existing.push(prediction)
        itemsByVendor.set(prediction.vendor_name, existing)
      }

      // Sum quantities
      totalQuantity += prediction.forecast_quantity || 0

      // Track confidence
      if (prediction.delivery_pattern_confidence != null) {
        confidenceSum += prediction.delivery_pattern_confidence
        confidenceCount++
        if (prediction.delivery_pattern_confidence < 0.6) {
          lowConfidenceCount++
        }
      }

      // Find next delivery
      const deliveryDate = prediction.delivery_date || prediction.forecast_date
      if (deliveryDate) {
        const date = new Date(deliveryDate)
        if (!nextDelivery || date < nextDelivery) {
          nextDelivery = date
        }
      }
    })

    // Count deliveries this week
    let deliveriesThisWeek = 0
    predictions.forEach((prediction) => {
      const deliveryDate = prediction.delivery_date || prediction.forecast_date
      if (deliveryDate) {
        const date = new Date(deliveryDate)
        if (date >= today && date <= weekFromNow) {
          deliveriesThisWeek++
        }
      }
    })

    return {
      totalItemsToOrder: predictions.length,
      totalForecastQuantity: totalQuantity,
      uniqueVendors: vendorSet.size,
      deliveriesThisWeek,
      lowConfidenceItems: lowConfidenceCount,
      avgConfidence: confidenceCount > 0 ? confidenceSum / confidenceCount : 0,
      nextDeliveryDate: nextDelivery,
      itemsByVendor,
    }
  }, [predictions, patterns])
}
