class SecureStorage {
  private readonly SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET || 'coinquest-alpha-2025'
  private cryptoKey: CryptoKey | null = null

  private async getCryptoKey(): Promise<CryptoKey> {
    if (this.cryptoKey) {
      console.log('🔑 Utilisation de la clé crypto en cache')
      return this.cryptoKey
    }

    console.log("🔑 Génération d'une nouvelle clé crypto...")
    console.log('Secret utilisé:', this.SECRET_KEY.substring(0, 10) + '...')

    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.SECRET_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey'],
    )

    this.cryptoKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('coinquest-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )

    console.log('✅ Clé crypto générée')
    return this.cryptoKey
  }

  private async encrypt(plaintext: string): Promise<string> {
    console.log('🔒 Chiffrement de', plaintext.length, 'caractères...')

    try {
      const key = await this.getCryptoKey()
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)

      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv, 0)
      combined.set(new Uint8Array(encrypted), iv.length)

      const result = this.arrayBufferToBase64(combined)
      console.log('✅ Chiffrement réussi, longueur:', result.length)
      return result
    } catch (error) {
      console.error('❌ ERREUR CHIFFREMENT:', error)
      throw error
    }
  }

  private async decrypt(ciphertext: string): Promise<string> {
    console.log('🔓 Déchiffrement de', ciphertext.length, 'caractères...')

    try {
      const key = await this.getCryptoKey()
      const combined = this.base64ToArrayBuffer(ciphertext)
      const iv = combined.slice(0, 12)
      const data = combined.slice(12)

      console.log('📋 IV length:', iv.length)
      console.log('📋 Data length:', data.length)

      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)

      const decoder = new TextDecoder()
      const result = decoder.decode(decrypted)
      console.log('✅ Déchiffrement réussi, longueur:', result.length)
      return result
    } catch (error) {
      console.error('❌ ERREUR DÉCHIFFREMENT:', error)
      console.error('Ciphertext length:', ciphertext.length)
      console.error('Ciphertext preview:', ciphertext.substring(0, 50) + '...')
      throw error
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    console.group(`💾 setItem("${key}")`)

    try {
      console.log(
        '📝 Valeur à sauvegarder:',
        value.substring(0, 100) + (value.length > 100 ? '...' : ''),
      )
      const encrypted = await this.encrypt(value)

      console.log('🔒 Valeur chiffrée:', encrypted.substring(0, 50) + '...')
      localStorage.setItem(key, encrypted)

      // Vérification immédiate
      const test = localStorage.getItem(key)
      if (test === encrypted) {
        console.log('✅ Vérification OK: valeur bien écrite dans localStorage')
      } else {
        console.error('❌ PROBLÈME: valeur non écrite correctement!')
        console.error('Attendu:', encrypted.substring(0, 50))
        console.error('Obtenu:', test ? test.substring(0, 50) : 'null')
      }

      console.groupEnd()
    } catch (error) {
      console.error('❌ Erreur setItem:', error)
      console.groupEnd()
      throw error
    }
  }

  async getItem(key: string): Promise<string | null> {
    console.group(`📖 getItem("${key}")`)

    try {
      const encrypted = localStorage.getItem(key)

      if (!encrypted) {
        console.log('❌ Clé non trouvée dans localStorage')
        console.groupEnd()
        return null
      }

      console.log('✅ Clé trouvée, longueur:', encrypted.length)
      console.log('🔒 Valeur chiffrée:', encrypted.substring(0, 50) + '...')

      const decrypted = await this.decrypt(encrypted)
      console.log('✅ Déchiffrement réussi')
      console.log(
        '📝 Valeur déchiffrée:',
        decrypted.substring(0, 100) + (decrypted.length > 100 ? '...' : ''),
      )
      console.groupEnd()

      return decrypted
    } catch (error) {
      console.error('❌ Erreur getItem:', error)
      console.error('Stack:', error.stack)
      console.groupEnd()
      return null
    }
  }

  removeItem(key: string): void {
    console.log(`🗑️ removeItem("${key}")`)
    localStorage.removeItem(key)
  }

  clear(): void {
    console.log('🗑️ clear() - suppression de tout le localStorage')
    localStorage.clear()
  }

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

export const secureStorage = new SecureStorage()

/**
 * 💾 Stocker un token avec expiration - VERSION DEBUG
 */
export async function setTokenWithExpiry(
  token: string,
  expiryHours: number = 24 * 7,
): Promise<void> {
  console.group('💾 === setTokenWithExpiry ===')
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
  console.log('📦 Objet à sauvegarder:', itemStr.substring(0, 150) + '...')

  await secureStorage.setItem('auth_token', itemStr)

  // ✅ VÉRIFICATION IMMÉDIATE
  console.log('🔍 Vérification immédiate...')
  const verification = await secureStorage.getItem('auth_token')

  if (verification) {
    const parsed = JSON.parse(verification)
    if (parsed.token === token) {
      console.log('✅ VÉRIFICATION OK: Token bien sauvegardé et récupérable')
    } else {
      console.error('❌ VÉRIFICATION ÉCHOUÉE: Token ne correspond pas!')
      console.error('Attendu:', token.substring(0, 20))
      console.error('Obtenu:', parsed.token ? parsed.token.substring(0, 20) : 'null')
    }
  } else {
    console.error('❌ VÉRIFICATION ÉCHOUÉE: Impossible de récupérer le token!')
  }

  console.groupEnd()
}

/**
 * 🔍 Récupérer le token si valide - VERSION DEBUG
 */
export async function getTokenIfValid(): Promise<string | null> {
  console.group('🔍 === getTokenIfValid ===')

  try {
    const itemStr = await secureStorage.getItem('auth_token')

    if (!itemStr) {
      console.log('❌ Aucune donnée trouvée')
      console.log(
        '📋 Contenu brut localStorage:',
        localStorage.getItem('auth_token') ? 'EXISTS' : 'NULL',
      )
      console.groupEnd()
      return null
    }

    console.log('✅ Données récupérées:', itemStr.substring(0, 100) + '...')

    const item = JSON.parse(itemStr)
    console.log('📦 Objet parsé:', {
      hasToken: !!item.token,
      tokenPreview: item.token ? item.token.substring(0, 20) + '...' : 'null',
      expiry: item.expiry,
      expiryDate: new Date(item.expiry).toISOString(),
      createdAt: item.createdAt,
    })

    const now = new Date()
    const isExpired = now.getTime() > item.expiry
    const timeRemaining = item.expiry - now.getTime()
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))

    console.log('⏰ Maintenant:', now.toISOString())
    console.log('⏰ Expiré?', isExpired)
    console.log('⏰ Temps restant:', hoursRemaining, 'heures')

    if (isExpired) {
      console.log('🔒 Token expiré, suppression automatique')
      secureStorage.removeItem('auth_token')
      console.groupEnd()
      return null
    }

    console.log('✅ Token valide retourné')
    console.groupEnd()
    return item.token
  } catch (error) {
    console.error('❌ Erreur dans getTokenIfValid:', error)
    console.error('Stack:', error.stack)
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
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(import.meta.env.VITE_STORAGE_SECRET || 'coinquest'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const signatureBuffer = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))
  return await crypto.subtle.verify('HMAC', key, signatureBuffer, encoder.encode(data))
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
