import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '@/composables/core'
import { useNotifications } from '@/composables/ui'
import { usePWAInstall } from './usePWAInstall.ts'
import { usePWANotifications } from './usePWANotifications.ts'
import { usePWACache } from './usePWACache.ts'
import { usePWABackgroundSync } from './usePWABackgroundSync.ts'
import { usePWADevice } from './usePWADevice.ts'
import { usePWALifecycle } from './usePWALifecycle.ts'

interface PWAStatus {
  installation: 'not_supported' | 'installable' | 'installed' | 'standalone'
  notifications: 'unsupported' | 'default' | 'denied' | 'granted'
  cache: 'unsupported' | 'initializing' | 'ready' | 'error'
  background_sync: 'unsupported' | 'idle' | 'syncing' | 'error'
  device_features: 'limited' | 'basic' | 'advanced' | 'full'
  lifecycle: 'initializing' | 'ready' | 'active' | 'background' | 'terminated'
  overall: 'initializing' | 'ready' | 'optimal' | 'degraded' | 'critical'
}

interface PWAMetrics {
  installation_rate: number
  notification_engagement: number
  cache_hit_rate: number
  sync_success_rate: number
  device_capability_usage: number
  session_quality: number
  overall_health: number
}

interface PWAInitConfig {
  auto_install_prompt: boolean
  auto_notifications: boolean
  aggressive_caching: boolean
  background_sync: boolean
  device_features: boolean
  analytics_tracking: boolean
  debug_mode: boolean
}

/**
 * Composable orchestrateur PWA master
 * Coordination de tous les composables PWA, santé globale, métriques
 */
