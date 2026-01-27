// src/stores/systemStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface SystemConfig {
  app_name: string
  version: string
  maintenance_mode: boolean
  features: {
    gaming_enabled: boolean
    ai_suggestions: boolean
    real_time_notifications: boolean
    offline_mode: boolean
  }
  theme: 'light' | 'dark' | 'auto'
  currency: string
  timezone: string
}

interface SystemStats {
  total_users: number
  total_transactions: number
  uptime: number
  last_backup: string
}

export const useSystemStore = defineStore('system', () => {
  // State
  const config = ref<SystemConfig>({
    app_name: 'Budget Gaming',
    version: '1.0.0',
    maintenance_mode: false,
    features: {
      gaming_enabled: true,
      ai_suggestions: true,
      real_time_notifications: true,
      offline_mode: true
    },
    theme: 'dark',
    currency: 'EUR',
    timezone: 'Europe/Paris'
  })

  const stats = ref<SystemStats>({
    total_users: 0,
    total_transactions: 0,
    uptime: 0,
    last_backup: ''
  })

  const isOnline = ref(navigator.onLine)
  const loading = ref(false)
  const initialized = ref(false)

  // Getters
  const isDarkMode = computed(() => {
    if (config.value.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return config.value.theme === 'dark'
  })

  const isMaintenanceMode = computed(() => config.value.maintenance_mode)
  const featuresEnabled = computed(() => config.value.features)

  // Actions
  async function initSystem(): Promise<void> {
    if (initialized.value) return

    loading.value = true

    try {
      // Charger la configuration système
      await loadSystemConfig()

      // Écouter les changements de connectivité
      window.addEventListener('online', () => isOnline.value = true)
      window.addEventListener('offline', () => isOnline.value = false)

      // Écouter les changements de thème système
      if (config.value.theme === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', updateTheme)
      }

      initialized.value = true
    } catch (error) {
      console.error('Erreur initialisation système:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadSystemConfig(): Promise<void> {
    try {
      // Simuler un appel API - à remplacer par un vrai appel
      await new Promise(resolve => setTimeout(resolve, 100))

      // Charger depuis localStorage si disponible
      const savedConfig = localStorage.getItem('system_config')
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        config.value = { ...config.value, ...parsed }
      }
    } catch (error) {
      console.error('Erreur chargement config système:', error)
    }
  }

  function updateTheme(theme?: 'light' | 'dark' | 'auto'): void {
    if (theme) {
      config.value.theme = theme
    }

    // Appliquer le thème au DOM
    const isDark = isDarkMode.value
    document.documentElement.classList.toggle('dark', isDark)

    // Sauvegarder en localStorage
    localStorage.setItem('system_config', JSON.stringify(config.value))
  }

  function toggleTheme(): void {
    const newTheme = config.value.theme === 'dark' ? 'light' : 'dark'
    updateTheme(newTheme)
  }

  function updateFeature(feature: keyof SystemConfig['features'], enabled: boolean): void {
    config.value.features[feature] = enabled
    localStorage.setItem('system_config', JSON.stringify(config.value))
  }

  function setMaintenanceMode(enabled: boolean): void {
    config.value.maintenance_mode = enabled
  }

  // Utilitaires
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: config.value.currency
    }).format(amount)
  }

  function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: config.value.timezone
    }).format(dateObj)
  }

  return {
    // State
    config,
    stats,
    isOnline,
    loading,
    initialized,

    // Getters
    isDarkMode,
    isMaintenanceMode,
    featuresEnabled,

    // Actions
    initSystem,
    loadSystemConfig,
    updateTheme,
    toggleTheme,
    updateFeature,
    setMaintenanceMode,

    // Utilitaires
    formatCurrency,
    formatDate
  }
})
