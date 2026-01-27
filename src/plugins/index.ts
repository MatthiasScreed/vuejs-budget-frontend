import type { App } from 'vue'
import { useAppStore } from '@/stores'
import { PerformanceMonitor } from '@/middleware/performanceMonitor'

export function setupGlobalPlugins(app: App) {
  // Plugin de monitoring des performances
  if (import.meta.env.DEV) {
    app.config.globalProperties.$perf = PerformanceMonitor
  }

  // Plugin de gaming shortcuts
  app.config.globalProperties.$gaming = {
    async addXP(amount: number, source: string) {
      const appStore = useAppStore()
      return appStore.executeWithMiddleware(
        () => levelStore.addXP(amount, source),
        `Gaming XP: ${source}`
      )
    }
  }

  // Plugin de formatage global
  app.config.globalProperties.$format = {
    currency: (amount: number) => new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount),

    xp: (amount: number) => `${amount.toLocaleString('fr-FR')} XP`,

    percentage: (value: number) => `${Math.round(value)}%`
  }
}
