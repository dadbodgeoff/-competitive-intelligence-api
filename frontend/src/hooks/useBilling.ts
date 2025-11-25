/**
 * Billing hooks for Stripe integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

// ============================================================================
// TYPES
// ============================================================================

export interface PricingPlan {
  plan_slug: string;
  plan_name: string;
  tier: 'free' | 'premium' | 'enterprise';
  amount_cents: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  is_featured: boolean;
  display_order: number;
}

export interface Subscription {
  has_subscription: boolean;
  plan_name?: string;
  status?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

export interface Invoice {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  invoice_number?: string;
  invoice_pdf_url?: string;
  paid_at?: string;
  created_at: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const response = await apiClient.get('/api/v1/billing/plans');
  return response.data.plans;
}

async function fetchSubscription(): Promise<Subscription> {
  const response = await apiClient.get('/api/v1/billing/subscription');
  return response.data;
}

async function fetchInvoices(limit = 10): Promise<Invoice[]> {
  const response = await apiClient.get(`/api/v1/billing/invoices?limit=${limit}`);
  return response.data.invoices;
}

async function createCheckoutSession(planSlug: string): Promise<{ checkout_url: string; session_id: string }> {
  const response = await apiClient.post('/api/v1/billing/checkout', {
    plan_slug: planSlug,
  });
  return response.data;
}

async function createPortalSession(): Promise<{ portal_url: string }> {
  const response = await apiClient.post('/api/v1/billing/portal');
  return response.data;
}

async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post('/api/v1/billing/subscription/cancel');
  return response.data;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch available pricing plans (public, no auth required)
 */
export function usePricingPlans() {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: fetchPricingPlans,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Fetch current user's subscription status
 */
export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Fetch user's payment history
 */
export function useInvoices(limit = 10) {
  return useQuery({
    queryKey: ['invoices', limit],
    queryFn: () => fetchInvoices(limit),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create checkout session and redirect to Stripe
 */
export function useCheckout() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url;
    },
  });
}

/**
 * Open Stripe Customer Portal
 */
export function useCustomerPortal() {
  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: (data) => {
      // Redirect to Stripe Portal
      window.location.href = data.portal_url;
    },
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      // Invalidate subscription query to refetch
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format cents to display price
 */
export function formatPrice(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Get interval display text
 */
export function formatInterval(interval: 'month' | 'year'): string {
  return interval === 'month' ? '/mo' : '/yr';
}
