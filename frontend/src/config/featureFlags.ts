/**
 * Feature Flags Configuration
 * 
 * Control which features are enabled/disabled in the app.
 * Set via environment variables or hardcoded defaults.
 */

export const featureFlags = {
  /**
   * Billing Module - Stripe integration for subscriptions
   * Set to true when Stripe API keys are configured
   */
  BILLING_ENABLED: import.meta.env.VITE_FEATURE_BILLING_ENABLED === 'true',

  /**
   * Creative Studio - AI image generation
   */
  CREATIVE_ENABLED: true,

  /**
   * Menu Comparison - Competitor analysis
   */
  MENU_COMPARISON_ENABLED: true,

  /**
   * Scheduling Module
   */
  SCHEDULING_ENABLED: true,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}
