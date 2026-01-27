// composables/core/useApiHealth.ts
import { ref, computed } from 'vue'
import { useApi } from './useApi'

interface HealthStatus {
  status: 'connected' | 'disconnected' | 'checking'
  lastCheck: number | null
  latency: number | null
  version: string | null
  environment: string | null
  error?: string | null
}

export function useApiHealth() {
  const { get } = useApi()

  const health = ref<HealthStatus>({
    status: 'checking',
    lastCheck: null,
    latency: null,
    version: null,
    environment: null,
    error: null
  })

  const checkInterval = ref<NodeJS.Timeout | null>(null)

  /**
   * ✅ VÉRIFIER LA SANTÉ - VERSION SIMPLE ET EFFICACE
   */
  async function checkHealth(): Promise<boolean> {
    const startTime = Date.now()
    health.value.status = 'checking'
    health.value.error = null

    try {
      const response = await get('/health', {
        skipAuth: true,
        timeout: 30000,
      })

      const latency = Date.now() - startTime

      // ✅ La réponse est déjà au bon format grâce au nouveau useApi
      if (response.success) {
        health.value = {
          status: 'connected',
          lastCheck: Date.now(),
          latency,
          version: response.version || '1.0.0',
          environment: response.environment || 'development',
          error: null
        }

        console.log('✅ API connectée', { latency: `${latency}ms` })
        return true
      }

      throw new Error(response.message || 'Health check failed')

    } catch (error: any) {
      health.value = {
        status: 'disconnected',
        lastCheck: Date.now(),
        latency: null,
        version: null,
        environment: null,
        error: error.message
      }

      console.warn('❌ API déconnectée:', error.message)
      return false
    }
  }

  /**
   * Démarrer la surveillance
   */
  function startHealthMonitoring(intervalMs: number = 30000): void {
    console.log('🚀 Démarrage surveillance API...')

    checkHealth()

    if (checkInterval.value) {
      clearInterval(checkInterval.value)
    }

    checkInterval.value = setInterval(() => checkHealth(), intervalMs)
  }

  /**
   * Arrêter la surveillance
   */
  function stopHealthMonitoring(): void {
    if (checkInterval.value) {
      clearInterval(checkInterval.value)
      checkInterval.value = null
    }
  }

  // Computed
  const isConnected = computed(() => health.value.status === 'connected')
  const isDisconnected = computed(() => health.value.status === 'disconnected')
  const isChecking = computed(() => health.value.status === 'checking')

  const healthColor = computed(() => {
    switch (health.value.status) {
      case 'connected': return 'green'
      case 'disconnected': return 'red'
      case 'checking': return 'yellow'
      default: return 'gray'
    }
  })

  const statusText = computed(() => {
    switch (health.value.status) {
      case 'connected':
        return health.value.latency
          ? `API connectée (${health.value.latency}ms)`
          : 'API connectée'
      case 'disconnected':
        return 'API déconnectée'
      case 'checking':
        return 'Vérification...'
      default:
        return 'État inconnu'
    }
  })

  return {
    health,
    isConnected,
    isDisconnected,
    isChecking,
    healthColor,
    statusText,
    checkHealth,
    startHealthMonitoring,
    stopHealthMonitoring,
    cleanup: stopHealthMonitoring
  }
}

// Composable d'initialisation des stores
export function useStoreInitializer() {
  const initializationStatus = ref<Record<string, boolean>>({})
  const initializationErrors = ref<Record<string, string>>({})

  async function safeInitializeStore(
    storeName: string,
    initFunction: () => Promise<void>
  ): Promise<boolean> {
    try {
      console.log(`🚀 Initializing store: ${storeName}`)
      await initFunction()
      initializationStatus.value[storeName] = true
      console.log(`✅ Store ${storeName} initialized`)
      return true
    } catch (error: any) {
      console.error(`❌ Store ${storeName} failed:`, error)
      initializationErrors.value[storeName] = error.message
      return false
    }
  }

  async function initializeGamingStores(): Promise<void> {
    try {
      const [{ useAchievementStore }, { useLevelStore }] = await Promise.all([
        import('@/stores/achievementStore').catch(() => ({ useAchievementStore: null })),
        import('@/stores/levelStore').catch(() => ({ useLevelStore: null }))
      ])

      if (useAchievementStore) {
        const store = useAchievementStore()
        await safeInitializeStore('achievement', async () => {
          if (store.fetchAchievements) await store.fetchAchievements()
          if (store.fetchUserAchievements) await store.fetchUserAchievements()
        })
      }

      if (useLevelStore) {
        const store = useLevelStore()
        await safeInitializeStore('level', async () => {
          if (store.fetchUserLevel) await store.fetchUserLevel()
        })
      }

      console.log('🎮 Gaming stores initialized')
    } catch (error) {
      console.error('❌ Gaming stores init failed:', error)
    }
  }

  return {
    initializationStatus,
    initializationErrors,
    safeInitializeStore,
    initializeGamingStores
  }
}
