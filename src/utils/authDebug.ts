// src/utils/authDebug.ts
// Utilitaire de debug pour tracer les problèmes d'authentification

/**
 * Logger amélioré avec timestamps et catégories
 */
export class AuthDebugger {
  private static logs: Array<{
    time: string
    category: string
    message: string
    data?: any
  }> = []

  private static isEnabled = import.meta.env.DEV

  /**
   * Log un événement d'auth
   */
  static log(category: string, message: string, data?: any) {
    if (!this.isEnabled) return

    const entry = {
      time: new Date().toISOString().split('T')[1].slice(0, 12),
      category,
      message,
      data,
    }

    this.logs.push(entry)

    // Garder seulement les 100 derniers logs
    if (this.logs.length > 100) {
      this.logs.shift()
    }

    // Console colorée
    const colors: Record<string, string> = {
      ROUTER: '#3b82f6', // blue
      AUTH: '#10b981', // green
      API: '#f59e0b', // amber
      STORE: '#8b5cf6', // purple
      ERROR: '#ef4444', // red
      GUARD: '#06b6d4', // cyan
    }

    const color = colors[category] || '#6b7280'

    console.log(
      `%c[${entry.time}] %c[${category}]%c ${message}`,
      'color: #9ca3af',
      `color: ${color}; font-weight: bold`,
      'color: inherit',
      data !== undefined ? data : '',
    )
  }

  /**
   * Log d'erreur
   */
  static error(category: string, message: string, error?: any) {
    this.log('ERROR', `[${category}] ${message}`, error)
  }

  /**
   * Vérifier l'état actuel de l'auth
   */
  static checkAuthState(): {
    hasToken: boolean
    hasUser: boolean
    tokenPreview: string | null
    userEmail: string | null
  } {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')

    let userEmail = null
    try {
      if (userStr) {
        const user = JSON.parse(userStr)
        userEmail = user.email
      }
    } catch {
      /* ignore */
    }

    const state = {
      hasToken: !!token,
      hasUser: !!userStr,
      tokenPreview: token ? `${token.slice(0, 20)}...` : null,
      userEmail,
    }

    this.log('AUTH', 'État actuel', state)
    return state
  }

  /**
   * Obtenir tous les logs
   */
  static getLogs() {
    return [...this.logs]
  }

  /**
   * Exporter les logs en JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Effacer les logs
   */
  static clear() {
    this.logs = []
    console.clear()
    this.log('AUTH', 'Logs effacés')
  }

  /**
   * Afficher un résumé dans la console
   */
  static summary() {
    console.group('🔐 Auth Debug Summary')
    console.table(this.checkAuthState())
    console.log('Recent logs:', this.logs.slice(-10))
    console.groupEnd()
  }
}

/**
 * Raccourcis globaux pour le debug (accessibles dans la console)
 */
if (import.meta.env.DEV) {
  // @ts-ignore
  window.authDebug = {
    check: () => AuthDebugger.checkAuthState(),
    logs: () => AuthDebugger.getLogs(),
    export: () => AuthDebugger.exportLogs(),
    clear: () => AuthDebugger.clear(),
    summary: () => AuthDebugger.summary(),

    // Forcer un état d'auth
    forceLogin: (token: string, user: object) => {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      AuthDebugger.log('AUTH', 'Auth forcée', { token: token.slice(0, 20), user })
    },

    // Forcer un logout
    forceLogout: () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      AuthDebugger.log('AUTH', 'Logout forcé')
    },

    // Tester la navigation
    testNav: async (path: string) => {
      AuthDebugger.log('ROUTER', `Test navigation vers: ${path}`)
      window.location.href = path
    },
  }

  console.log('%c🔐 Auth Debug disponible!', 'color: #10b981; font-weight: bold')
  console.log('Commandes: authDebug.check(), authDebug.logs(), authDebug.summary()')
}

export default AuthDebugger
