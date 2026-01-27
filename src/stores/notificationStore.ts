import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { notificationService } from '@/services/notificationService'
import type {
  Notification,
  NotificationAction,
  NotificationPreferences,
  CreateNotificationData
} from '@/types/entities/notification'
import type { ApiResponse } from '@/types/base'

export const useNotificationStore = defineStore('notification', () => {

  // ==========================================
  // STATE
  // ==========================================

  const notifications = ref<Notification[]>([])
  const preferences = ref<NotificationPreferences | null>(null)

  // États de chargement
  const loading = ref(false)
  const marking = ref(false)
  const updating = ref(false)

  // Erreurs
  const error = ref<string | null>(null)

  // Configuration locale
  const showInApp = ref(true)
  const soundEnabled = ref(true)
  const maxNotifications = ref(50)

  // Queue pour notifications en attente
  const pendingNotifications = ref<CreateNotificationData[]>([])
  const isOnline = ref(navigator.onLine)

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Notifications non lues
   */
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  )

  /**
   * Notifications par type
   */
  const achievementNotifications = computed(() =>
    notifications.value.filter(n => n.type === 'achievement')
  )

  const levelUpNotifications = computed(() =>
    notifications.value.filter(n => n.type === 'levelup')
  )

  const goalNotifications = computed(() =>
    notifications.value.filter(n => n.type === 'goal')
  )

  const bankingNotifications = computed(() =>
    notifications.value.filter(n => n.type === 'banking')
  )

  const reminderNotifications = computed(() =>
    notifications.value.filter(n => n.type === 'reminder')
  )

  /**
   * Notifications récentes (dernières 24h)
   */
  const recentNotifications = computed(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return notifications.value
      .filter(n => new Date(n.created_at) > oneDayAgo)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })

  /**
   * Notifications importantes (avec actions)
   */
  const actionableNotifications = computed(() =>
    notifications.value.filter(n => n.action && !n.read)
  )

  /**
   * Compteur de notifications non lues
   */
  const unreadCount = computed(() => unreadNotifications.value.length)

  /**
   * Notification la plus récente
   */
  const latestNotification = computed(() => {
    if (notifications.value.length === 0) return null
    return notifications.value
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  })

  /**
   * Statistiques des notifications
   */
  const notificationStats = computed(() => {
    const total = notifications.value.length
    const unread = unreadCount.value
    const withActions = actionableNotifications.value.length

    const byType = {
      achievement: achievementNotifications.value.length,
      levelup: levelUpNotifications.value.length,
      goal: goalNotifications.value.length,
      banking: bankingNotifications.value.length,
      reminder: reminderNotifications.value.length
    }

    return {
      total,
      unread,
      withActions,
      byType,
      readPercentage: total > 0 ? Math.round(((total - unread) / total) * 100) : 0
    }
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger toutes les notifications
   */
  async function fetchNotifications(limit: number = 50): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await notificationService.getNotifications({ limit })

      if (response.success) {
        notifications.value = response.data

        // Nettoyer les anciennes notifications localement
        cleanupOldNotifications()
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des notifications')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des notifications'
      console.error('Erreur fetchNotifications:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer une notification
   */
  async function createNotification(data: CreateNotificationData): Promise<boolean> {
    try {
      // Si hors ligne, ajouter à la queue
      if (!isOnline.value) {
        pendingNotifications.value.push(data)
        return true
      }

      const response = await notificationService.createNotification(data)

      if (response.success) {
        // Ajouter à la liste locale
        notifications.value.unshift(response.data)

        // Limiter le nombre de notifications
        if (notifications.value.length > maxNotifications.value) {
          notifications.value = notifications.value.slice(0, maxNotifications.value)
        }

        // Afficher la notification si activée
        if (showInApp.value) {
          showNotificationToast(response.data)
        }

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la création de la notification')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de la notification'
      console.error('Erreur createNotification:', err)

      // Ajouter à la queue pour retry
      pendingNotifications.value.push(data)
      return false
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async function markAsRead(id: string): Promise<boolean> {
    marking.value = true

    try {
      const response = await notificationService.markAsRead(id)

      if (response.success) {
        // Mettre à jour localement
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
          notification.read = true
          notification.read_at = new Date().toISOString()
        }

        return true
      } else {
        throw new Error(response.message || 'Erreur lors du marquage')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du marquage comme lu'
      console.error('Erreur markAsRead:', err)
      return false
    } finally {
      marking.value = false
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async function markAllAsRead(): Promise<boolean> {
    marking.value = true

    try {
      const response = await notificationService.markAllAsRead()

      if (response.success) {
        // Mettre à jour toutes les notifications localement
        notifications.value.forEach(notification => {
          notification.read = true
          notification.read_at = new Date().toISOString()
        })

        return true
      } else {
        throw new Error(response.message || 'Erreur lors du marquage global')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du marquage global'
      console.error('Erreur markAllAsRead:', err)
      return false
    } finally {
      marking.value = false
    }
  }

  /**
   * Supprimer une notification
   */
  async function deleteNotification(id: string): Promise<boolean> {
    try {
      const response = await notificationService.deleteNotification(id)

      if (response.success) {
        notifications.value = notifications.value.filter(n => n.id !== id)
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de la notification'
      console.error('Erreur deleteNotification:', err)
      return false
    }
  }

  /**
   * Exécuter l'action d'une notification
   */
  async function executeAction(notificationId: string): Promise<boolean> {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (!notification?.action) return false

    try {
      const response = await notificationService.executeAction(notificationId, notification.action.type)

      if (response.success) {
        // Marquer comme lue après exécution
        await markAsRead(notificationId)
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de l\'exécution de l\'action')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'exécution de l\'action'
      console.error('Erreur executeAction:', err)
      return false
    }
  }

  /**
   * Mettre à jour les préférences
   */
  async function updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<boolean> {
    updating.value = true
    error.value = null

    try {
      const response = await notificationService.updatePreferences(newPreferences)

      if (response.success) {
        preferences.value = response.data

        // Mettre à jour les préférences locales
        if (newPreferences.in_app_enabled !== undefined) {
          showInApp.value = newPreferences.in_app_enabled
        }
        if (newPreferences.sound_enabled !== undefined) {
          soundEnabled.value = newPreferences.sound_enabled
        }

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour des préférences')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour des préférences'
      console.error('Erreur updatePreferences:', err)
      return false
    } finally {
      updating.value = false
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Afficher une notification toast
   */
  function showNotificationToast(notification: Notification): void {
    if (!showInApp.value) return

    // Utiliser vue-toastification ou autre système de toast
    const toastConfig = {
      type: getToastType(notification.type),
      title: notification.title,
      message: notification.message,
      timeout: getToastTimeout(notification.priority || 'normal')
    }

    // Jouer un son si activé
    if (soundEnabled.value && notification.priority === 'high') {
      playNotificationSound()
    }

    console.log('🔔 Notification toast:', toastConfig)
  }

  /**
   * Déterminer le type de toast
   */
  function getToastType(notificationType: Notification['type']): string {
    switch (notificationType) {
      case 'achievement':
      case 'levelup':
        return 'success'
      case 'banking':
        return 'warning'
      case 'reminder':
        return 'info'
      case 'goal':
        return 'success'
      default:
        return 'info'
    }
  }

  /**
   * Déterminer la durée du toast
   */
  function getToastTimeout(priority: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high': return 8000
      case 'normal': return 5000
      case 'low': return 3000
      default: return 5000
    }
  }

  /**
   * Jouer un son de notification
   */
  function playNotificationSound(): void {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.3
      audio.play().catch(console.error)
    } catch (err) {
      console.warn('Impossible de jouer le son de notification:', err)
    }
  }

  /**
   * Nettoyer les anciennes notifications (plus de 30 jours)
   */
  function cleanupOldNotifications(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    notifications.value = notifications.value.filter(n =>
      new Date(n.created_at) > thirtyDaysAgo
    )
  }

  /**
   * Synchroniser les notifications en attente (quand on revient online)
   */
  async function syncPendingNotifications(): Promise<void> {
    if (pendingNotifications.value.length === 0) return

    const toSync = [...pendingNotifications.value]
    pendingNotifications.value = []

    for (const notification of toSync) {
      await createNotification(notification)
    }
  }

  /**
   * Créer des notifications spécialisées
   */
  async function notifyAchievement(achievementName: string, xpGained: number): Promise<void> {
    await createNotification({
      type: 'achievement',
      title: '🏆 Nouveau succès !',
      message: `Tu as débloqué "${achievementName}" et gagné ${xpGained} XP !`,
      priority: 'high',
      action: {
        type: 'view_achievements',
        label: 'Voir mes succès',
        url: '/gaming/achievements'
      }
    })
  }

  async function notifyLevelUp(newLevel: number, rewards?: string[]): Promise<void> {
    const rewardsText = rewards ? ` Récompenses : ${rewards.join(', ')}` : ''

    await createNotification({
      type: 'levelup',
      title: '🎉 Niveau supérieur !',
      message: `Félicitations ! Tu as atteint le niveau ${newLevel} !${rewardsText}`,
      priority: 'high',
      action: {
        type: 'view_profile',
        label: 'Voir mon profil',
        url: '/gaming/profile'
      }
    })
  }

  async function notifyGoalProgress(goalName: string, percentage: number): Promise<void> {
    const isCompleted = percentage >= 100

    await createNotification({
      type: 'goal',
      title: isCompleted ? '🎯 Objectif atteint !' : '📈 Progrès objectif',
      message: isCompleted
        ? `Bravo ! Tu as atteint ton objectif "${goalName}" !`
        : `Tu as progressé à ${percentage}% pour "${goalName}"`,
      priority: isCompleted ? 'high' : 'normal',
      action: {
        type: 'view_goals',
        label: 'Voir mes objectifs',
        url: '/goals'
      }
    })
  }

  async function notifyBankingIssue(message: string, severity: 'info' | 'warning' | 'error' = 'warning'): Promise<void> {
    await createNotification({
      type: 'banking',
      title: '🏦 Connexion bancaire',
      message,
      priority: severity === 'error' ? 'high' : 'normal',
      action: {
        type: 'view_banking',
        label: 'Vérifier',
        url: '/banking'
      }
    })
  }

  async function notifyReminder(title: string, message: string, actionUrl?: string): Promise<void> {
    await createNotification({
      type: 'reminder',
      title: `⏰ ${title}`,
      message,
      priority: 'normal',
      action: actionUrl ? {
        type: 'navigate',
        label: 'Voir',
        url: actionUrl
      } : undefined
    })
  }

  /**
   * Filtrer les notifications
   */
  function filterNotifications(filters: {
    type?: Notification['type']
    read?: boolean
    priority?: 'low' | 'normal' | 'high'
    dateFrom?: Date
    dateTo?: Date
  }): Notification[] {
    let filtered = [...notifications.value]

    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type)
    }

    if (filters.read !== undefined) {
      filtered = filtered.filter(n => n.read === filters.read)
    }

    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(n => new Date(n.created_at) >= filters.dateFrom!)
    }

    if (filters.dateTo) {
      filtered = filtered.filter(n => new Date(n.created_at) <= filters.dateTo!)
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  /**
   * Rechercher dans les notifications
   */
  function searchNotifications(query: string): Notification[] {
    const lowerQuery = query.toLowerCase()
    return notifications.value.filter(notification =>
      notification.title.toLowerCase().includes(lowerQuery) ||
      notification.message.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Programmer un rappel
   */
  async function scheduleReminder(
    title: string,
    message: string,
    scheduledFor: Date,
    actionUrl?: string
  ): Promise<boolean> {
    try {
      const response = await notificationService.scheduleNotification({
        type: 'reminder',
        title: `⏰ ${title}`,
        message,
        priority: 'normal',
        scheduled_for: scheduledFor.toISOString(),
        action: actionUrl ? {
          type: 'navigate',
          label: 'Voir',
          url: actionUrl
        } : undefined
      })

      return response.success
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la programmation du rappel'
      console.error('Erreur scheduleReminder:', err)
      return false
    }
  }

  /**
   * Obtenir les préférences de notification
   */
  async function fetchPreferences(): Promise<void> {
    try {
      const response = await notificationService.getPreferences()

      if (response.success) {
        preferences.value = response.data

        // Synchroniser avec les préférences locales
        showInApp.value = response.data.in_app_enabled
        soundEnabled.value = response.data.sound_enabled
      }
    } catch (err: any) {
      console.error('Erreur fetchPreferences:', err)
    }
  }

  /**
   * Gérer le changement de statut online/offline
   */
  function handleConnectionChange(): void {
    isOnline.value = navigator.onLine

    if (isOnline.value && pendingNotifications.value.length > 0) {
      // Synchroniser les notifications en attente
      syncPendingNotifications()
    }
  }

  /**
   * Nettoyer toutes les notifications lues
   */
  async function clearReadNotifications(): Promise<boolean> {
    try {
      const response = await notificationService.deleteReadNotifications()

      if (response.success) {
        notifications.value = notifications.value.filter(n => !n.read)
        return true
      } else {
        throw new Error(response.message || 'Erreur lors du nettoyage')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du nettoyage des notifications'
      console.error('Erreur clearReadNotifications:', err)
      return false
    }
  }

  /**
   * Initialiser le store
   */
  async function initialize(): Promise<void> {
    // Écouter les changements de connexion
    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)

    // Charger les données initiales
    await Promise.all([
      fetchNotifications(),
      fetchPreferences()
    ])
  }

  /**
   * Nettoyer les erreurs
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    notifications.value = []
    preferences.value = null
    pendingNotifications.value = []
    loading.value = false
    marking.value = false
    updating.value = false
    error.value = null
    showInApp.value = true
    soundEnabled.value = true

    // Nettoyer les event listeners
    window.removeEventListener('online', handleConnectionChange)
    window.removeEventListener('offline', handleConnectionChange)
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    notifications,
    preferences,
    loading,
    marking,
    updating,
    error,
    showInApp,
    soundEnabled,
    maxNotifications,
    pendingNotifications,
    isOnline,

    // Getters
    unreadNotifications,
    achievementNotifications,
    levelUpNotifications,
    goalNotifications,
    bankingNotifications,
    reminderNotifications,
    recentNotifications,
    actionableNotifications,
    unreadCount,
    latestNotification,
    notificationStats,

    // Actions
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    executeAction,
    updatePreferences,
    filterNotifications,
    searchNotifications,
    scheduleReminder,
    fetchPreferences,
    clearReadNotifications,
    initialize,
    clearError,
    $reset,

    // Notifications spécialisées
    notifyAchievement,
    notifyLevelUp,
    notifyGoalProgress,
    notifyBankingIssue,
    notifyReminder,

    // Utilitaires
    handleConnectionChange,
    syncPendingNotifications
  }
})
