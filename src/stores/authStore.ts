// src/stores/authStore.ts - VERSION CORRIGÉE
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types/entities/auth'

// ==========================================
// ✅ HELPERS TOKEN - VERSION ROBUSTE
// ==========================================

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function saveToken(token: string, expiryHours: number = 168): void {
  try {
    const expiry = Date.now() + expiryHours * 60 * 60 * 1000
    const item = { token, expiry, createdAt: Date.now() }
    localStorage.setItem(TOKEN_KEY, JSON.stringify(item))

    // ✅ AUSSI stocker le token brut pour compatibilité
    sessionStorage.setItem('token_backup', token)

    console.log('💾 Token sauvegardé, expire:', new Date(expiry).toISOString())
  } catch (e) {
    console.error('❌ Erreur sauvegarde token:', e)
  }
}

function getToken(): string | null {
  try {
    // 1️⃣ Essayer le format JSON (normal)
    const itemStr = localStorage.getItem(TOKEN_KEY)
    if (itemStr) {
      try {
        const item = JSON.parse(itemStr)

        // Vérifier expiration
        if (item.expiry && Date.now() > item.expiry) {
          console.log('🔓 Token expiré, suppression...')
          clearToken()
          return null
        }

        if (item.token) {
          return item.token
        }
      } catch {
        // Si JSON invalide, peut-être que c'est le token brut
        if (itemStr.length > 20 && !itemStr.startsWith('{')) {
          console.log('📖 Token brut trouvé dans localStorage')
          return itemStr
        }
      }
    }

    // 2️⃣ Fallback: sessionStorage backup
    const backup = sessionStorage.getItem('token_backup')
    if (backup) {
      console.log('📖 Token récupéré depuis backup')
      return backup
    }

    return null
  } catch (e) {
    console.error('❌ Erreur lecture token:', e)
    return null
  }
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem('token_backup')
}

function saveUser(user: any): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('❌ Erreur sauvegarde user:', e)
  }
}

function getStoredUser(): any | null {
  try {
    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  } catch {
    return null
  }
}

// ==========================================
// INTERFACES
// ==========================================

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  loading: boolean
  error: string | null
  validationErrors: Record<string, string[]>
}

interface AuthResult {
  success: boolean
  data?: any
  message?: string
  errors?: Record<string, string[]>
}

