import { ref, computed, onUnmounted, nextTick } from 'vue'

// ==========================================
// INTERFACES WEBSOCKET
// ==========================================

export interface WebSocketConfig {
  url: string
  protocols?: string[]
  heartbeatInterval: number
  reconnectAttempts: number
  reconnectDelay: number
  debug: boolean
  autoConnect: boolean
}

export interface WebSocketMessage {
  type: string
  event: string
  data: unknown
  timestamp: number
  id?: string
}

export interface ConnectionStatus {
  connected: boolean
  connecting: boolean
  error: string | null
  reconnectCount: number
  lastConnected?: string
  lastError?: string
}

// ==========================================
// TYPES
// ==========================================

export type WebSocketReadyState =
  | WebSocket.CONNECTING
  | WebSocket.OPEN
  | WebSocket.CLOSING
  | WebSocket.CLOSED

export type MessageListener = (data: unknown) => void

// ==========================================
// COMPOSABLE WEBSOCKET ROBUSTE
// ==========================================

export function useWebSocket(endpoint: string = '/ws') {

  // ==========================================
  // STATE RÉACTIF
  // ==========================================

  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const lastError = ref<string | null>(null)
  const reconnectCount = ref(0)
  const messageHistory = ref<WebSocketMessage[]>([])

  // ==========================================
  // CONFIGURATION
  // ==========================================

  const config: WebSocketConfig = {
    url: getWebSocketURL(endpoint),
    heartbeatInterval: parseInt(import.meta.env.VITE_WS_HEARTBEAT_INTERVAL) || 30000,
    reconnectAttempts: parseInt(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS) || 5,
    reconnectDelay: 1000,
    debug: import.meta.env.VITE_DEBUG === 'true',
    autoConnect: true
  }

  // ==========================================
  // TIMERS ET LISTENERS
  // ==========================================

  let heartbeatTimer: NodeJS.Timeout | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  const listeners = new Map<string, MessageListener[]>()

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  const connectionStatus = computed<ConnectionStatus>(() => ({
    connected: isConnected.value,
    connecting: isConnecting.value,
    error: lastError.value,
    reconnectCount: reconnectCount.value,
    lastConnected: isConnected.value ? new Date().toISOString() : undefined,
    lastError: lastError.value || undefined
  }))

  const readyState = computed<WebSocketReadyState>(() => {
    return socket.value?.readyState ?? WebSocket.CLOSED
  })

  const canConnect = computed(() => {
    return !isConnecting.value && !isConnected.value &&
      reconnectCount.value < config.reconnectAttempts
  })

  // ==========================================
  // MÉTHODES PUBLIQUES
  // ==========================================

  /**
   * Se connecter au WebSocket avec gestion d'erreurs robuste
   */
  async function connect(): Promise<boolean> {
    if (isConnecting.value || isConnected.value) {
      log('Connexion déjà en cours ou établie')
      return isConnected.value
    }

    if (!canConnect.value) {
      log('Impossible de se connecter (trop de tentatives)')
      return false
    }

    isConnecting.value = true
    lastError.value = null
    log(`Tentative de connexion WebSocket (${reconnectCount.value + 1}/${config.reconnectAttempts})`)

    try {
      // Nettoyer l'ancienne connexion si elle existe
      if (socket.value) {
        cleanupSocket()
      }

      // Créer une nouvelle connexion avec timeout
      socket.value = await createWebSocketWithTimeout(config.url, config.protocols)

      // Configurer les event handlers
      setupSocketEventHandlers()

      return true
    } catch (error) {
      await handleConnectionError(error as Error)
      return false
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Se déconnecter proprement du WebSocket
   */
  function disconnect(): void {
    log('Déconnexion WebSocket demandée')

    clearAllTimers()
    reconnectCount.value = 0

    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.close(1000, 'Manual disconnect')
    }

    cleanupSocket()
  }

  /**
   * Envoyer un message avec validation
   */
  function send(type: string, event: string, data: unknown = {}): boolean {
    if (!isConnected.value || !socket.value) {
      log('WebSocket non connecté - message ignoré')
      return false
    }

    if (!type || !event) {
      log('Type et event requis pour envoyer un message')
      return false
    }

    try {
      const message: WebSocketMessage = {
        type,
        event,
        data,
        timestamp: Date.now(),
        id: generateMessageId()
      }

      socket.value.send(JSON.stringify(message))

      if (config.debug) {
        addToHistory(message)
      }

      log(`Message envoyé: ${type}:${event}`)
      return true
    } catch (error) {
      log(`Erreur envoi message: ${error}`)
      return false
    }
  }

  /**
   * S'abonner à un type d'événement
   */
  function on(event: string, listener: MessageListener): () => void {
    if (!listeners.has(event)) {
      listeners.set(event, [])
    }

    listeners.get(event)!.push(listener)
    log(`Listener ajouté pour: ${event}`)

    // Retourner la fonction de désabonnement
    return () => off(event, listener)
  }

  /**
   * Se désabonner d'un événement
   */
  function off(event: string, listener: MessageListener): void {
    const eventListeners = listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
        log(`Listener retiré pour: ${event}`)
      }
    }
  }

  /**
   * Forcer une reconnexion
   */
  async function reconnect(): Promise<boolean> {
    log('Reconnexion forcée')
    disconnect()
    await nextTick()
    return connect()
  }

  // ==========================================
  // MÉTHODES PRIVÉES
  // ==========================================

  /**
   * Créer un WebSocket avec timeout
   */
  function createWebSocketWithTimeout(
    url: string,
    protocols?: string[]
  ): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url, protocols)
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('WebSocket connection timeout'))
      }, 10000) // 10 secondes timeout

      ws.onopen = () => {
        clearTimeout(timeout)
        resolve(ws)
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('WebSocket connection failed'))
      }
    })
  }

  /**
   * Configurer les event handlers du WebSocket
   */
  function setupSocketEventHandlers(): void {
    if (!socket.value) return

    socket.value.onopen = handleOpen
    socket.value.onmessage = handleMessage
    socket.value.onclose = handleClose
    socket.value.onerror = handleError
  }

  /**
   * Gérer l'ouverture de la connexion
   */
  function handleOpen(): void {
    log('WebSocket connecté avec succès')

    isConnected.value = true
    isConnecting.value = false
    lastError.value = null
    reconnectCount.value = 0

    // Démarrer le heartbeat
    startHeartbeat()

    // Émettre l'événement de connexion
    emit('connected', { timestamp: Date.now() })
  }

  /**
   * Gérer la réception de messages
   */
  function handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)

      log(`Message reçu: ${message.type}:${message.event}`)

      if (config.debug) {
        addToHistory(message)
      }

      // Traiter les messages système
      if (message.type === 'system') {
        handleSystemMessage(message)
      } else {
        // Émettre vers les listeners
        emit(message.event, message.data)
      }
    } catch (error) {
      log(`Erreur parsing message: ${error}`)
    }
  }

  /**
   * Gérer la fermeture de la connexion
   */
  function handleClose(event: CloseEvent): void {
    log(`WebSocket fermé: ${event.code} - ${event.reason}`)

    isConnected.value = false
    isConnecting.value = false
    clearAllTimers()

    // Reconnexion automatique si ce n'est pas intentionnel
    if (event.code !== 1000 && reconnectCount.value < config.reconnectAttempts) {
      scheduleReconnect()
    }

    emit('disconnected', { code: event.code, reason: event.reason })
  }

  /**
   * Gérer les erreurs WebSocket
   */
  function handleError(error: Event): void {
    const errorMsg = 'Erreur WebSocket détectée'
    log(errorMsg)

    lastError.value = errorMsg

    // Ne pas tenter de reconnexion immédiate sur erreur
    setTimeout(() => {
      if (!isConnected.value && canConnect.value) {
        scheduleReconnect()
      }
    }, config.reconnectDelay)
  }

  /**
   * Gérer les messages système
   */
  function handleSystemMessage(message: WebSocketMessage): void {
    switch (message.event) {
      case 'ping':
        send('system', 'pong', { timestamp: Date.now() })
        break
      case 'auth_required':
        log('Authentification requise par le serveur')
        emit('auth_required', message.data)
        break
      default:
        emit('system', message)
    }
  }

  /**
   * Programmer une reconnexion
   */
  function scheduleReconnect(): void {
    if (reconnectTimer) return

    const delay = config.reconnectDelay * Math.pow(2, reconnectCount.value)

    log(`Reconnexion programmée dans ${delay}ms`)

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      reconnectCount.value++
      connect()
    }, delay)
  }

  /**
   * Démarrer le heartbeat
   */
  function startHeartbeat(): void {
    if (heartbeatTimer) clearTimeout(heartbeatTimer)

    heartbeatTimer = setTimeout(() => {
      if (isConnected.value) {
        send('system', 'ping', { timestamp: Date.now() })
        startHeartbeat() // Programmer le prochain heartbeat
      }
    }, config.heartbeatInterval)
  }

  /**
   * Nettoyer le socket
   */
  function cleanupSocket(): void {
    if (socket.value) {
      socket.value.onopen = null
      socket.value.onmessage = null
      socket.value.onclose = null
      socket.value.onerror = null
      socket.value = null
    }

    isConnected.value = false
    isConnecting.value = false
  }

  /**
   * Nettoyer tous les timers
   */
  function clearAllTimers(): void {
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer)
      heartbeatTimer = null
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  /**
   * Émettre un événement vers les listeners
   */
  function emit(event: string, data: unknown): void {
    const eventListeners = listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          log(`Erreur dans listener ${event}: ${error}`)
        }
      })
    }
  }

  /**
   * Ajouter un message à l'historique
   */
  function addToHistory(message: WebSocketMessage): void {
    messageHistory.value.push(message)

    // Garder seulement les 50 derniers messages
    if (messageHistory.value.length > 50) {
      messageHistory.value.shift()
    }
  }

  /**
   * Logger avec préfixe WebSocket
   */
  function log(message: string): void {
    if (config.debug) {
      console.log(`[WebSocket] ${message}`)
    }
  }

  /**
   * Gérer les erreurs de connexion
   */
  async function handleConnectionError(error: Error): Promise<void> {
    const errorMsg = `Connexion échouée: ${error.message}`
    log(errorMsg)

    lastError.value = errorMsg
    reconnectCount.value++

    // Programmer une reconnexion si possible
    if (canConnect.value) {
      scheduleReconnect()
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Générer un ID unique pour les messages
   */
  function generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtenir l'URL WebSocket avec fallback sécurisé
   */
  function getWebSocketURL(endpoint: string): string {
    const wsUrl = import.meta.env.VITE_WS_URL
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

    // Si pas d'URL WebSocket configurée, essayer de deviner
    if (!wsUrl) {
      const baseUrl = appUrl.replace('http', 'ws').replace('https', 'wss')
      log(`URL WebSocket non configurée, utilisation de: ${baseUrl}${endpoint}`)
      return `${baseUrl}${endpoint}`
    }

    return `${wsUrl}${endpoint}`
  }

  /**
   * Vérifier si WebSocket est supporté
   */
  function isWebSocketSupported(): boolean {
    return typeof WebSocket !== 'undefined'
  }

  /**
   * Obtenir les statistiques de connexion
   */
  function getConnectionStats() {
    return {
      readyState: readyState.value,
      isConnected: isConnected.value,
      reconnectCount: reconnectCount.value,
      messagesSent: messageHistory.value.filter(m => m.type !== 'received').length,
      messagesReceived: messageHistory.value.filter(m => m.type === 'received').length,
      lastError: lastError.value,
      uptime: isConnected.value ? Date.now() - (new Date().getTime()) : 0
    }
  }

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================

  // Connexion automatique si configurée
  if (config.autoConnect && isWebSocketSupported()) {
    nextTick(() => {
      // Délai pour éviter les problèmes de montage
      setTimeout(connect, 100)
    })
  }

  // Nettoyage au démontage du composant
  onUnmounted(() => {
    log('Nettoyage WebSocket au démontage')
    disconnect()
    listeners.clear()
  })

  // ==========================================
  // API PUBLIQUE
  // ==========================================

  return {
    // État
    socket: readonly(socket),
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    lastError: readonly(lastError),
    connectionStatus,
    readyState,

    // Actions
    connect,
    disconnect,
    reconnect,
    send,

    // Events
    on,
    off,

    // Utilitaires
    isWebSocketSupported,
    getConnectionStats,
    messageHistory: readonly(messageHistory)
  }
}

// ==========================================
// UTILITAIRES GLOBAUX
// ==========================================

/**
 * Fonction helper pour readonly
 */
function readonly<T>(ref: import('vue').Ref<T>) {
  return computed(() => ref.value)
}
