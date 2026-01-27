// src/plugins/formatters.ts
import type { App } from 'vue'
import * as formatters from '@/utils/formatters'

/**
 * Plugin Vue pour les formatters
 * Rend les fonctions de formatage disponibles dans tous les composants
 */
export default {
  install(app: App) {
    // Ajouter les formatters comme propriétés globales
    app.config.globalProperties.$formatCurrency = formatters.formatCurrency
    app.config.globalProperties.$formatNumber = formatters.formatNumber
    app.config.globalProperties.$formatDate = formatters.formatDate
    app.config.globalProperties.$formatRelativeDate = formatters.formatRelativeDate
    app.config.globalProperties.$formatPercent = formatters.formatPercent
    app.config.globalProperties.$formatDuration = formatters.formatDuration
    app.config.globalProperties.$truncate = formatters.truncate
    app.config.globalProperties.$capitalize = formatters.capitalize
    app.config.globalProperties.$formatCompactCurrency = formatters.formatCompactCurrency
    app.config.globalProperties.$parseCurrency = formatters.parseCurrency
    app.config.globalProperties.$formatFileSize = formatters.formatFileSize

    // Provide pour Composition API
    app.provide('formatters', formatters)
  }
}

// Déclarations TypeScript pour l'autocomplétion
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $formatCurrency: typeof formatters.formatCurrency
    $formatNumber: typeof formatters.formatNumber
    $formatDate: typeof formatters.formatDate
    $formatRelativeDate: typeof formatters.formatRelativeDate
    $formatPercent: typeof formatters.formatPercent
    $formatDuration: typeof formatters.formatDuration
    $truncate: typeof formatters.truncate
    $capitalize: typeof formatters.capitalize
    $formatCompactCurrency: typeof formatters.formatCompactCurrency
    $parseCurrency: typeof formatters.parseCurrency
    $formatFileSize: typeof formatters.formatFileSize
  }
}
