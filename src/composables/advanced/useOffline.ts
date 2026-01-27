import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@/composables/core'
import { useNotifications } from '@/composables/ui'

interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'transaction' | 'goal' | 'category'
  data: any
  timestamp: number
  retries: number
  status: 'pending' | 'syncing' | 'synced' | 'failed'
}

interface SyncStatus {
  isOnline: boolean
  lastSyncTime: number
  pendingActions: number
  failedActions: number
  isSyncing: boolean
}

interface OfflineData {
  transactions: any[]
  goals: any[]
  categories: any[]
  achievements: any[]
  user_profile: any
}

/**
 * Composable pour mode hors ligne avec synchronisation
 * Cache données, queue actions, sync intelligente
 */
export function useOffline() {
  const notifications = useNotifications()

  // Storage offline
  const [offlineData, setOfflineData] = useLocalStorage<OfflineData>('offline_data', {
    transactions: [],
    goals: [],
    categories: [],
    achievements: [],
    user_profile: null
  })

  const [actionQueue, setActionQueue] = useLocalStorage<OfflineAction[]>('offline_actions', [])

  // State
  const isOnline = ref(navigator.onLine)
  const isSyncing = ref(false)
  const lastSyncTime = ref(Date.now())
  const syncErrors = ref<string[]>([])

  /**
   * Initialiser mode offline
   */
  function initOffline(): void {
    setupOnlineListeners()
    loadOfflineData()

    if (isOnline.value) {
      scheduleSync()
    }

    log('Mode offline initialisé')
  }

  /**
   * Setup listeners online/offline
   */
  function setupOnlineListeners(): void {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Visibility change pour sync quand app redevient visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isOnline.value) {
        scheduleSync()
      }
    })
  }

  /**
   * Gérer passage en ligne
   */
  function handleOnline(): void {
    isOnline.value = true

    notifications.success('🌐 Connexion rétablie !', {
      title: '📶 Mode En Ligne',
      duration: 3000
    })

    // Démarrer sync immédiatement
    syncPendingActions()

    log('Mode en ligne')
  }

  /**
   * Gérer passage hors ligne
   */
  function handleOffline(): void {
    isOnline.value = false

    notifications.warning('📡 Mode hors ligne activé', {
      title: '📴 Hors Ligne',
      duration: 5000,
      actions: [
        { label: 'Voir données locales', action: 'view_offline', url: '/offline' }
      ]
    })

    log('Mode hors ligne')
  }

  /**
   * Charger données offline depuis cache
   */
  function loadOfflineData(): void {
    // Charger depuis IndexedDB si disponible, sinon localStorage
    if ('indexedDB' in window) {
      loadFromIndexedDB()
    }

    log('Données offline chargées')
  }

  /**
   * Charger depuis IndexedDB
   */
  async function loadFromIndexedDB(): Promise<void> {
    try {
      // Simplified IndexedDB access
      // En production, utiliser une librairie comme Dexie.js
      log('IndexedDB utilisé pour données offline')
    } catch (error) {
      log('Erreur IndexedDB, fallback localStorage:', error)
    }
  }

  /**
   * Ajouter action à la queue offline
   */
  function queueAction(
    type: OfflineAction['type'],
    entity: OfflineAction['entity'],
    data: any
  ): string {
    const action: OfflineAction = {
      id: generateActionId(),
      type,
      entity,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    }

    const currentQueue = actionQueue.value || []
    setActionQueue([...currentQueue, action])

    log(`Action ajoutée à la queue: ${type} ${entity}`)

    // Sync immédiatement si en ligne
    if (isOnline.value) {
      scheduleSync()
    }

    return action.id
  }

  /**
   * Synchroniser actions en attente
   */
  async function syncPendingActions(): Promise<void> {
    if (isSyncing.value || !isOnline.value) {
      return
    }

    const pendingActions = actionQueue.value?.filter(a => a.status === 'pending') || []

    if (pendingActions.length === 0) {
      return
    }

    isSyncing.value = true
    syncErrors.value = []

    log(`Synchronisation ${pendingActions.length} actions...`)

    for (const action of pendingActions) {
      try {
        await syncSingleAction(action)
      } catch (error: any) {
        handleSyncError(action, error)
      }
    }

    // Nettoyer actions synchronisées
    cleanupSyncedActions()

    lastSyncTime.value = Date.now()
    isSyncing.value = false

    // Notification résultat sync
    const failed = actionQueue.value?.filter(a => a.status === 'failed').length || 0
    const synced = pendingActions.length - failed

    if (synced > 0) {
      notifications.success(`✅ ${synced} actions synchronisées`, {
        title: '🔄 Synchronisation',
        duration: 3000
      })
    }

    if (failed > 0) {
      notifications.warning(`⚠️ ${failed} actions échouées`, {
        title: '🔄 Sync Partielle',
        duration: 5000
      })
    }

    log('Synchronisation terminée')
  }

  /**
   * Synchroniser une action unique
   */
  async function syncSingleAction(action: OfflineAction): Promise<void> {
    action.status = 'syncing'

    const endpoint = getActionEndpoint(action)
    const method = getActionMethod(action)

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: method !== 'DELETE' ? JSON.stringify(action.data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    action.status = 'synced'
    log(`Action synchronisée: ${action.type} ${action.entity}`)
  }

  /**
   * Gérer erreur de sync
   */
  function handleSyncError(action: OfflineAction, error: any): void {
    action.retries++
    action.status = action.retries >= 3 ? 'failed' : 'pending'

    syncErrors.value.push(`${action.entity}: ${error.message}`)

    log(`Erreur sync action ${action.id}:`, error)
  }

  /**
   * Nettoyer actions synchronisées
   */
  function cleanupSyncedActions(): void {
    const cleanQueue = actionQueue.value?.filter(a => a.status !== 'synced') || []
    setActionQueue(cleanQueue)
  }

  /**
   * Programmer sync différée
   */
  function scheduleSync(delay: number = 1000): void {
    setTimeout(() => {
      if (isOnline.value) {
        syncPendingActions()
      }
    }, delay)
  }

  /**
   * Forcer synchronisation manuelle
   */
  async function forceSyncNow(): Promise<void> {
    if (!isOnline.value) {
      notifications.error('Impossible de synchroniser hors ligne')
      return
    }

    await syncPendingActions()
  }

  /**
   * Obtenir endpoint pour action
   */
  function getActionEndpoint(action: OfflineAction): string {
    const base = '/api'

    switch (action.entity) {
      case 'transaction':
        return action.type === 'create'
          ? `${base}/transactions`
          : `${base}/transactions/${action.data.id}`
      case 'goal':
        return action.type === 'create'
          ? `${base}/goals`
          : `${base}/goals/${action.data.id}`
      case 'category':
        return action.type === 'create'
          ? `${base}/categories`
          : `${base}/categories/${action.data.id}`
      default:
        throw new Error(`Entity inconnue: ${action.entity}`)
    }
  }

  /**
   * Obtenir méthode HTTP pour action
   */
  function getActionMethod(action: OfflineAction): string {
    switch (action.type) {
      case 'create': return 'POST'
      case 'update': return 'PUT'
      case 'delete': return 'DELETE'
      default: throw new Error(`Type inconnu: ${action.type}`)
    }
  }

  /**
   * Obtenir token d'authentification
   */
  function getAuthToken(): string {
    return localStorage.getItem('auth_token') || ''
  }

  /**
   * Générer ID unique pour action
   */
  function generateActionId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Sauvegarder données pour usage offline
   */
  function cacheDataForOffline(entity: string, data: any[]): void {
    const current = offlineData.value
    setOfflineData({
      ...current,
      [entity]: data
    })

    log(`Données ${entity} mises en cache offline`)
  }

  /**
   * Obtenir données offline
   */
  function getOfflineData(entity: string): any[] {
    return offlineData.value[entity as keyof OfflineData] || []
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[Offline]', ...args)
  }

  // Computed properties
  const syncStatus = computed<SyncStatus>(() => ({
    isOnline: isOnline.value,
    lastSyncTime: lastSyncTime.value,
    pendingActions: actionQueue.value?.filter(a => a.status === 'pending').length || 0,
    failedActions: actionQueue.value?.filter(a => a.status === 'failed').length || 0,
    isSyncing: isSyncing.value
  }))

  const hasOfflineData = computed(() => {
    const data = offlineData.value
    return Object.values(data).some(arr => Array.isArray(arr) && arr.length > 0)
  })

  const canWorkOffline = computed(() => hasOfflineData.value || isOnline.value)

  // Watcher pour persistence
  watch(() => actionQueue.value, (newQueue) => {
    if (newQueue && newQueue.length > 0 && isOnline.value) {
      scheduleSync(2000) // Sync dans 2 secondes
    }
  }, { deep: true })

  return {
    // State
    isOnline,
    isSyncing,
    lastSyncTime,
    syncErrors,

    // Computed
    syncStatus,
    hasOfflineData,
    canWorkOffline,

    // Methods
    initOffline,
    queueAction,
    syncPendingActions,
    forceSyncNow,
    cacheDataForOffline,
    getOfflineData
  }
}
