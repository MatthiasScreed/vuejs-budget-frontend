import { defineStore } from 'pinia'
import { ref } from 'vue'

// ==========================================
// INTERFACES TOAST
// ==========================================

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration: number
  persistent: boolean
  actions?: ToastAction[]
  icon?: string
  timestamp: number
  read: boolean
}

export interface ToastAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

export interface ToastOptions {
  title?: string
  duration?: number
  persistent?: boolean
  actions?: ToastAction[]
  icon?: string
}

// ==========================================
// TYPES
// ==========================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

// ==========================================
// STORE TOAST
// ==========================================

export const useToastStore = defineStore('toast', () => {

  // ==========================================
  // STATE
  // ==========================================

  const toasts = ref<Toast[]>([])
  const maxToasts = ref(5)
  const defaultDuration = ref(5000)

  // ==========================================
  // GETTERS
  // ==========================================

  const activeToasts = computed(() =>
    toasts.value.filter(toast => !toast.read)
  )

  const unreadCount = computed(() => activeToasts.value.length)

  const hasErrors = computed(() =>
    activeToasts.value.some(toast => toast.type === 'error')
  )

  const hasWarnings = computed(() =>
    activeToasts.value.some(toast => toast.type === 'warning')
  )

  // ==========================================
  // ACTIONS PRINCIPALES
  // ==========================================

  /**
   * Ajouter un toast success
   */
  function success(message: string, options: ToastOptions = {}): string {
    return addToast('success', message, {
      icon: '✅',
      ...options
    })
  }

  /**
   * Ajouter un toast d'erreur
   */
  function error(message: string, options: ToastOptions = {}): string {
    return addToast('error', message, {
      duration: 8000, // Plus long pour les erreurs
      icon: '❌',
      ...options
    })
  }

  /**
   * Ajouter un toast d'avertissement
   */
  function warning(message: string, options: ToastOptions = {}): string {
    return addToast('warning', message, {
      duration: 6000,
      icon: '⚠️',
      ...options
    })
  }

  /**
   * Ajouter un toast d'information
   */
  function info(message: string, options: ToastOptions = {}): string {
    return addToast('info', message, {
      icon: 'ℹ️',
      ...options
    })
  }

  /**
   * Toast spécialisés pour l'application gaming
   */
  function achievement(achievementName: string, points: number): string {
    return addToast('success', `Succès débloqué : ${achievementName}`, {
      title: '🏆 Achievement Unlocked!',
      duration: 8000,
      icon: '🎉',
      actions: [{
        label: 'Voir',
        action: () => navigateToAchievements()
      }]
    })
  }

  function levelUp(newLevel: number, xpGained: number): string {
    return addToast('success', `Félicitations ! Vous passez niveau ${newLevel}`, {
      title: '📈 Level Up!',
      duration: 10000,
      icon: '🎊',
      persistent: true,
      actions: [{
        label: 'Voir profil',
        action: () => navigateToProfile()
      }]
    })
  }

  function xpGained(amount: number, source: string): string {
    return addToast('info', `+${amount} XP depuis ${source}`, {
      title: '⭐ XP Gagné',
      duration: 3000,
      icon: '✨'
    })
  }

  function networkError(): string {
    return addToast('error', 'Problème de connexion au serveur', {
      title: '🌐 Erreur Réseau',
      persistent: true,
      actions: [{
        label: 'Réessayer',
        action: () => window.location.reload()
      }]
    })
  }

  function websocketError(): string {
    return addToast('warning', 'Connexion temps réel indisponible', {
      title: '🔗 WebSocket',
      duration: 8000,
      actions: [{
        label: 'Reconnecter',
        action: () => reconnectWebSocket()
      }]
    })
  }

  // ==========================================
  // GESTION DES TOASTS
  // ==========================================

  /**
   * Ajouter un toast générique
   */
  function addToast(
    type: ToastType,
    message: string,
    options: ToastOptions = {}
  ): string {
    const id = generateToastId()

    const toast: Toast = {
      id,
      type,
      title: options.title || getDefaultTitle(type),
      message,
      duration: options.duration || defaultDuration.value,
      persistent: options.persistent || false,
      actions: options.actions || [],
      icon: options.icon || getDefaultIcon(type),
      timestamp: Date.now(),
      read: false
    }

    toasts.value.push(toast)

    // Limiter le nombre de toasts
    if (toasts.value.length > maxToasts.value) {
      toasts.value.shift()
    }

    // Auto-suppression si pas persistant
    if (!toast.persistent) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    console.log(`[Toast] ${type.toUpperCase()}: ${message}`)

    return id
  }

  /**
   * Supprimer un toast
   */
  function removeToast(id: string): void {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Marquer un toast comme lu
   */
  function markAsRead(id: string): void {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.read = true
    }
  }

  /**
   * Marquer tous les toasts comme lus
   */
  function markAllAsRead(): void {
    toasts.value.forEach(toast => {
      toast.read = true
    })
  }

  /**
   * Vider tous les toasts
   */
  function clearAll(): void {
    toasts.value = []
  }

  /**
   * Vider les toasts par type
   */
  function clearByType(type: ToastType): void {
    toasts.value = toasts.value.filter(toast => toast.type !== type)
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Générer un ID unique pour le toast
   */
  function generateToastId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtenir le titre par défaut selon le type
   */
  function getDefaultTitle(type: ToastType): string {
    const titles: Record<ToastType, string> = {
      'success': 'Succès',
      'error': 'Erreur',
      'warning': 'Attention',
      'info': 'Information'
    }
    return titles[type]
  }

  /**
   * Obtenir l'icône par défaut selon le type
   */
  function getDefaultIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    }
    return icons[type]
  }

  /**
   * Naviguer vers les achievements
   */
  function navigateToAchievements(): void {
    // Cette fonction sera injectée par le router
    console.log('Navigation vers achievements')
  }

  /**
   * Naviguer vers le profil
   */
  function navigateToProfile(): void {
    // Cette fonction sera injectée par le router
    console.log('Navigation vers profil')
  }

  /**
   * Reconnexion WebSocket
   */
  function reconnectWebSocket(): void {
    // Cette fonction sera injectée par le service WebSocket
    console.log('Tentative de reconnexion WebSocket')
  }

  // ==========================================
  // API PUBLIQUE
  // ==========================================

  return {
    // State
    toasts: readonly(toasts),
    maxToasts: readonly(maxToasts),

    // Getters
    activeToasts,
    unreadCount,
    hasErrors,
    hasWarnings,

    // Actions génériques
    success,
    error,
    warning,
    info,

    // Actions spécialisées gaming
    achievement,
    levelUp,
    xpGained,
    networkError,
    websocketError,

    // Gestion
    removeToast,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearByType
  }
})

// ==========================================
// TYPES D'EXPORT
// ==========================================

export type ToastStore = ReturnType<typeof useToastStore>
