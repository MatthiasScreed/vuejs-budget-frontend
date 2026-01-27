// src/composables/core/useErrorHandler.ts
import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import type { ToastInterface } from 'vue-toastification'

interface ErrorLog {
  id: string
  timestamp: number
  type: 'api' | 'validation' | 'network' | 'gaming' | 'system'
  message: string
  context?: string
  stack?: string
  user_id?: number
  url?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

interface ErrorStats {
  total_errors: number
  last_24h: number
  most_frequent: string
  error_rate: number
}

/**
 * Composable pour gestion centralisée des erreurs
 * Logging, notifications, retry et analytics
 */
export function useErrorHandler() {
  const toast = useToast()

  // State global des erreurs
  const errorLogs = ref<ErrorLog[]>([])
  const currentErrors = ref<ErrorLog[]>([])
  const errorStats = reactive<ErrorStats>({
    total_errors: 0,
    last_24h: 0,
    most_frequent: '',
    error_rate: 0
  })

  const isOnline = ref(navigator.onLine)

  /**
   * Gestionnaire principal des erreurs API
   */
  async function handleApiError(
    error: any,
    context?: string,
    showToast: boolean = true
  ): Promise<void> {
    const errorLog = createErrorLog(error, 'api', context)

    // Ajouter au log
    addErrorLog(errorLog)

    // Afficher une notification si demandé
    if (showToast) {
      showErrorNotification(errorLog)
    }

    // Logger en console en développement
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        message: errorLog.message,
        context: errorLog.context,
        error: error
      })
    }

    // Envoyer au service de logging si en production
    if (import.meta.env.PROD) {
      await sendErrorToService(errorLog)
    }
  }

  /**
   * Gestionnaire des erreurs de validation
   */
  function handleValidationError(
    errors: Record<string, string[]>,
    context?: string
  ): void {
    const firstError = Object.values(errors)[0]?.[0] || 'Erreur de validation'

    const errorLog = createErrorLog(
      new Error(firstError),
      'validation',
      context
    )

    addErrorLog(errorLog)

    toast.error(firstError, {
      timeout: 5000,
      icon: '⚠️'
    })
  }

  /**
   * Gestionnaire des erreurs réseau
   */
  function handleNetworkError(error: any, context?: string): void {
    const errorLog = createErrorLog(error, 'network', context)
    addErrorLog(errorLog)

    if (!isOnline.value) {
      toast.error('Connexion Internet indisponible', {
        timeout: false,
        icon: '📡'
      })
    } else {
      toast.error('Problème de connexion réseau', {
        timeout: 5000,
        icon: '🌐'
      })
    }
  }

  /**
   * Gestionnaire des erreurs gaming
   */
  function handleGamingError(error: any, context?: string): void {
    const errorLog = createErrorLog(error, 'gaming', context)
    addErrorLog(errorLog)

    toast.warning('Système gaming temporairement indisponible', {
      timeout: 3000,
      icon: '🎮'
    })
  }

  /**
   * Gestionnaire des erreurs système
   */
  function handleSystemError(error: any, context?: string): void {
    const errorLog = createErrorLog(error, 'system', context)
    addErrorLog(errorLog)

    toast.error('Erreur système critique', {
      timeout: 10000,
      icon: '⚡'
    })
  }

  /**
   * Créer un log d'erreur structuré
   */
  function createErrorLog(
    error: any,
    type: ErrorLog['type'],
    context?: string
  ): ErrorLog {
    const message = error?.response?.data?.message || error?.message || 'Erreur inconnue'

    return {
      id: generateErrorId(),
      timestamp: Date.now(),
      type,
      message,
      context,
      stack: error?.stack,
      url: window.location.href,
      severity: determineSeverity(error, type),
      resolved: false
    }
  }

  /**
   * Ajouter une erreur au log
   */
  function addErrorLog(errorLog: ErrorLog): void {
    errorLogs.value.unshift(errorLog)

    // Garder seulement les 100 dernières erreurs
    if (errorLogs.value.length > 100) {
      errorLogs.value = errorLogs.value.slice(0, 100)
    }

    // Mettre à jour les erreurs actuelles (non résolues)
    currentErrors.value = errorLogs.value.filter(err => !err.resolved)

    // Mettre à jour les statistiques
    updateErrorStats()

    // Sauvegarder en localStorage
    saveErrorLogs()
  }

  /**
   * Afficher une notification d'erreur
   */
  function showErrorNotification(errorLog: ErrorLog): void {
    const options = {
      timeout: getTimeoutBySeverity(errorLog.severity),
      icon: getIconByType(errorLog.type)
    }

    switch (errorLog.severity) {
      case 'critical':
        toast.error(errorLog.message, options)
        break
      case 'high':
        toast.error(errorLog.message, options)
        break
      case 'medium':
        toast.warning(errorLog.message, options)
        break
      case 'low':
        toast.info(errorLog.message, options)
        break
    }
  }

  /**
   * Déterminer la sévérité d'une erreur
   */
  function determineSeverity(error: any, type: ErrorLog['type']): ErrorLog['severity'] {
    // Erreurs critiques
    if (error?.response?.status === 500 || type === 'system') {
      return 'critical'
    }

    // Erreurs importantes
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return 'high'
    }

    // Erreurs moyennes
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Générer un ID unique pour l'erreur
   */
  function generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtenir le timeout selon la sévérité
   */
  function getTimeoutBySeverity(severity: ErrorLog['severity']): number | false {
    switch (severity) {
      case 'critical': return false // Pas d'auto-dismiss
      case 'high': return 10000
      case 'medium': return 5000
      case 'low': return 3000
      default: return 5000
    }
  }

  /**
   * Obtenir l'icône selon le type
   */
  function getIconByType(type: ErrorLog['type']): string {
    switch (type) {
      case 'api': return '🔌'
      case 'validation': return '⚠️'
      case 'network': return '🌐'
      case 'gaming': return '🎮'
      case 'system': return '⚡'
      default: return '❌'
    }
  }

  /**
   * Marquer une erreur comme résolue
   */
  function resolveError(errorId: string): void {
    const error = errorLogs.value.find(err => err.id === errorId)
    if (error) {
      error.resolved = true
      currentErrors.value = errorLogs.value.filter(err => !err.resolved)
      updateErrorStats()
      saveErrorLogs()
    }
  }

  /**
   * Effacer toutes les erreurs
   */
  function clearAllErrors(): void {
    errorLogs.value = []
    currentErrors.value = []
    updateErrorStats()
    localStorage.removeItem('error_logs')
  }

  /**
   * Mettre à jour les statistiques d'erreurs
   */
  function updateErrorStats(): void {
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)

    errorStats.total_errors = errorLogs.value.length
    errorStats.last_24h = errorLogs.value.filter(err => err.timestamp > last24h).length

    // Calculer l'erreur la plus fréquente
    const errorCounts = errorLogs.value.reduce((acc, err) => {
      acc[err.message] = (acc[err.message] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    errorStats.most_frequent = Object.keys(errorCounts).reduce((a, b) =>
      errorCounts[a] > errorCounts[b] ? a : b, ''
    )

    // Calculer le taux d'erreur (erreurs par heure sur les 24h)
    errorStats.error_rate = errorStats.last_24h / 24
  }

  /**
   * Sauvegarder les logs d'erreurs
   */
  function saveErrorLogs(): void {
    try {
      const logsToSave = errorLogs.value.slice(0, 50) // Garder seulement les 50 dernières
      localStorage.setItem('error_logs', JSON.stringify(logsToSave))
    } catch (error) {
      console.warn('Impossible de sauvegarder les logs d\'erreurs:', error)
    }
  }

  /**
   * Charger les logs d'erreurs depuis localStorage
   */
  function loadErrorLogs(): void {
    try {
      const saved = localStorage.getItem('error_logs')
      if (saved) {
        errorLogs.value = JSON.parse(saved)
        currentErrors.value = errorLogs.value.filter(err => !err.resolved)
        updateErrorStats()
      }
    } catch (error) {
      console.warn('Impossible de charger les logs d\'erreurs:', error)
    }
  }

  /**
   * Envoyer l'erreur à un service externe (en production)
   */
  async function sendErrorToService(errorLog: ErrorLog): Promise<void> {
    try {
      // Ici, tu peux intégrer Sentry, LogRocket, etc.
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog)
      // })
      console.log('Error sent to service:', errorLog)
    } catch (error) {
      console.warn('Failed to send error to service:', error)
    }
  }

  // Écouter les changements de connectivité
  window.addEventListener('online', () => isOnline.value = true)
  window.addEventListener('offline', () => isOnline.value = false)

  // Charger les logs existants au démarrage
  loadErrorLogs()

  return {
    // State
    errorLogs,
    currentErrors,
    errorStats,
    isOnline,

    // Handlers principaux
    handleApiError,
    handleValidationError,
    handleNetworkError,
    handleGamingError,
    handleSystemError,

    // Utilitaires
    resolveError,
    clearAllErrors,
    createErrorLog,
    addErrorLog
  }
}
