import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { useTransactionStore } from './transactionStore'
import { useGoalStore } from './goalStore'
import { useAchievementStore } from './achievementStore'
import { useCategoryStore } from './categoryStore'
import { useErrorHandler } from "@/composables/core/useErrorHandler";
import { eventBus } from '@/services/eventBus'

/**
 * Store principal simplifié pour l'initialisation de base
 * Logique métier déportée dans les composables
 */
export const useAppStore = defineStore('app', () => {
  const { handleApiError } = useErrorHandler()

  // ==========================================
  // STATE
  // ==========================================

  const initialized = ref(false)
  const initializing = ref(false)
  const error = ref<string | null>(null)

  // Configuration de base
  const config = ref({
    gamingEnabled: true,
    notificationsEnabled: true,
    autoSyncInterval: 5 * 60 * 1000 // 5 minutes
  })

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * État global de chargement
   */
  const isLoading = computed(() => {
    const authStore = useAuthStore()
    const transactionStore = useTransactionStore()

    return initializing.value || authStore.loading || transactionStore.isLoading
  })

  /**
   * Métrics utilisateur de base
   */
  const userMetrics = computed(() => {
    const authStore = useAuthStore()
    const transactionStore = useTransactionStore()
    const achievementStore = useAchievementStore()

    return {
      level: authStore.userLevel,
      totalXP: authStore.userXP,
      balance: transactionStore.balance,
      achievementsUnlocked: achievementStore.unlockedAchievements.length,
      transactionCount: transactionStore.transactions.length
    }
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Initialiser l'application
   */
  async function initializeApp(): Promise<boolean> {
    if (initialized.value) return true

    initializing.value = true
    error.value = null

    try {
      console.log('🚀 Initialisation app...')

      // 1. Auth obligatoire
      const authStore = useAuthStore()
      await authStore.initAuth()

      if (!authStore.isAuthenticated) {
        console.log('❌ User non authentifié')
        return false
      }

      // 2. Stores critiques en parallèle
      await Promise.allSettled([
        initializeCoreStores(),
        config.value.gamingEnabled ? initializeGamingStores() : Promise.resolve()
      ])

      // 3. Démarrer auto-sync si configuré
      if (config.value.autoSyncInterval > 0) {
        startAutoSync()
      }

      initialized.value = true
      console.log('✅ App initialisée')
      return true

    } catch (err: any) {
      await handleApiError(err, 'app_initialization')
      error.value = err.message
      return false
    } finally {
      initializing.value = false
    }
  }

  /**
   * Initialiser les stores principaux
   */
  async function initializeCoreStores(): Promise<void> {
    const categoryStore = useCategoryStore()
    const transactionStore = useTransactionStore()
    const goalStore = useGoalStore()

    await Promise.allSettled([
      categoryStore.fetchCategories(),
      transactionStore.fetchTransactions(),
      goalStore.fetchGoals()
    ])
  }

  /**
   * Initialiser le gaming
   */
  async function initializeGamingStores(): Promise<void> {
    const achievementStore = useAchievementStore()

    await Promise.allSettled([
      achievementStore.loadAchievementData()
    ])
  }

  /**
   * Démarrer la synchronisation automatique
   */
  function startAutoSync(): void {
    setInterval(async () => {
      try {
        const transactionStore = useTransactionStore()
        await transactionStore.refresh()
      } catch (err) {
        console.warn('Erreur auto-sync:', err)
      }
    }, config.value.autoSyncInterval)
  }

  /**
   * Action globale : Ajouter transaction avec effets de bord
   */
  async function addTransaction(transactionData: any): Promise<boolean> {
    const transactionStore = useTransactionStore()
    const success = await transactionStore.createTransaction(transactionData)

    if (success && config.value.gamingEnabled) {
      // Les événements déclencheront automatiquement les vérifications
      // via eventBus dans achievementStore
    }

    return success
  }

  /**
   * Configurer l'app
   */
  function updateConfig(newConfig: Partial<typeof config.value>): void {
    config.value = { ...config.value, ...newConfig }
    localStorage.setItem('app_config', JSON.stringify(config.value))
  }

  /**
   * Charger config depuis localStorage
   */
  function loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem('app_config')
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        config.value = { ...config.value, ...parsed }
      }
    } catch (err) {
      console.warn('Config non chargée:', err)
    }
  }

  /**
   * Reset d'urgence simplifié
   */
  async function emergencyReset(): Promise<void> {
    console.log('🚨 Reset urgence...')

    // Reset stores
    const stores = [
      useAuthStore(),
      useTransactionStore(),
      useGoalStore(),
      useAchievementStore(),
      useCategoryStore()
    ]

    stores.forEach(store => {
      if (store.$reset) store.$reset()
    })

    // Nettoyer localStorage sauf auth
    const keysToKeep = ['auth_token', 'user']
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })

    initialized.value = false
    error.value = null
  }

  /**
   * Diagnostiquer rapidement les problèmes
   */
  function diagnoseIssues(): string[] {
    const issues: string[] = []
    const authStore = useAuthStore()

    if (!navigator.onLine) issues.push('Pas de connexion')
    if (!authStore.isAuthenticated) issues.push('Non authentifié')
    if (error.value) issues.push('Erreur app')

    return issues
  }

  // Charger config au démarrage
  loadConfig()

  // Écouter les événements importants
  eventBus.on('auth:logout', () => {
    initialized.value = false
  })

  return {
    // State
    initialized,
    initializing,
    error,
    config,

    // Getters
    isLoading,
    userMetrics,

    // Actions principales
    initializeApp,
    addTransaction,
    updateConfig,
    loadConfig,
    emergencyReset,
    diagnoseIssues
  }
})
