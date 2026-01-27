import { ref, computed } from 'vue'
import { useFormatting } from './useFormatting'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'gaming'
  title: string
  message: string
  duration: number // 0 = persistent
  priority: 'low' | 'normal' | 'high' | 'critical'
  icon?: string
  image?: string
  actions?: NotificationAction[]
  data?: any
  timestamp: Date
  read: boolean
  dismissed: boolean
}

interface NotificationAction {
  label: string
  action: string
  style?: 'primary' | 'secondary' | 'danger'
  url?: string
}

interface NotificationOptions {
  title?: string
  duration?: number
  priority?: Notification['priority']
  icon?: string
  image?: string
  actions?: NotificationAction[]
  data?: any
}

/**
 * Composable pour système de notifications avancé
 * Gaming, business, queue intelligente, persistance
 */
export function useNotifications() {
  const { formatCurrency } = useFormatting()

  // State
  const notifications = ref<Notification[]>([])
  const maxNotifications = ref(50)
  const defaultDuration = ref(5000)

  /**
   * Créer une notification
   */
  function create(
    type: Notification['type'],
    message: string,
    options: NotificationOptions = {}
  ): string {
    const notification: Notification = {
      id: generateId(),
      type,
      title: options.title || getDefaultTitle(type),
      message,
      duration: options.duration ?? getDefaultDuration(type),
      priority: options.priority || 'normal',
      icon: options.icon || getDefaultIcon(type),
      image: options.image,
      actions: options.actions,
      data: options.data,
      timestamp: new Date(),
      read: false,
      dismissed: false
    }

    addNotification(notification)
    return notification.id
  }

  /**
   * Notifications spécialisées - Success
   */
  function success(message: string, options: NotificationOptions = {}): string {
    return create('success', message, options)
  }

  /**
   * Notifications spécialisées - Error
   */
  function error(message: string, options: NotificationOptions = {}): string {
    return create('error', message, {
      duration: 0, // Persistent par défaut
      priority: 'high',
      ...options
    })
  }

  /**
   * Notifications spécialisées - Warning
   */
  function warning(message: string, options: NotificationOptions = {}): string {
    return create('warning', message, {
      priority: 'normal',
      ...options
    })
  }

  /**
   * Notifications spécialisées - Info
   */
  function info(message: string, options: NotificationOptions = {}): string {
    return create('info', message, options)
  }

  /**
   * Notification Achievement Gaming
   */
  function achievement(
    achievementName: string,
    xpGained: number = 0,
    rarity: string = 'common'
  ): string {
    return create('achievement', `Achievement débloqué : ${achievementName}`, {
      title: `🏆 ${getRarityIcon(rarity)} Nouveau succès !`,
      duration: 8000,
      priority: 'high',
      icon: '🏆',
      actions: [
        { label: 'Voir mes succès', action: 'view_achievements', url: '/achievements' }
      ],
      data: { achievementName, xpGained, rarity }
    })
  }

  /**
   * Notification Level Up
   */
  function levelUp(oldLevel: number, newLevel: number, xpGained: number): string {
    return create('gaming', `Félicitations ! Vous êtes maintenant niveau ${newLevel} !`, {
      title: '🎉 LEVEL UP !',
      duration: 10000,
      priority: 'critical',
      icon: '🎉',
      actions: [
        { label: 'Voir mon profil', action: 'view_profile', url: '/profile' }
      ],
      data: { oldLevel, newLevel, xpGained }
    })
  }

  /**
   * Notification Streak Milestone
   */
  function streakMilestone(streakName: string, days: number): string {
    const title = getStreakTitle(days)
    const message = `${days} jours de suite pour "${streakName}" !`

    return create('gaming', message, {
      title,
      duration: days >= 30 ? 8000 : 5000,
      priority: days >= 100 ? 'critical' : 'high',
      icon: '🔥',
      data: { streakName, days }
    })
  }

  /**
   * Notification Goal Progress
   */
  function goalProgress(goalName: string, progress: number, amountSaved: number): string {
    const isCompleted = progress >= 100

    return create('success',
      isCompleted
        ? `Bravo ! "${goalName}" atteint avec ${formatCurrency(amountSaved)} !`
        : `${progress}% accompli pour "${goalName}" !`,
      {
        title: isCompleted ? '🎯 Objectif atteint !' : '📈 Étape franchie !',
        priority: isCompleted ? 'high' : 'normal',
        icon: isCompleted ? '🎯' : '📈',
        actions: isCompleted ? [
          { label: 'Voir mes succès', action: 'view_goals', url: '/goals' }
        ] : [
          { label: 'Continuer', action: 'view_goals', url: '/goals' }
        ],
        data: { goalName, progress, amountSaved }
      }
    )
  }

  /**
   * Notification Budget Alert
   */
  function budgetAlert(
    type: 'overspend' | 'underspend' | 'goal_risk',
    data: any
  ): string {
    const configs = {
      overspend: {
        title: '⚠️ Budget dépassé !',
        message: `Budget "${data.categoryName}" dépassé de ${formatCurrency(data.overspend)}`,
        priority: 'high' as const,
        icon: '⚠️'
      },
      underspend: {
        title: '💡 Économies possibles !',
        message: `${formatCurrency(data.savings)} économisables sur "${data.categoryName}"`,
        priority: 'normal' as const,
        icon: '💡'
      },
      goal_risk: {
        title: '🎯 Objectif en danger !',
        message: `"${data.goalName}" risque de ne pas être atteint`,
        priority: 'high' as const,
        icon: '🎯'
      }
    }

    const config = configs[type]

    return create('warning', config.message, {
      title: config.title,
      priority: config.priority,
      icon: config.icon,
      actions: [
        {
          label: 'Voir détails',
          action: 'navigate',
          url: type === 'goal_risk' ? '/goals' : '/analytics'
        }
      ],
      data
    })
  }

  /**
   * Ajouter notification à la liste
   */
  function addNotification(notification: Notification): void {
    notifications.value.unshift(notification)

    // Limiter le nombre de notifications
    if (notifications.value.length > maxNotifications.value) {
      notifications.value = notifications.value.slice(0, maxNotifications.value)
    }

    // Auto-dismiss si durée définie
    if (notification.duration > 0) {
      setTimeout(() => {
        dismiss(notification.id)
      }, notification.duration)
    }
  }

  /**
   * Marquer comme lue
   */
  function markAsRead(id: string): void {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  /**
   * Dismisser une notification
   */
  function dismiss(id: string): void {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.dismissed = true

      // Retirer après animation
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id)
      }, 300)
    }
  }

  /**
   * Vider toutes les notifications
   */
  function clear(): void {
    notifications.value = []
  }

  /**
   * Marquer toutes comme lues
   */
  function markAllAsRead(): void {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  /**
   * Obtenir titre par défaut selon type
   */
  function getDefaultTitle(type: Notification['type']): string {
    const titles = {
      success: '✅ Succès',
      error: '❌ Erreur',
      warning: '⚠️ Attention',
      info: 'ℹ️ Information',
      achievement: '🏆 Achievement',
      gaming: '🎮 Gaming'
    }

    return titles[type]
  }

  /**
   * Obtenir icône par défaut selon type
   */
  function getDefaultIcon(type: Notification['type']): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      achievement: '🏆',
      gaming: '🎮'
    }

    return icons[type]
  }

  /**
   * Obtenir durée par défaut selon type
   */
  function getDefaultDuration(type: Notification['type']): number {
    const durations = {
      success: 4000,
      error: 0, // Persistent
      warning: 6000,
      info: 5000,
      achievement: 8000,
      gaming: 6000
    }

    return durations[type]
  }

  /**
   * Obtenir icône de rareté
   */
  function getRarityIcon(rarity: string): string {
    const icons = {
      common: '🥉',
      uncommon: '🥈',
      rare: '🥇',
      epic: '💎',
      legendary: '👑'
    }

    return icons[rarity as keyof typeof icons] || '🏆'
  }

  /**
   * Obtenir titre de streak selon jours
   */
  function getStreakTitle(days: number): string {
    if (days === 365) return '🎊 UN AN DE STREAK !'
    if (days === 100) return '💯 STREAK CENTENAIRE !'
    if (days >= 30) return '🏆 Streak du mois !'

    return '🔥 Streak Milestone !'
  }

  /**
   * Générer ID unique
   */
  function generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Computed properties
  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read && !n.dismissed).length
  )

  const visibleNotifications = computed(() =>
    notifications.value.filter(n => !n.dismissed)
  )

  const criticalNotifications = computed(() =>
    visibleNotifications.value.filter(n => n.priority === 'critical')
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  return {
    // State
    notifications,
    maxNotifications,
    defaultDuration,

    // Computed
    unreadCount,
    visibleNotifications,
    criticalNotifications,
    hasUnread,

    // Basic methods
    create,
    success,
    error,
    warning,
    info,

    // Gaming methods
    achievement,
    levelUp,
    streakMilestone,
    goalProgress,
    budgetAlert,

    // Management methods
    markAsRead,
    dismiss,
    clear,
    markAllAsRead
  }
}
