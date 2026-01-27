// src/composables/ui/useGamingNotifications.ts
import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'

interface GamingNotification {
  id: string
  type: 'achievement' | 'level_up' | 'streak' | 'challenge' | 'xp_gained' | 'budget_alert'
  title: string
  message: string
  icon: string
  color: string
  duration: number
  timestamp: number
  read: boolean
  data?: any
}

interface NotificationSound {
  achievement: string
  level_up: string
  streak: string
  challenge: string
  xp_gained: string
  budget_alert: string
}

/**
 * Composable pour notifications gaming immersives
 * Animations, sons, badges et système de récompenses visuelles
 */
export function useGamingNotifications() {
  const toast = useToast()

  // State
  const notifications = ref<GamingNotification[]>([])
  const soundEnabled = ref(true)
  const animationsEnabled = ref(true)

  // Configuration des sons
  const sounds: NotificationSound = {
    achievement: '/sounds/achievement.mp3',
    level_up: '/sounds/level-up.mp3',
    streak: '/sounds/streak.mp3',
    challenge: '/sounds/challenge.mp3',
    xp_gained: '/sounds/xp-gain.mp3',
    budget_alert: '/sounds/budget-alert.mp3'
  }

  /**
   * Notification de succès débloqué
   */
  function notifyAchievement(
    title: string,
    description: string,
    icon: string = '🏆',
    xpReward?: number
  ): void {
    const notification = createNotification({
      type: 'achievement',
      title: `🎉 Succès débloqué: ${title}`,
      message: description + (xpReward ? ` (+${xpReward} XP)` : ''),
      icon,
      color: 'from-yellow-400 to-orange-500',
      duration: 8000,
      data: { xpReward }
    })

    showGamingToast(notification)
    playSound('achievement')
    addToHistory(notification)
  }

  /**
   * Notification de montée de niveau
   */
  function notifyLevelUp(
    newLevel: number,
    rewards: string[] = [],
    nextLevelXp?: number
  ): void {
    const notification = createNotification({
      type: 'level_up',
      title: `🚀 Niveau ${newLevel} atteint !`,
      message: rewards.length > 0
        ? `Récompenses: ${rewards.join(', ')}`
        : 'Félicitations pour votre progression !',
      icon: '⭐',
      color: 'from-purple-400 to-pink-500',
      duration: 10000,
      data: { newLevel, rewards, nextLevelXp }
    })

    showGamingToast(notification)
    playSound('level_up')
    addToHistory(notification)
  }

  /**
   * Notification de série (streak)
   */
  function notifyStreak(
    streakDays: number,
    bonusXp: number,
    nextMilestone?: number
  ): void {
    const notification = createNotification({
      type: 'streak',
      title: `🔥 Série de ${streakDays} jours !`,
      message: `Bonus de série: +${bonusXp} XP` +
        (nextMilestone ? ` | Prochain palier: ${nextMilestone} jours` : ''),
      icon: '🔥',
      color: 'from-orange-400 to-red-500',
      duration: 6000,
      data: { streakDays, bonusXp, nextMilestone }
    })

    showGamingToast(notification)
    playSound('streak')
    addToHistory(notification)
  }

  /**
   * Notification de défi
   */
  function notifyChallenge(
    challengeTitle: string,
    status: 'started' | 'progress' | 'completed' | 'failed',
    progress?: { current: number; target: number },
    reward?: { xp: number; badge?: string }
  ): void {
    let title = ''
    let message = ''
    let icon = ''
    let color = ''
    let duration = 5000

    switch (status) {
      case 'started':
        title = `🎯 Nouveau défi: ${challengeTitle}`
        message = progress ? `Objectif: ${progress.target}` : 'Bonne chance !'
        icon = '🎯'
        color = 'from-blue-400 to-cyan-500'
        break

      case 'progress':
        title = `📈 Défi en cours: ${challengeTitle}`
        message = progress
          ? `Progression: ${progress.current}/${progress.target}`
          : 'Continue comme ça !'
        icon = '📈'
        color = 'from-green-400 to-blue-500'
        break

      case 'completed':
        title = `✅ Défi réussi: ${challengeTitle}`
        message = reward
          ? `Récompense: +${reward.xp} XP` + (reward.badge ? ` + ${reward.badge}` : '')
          : 'Félicitations !'
        icon = '✅'
        color = 'from-green-400 to-emerald-500'
        duration = 8000
        break

      case 'failed':
        title = `❌ Défi échoué: ${challengeTitle}`
        message = 'Ne vous découragez pas, essayez encore !'
        icon = '❌'
        color = 'from-gray-400 to-gray-600'
        break
    }

    const notification = createNotification({
      type: 'challenge',
      title,
      message,
      icon,
      color,
      duration,
      data: { challengeTitle, status, progress, reward }
    })

    showGamingToast(notification)
    playSound('challenge')
    addToHistory(notification)
  }

  /**
   * Notification de gain d'XP
   */
  function notifyXPGained(
    xpAmount: number,
    action: string,
    multiplier?: number
  ): void {
    const notification = createNotification({
      type: 'xp_gained',
      title: `+${xpAmount} XP`,
      message: `${action}` + (multiplier ? ` (x${multiplier} bonus)` : ''),
      icon: '⚡',
      color: 'from-cyan-400 to-blue-500',
      duration: 3000,
      data: { xpAmount, action, multiplier }
    })

    showGamingToast(notification)
    playSound('xp_gained')
    addToHistory(notification)
  }

  /**
   * Notification d'alerte budget avec gamification
   */
  function notifyBudgetAlert(
    type: 'overspend' | 'goal_reached' | 'savings_opportunity',
    amount: number,
    category?: string,
    suggestion?: string
  ): void {
    let title = ''
    let message = ''
    let icon = ''
    let color = ''

    switch (type) {
      case 'overspend':
        title = '⚠️ Budget dépassé'
        message = `${category}: +${amount}€ au-dessus du budget`
        icon = '⚠️'
        color = 'from-red-400 to-orange-500'
        break

      case 'goal_reached':
        title = '🎯 Objectif atteint !'
        message = `${category}: ${amount}€ d'économisé`
        icon = '🎯'
        color = 'from-green-400 to-emerald-500'
        break

      case 'savings_opportunity':
        title = '💡 Opportunité d\'économie'
        message = `Vous pourriez économiser ${amount}€`
        icon = '💡'
        color = 'from-yellow-400 to-green-500'
        break
    }

    if (suggestion) {
      message += ` | ${suggestion}`
    }

    const notification = createNotification({
      type: 'budget_alert',
      title,
      message,
      icon,
      color,
      duration: 7000,
      data: { type, amount, category, suggestion }
    })

    showGamingToast(notification)
    playSound('budget_alert')
    addToHistory(notification)
  }

  /**
   * Créer un objet notification
   */
  function createNotification(params: Partial<GamingNotification>): GamingNotification {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: params.type || 'achievement',
      title: params.title || '',
      message: params.message || '',
      icon: params.icon || '🎮',
      color: params.color || 'from-blue-400 to-purple-500',
      duration: params.duration || 5000,
      timestamp: Date.now(),
      read: false,
      data: params.data
    }
  }

  /**
   * Afficher un toast gaming personnalisé
   */
  function showGamingToast(notification: GamingNotification): void {
    const toastContent = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">${notification.icon}</div>
        <div class="flex-1">
          <div class="font-bold text-white">${notification.title}</div>
          <div class="text-gray-200 text-sm">${notification.message}</div>
        </div>
      </div>
    `

    toast(toastContent, {
      timeout: notification.duration,
      hideProgressBar: false,
      closeButton: true,
      className: `gaming-toast gaming-toast-${notification.type}`,
      bodyClassName: `bg-gradient-to-r ${notification.color} text-white rounded-lg`,
      progressClassName: 'gaming-progress-bar',
    })
  }

  /**
   * Jouer un son de notification
   */
  function playSound(soundType: keyof NotificationSound): void {
    if (!soundEnabled.value) return

    try {
      const audio = new Audio(sounds[soundType])
      audio.volume = 0.6
      audio.play().catch(err => {
        console.warn('Cannot play notification sound:', err)
      })
    } catch (error) {
      console.warn('Sound not available:', soundType)
    }
  }

  /**
   * Ajouter à l'historique des notifications
   */
  function addToHistory(notification: GamingNotification): void {
    notifications.value.unshift(notification)

    // Garder seulement les 50 dernières notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }

    saveNotificationHistory()
  }

  /**
   * Marquer une notification comme lue
   */
  function markAsRead(notificationId: string): void {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      saveNotificationHistory()
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  function markAllAsRead(): void {
    notifications.value.forEach(n => n.read = true)
    saveNotificationHistory()
  }

  /**
   * Supprimer une notification
   */
  function removeNotification(notificationId: string): void {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
      saveNotificationHistory()
    }
  }

  /**
   * Effacer l'historique
   */
  function clearHistory(): void {
    notifications.value = []
    localStorage.removeItem('gaming_notifications_history')
  }

  /**
   * Obtenir les notifications non lues
   */
  function getUnreadNotifications(): GamingNotification[] {
    return notifications.value.filter(n => !n.read)
  }

  /**
   * Obtenir les notifications par type
   */
  function getNotificationsByType(type: GamingNotification['type']): GamingNotification[] {
    return notifications.value.filter(n => n.type === type)
  }

  /**
   * Sauvegarder l'historique des notifications
   */
  function saveNotificationHistory(): void {
    try {
      localStorage.setItem('gaming_notifications_history', JSON.stringify(notifications.value))
    } catch (error) {
      console.warn('Cannot save notification history:', error)
    }
  }

  /**
   * Charger l'historique des notifications
   */
  function loadNotificationHistory(): void {
    try {
      const saved = localStorage.getItem('gaming_notifications_history')
      if (saved) {
        notifications.value = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Cannot load notification history:', error)
    }
  }

  /**
   * Configurer les préférences de notifications
   */
  function setPreferences(preferences: {
    soundEnabled?: boolean
    animationsEnabled?: boolean
  }): void {
    if (preferences.soundEnabled !== undefined) {
      soundEnabled.value = preferences.soundEnabled
    }
    if (preferences.animationsEnabled !== undefined) {
      animationsEnabled.value = preferences.animationsEnabled
    }

    localStorage.setItem('gaming_notification_preferences', JSON.stringify({
      soundEnabled: soundEnabled.value,
      animationsEnabled: animationsEnabled.value
    }))
  }

  /**
   * Charger les préférences
   */
  function loadPreferences(): void {
    try {
      const saved = localStorage.getItem('gaming_notification_preferences')
      if (saved) {
        const prefs = JSON.parse(saved)
        soundEnabled.value = prefs.soundEnabled ?? true
        animationsEnabled.value = prefs.animationsEnabled ?? true
      }
    } catch (error) {
      console.warn('Cannot load notification preferences:', error)
    }
  }

  // Initialisation
  loadNotificationHistory()
  loadPreferences()

  return {
    // State
    notifications,
    soundEnabled,
    animationsEnabled,

    // Méthodes de notification
    notifyAchievement,
    notifyLevelUp,
    notifyStreak,
    notifyChallenge,
    notifyXPGained,
    notifyBudgetAlert,

    // Gestion des notifications
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearHistory,

    // Utilitaires
    getUnreadNotifications,
    getNotificationsByType,
    setPreferences,
    playSound
  }
}
