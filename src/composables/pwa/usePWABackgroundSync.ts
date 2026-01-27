import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/ui'

interface SyncTask {
  id: string
  type: 'transaction' | 'goal' | 'category' | 'gaming_action' | 'user_profile'
  action: 'create' | 'update' | 'delete'
  data: any
  endpoint: string
  method: 'POST' | 'PUT' | 'DELETE'
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  retries: number
  max_retries: number
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'cancelled'
  error?: string
}

interface SyncStats {
  pending_tasks: number
  completed_tasks: number
  failed_tasks: number
  total_synced: number
  last_sync: number
  sync_success_rate: number
  average_sync_time: number
}

interface BackgroundSyncConfig {
  enabled: boolean
  max_queue_size: number
  retry_delays: number[] // Délais en millisecondes
  batch_size: number
  sync_on_network: boolean
  sync_on_visibility: boolean
  periodic_sync_interval: number
}

/**
 * Composable pour synchronisation en arrière-plan PWA
 * Queue de tâches, retry intelligent, sync périodique
 */
export function usePWABackgroundSync() {
  const notifications = useNotifications()

  // State
  const isSupported = ref(false)
  const isOnline = ref(navigator.onLine)
  const isSyncing = ref(false)
  const syncQueue = ref<SyncTask[]>([])
  const syncHistory = ref<SyncTask[]>([])

  const config = ref<BackgroundSyncConfig>({
    enabled: true,
    max_queue_size: 100,
    retry_delays: [1000, 5000, 15000, 60000, 300000], // 1s, 5s, 15s, 1m, 5m
    batch_size: 10,
    sync_on_network: true,
    sync_on_visibility: true,
    periodic_sync_interval: 5 * 60 * 1000 // 5 minutes
  })

  const stats = ref<SyncStats>({
    pending_tasks: 0,
    completed_tasks: 0,
    failed_tasks: 0,
    total_synced: 0,
    last_sync: 0,
    sync_success_rate: 100,
    average_sync_time: 0
  })

  /**
   * Initialiser la synchronisation en arrière-plan
   */
  async function initBackgroundSync(): Promise<void> {
    checkBackgroundSyncSupport()
    await loadSyncQueue()
    await loadSyncConfig()
    setupNetworkListeners()
    setupVisibilityListeners()
    setupPeriodicSync()
    updateSyncStats()

    log('Background Sync initialisé')
  }

  /**
   * Vérifier le support du Background Sync
   */
  function checkBackgroundSyncSupport(): boolean {
    const supported = 'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype

    isSupported.value = supported

    if (!supported) {
      log('Background Sync non supporté, fallback vers sync manuel')
    }

    return supported
  }

  /**
   * Ajouter une tâche à la queue de synchronisation
   */
  async function queueSyncTask(
    type: SyncTask['type'],
    action: SyncTask['action'],
    data: any,
    priority: SyncTask['priority'] = 'medium'
  ): Promise<string> {
    const taskId = generateTaskId()

    const task: SyncTask = {
      id: taskId,
      type,
      action,
      data,
      endpoint: buildEndpoint(type, action, data),
      method: getHttpMethod(action),
      priority,
      timestamp: Date.now(),
      retries: 0,
      max_retries: config.value.retry_delays.length,
      status: 'pending'
    }

    // Vérifier la taille de la queue
    if (syncQueue.value.length >= config.value.max_queue_size) {
      // Supprimer les tâches les plus anciennes de priorité basse
      removeOldLowPriorityTasks()
    }

    syncQueue.value.push(task)
    await saveSyncQueue()
    updateSyncStats()

    log(`Tâche ajoutée à la queue: ${type}/${action} (${taskId})`)

    // Déclencher une tentative de sync immédiate
    if (isOnline.value && config.value.enabled) {
      scheduleSync()
    }

    // Enregistrer pour background sync si supporté
    if (isSupported.value) {
      await registerBackgroundSync(taskId)
    }

    return taskId
  }

  /**
   * Synchroniser les tâches en attente
   */
  async function syncPendingTasks(): Promise<void> {
    if (isSyncing.value || !config.value.enabled || !isOnline.value) {
      return
    }

    const pendingTasks = syncQueue.value
      .filter(task => task.status === 'pending')
      .sort(compareTasks)
      .slice(0, config.value.batch_size)

    if (pendingTasks.length === 0) {
      return
    }

    isSyncing.value = true
    const syncStartTime = Date.now()

    log(`🔄 Synchronisation de ${pendingTasks.length} tâches...`)

    let syncedCount = 0
    let failedCount = 0

    for (const task of pendingTasks) {
      try {
        task.status = 'syncing'
        await saveSyncQueue()

        const success = await processSyncTask(task)

        if (success) {
          task.status = 'completed'
          syncedCount++

          // Déplacer vers l'historique
          syncHistory.value.unshift(task)
          syncQueue.value = syncQueue.value.filter(t => t.id !== task.id)
        } else {
          await handleSyncFailure(task)
          failedCount++
        }

      } catch (error: any) {
        task.error = error.message
        await handleSyncFailure(task)
        failedCount++
      }
    }

    // Limiter l'historique
    if (syncHistory.value.length > 200) {
      syncHistory.value = syncHistory.value.slice(0, 200)
    }

    const syncDuration = Date.now() - syncStartTime

    // Mettre à jour les statistiques
    stats.value.completed_tasks += syncedCount
    stats.value.failed_tasks += failedCount
    stats.value.total_synced += syncedCount
    stats.value.last_sync = Date.now()
    stats.value.average_sync_time = (stats.value.average_sync_time + syncDuration) / 2

    await saveSyncQueue()
    updateSyncStats()

    isSyncing.value = false

    // Notification résultat
    if (syncedCount > 0) {
      notifications.success(`✅ ${syncedCount} données synchronisées`, {
        title: '🔄 Sync réussie',
        duration: 3000
      })
    }

    if (failedCount > 0) {
      notifications.warning(`⚠️ ${failedCount} synchronisations échouées`, {
        title: '🔄 Sync partielle',
        duration: 5000
      })
    }

    log(`Synchronisation terminée: ${syncedCount} réussies, ${failedCount} échouées`)
  }

  /**
   * Traiter une tâche de synchronisation unique
   */
  async function processSyncTask(task: SyncTask): Promise<boolean> {
    try {
      const response = await fetch(task.endpoint, {
        method: task.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: task.method !== 'DELETE' ? JSON.stringify(task.data) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      log(`✅ Tâche synchronisée: ${task.id}`)
      return true

    } catch (error: any) {
      log(`❌ Erreur sync tâche ${task.id}:`, error)
      task.error = error.message
      return false
    }
  }

  /**
   * Gérer l'échec de synchronisation d'une tâche
   */
  async function handleSyncFailure(task: SyncTask): Promise<void> {
    task.retries++

    if (task.retries < task.max_retries) {
      // Programmer un retry avec délai exponentiel
      const delay = config.value.retry_delays[task.retries - 1] || 300000

      setTimeout(() => {
        task.status = 'pending'
        saveSyncQueue()
      }, delay)

      task.status = 'pending'
      log(`📅 Retry programmé pour tâche ${task.id} dans ${delay}ms`)
    } else {
      // Échec définitif
      task.status = 'failed'
      log(`💀 Tâche ${task.id} échouée définitivement`)

      // Notification pour tâches critiques
      if (task.priority === 'critical') {
        notifications.error(`Échec synchronisation critique: ${task.type}`, {
          title: '❌ Sync échouée',
          duration: 0, // Persistent
          actions: [
            { label: 'Réessayer', action: 'retry_critical', url: '#' }
          ]
        })
      }
    }
  }

  /**
   * Enregistrer une tâche pour background sync
   */
  async function registerBackgroundSync(taskId: string): Promise<void> {
    if (!isSupported.value) return

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(`sync-task-${taskId}`)

      log(`Background sync enregistré: ${taskId}`)

    } catch (error: any) {
      log('Erreur enregistrement background sync:', error)
    }
  }

  /**
   * Supprimer les anciennes tâches de basse priorité
   */
  function removeOldLowPriorityTasks(): void {
    const lowPriorityTasks = syncQueue.value
      .filter(task => task.priority === 'low')
      .sort((a, b) => a.timestamp - b.timestamp)

    const toRemove = Math.min(10, lowPriorityTasks.length)

    for (let i = 0; i < toRemove; i++) {
      const index = syncQueue.value.indexOf(lowPriorityTasks[i])
      if (index > -1) {
        syncQueue.value.splice(index, 1)
      }
    }

    if (toRemove > 0) {
      log(`${toRemove} tâches de basse priorité supprimées`)
    }
  }

  /**
   * Comparer les tâches pour priorisation
   */
  function compareTasks(a: SyncTask, b: SyncTask): number {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

    // D'abord par priorité
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Ensuite par timestamp (plus ancien en premier)
    return a.timestamp - b.timestamp
  }

  /**
   * Construire l'endpoint API pour une tâche
   */
  function buildEndpoint(type: SyncTask['type'], action: SyncTask['action'], data: any): string {
    const baseUrl = '/api'

    switch (type) {
      case 'transaction':
        return action === 'create'
          ? `${baseUrl}/transactions`
          : `${baseUrl}/transactions/${data.id}`

      case 'goal':
        return action === 'create'
          ? `${baseUrl}/goals`
          : `${baseUrl}/goals/${data.id}`

      case 'category':
        return action === 'create'
          ? `${baseUrl}/categories`
          : `${baseUrl}/categories/${data.id}`

      case 'gaming_action':
        return `${baseUrl}/gaming/actions/${action}`

      case 'user_profile':
        return `${baseUrl}/user/profile`

      default:
        throw new Error(`Type de tâche non supporté: ${type}`)
    }
  }

  /**
   * Obtenir la méthode HTTP pour une action
   */
  function getHttpMethod(action: SyncTask['action']): SyncTask['method'] {
    switch (action) {
      case 'create': return 'POST'
      case 'update': return 'PUT'
      case 'delete': return 'DELETE'
      default: throw new Error(`Action non supportée: ${action}`)
    }
  }

  /**
   * Setup des listeners réseau
   */
  function setupNetworkListeners(): void {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  /**
   * Gérer le retour en ligne
   */
  function handleOnline(): void {
    isOnline.value = true
    log('🌐 Connexion rétablie')

    if (config.value.sync_on_network && syncQueue.value.length > 0) {
      scheduleSync(1000) // Sync dans 1 seconde
    }
  }

  /**
   * Gérer la perte de connexion
   */
  function handleOffline(): void {
    isOnline.value = false
    log('📴 Connexion perdue')
  }

  /**
   * Setup des listeners de visibilité
   */
  function setupVisibilityListeners(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && config.value.sync_on_visibility && isOnline.value) {
        scheduleSync(2000) // Sync dans 2 secondes
      }
    })
  }

  /**
   * Setup de la synchronisation périodique
   */
  function setupPeriodicSync(): void {
    setInterval(() => {
      if (config.value.enabled && isOnline.value && syncQueue.value.length > 0) {
        syncPendingTasks()
      }
    }, config.value.periodic_sync_interval)
  }

  /**
   * Programmer une synchronisation avec délai
   */
  function scheduleSync(delay: number = 0): void {
    setTimeout(() => {
      if (isOnline.value && !isSyncing.value) {
        syncPendingTasks()
      }
    }, delay)
  }

  /**
   * Forcer la synchronisation maintenant
   */
  async function forceSyncNow(): Promise<void> {
    if (!isOnline.value) {
      notifications.error('Impossible de synchroniser hors ligne')
      return
    }

    await syncPendingTasks()
  }

  /**
   * Annuler une tâche de synchronisation
   */
  function cancelSyncTask(taskId: string): boolean {
    const taskIndex = syncQueue.value.findIndex(task => task.id === taskId)

    if (taskIndex === -1) return false

    const task = syncQueue.value[taskIndex]

    if (task.status === 'syncing') {
      log('Impossible d\'annuler une tâche en cours de sync')
      return false
    }

    task.status = 'cancelled'
    syncQueue.value.splice(taskIndex, 1)
    saveSyncQueue()
    updateSyncStats()

    log(`Tâche ${taskId} annulée`)
    return true
  }

  /**
   * Vider la queue de synchronisation
   */
  async function clearSyncQueue(): Promise<void> {
    syncQueue.value = []
    await saveSyncQueue()
    updateSyncStats()

    notifications.info('🗑️ Queue de synchronisation vidée', {
      title: 'Queue nettoyée',
      duration: 3000
    })

    log('Queue de synchronisation vidée')
  }

  /**
   * Mettre à jour les statistiques
   */
  function updateSyncStats(): void {
    stats.value.pending_tasks = syncQueue.value.filter(t => t.status === 'pending').length

    if (stats.value.total_synced > 0) {
      stats.value.sync_success_rate =
        (stats.value.completed_tasks / (stats.value.completed_tasks + stats.value.failed_tasks)) * 100
    }
  }

  /**
   * Sauvegarder la queue de synchronisation
   */
  async function saveSyncQueue(): Promise<void> {
    localStorage.setItem('pwa_sync_queue', JSON.stringify(syncQueue.value))
    localStorage.setItem('pwa_sync_stats', JSON.stringify(stats.value))
  }

  /**
   * Charger la queue de synchronisation
   */
  async function loadSyncQueue(): Promise<void> {
    const savedQueue = localStorage.getItem('pwa_sync_queue')
    const savedStats = localStorage.getItem('pwa_sync_stats')

    if (savedQueue) {
      try {
        syncQueue.value = JSON.parse(savedQueue)
      } catch (error) {
        log('Erreur chargement queue sync')
      }
    }

    if (savedStats) {
      try {
        stats.value = { ...stats.value, ...JSON.parse(savedStats) }
      } catch (error) {
        log('Erreur chargement stats sync')
      }
    }
  }

  /**
   * Charger la configuration
   */
  async function loadSyncConfig(): Promise<void> {
    const saved = localStorage.getItem('pwa_sync_config')

    if (saved) {
      try {
        config.value = { ...config.value, ...JSON.parse(saved) }
      } catch (error) {
        log('Erreur chargement config sync')
      }
    }
  }

  /**
   * Sauvegarder la configuration
   */
  async function saveSyncConfig(): Promise<void> {
    localStorage.setItem('pwa_sync_config', JSON.stringify(config.value))
  }

  /**
   * Mettre à jour la configuration
   */
  async function updateConfig(newConfig: Partial<BackgroundSyncConfig>): Promise<void> {
    config.value = { ...config.value, ...newConfig }
    await saveSyncConfig()
    log('Configuration sync mise à jour')
  }

  /**
   * Générer un ID unique pour les tâches
   */
  function generateTaskId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtenir le token d'authentification
   */
  function getAuthToken(): string {
    return localStorage.getItem('auth_token') || ''
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[BackgroundSync]', ...args)
  }

  // Computed properties
  const backgroundSyncSupported = computed(() => isSupported.value)

  const hasPendingTasks = computed(() =>
    syncQueue.value.some(task => task.status === 'pending')
  )

  const criticalTasksPending = computed(() =>
    syncQueue.value.filter(task => task.status === 'pending' && task.priority === 'critical').length
  )

  const syncHealthy = computed(() =>
    stats.value.sync_success_rate > 80 && criticalTasksPending.value === 0
  )

  // Auto-init
  onMounted(() => {
    initBackgroundSync()
  })

  return {
    // State
    isSupported,
    isOnline,
    isSyncing,
    syncQueue,
    syncHistory,
    config,
    stats,

    // Computed
    backgroundSyncSupported,
    hasPendingTasks,
    criticalTasksPending,
    syncHealthy,

    // Methods
    initBackgroundSync,
    queueSyncTask,
    syncPendingTasks,
    forceSyncNow,
    cancelSyncTask,
    clearSyncQueue,
    updateConfig
  }
}
