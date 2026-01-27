import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '@/composables/ui'

interface AppState {
  visibility: 'visible' | 'hidden'
  focus: 'focused' | 'blurred'
  connection: 'online' | 'offline'
  installation: 'not_installed' | 'installed' | 'standalone'
  lifecycle: 'active' | 'passive' | 'background' | 'terminated'
}

interface LifecycleEvent {
  type: string
  timestamp: number
  data?: any
}

interface SessionInfo {
  id: string
  start_time: number
  duration: number
  interactions: number
  page_views: number
  background_time: number
  last_activity: number
}

interface AppUsageStats {
  total_sessions: number
  total_duration: number
  average_session: number
  daily_active: boolean
  sessions_today: number
  last_visit: number
  engagement_score: number
}

interface PWAUpdateInfo {
  available: boolean
  version?: string
  size?: number
  critical?: boolean
  changelog?: string[]
  auto_update?: boolean
}

/**
 * Composable pour cycle de vie PWA
 * Gestion états app, sessions, mises à jour, analytics
 */
export function usePWALifecycle() {
  const notifications = useNotifications()

  // State
  const appState = ref<AppState>({
    visibility: document.visibilityState === 'visible' ? 'visible' : 'hidden',
    focus: document.hasFocus() ? 'focused' : 'blurred',
    connection: navigator.onLine ? 'online' : 'offline',
    installation: 'not_installed',
    lifecycle: 'active'
  })

  const currentSession = ref<SessionInfo>({
    id: generateSessionId(),
    start_time: Date.now(),
    duration: 0,
    interactions: 0,
    page_views: 1,
    background_time: 0,
    last_activity: Date.now()
  })

  const lifecycleEvents = ref<LifecycleEvent[]>([])
  const usageStats = ref<AppUsageStats>({
    total_sessions: 0,
    total_duration: 0,
    average_session: 0,
    daily_active: false,
    sessions_today: 0,
    last_visit: 0,
    engagement_score: 0
  })

  const updateInfo = ref<PWAUpdateInfo>({
    available: false,
    auto_update: false
  })

  const isFirstVisit = ref(false)
  const isReturningUser = ref(false)
  const backgroundStartTime = ref<number>(0)

  // Timers
  let sessionTimer: NodeJS.Timeout | null = null
  let inactivityTimer: NodeJS.Timeout | null = null
  let backgroundTimer: NodeJS.Timeout | null = null

  /**
   * Initialiser le cycle de vie PWA
   */
  async function initPWALifecycle(): Promise<void> {
    await loadUsageStats()
    detectInstallationMode()
    setupLifecycleListeners()
    startSessionTracking()
    checkForUpdates()
    trackAppLaunch()

    log('Cycle de vie PWA initialisé')
  }

  /**
   * Détecter le mode d'installation
   */
  function detectInstallationMode(): void {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      appState.value.installation = 'standalone'
    } else if (isInstalledPWA()) {
      appState.value.installation = 'installed'
    }

    log(`Mode installation: ${appState.value.installation}`)
  }

  /**
   * Vérifier si PWA installée
   */
  function isInstalledPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
  }

  /**
   * Setup des listeners de cycle de vie
   */
  function setupLifecycleListeners(): void {
    // Visibilité de la page
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Focus/Blur de la fenêtre
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)

    // États réseau
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Activité utilisateur
    setupActivityListeners()

    // Avant fermeture
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Page Load Performance
    window.addEventListener('load', handlePageLoad)

    log('Listeners cycle de vie configurés')
  }

  /**
   * Setup des listeners d'activité utilisateur
   */
  function setupActivityListeners(): void {
    const activityEvents = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove']

    const handleActivity = () => {
      currentSession.value.interactions++
      currentSession.value.last_activity = Date.now()
      resetInactivityTimer()
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    resetInactivityTimer()
  }

  /**
   * Gérer changement de visibilité
   */
  function handleVisibilityChange(): void {
    const wasVisible = appState.value.visibility === 'visible'
    appState.value.visibility = document.visibilityState === 'visible' ? 'visible' : 'hidden'

    if (appState.value.visibility === 'hidden' && wasVisible) {
      // App passe en arrière-plan
      handleAppBackground()
    } else if (appState.value.visibility === 'visible' && !wasVisible) {
      // App revient au premier plan
      handleAppForeground()
    }

    addLifecycleEvent('visibility_change', {
      visibility: appState.value.visibility,
      timestamp: Date.now()
    })
  }

  /**
   * Gérer focus fenêtre
   */
  function handleWindowFocus(): void {
    appState.value.focus = 'focused'
    appState.value.lifecycle = 'active'

    addLifecycleEvent('window_focus')
  }

  /**
   * Gérer blur fenêtre
   */
  function handleWindowBlur(): void {
    appState.value.focus = 'blurred'
    appState.value.lifecycle = 'passive'

    addLifecycleEvent('window_blur')
  }

  /**
   * Gérer retour en ligne
   */
  function handleOnline(): void {
    appState.value.connection = 'online'

    notifications.success('🌐 Connexion rétablie', {
      title: '📶 En ligne',
      duration: 3000
    })

    addLifecycleEvent('online')
  }

  /**
   * Gérer passage hors ligne
   */
  function handleOffline(): void {
    appState.value.connection = 'offline'

    notifications.warning('📴 Mode hors ligne', {
      title: '🔴 Hors ligne',
      duration: 5000
    })

    addLifecycleEvent('offline')
  }

  /**
   * Gérer app en arrière-plan
   */
  function handleAppBackground(): void {
    appState.value.lifecycle = 'background'
    backgroundStartTime.value = Date.now()

    // Sauvegarder session
    saveCurrentSession()

    addLifecycleEvent('app_background')
    log('App passée en arrière-plan')
  }

  /**
   * Gérer retour app au premier plan
   */
  function handleAppForeground(): void {
    const backgroundDuration = backgroundStartTime.value > 0
      ? Date.now() - backgroundStartTime.value
      : 0

    currentSession.value.background_time += backgroundDuration
    appState.value.lifecycle = 'active'

    // Nouvelle session si trop longtemps en arrière-plan (> 30 min)
    if (backgroundDuration > 30 * 60 * 1000) {
      endCurrentSession()
      startNewSession()
    }

    addLifecycleEvent('app_foreground', {
      background_duration: backgroundDuration
    })
    log('App revenue au premier plan')
  }

  /**
   * Gérer avant fermeture
   */
  function handleBeforeUnload(): void {
    endCurrentSession()
    saveUsageStats()
    addLifecycleEvent('before_unload')
  }

  /**
   * Gérer chargement page
   */
  function handlePageLoad(): void {
    currentSession.value.page_views++
    addLifecycleEvent('page_load', {
      load_time: performance.now()
    })
  }

  /**
   * Démarrer tracking session
   */
  function startSessionTracking(): void {
    sessionTimer = setInterval(() => {
      currentSession.value.duration = Date.now() - currentSession.value.start_time
      updateEngagementScore()
    }, 10000) // Toutes les 10 secondes

    log('Tracking session démarré')
  }

  /**
   * Démarrer nouvelle session
   */
  function startNewSession(): void {
    currentSession.value = {
      id: generateSessionId(),
      start_time: Date.now(),
      duration: 0,
      interactions: 0,
      page_views: 1,
      background_time: 0,
      last_activity: Date.now()
    }

    usageStats.value.total_sessions++
    usageStats.value.sessions_today++

    log('Nouvelle session démarrée:', currentSession.value.id)
  }

  /**
   * Terminer session courante
   */
  function endCurrentSession(): void {
    if (sessionTimer) {
      clearInterval(sessionTimer)
      sessionTimer = null
    }

    currentSession.value.duration = Date.now() - currentSession.value.start_time

    // Sauvegarder session
    saveCurrentSession()

    // Mettre à jour stats
    usageStats.value.total_duration += currentSession.value.duration
    usageStats.value.average_session = usageStats.value.total_duration / usageStats.value.total_sessions
    usageStats.value.last_visit = Date.now()

    log('Session terminée:', currentSession.value)
  }

  /**
   * Reset timer d'inactivité
   */
  function resetInactivityTimer(): void {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    // Considérer inactif après 5 minutes
    inactivityTimer = setTimeout(() => {
      appState.value.lifecycle = 'passive'
      addLifecycleEvent('user_inactive')
    }, 5 * 60 * 1000)
  }

  /**
   * Ajouter événement de cycle de vie
   */
  function addLifecycleEvent(type: string, data?: any): void {
    const event: LifecycleEvent = {
      type,
      timestamp: Date.now(),
      data
    }

    lifecycleEvents.value.unshift(event)

    // Limiter l'historique à 100 événements
    if (lifecycleEvents.value.length > 100) {
      lifecycleEvents.value = lifecycleEvents.value.slice(0, 100)
    }

    log('Événement cycle de vie:', type, data)
  }

  /**
   * Calculer score d'engagement
   */
  function updateEngagementScore(): void {
    const session = currentSession.value
    const sessionDuration = Date.now() - session.start_time

    // Score basé sur durée, interactions et pages vues
    let score = 0

    // Points pour durée (max 40 points pour 20 min)
    score += Math.min(40, (sessionDuration / (20 * 60 * 1000)) * 40)

    // Points pour interactions (max 30 points pour 100 interactions)
    score += Math.min(30, (session.interactions / 100) * 30)

    // Points pour pages vues (max 20 points pour 10 pages)
    score += Math.min(20, (session.page_views / 10) * 20)

    // Bonus pour utilisation régulière (max 10 points)
    if (usageStats.value.sessions_today > 1) {
      score += Math.min(10, usageStats.value.sessions_today * 2)
    }

    usageStats.value.engagement_score = Math.round(score)
  }

  /**
   * Vérifier les mises à jour
   */
  async function checkForUpdates(): Promise<void> {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (newWorker) {
            updateInfo.value.available = true

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                handleUpdateAvailable()
              }
            })
          }
        })

        // Vérifier immédiatement
        await registration.update()
      }
    } catch (error: any) {
      log('Erreur vérification mise à jour:', error)
    }
  }

  /**
   * Gérer mise à jour disponible
   */
  function handleUpdateAvailable(): void {
    log('Mise à jour disponible')

    if (updateInfo.value.auto_update) {
      applyUpdate()
    } else {
      notifications.info('🔄 Mise à jour disponible', {
        title: '📱 Nouvelle version',
        duration: 0, // Persistent
        actions: [
          { label: 'Mettre à jour', action: 'update_now' },
          { label: 'Plus tard', action: 'update_later' }
        ]
      })
    }

    addLifecycleEvent('update_available')
  }

  /**
   * Appliquer la mise à jour
   */
  async function applyUpdate(): Promise<void> {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration?.waiting) {
        // Envoyer message au service worker pour skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })

        // Recharger la page
        window.location.reload()
      }
    } catch (error: any) {
      log('Erreur application mise à jour:', error)
    }
  }

  /**
   * Tracker lancement app
   */
  function trackAppLaunch(): void {
    const lastVisit = localStorage.getItem('pwa_last_visit')
    const now = Date.now()

    if (!lastVisit) {
      isFirstVisit.value = true
      trackLifecycleEvent('first_visit')
    } else {
      const lastVisitTime = parseInt(lastVisit)
      const timeSinceLastVisit = now - lastVisitTime

      isReturningUser.value = true

      // Nouvelle session si plus de 30 minutes
      if (timeSinceLastVisit > 30 * 60 * 1000) {
        trackLifecycleEvent('new_session', {
          time_since_last_visit: timeSinceLastVisit
        })
      } else {
        trackLifecycleEvent('session_resume', {
          time_since_last_visit: timeSinceLastVisit
        })
      }
    }

    localStorage.setItem('pwa_last_visit', now.toString())
  }

  /**
   * Tracker événement lifecycle
   */
  function trackLifecycleEvent(event: string, data?: any): void {
    // Intégration analytics
    log(`📊 Lifecycle event: ${event}`, data)

    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        event_category: 'pwa_lifecycle',
        event_label: appState.value.installation,
        value: data?.value || 1
      })
    }
  }

  /**
   * Sauvegarder session courante
   */
  function saveCurrentSession(): void {
    const sessions = getStoredSessions()
    sessions.unshift({
      ...currentSession.value,
      duration: Date.now() - currentSession.value.start_time
    })

    // Limiter à 50 sessions
    localStorage.setItem('pwa_sessions', JSON.stringify(sessions.slice(0, 50)))
  }

  /**
   * Obtenir sessions stockées
   */
  function getStoredSessions(): SessionInfo[] {
    const stored = localStorage.getItem('pwa_sessions')

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
   * Charger statistiques d'utilisation
   */
  async function loadUsageStats(): Promise<void> {
    const stored = localStorage.getItem('pwa_usage_stats')

    if (stored) {
      try {
        const stats = JSON.parse(stored)
        usageStats.value = { ...usageStats.value, ...stats }
      } catch (error) {
        log('Erreur chargement stats usage')
      }
    }

    // Vérifier si actif aujourd'hui
    const today = new Date().toDateString()
    const lastActiveDay = localStorage.getItem('pwa_last_active_day')

    usageStats.value.daily_active = lastActiveDay === today

    if (!usageStats.value.daily_active) {
      usageStats.value.sessions_today = 0
      localStorage.setItem('pwa_last_active_day', today)
    }
  }

  /**
   * Sauvegarder statistiques d'utilisation
   */
  function saveUsageStats(): void {
    localStorage.setItem('pwa_usage_stats', JSON.stringify(usageStats.value))
  }

  /**
   * Générer ID session unique
   */
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtenir métriques de performance
   */
  function getPerformanceMetrics(): any {
    if (!('performance' in window)) return null

    const navigation = performance.getEntriesByType('navigation')[0] as any
    const paint = performance.getEntriesByType('paint')

    return {
      dns_lookup: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcp_connect: navigation?.connectEnd - navigation?.connectStart,
      request_time: navigation?.responseEnd - navigation?.requestStart,
      dom_load: navigation?.domContentLoadedEventEnd - navigation?.navigationStart,
      page_load: navigation?.loadEventEnd - navigation?.navigationStart,
      first_paint: paint.find(p => p.name === 'first-paint')?.startTime,
      first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
    }
  }

  /**
   * Obtenir résumé de l'état actuel
   */
  function getCurrentStateSummary(): any {
    return {
      app_state: appState.value,
      current_session: {
        ...currentSession.value,
        duration: Date.now() - currentSession.value.start_time
      },
      usage_stats: usageStats.value,
      is_first_visit: isFirstVisit.value,
      is_returning_user: isReturningUser.value,
      performance: getPerformanceMetrics()
    }
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWALifecycle]', ...args)
  }

  // Computed properties
  const isAppActive = computed(() =>
    appState.value.visibility === 'visible' && appState.value.focus === 'focused'
  )

  const sessionDuration = computed(() =>
    Date.now() - currentSession.value.start_time
  )

  const isLongSession = computed(() =>
    sessionDuration.value > 10 * 60 * 1000 // Plus de 10 minutes
  )

  const isEngagedUser = computed(() =>
    usageStats.value.engagement_score > 60
  )

  const sessionsToday = computed(() => usageStats.value.sessions_today)

  const averageSessionDuration = computed(() =>
    Math.round(usageStats.value.average_session / 1000 / 60) // en minutes
  )

  // Cleanup
  onUnmounted(() => {
    if (sessionTimer) clearInterval(sessionTimer)
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (backgroundTimer) clearTimeout(backgroundTimer)

    endCurrentSession()
    saveUsageStats()
  })

  // Auto-init
  onMounted(() => {
    initPWALifecycle()
  })

  return {
    // State
    appState,
    currentSession,
    lifecycleEvents,
    usageStats,
    updateInfo,
    isFirstVisit,
    isReturningUser,

    // Computed
    isAppActive,
    sessionDuration,
    isLongSession,
    isEngagedUser,
    sessionsToday,
    averageSessionDuration,

    // Methods
    initPWALifecycle,
    checkForUpdates,
    applyUpdate,
    trackLifecycleEvent,
    getCurrentStateSummary,
    getPerformanceMetrics,
    endCurrentSession,
    startNewSession
  }
}
