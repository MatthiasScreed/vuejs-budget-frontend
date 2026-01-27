import { getCurrentInstance, nextTick } from 'vue'

// ==========================================
// TYPES POUR LE DÉBOGAGE
// ==========================================

export interface VueDebugInfo {
  componentName?: string
  propsCount: number
  dataKeys: string[]
  computedKeys: string[]
  methodsKeys: string[]
  missingProperties: string[]
}

export interface ReactivityIssue {
  property: string
  expectedType: string
  actualValue: unknown
  suggestion: string
}

// ==========================================
// UTILITAIRES DE DÉBOGAGE VUE
// ==========================================

/**
 * Déboguer les propriétés manquantes dans un composant Vue
 */
export function debugVueComponent(): VueDebugInfo | null {
  const instance = getCurrentInstance()

  if (!instance) {
    console.warn('[Debug] Aucune instance Vue détectée')
    return null
  }

  const proxy = instance.proxy
  if (!proxy) {
    console.warn('[Debug] Proxy Vue non disponible')
    return null
  }

  // Analyser les propriétés du composant
  const debugInfo: VueDebugInfo = {
    componentName: instance.type.name || instance.type.__name || 'Anonymous',
    propsCount: Object.keys(instance.props || {}).length,
    dataKeys: [],
    computedKeys: [],
    methodsKeys: [],
    missingProperties: []
  }

  // Identifier les propriétés data
  if (instance.data) {
    debugInfo.dataKeys = Object.keys(instance.data)
  }

  // Identifier les propriétés computed
  if (instance.type.computed) {
    debugInfo.computedKeys = Object.keys(instance.type.computed)
  }

  // Identifier les méthodes
  if (instance.type.methods) {
    debugInfo.methodsKeys = Object.keys(instance.type.methods)
  }

  // Détecter les propriétés potentiellement manquantes
  debugInfo.missingProperties = findMissingProperties(proxy)

  console.log('[Debug Vue] Informations du composant:', debugInfo)

  return debugInfo
}

/**
 * Corriger automatiquement les propriétés réactives manquantes
 */
export function fixMissingReactiveProperties(
  target: Record<string, unknown>,
  properties: string[]
): Record<string, unknown> {
  const fixes: Record<string, unknown> = {}

  properties.forEach(prop => {
    if (!(prop in target)) {
      // Deviner le type de données basé sur le nom de la propriété
      fixes[prop] = guessPropertyDefault(prop)

      console.log(`[Debug] Propriété manquante corrigée: ${prop} = ${fixes[prop]}`)
    }
  })

  return fixes
}

/**
 * Valider la réactivité d'un objet
 */
export function validateReactivity(
  obj: Record<string, unknown>,
  requiredProps: string[]
): ReactivityIssue[] {
  const issues: ReactivityIssue[] = []

  requiredProps.forEach(prop => {
    if (!(prop in obj)) {
      issues.push({
        property: prop,
        expectedType: guessPropertyType(prop),
        actualValue: undefined,
        suggestion: `Ajouter ${prop}: ${guessPropertyDefault(prop)} dans data() ou setup()`
      })
    } else if (obj[prop] === null || obj[prop] === undefined) {
      issues.push({
        property: prop,
        expectedType: guessPropertyType(prop),
        actualValue: obj[prop],
        suggestion: `Initialiser ${prop} avec une valeur par défaut`
      })
    }
  })

  return issues
}

/**
 * Nettoyer les proxies Vue pour éviter les erreurs
 */
export function deepCloneVueData<T>(data: T): T {
  if (data === null || typeof data !== 'object') {
    return data
  }

  if (data instanceof Date) {
    return new Date(data.getTime()) as unknown as T
  }

  if (Array.isArray(data)) {
    return data.map(item => deepCloneVueData(item)) as unknown as T
  }

  const cloned: Record<string, unknown> = {}
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      cloned[key] = deepCloneVueData((data as any)[key])
    }
  }

  return cloned as T
}

/**
 * Monitorer les changements de propriétés en temps réel
 */
export function watchPropertyChanges(
  target: Record<string, unknown>,
  callback: (prop: string, oldVal: unknown, newVal: unknown) => void
): () => void {
  const originalProps = { ...target }

  const interval = setInterval(() => {
    Object.keys(target).forEach(key => {
      if (target[key] !== originalProps[key]) {
        callback(key, originalProps[key], target[key])
        originalProps[key] = target[key]
      }
    })
  }, 100)

  return () => clearInterval(interval)
}

/**
 * Créer un proxy safe pour éviter les erreurs de propriétés
 */
