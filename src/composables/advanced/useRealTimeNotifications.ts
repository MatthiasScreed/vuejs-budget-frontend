import { ref, computed } from 'vue'
import { useWebSocket } from './useWebSocket'
import { useNotifications } from '@/composables/ui'

interface LiveNotification {
  id: string
  type: 'global' | 'personal' | 'friend' | 'challenge' | 'achievement'
  priority: 'low' | 'normal' | 'high' | 'critical'
  title: string
  message: string
  data: any
  timestamp: number
  expires_at?: number
  target_users?: number[]
}

interface NotificationSettings {
  achievements: boolean
  level_ups: boolean
  challenges: boolean
  friend_activity: boolean
  global_events: boolean
  leaderboard_changes: boolean
  marketing: boolean
}

/**
 * Composable pour notifications gaming temps réel
 * Push notifications, événements live, activité communautaire
 */
export function useRealTimeNotifications() {
  const ws = useWebSocket('/notifications')
  const notifications = useNotifications()

  // State
  const liveNotifications = ref<LiveNotification[]>([])
  const settings = ref<NotificationSettings>({
    achievements: true,
    level_ups: true,
    challenges: true,
    friend_activity: true,
    global_events: false,
    leaderboard_changes: true,
    marketing: false
  })
  const isSubscribed = ref(false)

  /**
   * Initialiser les notifications temps réel
   */
  async function initLiveNotifications(): Promise<void> {
    await ws.connect()

    if (ws.isConnected.value) {
      await subscribeToNotifications()
      loadNotificationSettings()
    }
  }

  /**
   * S'abonner aux notifications
   */
  async function subscribeToNotifications(): Promise<void> {
    // S'abonner aux types d'événements
    ws.on('live_notification', handleLiveNotification)
    ws.on('achievement_broadcast', handleAchievementBroadcast)
    ws.on('friend_activity', handleFriendActivity)
    ws.on('global_event', handleGlobalEvent)
    ws.on('challenge_broadcast', handleChallengeBroadcast)
    ws.on('leaderboard_broadcast', handleLeaderboardBroadcast)

    // Envoyer les préférences au serveur
    ws.send('notifications', 'subscribe', {
      user_id: getCurrentUserId(),
      settings: settings.value
    })

    isSubscribed.value = true
    log('Abonnement notifications live activé')
  }

  /**
   * Gérer notification live reçue
   */
  function handleLiveNotification(data: LiveNotification): void {
    // Vérifier si l'utilisateur veut ce type de notification
    if (!shouldShowNotification(data)) {
      return
    }

    // Ajouter à l'historique live
    addLiveNotification(data)

    // Afficher notification locale
    showLocalNotification(data)

    log('Notification live reçue:', data)
  }

  /**
   * Gérer broadcast d'achievement
   */
  function handleAchievementBroadcast(data: any): void {
    if (!settings.value.achievements) return

    const notification: LiveNotification = {
      id: generateNotificationId(),
      type: 'achievement',
      priority: 'normal',
      title: '🏆 Achievement Communautaire',
      message: `${data.user_name} a débloqué "${data.achievement_name}" !`,
      data,
      timestamp: Date.now()
    }

    addLiveNotification(notification)

    // Notification subtile pour événements communautaires
    if (data.rarity === 'legendary') {
      notifications.info(notification.message, {
        title: '👑 Achievement Légendaire !',
        duration: 3000,
        icon: '👑'
      })
    }
  }

  /**
   * Gérer activité des amis
   */
  function handleFriendActivity(data: any): void {
    if (!settings.value.friend_activity) return

    const activities = {
      level_up: `🎉 ${data.friend_name} a atteint le niveau ${data.new_level} !`,
      goal_completed: `🎯 ${data.friend_name} a atteint son objectif "${data.goal_name}" !`,
      challenge_won: `🏆 ${data.friend_name} a gagné le défi "${data.challenge_name}" !`
    }

    const message = activities[data.activity_type as keyof typeof activities]

    if (message) {
      notifications.info(message, {
        title: '👥 Activité Amis',
        duration: 4000,
        actions: [
          { label: 'Féliciter', action: 'congratulate', url: `/users/${data.friend_id}` }
        ]
      })
    }
  }

  /**
   * Gérer événements globaux
   */
  function handleGlobalEvent(data: any): void {
    if (!settings.value.global_events) return

    const globalEvents = {
      server_milestone: `🎊 ${data.milestone_name} atteint par la communauté !`,
      new_feature: `✨ Nouvelle fonctionnalité : ${data.feature_name}`,
      maintenance: `🔧 Maintenance prévue : ${data.maintenance_time}`
    }

    const message = globalEvents[data.event_type as keyof typeof globalEvents]

    if (message) {
      notifications.info(message, {
        title: '📢 Événement Global',
        duration: data.duration || 6000,
        priority: data.priority || 'normal'
      })
    }
  }

  /**
   * Gérer broadcast de défi
   */
  function handleChallengeBroadcast(data: any): void {
    if (!settings.value.challenges) return

    const challengeEvents = {
      new_challenge: `⚔️ Nouveau défi : "${data.challenge_name}" !`,
      challenge_ending: `⏰ Défi "${data.challenge_name}" se termine dans ${data.hours_left}h !`,
      winner_announced: `🏆 Gagnant du défi "${data.challenge_name}" : ${data.winner_name} !`
    }

    const message = challengeEvents[data.event_type as keyof typeof challengeEvents]

    if (message) {
      notifications.info(message, {
        title: '⚔️ Défi Communautaire',
        duration: 5000,
        actions: data.event_type === 'new_challenge' ? [
          { label: 'Participer', action: 'join_challenge', url: `/challenges/${data.challenge_id}` }
        ] : undefined
      })
    }
  }

  /**
   * Gérer broadcast leaderboard
   */
  function handleLeaderboardBroadcast(data: any): void {
    if (!settings.value.leaderboard_changes) return

    // Notification seulement si changement significatif du top 10
    if (data.significant_change) {
      notifications.info(`📊 ${data.user_name} entre dans le top ${data.new_rank} ${data.leaderboard_type} !`, {
        title: '📈 Leaderboard Update',
        duration: 3000
      })
    }
  }

  /**
   * Vérifier si on doit afficher la notification
   */
  function shouldShowNotification(notification: LiveNotification): boolean {
    // Vérifier expiration
    if (notification.expires_at && Date.now() > notification.expires_at) {
      return false
    }

    // Vérifier ciblage
    if (notification.target_users && notification.target_users.length > 0) {
      return notification.target_users.includes(getCurrentUserId())
    }

    // Vérifier préférences utilisateur
    switch (notification.type) {
      case 'achievement':
        return settings.value.achievements
      case 'challenge':
        return settings.value.challenges
      case 'friend':
        return settings.value.friend_activity
      case 'global':
        return settings.value.global_events
      default:
        return true
    }
  }

  /**
   * Afficher notification locale
   */
  function showLocalNotification(liveNotif: LiveNotification): void {
    const duration = liveNotif.priority === 'critical' ? 0 : 5000

    notifications.create(
      liveNotif.type === 'achievement' ? 'achievement' : 'info',
      liveNotif.message,
      {
        title: liveNotif.title,
        duration,
        priority: liveNotif.priority,
        data: liveNotif.data
      }
    )
  }

  /**
   * Mettre à jour les paramètres de notifications
   */
  async function updateNotificationSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    settings.value = { ...settings.value, ...newSettings }

    // Sauvegarder localement
    localStorage.setItem('notification_settings', JSON.stringify(settings.value))

    // Envoyer au serveur
    if (ws.isConnected.value) {
      ws.send('notifications', 'update_settings', {
        user_id: getCurrentUserId(),
        settings: settings.value
      })
    }
  }

  /**
   * Charger les paramètres de notifications
   */
  function loadNotificationSettings(): void {
    const saved = localStorage.getItem('notification_settings')

    if (saved) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(saved) }
      } catch (error) {
        log('Erreur chargement settings:', error)
      }
    }
  }

  /**
   * Tester les notifications
   */
  function testNotifications(): void {
    notifications.achievement('Test Achievement', 100, 'epic')
    notifications.levelUp(4, 5, 150)
    notifications.streakMilestone('Test Streak', 30)
  }

  /**
   * Ajouter notification live à l'historique
   */
  function addLiveNotification(notification: LiveNotification): void {
    liveNotifications.value.unshift(notification)

    // Limiter à 100 notifications
    if (liveNotifications.value.length > 100) {
      liveNotifications.value = liveNotifications.value.slice(0, 100)
    }
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  function getCurrentUserId(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.id || 0 : 0
  }

  /**
   * Générer ID de notification
   */
  function generateNotificationId(): string {
    return `live_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[LiveNotifications]', ...args)
  }

  // Computed properties
  const personalNotifications = computed(() =>
    liveNotifications.value.filter(n => n.type === 'personal')
  )

  const communityNotifications = computed(() =>
    liveNotifications.value.filter(n => n.type === 'global' && n.priority !== 'low')
  )

  const criticalNotifications = computed(() =>
    liveNotifications.value.filter(n => n.priority === 'critical')
  )

  const notificationPermissions = computed(() => {
    return 'Notification' in window ? Notification.permission : 'default'
  })

  return {
    // State
    liveNotifications,
    settings,
    isSubscribed,

    // Computed
    personalNotifications,
    communityNotifications,
    criticalNotifications,
    notificationPermissions,

    // Methods
    initLiveNotifications,
    updateNotificationSettings,
    testNotifications,
    loadNotificationSettings
  }
}
