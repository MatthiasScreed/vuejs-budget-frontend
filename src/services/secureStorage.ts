// src/services/secureStorage.ts
// VERSION SIMPLE (NON CHIFFRÉE) pour débugger

/**
 * Classe de stockage simple pour localStorage
 * ⚠️ VERSION TEMPORAIRE - À remplacer par version chiffrée après debug
 */
class SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    console.log(`💾 [SIMPLE] setItem("${key}")`)
    localStorage.setItem(key, value)

    // Vérification immédiate
    const test = localStorage.getItem(key)
    if (test === value) {
      console.log('✅ [SIMPLE] Valeur bien écrite')
    } else {
      console.error('❌ [SIMPLE] Valeur non écrite!')
    }
  }

  async getItem(key: string): Promise<string | null> {
    console.log(`📖 [SIMPLE] getItem("${key}")`)
    const value = localStorage.getItem(key)

    if (value) {
      console.log('✅ [SIMPLE] Valeur trouvée')
    } else {
      console.log('❌ [SIMPLE] Valeur non trouvée')
    }

    return value
  }

  removeItem(key: string): void {
    console.log(`🗑️ [SIMPLE] removeItem("${key}")`)
    localStorage.removeItem(key)
  }

  clear(): void {
    console.log('🗑️ [SIMPLE] clear()')
    localStorage.clear()
  }
}

export const secureStorage = new SecureStorage()

/**
 * Stocker un token avec expiration
 */
export async function setTokenWithExpiry(
  token: string,
  expiryHours: number = 24 * 7,
): Promise<void> {
  console.group('💾 === setTokenWithExpiry [SIMPLE] ===')
  console.log('Token à sauvegarder:', token.substring(0, 20) + '...')
  console.log('Expiration:', expiryHours, 'heures')

  const now = new Date()
  const expiry = now.getTime() + expiryHours * 60 * 60 * 1000
  const expiryDate = new Date(expiry)

  console.log('⏰ Création:', now.toISOString())
  console.log('⏰ Expiration:', expiryDate.toISOString())

  const item = {
    token: token,
    expiry: expiry,
    createdAt: now.toISOString(),
  }

  const itemStr = JSON.stringify(item)

  await secureStorage.setItem('auth_token', itemStr)

  // VÉRIFICATION IMMÉDIATE
  console.log('🔍 Vérification immédiate...')
  const verification = await secureStorage.getItem('auth_token')

  if (verification) {
    const parsed = JSON.parse(verification)
    if (parsed.token === token) {
      console.log('✅ VÉRIFICATION OK: Token bien sauvegardé')
    } else {
      console.error('❌ VÉRIFICATION ÉCHOUÉE: Token ne correspond pas!')
    }
  } else {
    console.error('❌ VÉRIFICATION ÉCHOUÉE: Impossible de récupérer!')
  }

  console.groupEnd()
}

/**
 * Récupérer le token si valide
 */
export async function getTokenIfValid(): Promise<string | null> {
  console.group('🔍 === getTokenIfValid [SIMPLE] ===')

  try {
    const itemStr = await secureStorage.getItem('auth_token')

    if (!itemStr) {
      console.log('❌ Aucune donnée trouvée')
      console.groupEnd()
      return null
    }

    console.log('✅ Données récupérées')

    const item = JSON.parse(itemStr)
    console.log('📦 Token:', item.token.substring(0, 20) + '...')
    console.log('📦 Expiry:', new Date(item.expiry).toISOString())

    const now = new Date()
    const isExpired = now.getTime() > item.expiry

    console.log('⏰ Maintenant:', now.toISOString())
    console.log('⏰ Expiré?', isExpired)

    if (isExpired) {
      console.log('🔒 Token expiré, suppression')
      secureStorage.removeItem('auth_token')
      console.groupEnd()
      return null
    }

    console.log('✅ Token valide retourné')
    console.groupEnd()
    return item.token
  } catch (error) {
    console.error('❌ Erreur:', error)
    console.groupEnd()
    return null
  }
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyIntegrity(data: string, signature: string): Promise<boolean> {
  return true // Désactivé en mode simple
}

export function setupMultiTabLogout(onLogout: () => void): void {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_token' && event.newValue === null) {
      console.log('🚪 Déconnexion détectée dans un autre onglet')
      onLogout()
    }
  })
}

class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  canAttempt(action: string, maxAttempts: number = 5, windowMinutes: number = 15): boolean {
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000
    const attempts = this.attempts.get(action) || []
    const recentAttempts = attempts.filter((time) => now - time < windowMs)

    if (recentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts)
      const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 60000)
      console.warn(`⚠️ Trop de tentatives pour "${action}". Réessayez dans ${waitTime} min`)
      return false
    }

    recentAttempts.push(now)
    this.attempts.set(action, recentAttempts)
    return true
  }

  reset(action: string): void {
    this.attempts.delete(action)
  }

  getWaitTime(action: string, windowMinutes: number = 15): number {
    const attempts = this.attempts.get(action) || []
    if (attempts.length === 0) return 0
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000
    const oldestAttempt = Math.min(...attempts)
    const waitMs = windowMs - (now - oldestAttempt)
    return waitMs > 0 ? Math.ceil(waitMs / 60000) : 0
  }
}

export const rateLimiter = new RateLimiter()

export function sanitizeInput(input: string): string {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getPasswordStrength(password: string): {
  score: number
  label: string
  suggestions: string[]
} {
  let score = 0
  const suggestions: string[] = []

  if (password.length >= 8) score++
  else suggestions.push('Au moins 8 caractères')

  if (password.length >= 12) score++

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  else suggestions.push('Majuscules et minuscules')

  if (/\d/.test(password)) score++
  else suggestions.push('Au moins un chiffre')

  if (/[^a-zA-Z0-9]/.test(password)) score++
  else suggestions.push('Au moins un caractère spécial')

  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']

  return {
    score,
    label: labels[Math.min(score, 4)],
    suggestions,
  }
}

export default {
  secureStorage,
  setTokenWithExpiry,
  getTokenIfValid,
  generateCSRFToken,
  hashPassword,
  verifyIntegrity,
  setupMultiTabLogout,
  rateLimiter,
  sanitizeInput,
  isValidEmail,
  getPasswordStrength,
}