export function createSafeProxy<T extends Record<string, unknown>>(
  target: T,
  defaults: Partial<T> = {}
): T {
  return new Proxy(target, {
    get(obj, prop: string) {
      if (prop in obj) {
        return obj[prop]
      }

      if (prop in defaults) {
        console.warn(`[Debug] Utilisation de la valeur par défaut pour: ${prop}`)
        return defaults[prop]
      }

      console.warn(`[Debug] Propriété manquante accédée: ${prop}`)
      return guessPropertyDefault(prop)
    },

    set(obj, prop: string, value) {
      obj[prop] = value
      return true
    }
  })
}

// ==========================================
// UTILITAIRES PRIVÉS
// ==========================================

/**
 * Trouver les propriétés potentiellement manquantes
 */
function findMissingProperties(proxy: Record<string, unknown>): string[] {
  const missing: string[] = []
  const commonProps = [
    'loading', 'error', 'data', 'items', 'form', 'config',
    'user', 'isAuthenticated', 'stats', 'achievements', 'level',
    'transactions', 'goals', 'categories', 'balance', 'positions'
  ]

  commonProps.forEach(prop => {
    try {
      const value = proxy[prop]
      if (value === undefined) {
        missing.push(prop)
      }
    } catch (error) {
      missing.push(prop)
    }
  })

  return missing
}

/**
 * Deviner le type d'une propriété basé sur son nom
 */
function guessPropertyType(propName: string): string {
  const typePatterns: Record<string, string> = {
    'is': 'boolean',
    'has': 'boolean',
    'can': 'boolean',
    'should': 'boolean',
    'loading': 'boolean',
    'error': 'string | null',
    'count': 'number',
    'total': 'number',
    'amount': 'number',
    'id': 'number',
    'items': 'array',
    'list': 'array',
    'data': 'array | object',
    'config': 'object',
    'user': 'object | null',
    'form': 'object'
  }

  for (const [pattern, type] of Object.entries(typePatterns)) {
    if (propName.toLowerCase().includes(pattern)) {
      return type
    }
  }

  return 'unknown'
}

/**
 * Deviner la valeur par défaut d'une propriété
 */
function guessPropertyDefault(propName: string): unknown {
  const prop = propName.toLowerCase()

  // Booleans
  if (prop.startsWith('is') || prop.startsWith('has') ||
    prop.startsWith('can') || prop.startsWith('should') ||
    prop.includes('loading') || prop.includes('visible')) {
    return false
  }

  // Numbers
  if (prop.includes('count') || prop.includes('total') ||
    prop.includes('amount') || prop.includes('id') ||
    prop.includes('level') || prop.includes('xp')) {
    return 0
  }

  // Arrays
  if (prop.includes('items') || prop.includes('list') ||
    prop.includes('array') || prop.includes('transactions') ||
    prop.includes('goals') || prop.includes('achievements') ||
    prop.includes('positions')) {
    return []
  }

  // Objects
  if (prop.includes('config') || prop.includes('form') ||
    prop.includes('data') || prop.includes('stats')) {
    return {}
  }

  // Nullable objects
  if (prop.includes('user') || prop.includes('current') ||
    prop.includes('selected') || prop.includes('active')) {
    return null
  }

  // Default
  return null
}

// ==========================================
// FONCTIONS UTILITAIRES GLOBALES
// ==========================================

/**
 * Mode de débogage global pour Vue
 */
export function enableVueDebugMode(): void {
  if (typeof window !== 'undefined') {
    // Exposer les utilitaires de debug globalement
    (window as any).__VUE_DEBUG__ = {
      debugComponent: debugVueComponent,
      fixMissing: fixMissingReactiveProperties,
      validateReactivity,
      createSafeProxy
    }

    console.log('🐛 Mode débogage Vue activé - utilisez window.__VUE_DEBUG__')
  }
}

/**
 * Capturer les erreurs Vue non gérées
 */
export function setupVueErrorHandling(): void {
  // Gestionnaire d'erreurs Vue global
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ Promise rejetée non gérée:', event.reason)

      // Empêcher l'affichage par défaut du navigateur
      if (import.meta.env.DEV) {
        event.preventDefault()
      }
    })

    window.addEventListener('error', (event) => {
      console.error('❌ Erreur JavaScript globale:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
  }
}

/**
 * Helper pour initialiser le débogage complet
 */
export function initializeDebugMode(): void {
  if (import.meta.env.DEV) {
    enableVueDebugMode()
    setupVueErrorHandling()

    console.log('🎯 CoinQuest Debug Mode initialisé')
    console.log('📊 Variables d\'environnement:', {
      API_URL: import.meta.env.VITE_API_URL,
      WS_URL: import.meta.env.VITE_WS_URL,
      DEBUG: import.meta.env.VITE_DEBUG
    })
  }
}
