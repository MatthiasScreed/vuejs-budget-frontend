import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/ui'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  renotify?: boolean
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  actions?: NotificationAction[]
  data?: any
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface PWANotificationSettings {
  achievements: boolean
  level_ups: boolean
  goal_reminders: boolean
  streak_reminders: boolean
  challenge_updates: boolean
  friend_activities: boolean
  marketing: boolean
  quiet_hours: {
    enabled: boolean
    start: string // "22:00"
    end: string   // "08:00"
  }
}

/**
 * Composable pour notifications push PWA
 * Permissions, subscriptions, envoi, gestion avancée
 */
export function usePWANotifications() {
  const notifications = useNotifications()

  // State
  const permission = ref<NotificationPermission>(Notification.permission || 'default')
  const subscription = ref<PushSubscription | null>(null)
  const isSubscribed = ref(false)
  const vapidPublicKey = ref(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
  const settings = ref<PWANotificationSettings>({
    achievements: true,
    level_ups: true,
    goal_reminders: true,
    streak_reminders: true,
    challenge_updates: true,
    friend_activities: false,
    marketing: false,
    quiet_hours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  })

  /**
   * Initialiser les notifications PWA
   */
  async function initPWANotifications(): Promise<void> {
    checkNotificationSupport()
    await loadSettings()
    await loadExistingSubscription()
    setupServiceWorkerListeners()

    log('PWA Notifications initialisées')
  }

  /**
   * Vérifier le support des notifications
   */
  function checkNotificationSupport(): boolean {
    const supported = 'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window

    if (!supported) {
      log('Notifications push non supportées')
    }

    return supported
  }

  /**
   * Demander la permission de notifications
   */
  async function requestPermission(): Promise<boolean> {
    if (!checkNotificationSupport()) {
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result

      log(`Permission notifications: ${result}`)

      if (result === 'granted') {
        await subscribeToNotifications()

        notifications.success('🔔 Notifications activées !', {
          title: '✅ Permissions accordées',
          duration: 4000
        })

        return true
      } else if (result === 'denied') {
        notifications.warning('Notifications désactivées. Vous pouvez les réactiver dans les paramètres du navigateur.', {
          title: '🔕 Permissions refusées',
          duration: 6000
        })

        return false
      }

      return false
    } catch (error: any) {
      log('Erreur demande permission:', error)
      return false
    }
  }

  /**
   * S'abonner aux notifications push
   */
  async function subscribeToNotifications(): Promise<boolean> {
    if (permission.value !== 'granted' || !checkNotificationSupport()) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Vérifier si déjà abonné
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        subscription.value = existingSubscription as any
        isSubscribed.value = true
        await sendSubscriptionToServer(existingSubscription as any)
        return true
      }

      // Créer nouvelle subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidPublicKey.value)
      })

      subscription.value = newSubscription as any
      isSubscribed.value = true

      // Envoyer au serveur
      await sendSubscriptionToServer(newSubscription as any)

      log('Subscription notifications créée')
      return true

    } catch (error: any) {
      log('Erreur subscription notifications:', error)
      return false
    }
  }

  /**
   * Se désabonner des notifications
   */
  async function unsubscribeFromNotifications(): Promise<boolean> {
    try {
      if (subscription.value) {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()

        if (sub) {
          await sub.unsubscribe()
          await removeSubscriptionFromServer()
        }
      }

      subscription.value = null
      isSubscribed.value = false

      notifications.info('🔕 Notifications désactivées', {
        title: 'Désabonnement réussi',
        duration: 3000
      })

      log('Désabonné des notifications')
      return true

    } catch (error: any) {
      log('Erreur désabonnement:', error)
      return false
    }
  }

  /**
   * Envoyer la subscription au serveur
   */
  async function sendSubscriptionToServer(sub: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          subscription: sub,
          settings: settings.value
        })
      })

      if (!response.ok) {
        throw new Error('Erreur envoi subscription au serveur')
      }

      log('Subscription envoyée au serveur')

    } catch (error: any) {
      log('Erreur envoi subscription:', error)
    }
  }

  /**
   * Supprimer la subscription du serveur
   */
  async function removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      log('Subscription supprimée du serveur')

    } catch (error: any) {
      log('Erreur suppression subscription:', error)
    }
  }

  /**
   * Afficher une notification locale
   */
  function showLocalNotification(payload: NotificationPayload): void {
    if (permission.value !== 'granted') {
      log('Permission non accordée pour notification locale')
      return
    }

    // Vérifier les heures silencieuses
    if (isQuietHours()) {
      log('Notification bloquée - heures silencieuses')
      return
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      image: payload.image,
      tag: payload.tag || 'default',
      renotify: payload.renotify || false,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      vibrate: payload.vibrate || [200, 100, 200],
      actions: payload.actions || [],
      data: payload.data || {}
    })

    // Auto-fermeture après 6 secondes si pas requireInteraction
    if (!payload.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 6000)
    }

    // Gestion des clics
    notification.onclick = () => {
      window.focus()
      if (payload.data?.url) {
        window.location.href = payload.data.url
      }
      notification.close()
    }

    log('Notification locale affichée:', payload.title)
  }

  /**
   * Notifications gaming spécialisées
   */
  const gamingNotifications = {
    /**
     * Notification achievement débloqué
     */
    achievement: (name: string, xp: number, rarity: string) => {
      if (!settings.value.achievements) return

      const rarityEmojis = {
        common: '🥉',
        rare: '🥈',
        epic: '🥇',
        legendary: '👑'
      }

      showLocalNotification({
        title: `${rarityEmojis[rarity as keyof typeof rarityEmojis] || '🏆'} Achievement Débloqué !`,
        body: `"${name}" - +${xp} XP`,
        tag: 'achievement',
        requireInteraction: rarity === 'legendary',
        vibrate: rarity === 'legendary' ? [300, 200, 300, 200, 500] : [200, 100, 200],
        actions: [
          { action: 'view', title: 'Voir mes succès', icon: '/icons/trophy.png' },
          { action: 'share', title: 'Partager', icon: '/icons/share.png' }
        ],
        data: { type: 'achievement', url: '/gaming/achievements' }
      })
    },

    /**
     * Notification level up
     */
    levelUp: (oldLevel: number, newLevel: number, xpGained: number) => {
      if (!settings.value.level_ups) return

      showLocalNotification({
        title: '🎉 Niveau Supérieur !',
        body: `Niveau ${oldLevel} → ${newLevel} (+${xpGained} XP)`,
        tag: 'level_up',
        requireInteraction: true,
        vibrate: [300, 200, 300, 200, 500],
        actions: [
          { action: 'dashboard', title: 'Voir progression', icon: '/icons/chart.png' },
          { action: 'celebrate', title: 'Célébrer', icon: '/icons/party.png' }
        ],
        data: { type: 'level_up', url: '/gaming/dashboard' }
      })
    },

    /**
     * Notification rappel objectif
     */
    goalReminder: (goalName: string, daysLeft: number, progressPercent: number) => {
      if (!settings.value.goal_reminders) return

      showLocalNotification({
        title: '🎯 Rappel Objectif',
        body: `"${goalName}" - ${progressPercent}% complété, ${daysLeft} jours restants`,
        tag: 'goal_reminder',
        vibrate: [150, 100, 150],
        actions: [
          { action: 'contribute', title: 'Contribuer', icon: '/icons/plus.png' },
          { action: 'view', title: 'Voir détails', icon: '/icons/eye.png' }
        ],
        data: { type: 'goal_reminder', url: '/goals' }
      })
    },

    /**
     * Notification streak
     */
    streakReminder: (streakName: string, currentDays: number, isAtRisk: boolean) => {
      if (!settings.value.streak_reminders) return

      const title = isAtRisk ? '⚠️ Streak en Danger !' : '🔥 Maintenir la Série'
      const body = isAtRisk
        ? `"${streakName}" - ${currentDays} jours ! Ne perdez pas votre progression`
        : `"${streakName}" - ${currentDays} jours de suite !`

      showLocalNotification({
        title,
        body,
        tag: 'streak',
        vibrate: isAtRisk ? [200, 100, 200, 100, 200] : [200, 100, 200],
        actions: [
          { action: 'maintain', title: 'Maintenir', icon: '/icons/fire.png' },
          { action: 'view', title: 'Voir streaks', icon: '/icons/calendar.png' }
        ],
        data: { type: 'streak', url: '/gaming/streaks' }
      })
    }
  }

  /**
   * Mettre à jour les paramètres de notifications
   */
  async function updateSettings(newSettings: Partial<PWANotificationSettings>): Promise<void> {
    settings.value = { ...settings.value, ...newSettings }
    await saveSettings()

    // Mettre à jour sur le serveur
    if (isSubscribed.value) {
      await sendSubscriptionToServer(subscription.value!)
    }

    log('Paramètres notifications mis à jour')
  }

  /**
   * Sauvegarder les paramètres localement
   */
  async function saveSettings(): Promise<void> {
    localStorage.setItem('pwa_notification_settings', JSON.stringify(settings.value))
  }

  /**
   * Charger les paramètres sauvegardés
   */
  async function loadSettings(): Promise<void> {
    const saved = localStorage.getItem('pwa_notification_settings')

    if (saved) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(saved) }
      } catch (error) {
        log('Erreur chargement paramètres notifications')
      }
    }
  }

  /**
   * Charger la subscription existante
   */
  async function loadExistingSubscription(): Promise<void> {
    if (!checkNotificationSupport() || permission.value !== 'granted') {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        subscription.value = existingSubscription as any
        isSubscribed.value = true
        log('Subscription existante trouvée')
      }
    } catch (error: any) {
      log('Erreur chargement subscription:', error)
    }
  }

  /**
   * Setup des listeners Service Worker
   */
  function setupServiceWorkerListeners(): void {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data

      switch (type) {
        case 'NOTIFICATION_CLICKED':
          handleNotificationClick(data)
          break
        case 'NOTIFICATION_CLOSED':
          handleNotificationClose(data)
          break
      }
    })
  }

  /**
   * Gérer clic sur notification
   */
  function handleNotificationClick(data: any): void {
    log('Notification cliquée:', data)

    // Tracking analytics
    trackNotificationEvent('notification_clicked', data)

    // Navigation si URL fournie
    if (data.url) {
      window.location.href = data.url
    }
  }

  /**
   * Gérer fermeture notification
   */
  function handleNotificationClose(data: any): void {
    log('Notification fermée:', data)
    trackNotificationEvent('notification_dismissed', data)
  }

  /**
   * Vérifier si c'est les heures silencieuses
   */
  function isQuietHours(): boolean {
    if (!settings.value.quiet_hours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = settings.value.quiet_hours.start.split(':').map(Number)
    const [endHour, endMin] = settings.value.quiet_hours.end.split(':').map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Gérer le cas où les heures silencieuses passent minuit
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    } else {
      return currentTime >= startTime && currentTime <= endTime
    }
  }

  /**
   * Tracker les événements de notifications
   */
  function trackNotificationEvent(event: string, data: any): void {
    log(`📊 Tracking notification: ${event}`, data)

    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        event_category: 'pwa_notifications',
        event_label: data.type || 'unknown'
      })
    }
  }

  /**
   * Convertir base64 en Uint8Array pour VAPID
   */
  function urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)))
  }

  /**
   * Obtenir le token d'authentification
   */
  function getAuthToken(): string {
    return localStorage.getItem('auth_token') || ''
  }

  /**
   * Tester les notifications
   */
  function testNotifications(): void {
    gamingNotifications.achievement('Test Achievement', 100, 'epic')

    setTimeout(() => {
      gamingNotifications.levelUp(4, 5, 150)
    }, 2000)

    setTimeout(() => {
      gamingNotifications.goalReminder('Test Goal', 7, 65)
    }, 4000)

    setTimeout(() => {
      gamingNotifications.streakReminder('Daily Login', 15, false)
    }, 6000)
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWANotifications]', ...args)
  }

  // Computed properties
  const notificationSupport = computed(() => checkNotificationSupport())

  const canRequestPermission = computed(() =>
    notificationSupport.value && permission.value === 'default'
  )

  const isPermissionGranted = computed(() => permission.value === 'granted')

  const subscriptionStatus = computed(() => {
    if (!notificationSupport.value) return 'unsupported'
    if (permission.value === 'denied') return 'denied'
    if (permission.value === 'default') return 'default'
    if (isSubscribed.value) return 'subscribed'
    return 'granted_unsubscribed'
  })

  // Auto-init
  onMounted(() => {
    initPWANotifications()
  })

  return {
    // State
    permission,
    subscription,
    isSubscribed,
    settings,

    // Computed
    notificationSupport,
    canRequestPermission,
    isPermissionGranted,
    subscriptionStatus,

    // Methods
    initPWANotifications,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    showLocalNotification,
    updateSettings,
    testNotifications,

    // Gaming notifications
    gamingNotifications
  }
}