// ==========================================
// STORE
// ==========================================

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    loading: false,
    error: null,
    validationErrors: {},
  }),

  getters: {
    isLoggedIn: (state): boolean => state.isAuthenticated && state.user !== null,
    userName: (state): string => state.user?.name || '',
    userEmail: (state): string => state.user?.email || '',
    userCurrency: (state): string => state.user?.currency || 'EUR',
    userLevel: (state): number => state.user?.level?.level || 1,
    userXP: (state): number => state.user?.level?.total_xp || 0,

    // ✅ Getter pour vérifier si token existe
    hasToken: (): boolean => getToken() !== null,
  },

  actions: {
    // ==========================================
    // ✅ INIT AUTH - VERSION ROBUSTE
    // ==========================================
    async initAuth(): Promise<boolean> {
      // Éviter double init
      if (this.isInitialized && this.isAuthenticated) {
        console.log('🔄 Auth déjà initialisée et authentifiée')
        return true
      }

      console.group('🔐 === INIT AUTH ===')
      this.loading = true

      try {
        // 1️⃣ Vérifier le token local
        const token = getToken()
        console.log('Token local:', token ? '✅ Présent' : '❌ Absent')

        if (!token) {
          console.log('❌ Pas de token → utilisateur non connecté')
          this.clearAuthData()
          return false
        }

        // 2️⃣ Charger le user depuis le cache (affichage rapide)
        const cachedUser = getStoredUser()
        if (cachedUser) {
          this.user = this.cloneUser(cachedUser)
          this.isAuthenticated = true
          console.log('👤 User chargé depuis cache:', this.user?.email)
        }

        // 3️⃣ Valider avec l'API (vérification serveur)
        console.log('🌐 Validation API...')
        const result = await this.loadUser()

        if (result.success) {
          console.log('✅ Session valide!')
          return true
        } else {
          console.log('❌ Session invalide:', result.message)

          // ✅ Si erreur réseau mais cache présent, continuer en mode dégradé
          if (this.user && cachedUser) {
            console.log('⚠️ Mode dégradé: utilisation du cache')
            return true
          }

          this.clearAuthData()
          return false
        }
      } catch (error: any) {
        console.error('❌ Erreur initAuth:', error.message)

        // 🔥 En cas d'erreur réseau, conserver la session cache
        if (this.user && getToken()) {
          console.log('⚠️ Erreur réseau mais session locale présente')
          return true
        }

        this.clearAuthData()
        return false
      } finally {
        this.isInitialized = true
        this.loading = false
        console.groupEnd()
      }
    },

    // ==========================================
    // ✅ LOGIN
    // ==========================================
    async login(credentials: LoginCredentials): Promise<AuthResult> {
      console.group('🔑 === LOGIN ===')

      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        console.log('📤 Envoi requête login...')
        const response = await api.post('/auth/login', credentials)

        console.log('📥 Réponse:', response.success ? '✅' : '❌')

        if (!response.success) {
          throw new Error(response.message || 'Erreur de connexion')
        }

        if (!response.data?.token || !response.data?.user) {
          throw new Error('Réponse serveur invalide')
        }

        const { user, token } = response.data

        // Sauvegarder le token
        const rememberHours = credentials.remember ? 168 : 24
        saveToken(token, rememberHours)

        // Mettre à jour le store
        this.user = this.cloneUser(user)
        this.isAuthenticated = true
        this.isInitialized = true
        saveUser(this.user)

        console.log('🎉 Login réussi:', user.email)
        console.groupEnd()

        return { success: true, data: response.data }
      } catch (error: any) {
        console.error('❌ Erreur login:', error.message)
        console.groupEnd()

        this.error = error.message

        if (error.response?.data?.errors) {
          this.validationErrors = error.response.data.errors
          return {
            success: false,
            message: error.message,
            errors: error.response.data.errors,
          }
        }

        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    // ==========================================
    // REGISTER
    // ==========================================
    async register(userData: RegisterData): Promise<AuthResult> {
      console.group('📝 === REGISTER ===')

      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        const response = await api.post('/auth/register', userData)

        if (!response.success || !response.data) {
          throw new Error(response.message || "Erreur d'enregistrement")
        }

        const { user, token } = response.data

        saveToken(token, 168)
        this.user = this.cloneUser(user)
        this.isAuthenticated = true
        this.isInitialized = true
        saveUser(this.user)

        console.log('✅ Inscription réussie:', user.email)
        console.groupEnd()

        return { success: true, data: response.data }
      } catch (error: any) {
        console.error('❌ Erreur inscription:', error.message)
        console.groupEnd()

        this.error = error.message

        if (error.response?.data?.errors) {
          this.validationErrors = error.response.data.errors
        }

        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    // ==========================================
    // LOAD USER
    // ==========================================
    async loadUser(): Promise<AuthResult> {
      const token = getToken()
      if (!token) {
        return { success: false, message: 'Aucun token' }
      }

      try {
        const response = await api.get<User>('/auth/me')

        if (!response.success || !response.data) {
          throw new Error(response.message || "Impossible de charger l'utilisateur")
        }

        this.user = this.cloneUser(response.data)
        this.isAuthenticated = true
        saveUser(this.user)

        return { success: true, data: this.user }
      } catch (error: any) {
        console.warn('⚠️ loadUser failed:', error.message)
        return { success: false, message: error.message }
      }
    },

    // ==========================================
    // LOGOUT
    // ==========================================
    async logout(): Promise<void> {
      console.log('🚪 Déconnexion...')

      try {
        await api.post('/auth/logout')
        console.log('✅ Logout serveur OK')
      } catch (err) {
        console.warn('⚠️ Logout serveur échoué (pas grave)')
      } finally {
        this.clearAuthData()
        console.log('✅ Session locale effacée')
      }
    },

    // ==========================================
    // ✅ FORCE RESTORE SESSION (après Bridge callback)
    // ==========================================
    async restoreSession(): Promise<boolean> {
      console.log('🔄 Tentative restauration session...')

      const token = getToken()
      if (!token) {
        console.log('❌ Pas de token à restaurer')
        return false
      }

      // Reset l'état d'initialisation pour forcer une nouvelle vérification
      this.isInitialized = false
      return this.initAuth()
    },

    // ==========================================
    // HELPERS
    // ==========================================
    setAuthData(user: User): void {
      this.user = this.cloneUser(user)
      this.isAuthenticated = true
      this.isInitialized = true
      saveUser(this.user)
    },

    clearAuthData(): void {
      this.user = null
      this.isAuthenticated = false
      this.error = null
      this.validationErrors = {}
      clearToken()
    },

    // ✅ Vérifier si session valide (pour router guard)
    hasValidSession(): boolean {
      return getToken() !== null && (this.isAuthenticated || getStoredUser() !== null)
    },

    cloneUser(user: any): User | null {
      if (!user) return null

      return {
        id: Number(user.id),
        name: String(user.name || ''),
        email: String(user.email || ''),
        currency: String(user.currency || 'EUR'),
        language: user.language ? String(user.language) : undefined,
        timezone: user.timezone ? String(user.timezone) : undefined,
        email_verified_at: user.email_verified_at ? String(user.email_verified_at) : undefined,
        created_at: String(user.created_at || ''),
        updated_at: String(user.updated_at || ''),
        level: user.level
          ? {
              id: Number(user.level.id),
              user_id: Number(user.level.user_id),
              level: Number(user.level.level),
              total_xp: Number(user.level.total_xp),
              current_level_xp: Number(user.level.current_level_xp),
              next_level_xp: Number(user.level.next_level_xp),
              created_at: String(user.level.created_at),
              updated_at: String(user.level.updated_at),
            }
          : undefined,
        total_xp: user.total_xp ? Number(user.total_xp) : undefined,
      }
    },
  },
})

// ✅ Export helper pour utilisation directe
export function getAuthToken(): string | null {
  return getToken()
}