export function usePWAOrchestrator() {
  const { isAuthenticated, user } = useAuth()
  const notifications = useNotifications()

  // Instances des composables PWA
  const pwaInstall = usePWAInstall()
  const pwaNotifications = usePWANotifications()
  const pwaCache = usePWACache()
  const pwaBackgroundSync = usePWABackgroundSync()
  const pwaDevice = usePWADevice()
  const pwaLifecycle = usePWALifecycle()

  // State global
  const isInitialized = ref(false)
  const isInitializing = ref(false)
  const initProgress = ref(0)
  const initErrors = ref<string[]>([])

  const config = ref<PWAInitConfig>({
    auto_install_prompt: true,
    auto_notifications: false,
    aggressive_caching: true,
    background_sync: true,
    device_features: true,
    analytics_tracking: true,
    debug_mode: import.meta.env.DEV
  })

  // Timers
  let healthCheckTimer: NodeJS.Timeout | null = null
  let metricsTimer: NodeJS.Timeout | null = null

  /**
   * Initialiser l'orchestrateur PWA complet
   */
  async function initPWAOrchestrator(): Promise<void> {
    if (isInitializing.value || isInitialized.value) {
      return
    }

    isInitializing.value = true
    initProgress.value = 0
    initErrors.value = []

    log('🚀 Initialisation PWA Orchestrateur...')

    try {
      // Étape 1: Charger configuration
      await loadConfig()
      updateProgress(10)

      // Étape 2: Initialiser cycle de vie (priorité)
      await safeInit('Lifecycle', pwaLifecycle.initPWALifecycle)
      updateProgress(25)

      // Étape 3: Initialiser device (pour capacités)
      await safeInit('Device Features', pwaDevice.initDeviceCapabilities)
      updateProgress(40)

      // Étape 4: Initialiser cache (pour performance)
      await safeInit('Cache System', pwaCache.initPWACache)
      updateProgress(55)

      // Étape 5: Initialiser installation (si supporté)
      if (config.value.auto_install_prompt) {
        await safeInit('Installation Manager', pwaInstall.initPWAInstall)
      }
      updateProgress(70)

      // Étape 6: Initialiser notifications (si autorisé)
      if (config.value.auto_notifications && isAuthenticated.value) {
        await safeInit('Push Notifications', pwaNotifications.initPWANotifications)
      }
      updateProgress(85)

      // Étape 7: Initialiser background sync (si connecté)
      if (config.value.background_sync && isAuthenticated.value) {
        await safeInit('Background Sync', pwaBackgroundSync.initBackgroundSync)
      }
      updateProgress(95)

      // Étape 8: Configuration finale
      await setupOrchestration()
      updateProgress(100)

      isInitialized.value = true

      log('✅ PWA Orchestrateur initialisé avec succès!')

      // Notification de succès
      showInitializationSuccess()

      // Analytics
      trackPWAInitialization('success', {
        duration: Date.now(),
        errors_count: initErrors.value.length,
        features_enabled: getEnabledFeatures()
      })

    } catch (error: any) {
      log('❌ Erreur initialisation PWA Orchestrateur:', error)
      handleInitializationError(error)
    } finally {
      isInitializing.value = false
    }
  }

  /**
   * Initialisation sécurisée d'un composable
   */
  async function safeInit(name: string, initFunction: () => Promise<void>): Promise<void> {
    try {
      log(`📦 Initialisation ${name}...`)
      await initFunction()
      log(`✅ ${name} initialisé`)
    } catch (error: any) {
      const errorMsg = `Erreur ${name}: ${error.message}`
      initErrors.value.push(errorMsg)
      log(`❌ ${errorMsg}`)

      // Continuer l'initialisation même en cas d'erreur
      // Les composables sont conçus pour être résilients
    }
  }

  /**
   * Mettre à jour le progrès d'initialisation
   */
  function updateProgress(progress: number): void {
    initProgress.value = progress
  }

  /**
   * Configuration de l'orchestration
   */
  async function setupOrchestration(): Promise<void> {
    // Démarrer monitoring santé
    startHealthMonitoring()

    // Démarrer tracking métriques
    startMetricsTracking()

    // Setup coordination entre composables
    setupInterComponentCommunication()

    // Setup réactions aux changements d'état
    setupStateReactions()

    log('🔧 Orchestration configurée')
  }

  /**
   * Démarrer monitoring de santé
   */
  function startHealthMonitoring(): void {
    healthCheckTimer = setInterval(() => {
      const status = getPWAStatus()
      const metrics = getPWAMetrics()

      // Vérifications proactives
      if (status.overall === 'critical') {
        handleCriticalState()
      } else if (status.overall === 'degraded') {
        handleDegradedState()
      }

      // Log périodique si debug
      if (config.value.debug_mode) {
        log('🏥 Health Check:', { status, metrics })
      }
    }, 30000) // Toutes les 30 secondes
  }

  /**
   * Démarrer tracking des métriques
   */
  function startMetricsTracking(): void {
    metricsTimer = setInterval(() => {
      const metrics = getPWAMetrics()

      // Sauvegarder métriques
      saveMetrics(metrics)

      // Analytics periodiques
      if (config.value.analytics_tracking) {
        trackPWAMetrics(metrics)
      }
    }, 5 * 60 * 1000) // Toutes les 5 minutes
  }

  /**
   * Setup communication inter-composables
   */
  function setupInterComponentCommunication(): void {
    // Cache ↔ Background Sync
    watch(() => pwaCache.needsCleanup.value, (needsCleanup) => {
      if (needsCleanup && pwaBackgroundSync.isOnline.value) {
        // Déclencher nettoyage quand sync termine
        pwaCache.cleanupCaches()
      }
    })

    // Notifications ↔ Device
    watch(() => pwaDevice.batteryLevel.value, (level) => {
      if (level !== null && level < 15) {
        // Réduire notifications en mode batterie faible
        pwaNotifications.updateSettings({ marketing: false })
      }
    })

    // Install ↔ Lifecycle
    watch(() => pwaLifecycle.isEngagedUser.value, (engaged) => {
      if (engaged && pwaInstall.canShowPrompt.value) {
        // Proposer installation aux utilisateurs engagés
        setTimeout(() => {
          pwaInstall.showInstallationHint()
        }, 2000)
      }
    })

    log('🔗 Communication inter-composables configurée')
  }

  /**
   * Setup réactions aux changements d'état
   */
  function setupStateReactions(): void {
    // Réagir à l'authentification
    watch(() => isAuthenticated.value, async (authenticated) => {
      if (authenticated) {
        // Activer fonctionnalités authentifiées
        if (config.value.auto_notifications) {
          await pwaNotifications.initPWANotifications()
        }
        if (config.value.background_sync) {
          await pwaBackgroundSync.initBackgroundSync()
        }
      } else {
        // Désactiver fonctionnalités privées
        await pwaNotifications.unsubscribeFromNotifications()
      }
    })

    // Réagir aux changements de connexion
    watch(() => pwaBackgroundSync.isOnline.value, (online) => {
      if (online) {
        // Déclencher sync quand connexion rétablie
        pwaBackgroundSync.forceSyncNow()
      }
    })

    log('⚡ Réactions d\'état configurées')
  }

  /**
   * Obtenir le statut PWA global
   */
  function getPWAStatus(): PWAStatus {
    const status: PWAStatus = {
      installation: getInstallationStatus(),
      notifications: getNotificationStatus(),
      cache: getCacheStatus(),
      background_sync: getBackgroundSyncStatus(),
      device_features: getDeviceFeaturesStatus(),
      lifecycle: getLifecycleStatus(),
      overall: 'ready'
    }

    // Calculer statut global
    const statusValues = Object.values(status).filter(s => s !== status.overall)
    const criticalCount = statusValues.filter(s => s === 'error' || s === 'unsupported').length
    const degradedCount = statusValues.filter(s => s === 'limited' || s === 'denied').length

    if (criticalCount > 2) {
      status.overall = 'critical'
    } else if (criticalCount > 0 || degradedCount > 1) {
      status.overall = 'degraded'
    } else if (statusValues.every(s => ['ready', 'granted', 'installed', 'standalone', 'full', 'active'].includes(s))) {
      status.overall = 'optimal'
    }

    return status
  }

  /**
   * Obtenir métriques PWA globales
   */
  function getPWAMetrics(): PWAMetrics {
    return {
      installation_rate: calculateInstallationRate(),
      notification_engagement: calculateNotificationEngagement(),
      cache_hit_rate: pwaCache.cacheStats.value.hit_rate,
      sync_success_rate: pwaBackgroundSync.stats.value.sync_success_rate,
      device_capability_usage: calculateDeviceCapabilityUsage(),
      session_quality: pwaLifecycle.usageStats.value.engagement_score,
      overall_health: calculateOverallHealth()
    }
  }

  /**
   * Calculer taux d'installation
   */
  function calculateInstallationRate(): number {
    const stats = pwaInstall.installationStats.value
    if (stats.prompt_shown === 0) return 0
    return (stats.install_accepted / stats.prompt_shown) * 100
  }

  /**
   * Calculer engagement notifications
   */
  function calculateNotificationEngagement(): number {
    // Basé sur permission et usage
    if (pwaNotifications.subscriptionStatus.value === 'subscribed') {
      return 80 + (pwaLifecycle.isEngagedUser.value ? 20 : 0)
    }
    return pwaNotifications.isPermissionGranted.value ? 40 : 0
  }

  /**
   * Calculer usage capacités device
   */
  function calculateDeviceCapabilityUsage(): number {
    const capabilities = pwaDevice.capabilities.value
    const available = Object.values(capabilities).filter(Boolean).length
    const total = Object.keys(capabilities).length
    return (available / total) * 100
  }

  /**
   * Calculer santé globale
   */
  function calculateOverallHealth(): number {
    const metrics = {
      cache: pwaCache.cacheHealthy.value ? 100 : 50,
      sync: pwaBackgroundSync.syncHealthy.value ? 100 : 60,
      lifecycle: pwaLifecycle.isEngagedUser.value ? 100 : 70,
      device: pwaDevice.supportsAdvancedFeatures.value ? 100 : 80
    }

    return Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length
  }

  /**
   * Gérer état critique
   */
  function handleCriticalState(): void {
    log('🚨 État critique détecté')

    notifications.error('⚠️ Fonctionnalités PWA dégradées', {
      title: '🚨 État Critique',
      duration: 0,
      actions: [
        { label: 'Diagnostiquer', action: 'diagnose', url: '/pwa/status' },
        { label: 'Redémarrer', action: 'restart_pwa' }
      ]
    })

    // Tenter réparation automatique
    scheduleAutomaticRecovery()
  }

  /**
   * Gérer état dégradé
   */
  function handleDegradedState(): void {
    log('⚠️ État dégradé détecté')

    notifications.warning('⚠️ Certaines fonctionnalités limitées', {
      title: '📱 Performance réduite',
      duration: 8000,
      actions: [
        { label: 'Optimiser', action: 'optimize_pwa' }
      ]
    })
  }

  /**
   * Programmer récupération automatique
   */
  function scheduleAutomaticRecovery(): void {
    setTimeout(async () => {
      log('🔧 Tentative de récupération automatique...')

      try {
        // Nettoyer caches
        await pwaCache.cleanupCaches()

        // Forcer sync
        await pwaBackgroundSync.forceSyncNow()

        // Vérifier mise à jour
        await pwaLifecycle.checkForUpdates()

        log('✅ Récupération automatique terminée')

      } catch (error: any) {
        log('❌ Récupération automatique échouée:', error)
      }
    }, 60000) // Dans 1 minute
  }

  /**
   * Obtenir statuts individuels
   */
  function getInstallationStatus(): PWAStatus['installation'] {
    if (!pwaInstall.installationStatus.value.isSupported) return 'not_supported'
    if (pwaInstall.installationStatus.value.isStandalone) return 'standalone'
    if (pwaInstall.installationStatus.value.isInstalled) return 'installed'
    if (pwaInstall.installationStatus.value.canInstall) return 'installable'
    return 'not_supported'
  }

  function getNotificationStatus(): PWAStatus['notifications'] {
    return pwaNotifications.subscriptionStatus.value as PWAStatus['notifications']
  }

  function getCacheStatus(): PWAStatus['cache'] {
    if (!pwaCache.cacheSupported.value) return 'unsupported'
    if (pwaCache.cacheHealthy.value) return 'ready'
    return 'error'
  }

  function getBackgroundSyncStatus(): PWAStatus['background_sync'] {
    if (!pwaBackgroundSync.backgroundSyncSupported.value) return 'unsupported'
    if (pwaBackgroundSync.isSyncing.value) return 'syncing'
    return 'idle'
  }

  function getDeviceFeaturesStatus(): PWAStatus['device_features'] {
    if (pwaDevice.supportsAdvancedFeatures.value) return 'full'
    if (pwaDevice.capabilities.value.vibration && pwaDevice.capabilities.value.geolocation) return 'advanced'
    if (pwaDevice.deviceInfo.value.isMobile) return 'basic'
    return 'limited'
  }

  function getLifecycleStatus(): PWAStatus['lifecycle'] {
    return pwaLifecycle.appState.value.lifecycle as PWAStatus['lifecycle']
  }

  /**
   * Afficher succès d'initialisation
   */
  function showInitializationSuccess(): void {
    const enabledFeatures = getEnabledFeatures()

    notifications.success(`🚀 PWA prête - ${enabledFeatures.length} fonctionnalités actives`, {
      title: '✨ Application optimisée',
      duration: 5000,
      actions: [
        { label: 'Voir statut', action: 'view_pwa_status' }
      ]
    })
  }

  /**
   * Gérer erreur d'initialisation
   */
  function handleInitializationError(error: any): void {
    notifications.error('❌ Erreur initialisation PWA', {
      title: '🚨 Initialisation échouée',
      duration: 0,
      actions: [
        { label: 'Réessayer', action: 'retry_init' },
        { label: 'Mode dégradé', action: 'fallback_mode' }
      ]
    })

    // Analytics erreur
    trackPWAInitialization('error', {
      error: error.message,
      errors_count: initErrors.value.length
    })
  }

  /**
   * Obtenir fonctionnalités activées
   */
  function getEnabledFeatures(): string[] {
    const features = []

    if (pwaInstall.installationStatus.value.isSupported) features.push('Installation')
    if (pwaNotifications.notificationSupport.value) features.push('Notifications')
    if (pwaCache.cacheSupported.value) features.push('Cache')
    if (pwaBackgroundSync.backgroundSyncSupported.value) features.push('Background Sync')
    if (pwaDevice.deviceInfo.value.isMobile) features.push('Mobile Features')

    return features
  }

  /**
   * Redémarrer PWA
   */
  async function restartPWA(): Promise<void> {
    log('🔄 Redémarrage PWA...')

    // Arrêter timers
    stopMonitoring()

    // Réinitialiser état
    isInitialized.value = false
    initErrors.value = []

    // Relancer initialisation
    setTimeout(() => {
      initPWAOrchestrator()
    }, 1000)
  }

  /**
   * Optimiser PWA
   */
  async function optimizePWA(): Promise<void> {
    log('⚡ Optimisation PWA...')

    const tasks = [
      () => pwaCache.cleanupCaches(),
      () => pwaCache.optimizeCacheStrategies(),
      () => pwaBackgroundSync.clearSyncQueue(),
      () => pwaLifecycle.checkForUpdates()
    ]

    let completed = 0

    for (const task of tasks) {
      try {
        await task()
        completed++
      } catch (error) {
        log('Erreur optimisation:', error)
      }
    }

    notifications.success(`⚡ ${completed}/${tasks.length} optimisations réussies`, {
      title: '🚀 PWA optimisée',
      duration: 4000
    })
  }

  /**
   * Arrêter monitoring
   */
  function stopMonitoring(): void {
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer)
      healthCheckTimer = null
    }

    if (metricsTimer) {
      clearInterval(metricsTimer)
      metricsTimer = null
    }
  }

  /**
   * Charger configuration
   */
  async function loadConfig(): Promise<void> {
    const saved = localStorage.getItem('pwa_orchestrator_config')

    if (saved) {
      try {
        config.value = { ...config.value, ...JSON.parse(saved) }
      } catch (error) {
        log('Erreur chargement config orchestrateur')
      }
    }
  }

  /**
   * Sauvegarder configuration
   */
  async function saveConfig(): Promise<void> {
    localStorage.setItem('pwa_orchestrator_config', JSON.stringify(config.value))
  }

  /**
   * Sauvegarder métriques
   */
  function saveMetrics(metrics: PWAMetrics): void {
    const history = getMetricsHistory()
    history.unshift({
      timestamp: Date.now(),
      ...metrics
    })

    // Limiter historique à 100 entrées
    localStorage.setItem('pwa_metrics_history', JSON.stringify(history.slice(0, 100)))
  }

  /**
   * Obtenir historique métriques
   */
  function getMetricsHistory(): any[] {
    const stored = localStorage.getItem('pwa_metrics_history')

    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        return []
      }
    }

    return []
  }

  /**
   * Tracker initialisation PWA
   */
  function trackPWAInitialization(result: 'success' | 'error', data: any): void {
    log(`📊 PWA Initialization: ${result}`, data)

    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_initialization', {
        event_category: 'pwa_orchestrator',
        event_label: result,
        value: result === 'success' ? 1 : 0,
        custom_parameters: data
      })
    }
  }

  /**
   * Tracker métriques PWA
   */
  function trackPWAMetrics(metrics: PWAMetrics): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_metrics', {
        event_category: 'pwa_performance',
        event_label: 'periodic_tracking',
        value: Math.round(metrics.overall_health),
        custom_parameters: metrics
      })
    }
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWAOrchestrator]', ...args)
  }

  // Computed properties
  const pwaStatus = computed(() => getPWAStatus())
  const pwaMetrics = computed(() => getPWAMetrics())

  const isReady = computed(() =>
    isInitialized.value && pwaStatus.value.overall !== 'critical'
  )

  const isOptimal = computed(() =>
    pwaStatus.value.overall === 'optimal'
  )

  const healthScore = computed(() =>
    Math.round(pwaMetrics.value.overall_health)
  )

  const enabledFeaturesCount = computed(() =>
    getEnabledFeatures().length
  )

  const initializationSummary = computed(() => ({
    progress: initProgress.value,
    errors: initErrors.value.length,
    features: getEnabledFeatures(),
    status: isInitialized.value ? 'completed' : isInitializing.value ? 'in_progress' : 'pending'
  }))

  // Lifecycle
  onMounted(() => {
    // Auto-init si authentifié
    if (isAuthenticated.value) {
      initPWAOrchestrator()
    }
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  // Watcher authentification
  watch(() => isAuthenticated.value, (authenticated) => {
    if (authenticated && !isInitialized.value) {
      initPWAOrchestrator()
    }
  })

  return {
    // State
    isInitialized,
    isInitializing,
    initProgress,
    initErrors,
    config,

    // Computed
    pwaStatus,
    pwaMetrics,
    isReady,
    isOptimal,
    healthScore,
    enabledFeaturesCount,
    initializationSummary,

    // Methods
    initPWAOrchestrator,
    restartPWA,
    optimizePWA,
    getPWAStatus,
    getPWAMetrics,
    getEnabledFeatures,

    // Sub-composables access
    install: pwaInstall,
    notifications: pwaNotifications,
    cache: pwaCache,
    backgroundSync: pwaBackgroundSync,
    device: pwaDevice,
    lifecycle: pwaLifecycle
  }
}
