/**
 * Feature Flags
 * Control which features are enabled in the app
 */

export const FEATURES = {
  /**
   * Stripe billing integration
   * Set to true when Stripe is configured and ready
   */
  BILLING_ENABLED: import.meta.env.VITE_BILLING_ENABLED === 'true',

  /**
   * Sentry error tracking
   * Set to true when Sentry DSN is configured
   */
  SENTRY_ENABLED: Boolean(import.meta.env.VITE_SENTRY_DSN),
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}
