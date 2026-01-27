// src/composables/useFormatters.ts
import { inject } from 'vue'
import * as formatters from '@/utils/formatters'

/**
 * Composable pour utiliser les formatters
 * À utiliser dans le setup() des composants
 */
export function useFormatters() {
  // Essayer d'injecter depuis le provide
  const injectedFormatters = inject<typeof formatters>('formatters')

  // Fallback sur import direct
  return injectedFormatters || formatters
}

// Export individuel pour plus de flexibilité
export const {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeDate,
  formatPercent,
  formatDuration,
  truncate,
  capitalize,
  formatCompactCurrency,
  parseCurrency,
  formatFileSize
} = formatters
