// src/services/secureStorage.ts
// STOCKAGE SÉCURISÉ avec Web Crypto API NATIF (zéro dépendance)

/**
 * Classe de stockage sécurisé pour localStorage
 * Utilise le Web Crypto API natif du navigateur
 */
class SecureStorage {
  private readonly SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET || 'coinquest-alpha-2025'
  private cryptoKey: CryptoKey | null = null

  /**
   * Initialiser la clé de chiffrement
   */
  private async getCryptoKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey

    // Convertir le secret en clé crypto
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.SECRET_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    // Dériver une clé AES-GCM
    this.cryptoKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('coinquest-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )

    return this.cryptoKey
  }

  /**
   * Chiffrer une chaîne
   */
  private async encrypt(plaintext: string): Promise<string> {
    try {
      const key = await this.getCryptoKey()
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)

      // Générer un IV aléatoire (Initialization Vector)
      const iv = crypto.getRandomValues(new Uint8Array(12))

      // Chiffrer avec AES-GCM
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )

      // Combiner IV + données chiffrées
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv, 0)
      combined.set(new Uint8Array(encrypted), iv.length)

      // Convertir en base64
      return this.arrayBufferToBase64(combined)
    } catch (error) {
      console.error('Erreur chiffrement:', error)
      throw error
    }
  }

  /**
   * Déchiffrer une chaîne
   */
  private async decrypt(ciphertext: string): Promise<string> {
    try {
      const key = await this.getCryptoKey()

      // Convertir base64 en ArrayBuffer
      const combined = this.base64ToArrayBuffer(ciphertext)

      // Séparer IV et données
      const iv = combined.slice(0, 12)
      const data = combined.slice(12)

      // Déchiffrer
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )

      // Convertir en string
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Erreur déchiffrement:', error)
      throw error
    }
  }

  /**
   * Stocker une valeur chiffrée
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await this.encrypt(value)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('❌ Erreur stockage sécurisé:', error)
    }
  }

  /**
   * Récupérer une valeur déchiffrée
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null

      return await this.decrypt(encrypted)
    } catch (error) {
      console.error('❌ Erreur lecture sécurisée:', error)
      return null
    }
  }

  /**
   * Supprimer une valeur
   */
  removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  /**
   * Nettoyer tout
   */
  clear(): void {
    localStorage.clear()
  }

  // ==========================================
  // HELPERS DE CONVERSION
  // ==========================================

  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
}

// ==========================================
// INSTANCE SINGLETON
// ==========================================

export const secureStorage = new SecureStorage()

// ==========================================
// UTILITAIRES SUPPLÉMENTAIRES
// ==========================================

/**
 * Stocker un token avec expiration
 */
export async function setTokenWithExpiry(
  token: string,
  expiryHours: number = 24 * 7
): Promise<void> {
  const now = new Date()
  const expiry = now.getTime() + (expiryHours * 60 * 60 * 1000)

  const item = {
    token: token,
    expiry: expiry,
    createdAt: now.toISOString()
  }

  await secureStorage.setItem('auth_token', JSON.stringify(item))
}

/**
 * Récupérer le token si toujours valide
 */
export async function getTokenIfValid(): Promise<string | null> {
  const itemStr = await secureStorage.getItem('auth_token')
  if (!itemStr) return null

  try {
    const item = JSON.parse(itemStr)
    const now = new Date()

    // Vérifier expiration
    if (now.getTime() > item.expiry) {
      console.log('🔒 Token expiré, suppression automatique')
      secureStorage.removeItem('auth_token')
      return null
    }

    return item.token
  } catch (error) {
    console.error('❌ Erreur parsing token:', error)
    return null
  }
}

/**
 * Générer un token CSRF aléatoire
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hasher un mot de passe (pour comparaison locale)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Vérifier l'intégrité des données avec HMAC
 */
export async function verifyIntegrity(
  data: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(import.meta.env.VITE_STORAGE_SECRET || 'coinquest'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const signatureBuffer = Uint8Array.from(
    atob(signature),
    c => c.charCodeAt(0)
  )

  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBuffer,
    encoder.encode(data)
  )
}

// ==========================================
// DÉTECTION MULTI-ONGLETS
// ==========================================

/**
 * Synchroniser logout entre onglets
 */
export function setupMultiTabLogout(onLogout: () => void): void {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_token' && event.newValue === null) {
      console.log('🚪 Déconnexion détectée dans un autre onglet')
      onLogout()
    }
  })
}

// ==========================================
// RATE LIMITING CLIENT-SIDE
// ==========================================

class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  /**
   * Vérifier si une action est autorisée
   */
  canAttempt(
    action: string,
    maxAttempts: number = 5,
    windowMinutes: number = 15
  ): boolean {
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000

    const attempts = this.attempts.get(action) || []
    const recentAttempts = attempts.filter(time => now - time < windowMs)

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

  /**
   * Réinitialiser le compteur
   */
  reset(action: string): void {
    this.attempts.delete(action)
  }

  /**
   * Obtenir le temps d'attente restant
   */
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

// ==========================================
// SANITIZE INPUTS (Anti-XSS)
// ==========================================

/**
 * Nettoyer les inputs utilisateur
 */
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

/**
 * Valider format email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valider force du mot de passe
 */
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
    suggestions
  }
}

// ==========================================
// EXPORT PAR DÉFAUT
// ==========================================

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
  getPasswordStrength
}
