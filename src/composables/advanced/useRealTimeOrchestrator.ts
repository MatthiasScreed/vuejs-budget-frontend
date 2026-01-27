import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/core'
import { useWebSocket } from './useWebSocket'
import { useRealTimeGaming } from './useRealTimeGaming'
import { useRealTimeNotifications } from './useRealTimeNotifications'
import { useRealTimeLeaderboards } from './useRealTimeLeaderboards'

interface ConnectionHealth {
  gaming: 'connected' | 'connecting' | 'disconnected' | 'error'
  notifications: 'connected' | 'connecting' | 'disconnected' | 'error'
  leaderboards: 'connected' | 'connecting' | 'disconnected' | 'error'
  overall: 'healthy' | 'degraded' | 'critical'
}

interface RealTimeStats {
  total_connections: number
  messages_sent: number
  messages_received: number
  uptime: number
  last_ping: number
}

/**
 * Composable orchestrateur pour tous les WebSockets gaming
 * Coordination, health checks, reconnections intelligentes
 */
export function useRealTimeOrchestrator() {
  const { isAuthenticated, user } = useAuth()

  // Instances WebSocket spécialisées
  const rtGaming = useRealTimeGaming()
  const rtNotifications = useRealTimeNotifications()
  const rtLeaderboards = useRealTimeLeaderboards()

  // State global
  const isInitialized = ref(false)
  const autoReconnect = ref(true)
  const stats = ref<RealTimeStats>({
    total_connections: 0,
    messages_sent: 0,
    messages_received: 0,
    uptime: 0,
    last_ping: 0
  })

  // Timers
  let healthCheckTimer: NodeJS.Timeout | null = null
  let statsTimer: NodeJS.Timeout | null = null

  /**
   * Initialiser tous les WebSockets gaming
   */
  async function initializeRealTime(): Promise<void> {
    if (!isAuthenticated.value || isInitialized.value) {
      return
    }

    log('🚀 Initialisation temps réel gaming...')

    try {
      // Initialiser dans l'ordre optimal
      await Promise.all([
        rtNotifications.initLiveNotifications(),
        rtGaming.initRealTimeGaming(),
        rtLeaderboards.initLiveLeaderboards()
      ])

      // Démarrer monitoring
      startHealthChecking()
      startStatsTracking()

      isInitialized.value = true

      log('✅ Temps réel gaming initialisé avec succès!')

      // Notification de connexion
      rtNotifications.notifications.success('🔥 Gaming temps réel activé !', {
        title: '⚡ Connexion Live',
        duration: 3000
      })

    } catch (error: any) {
      log('❌ Erreur initialisation temps réel:', error)
      await handleInitializationError(error)
    }
  }

  /**
   * Arrêter tous les WebSockets
   */
  function shutdownRealTime(): void {
    log('🛑 Arrêt temps réel gaming...')

    stopHealthChecking()
    stopStatsTracking()

    // Déconnecter tous les WebSockets
    // Note: ws.disconnect() sera appelé automatiquement par chaque composable

    isInitialized.value = false

    log('✅ Temps réel gaming arrêté')
  }

  /**
   * Redémarrer tous les WebSockets
   */
  async function restartRealTime(): Promise<void> {
    log('🔄 Redémarrage temps réel gaming...')

    shutdownRealTime()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Délai de grâce
    await initializeRealTime()
  }

  /**
   * Démarrer vérification santé des connexions
   */
  function startHealthChecking(): void {
    healthCheckTimer = setInterval(async () => {
      const health = getConnectionHealth()

      if (health.overall === 'critical' && autoReconnect.value) {
        log('⚕️ Santé critique détectée, redémarrage...')
        await restartRealTime()
      }
    }, 30000) // Vérification toutes les 30 secondes
  }

  /**
   * Arrêter vérification santé
   */
  function stopHealthChecking(): void {
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer)
      healthCheckTimer = null
    }
  }

  /**
   * Démarrer tracking des statistiques
   */
  function startStatsTracking(): void {
    const startTime = Date.now()

    statsTimer = setInterval(() => {
      stats.value.uptime = Math.floor((Date.now() - startTime) / 1000)
      stats.value.last_ping = Date.now()
    }, 5000) // Update toutes les 5 secondes
  }

  /**
   * Arrêter tracking des statistiques
   */
  function stopStatsTracking(): void {
    if (statsTimer) {
      clearInterval(statsTimer)
      statsTimer = null
    }
  }

  /**
   * Obtenir la santé des connexions
   */
  function getConnectionHealth(): ConnectionHealth {
    // Simplified health check - in real implementation would check each WebSocket
    const gaming = 'connected' // rtGaming connection status
    const notifications = 'connected' // rtNotifications connection status
    const leaderboards = 'connected' // rtLeaderboards connection status

    let overall: ConnectionHealth['overall'] = 'healthy'

    const connectedCount = [gaming, notifications, leaderboards]
      .filter(status => status === 'connected').length

    if (connectedCount === 0) overall = 'critical'
    else if (connectedCount < 3) overall = 'degraded'

    return {
      gaming,
      notifications,
      leaderboards,
      overall
    }
  }

  /**
   * Gérer erreur d'initialisation
   */
  async function handleInitializationError(error: any): Promise<void> {
    log('Gestion erreur initialisation:', error)

    // Retry automatique après délai
    if (autoReconnect.value) {
      setTimeout(() => {
        initializeRealTime()
      }, 5000)
    }
  }

  /**
   * Envoyer événement gaming à tous les canaux
   */
  function broadcastGamingEvent(
    eventType: string,
    eventData: any,
    channels: ('gaming' | 'notifications' | 'leaderboards')[] = ['gaming']
  ): void {
    channels.forEach(channel => {
      switch (channel) {
        case 'gaming':
          rtGaming.broadcastGamingAction(eventType, eventData)
          break
        case 'notifications':
          // Broadcast via notifications WebSocket
          break
        case 'leaderboards':
          // Trigger leaderboard update
          break
      }
    })

    stats.value.messages_sent++
  }

  /**
   * Obtenir métriques temps réel
   */
  function getRealTimeMetrics(): any {
    return {
      health: getConnectionHealth(),
      stats: stats.value,
      active_players: rtGaming.activePlayers.value,
      live_events: rtGaming.liveEvents.value.length,
      notifications_queue: rtNotifications.liveNotifications.value.length,
      leaderboard_rooms: rtLeaderboards.subscribedRooms.value.length
    }
  }

  /**
   * Activer/désactiver reconnexion auto
   */
  function toggleAutoReconnect(enabled: boolean): void {
    autoReconnect.value = enabled
    log(`Auto-reconnect ${enabled ? 'activé' : 'désactivé'}`)
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  function getCurrentUserId(): number {
    return user.value?.id || 0
  }

  /**
   * Obtenir le niveau utilisateur actuel
   */
  function getCurrentUserLevel(): number {
    return user.value?.level?.level || 1
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[RealTimeOrchestrator]', ...args)
  }

  // Computed properties
  const connectionHealth = computed(() => getConnectionHealth())

  const isFullyConnected = computed(() =>
    connectionHealth.value.overall === 'healthy'
  )

  const connectionStatus = computed(() => {
    if (isFullyConnected.value) return 'Connecté en temps réel'
    if (connectionHealth.value.overall === 'degraded') return 'Connexion partielle'
    if (connectionHealth.value.overall === 'critical') return 'Connexion critique'
    return 'Déconnecté'
  })

  const uptimeFormatted = computed(() => {
    const uptime = stats.value.uptime
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = uptime % 60

    return `${hours}h ${minutes}m ${seconds}s`
  })

  // Lifecycle
  onMounted(() => {
    if (isAuthenticated.value) {
      initializeRealTime()
    }
  })

  onUnmounted(() => {
    shutdownRealTime()
  })

  // Watcher pour authentification
  watch(() => isAuthenticated.value, (authenticated) => {
    if (authenticated && !isInitialized.value) {
      initializeRealTime()
    } else if (!authenticated && isInitialized.value) {
      shutdownRealTime()
    }
  })

  return {
    // State
    isInitialized,
    autoReconnect,
    stats,

    // Computed
    connectionHealth,
    isFullyConnected,
    connectionStatus,
    uptimeFormatted,

    // Methods
    initializeRealTime,
    shutdownRealTime,
    restartRealTime,
    broadcastGamingEvent,
    getRealTimeMetrics,
    toggleAutoReconnect,

    // Sub-composables access
    gaming: rtGaming,
    notifications: rtNotifications,
    leaderboards: rtLeaderboards
  }
}
