// src/composables/useLandingAnalytics.ts

import { onMounted } from 'vue'

/**
 * Track landing page events
 * École 42: Analytics séparés
 */
export function useLandingAnalytics() {
  const trackCalculatorUsage = (income: number, expenses: number): void => {
    // Track via analytics service
    console.log('Calculator used', { income, expenses })
  }

  const trackCTAClick = (location: string): void => {
    console.log('CTA clicked', { location })
  }

  const trackPageView = (): void => {
    console.log('Landing page viewed')
  }

  onMounted(() => {
    trackPageView()
  })

  return {
    trackCalculatorUsage,
    trackCTAClick,
    trackPageView,
  }
}
