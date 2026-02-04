// src/stores/authStore.ts - VERSION CORRIGÉE (Anti-logout cascade)
import { defineStore } from 'pinia'
import { api, updateTokenCache, clearTokenCache } from '@/services/api'
import { setTokenWithExpiry, getTokenIfValid, secureStorage } from '@/services/secureStorage'
import type { User, LoginCredentials, RegisterData } from '@/types/entities/auth'

// ==========================================
// TYPES
// ==========================================

interface AuthState {
  user: User | null
  token: string | null
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
// CONSTANTES
// ==========================================

const USER_KEY = 'user'

// ==========================================
// HELPERS STORAGE
// ==========================================

function getStoredUser(): User | null {
  try {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  } catch (e) {
    console.warn('⚠️ Erreur lecture user:', e)
    return null
  }
}

function setStoredUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (e) {
    console.warn('⚠️ Erreur écriture user:', e)
  }
}

function clearUserStorage(): void {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (e) {
    console.warn('⚠️ Erreur nettoyage user storage:', e)
  }
}

// ==========================================
// STORE
// ==========================================

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const user = getStoredUser()
    return {
      user: user,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      loading: false,
      error: null,
      validationErrors: {},
    }
  },

  getters: {
    isLoggedIn: (state): boolean => state.isAuthenticated && state.user !== null,
    userName: (state): string => state.user?.name || '',
    userEmail: (state): string => state.user?.email || '',
    userCurrency: (state): string => state.user?.currency || 'EUR',
    userLevel: (state): number => {
      const level = state.user?.level
      if (typeof level === 'object' && level !== null) {
        return level.level ?? 1
      }
      return 1
    },
    userXP: (state): number => {
      const level = state.user?.level
      if (typeof level === 'object' && level !== null) {
        return level.total_xp ?? 0
      }
      return 0
    },
  },

  actions: {
    /**
     * ✅ INITIALISATION - Appelé au démarrage de l'app
     */
    async initAuth(): Promise<boolean> {
      console.log('🔐 [Auth] Initialisation...')

      if (this.isInitialized) {
        console.log('✅ [Auth] Déjà initialisé')
        return this.isAuthenticated
      }

      try {
        const token = await getTokenIfValid()
        const user = getStoredUser()

        console.log('📦 [Auth] Token trouvé:', !!token)
        console.log('📦 [Auth] User trouvé:', !!user)

        if (!token) {
          console.log('⚠️ [Auth] Pas de token valide')
          this.isInitialized = true
          this.isAuthenticated = false
          this.token = null
          return false
        }

        // ✅ Mettre à jour le cache token dans api.ts
        this.token = token
        updateTokenCache(token)
        this.isAuthenticated = true

        if (user) {
          this.user = user
        }

        // Vérifier le token avec l'API (optionnel, en arrière-plan)
        this.loadUser().catch((err) => {
          console.warn('⚠️ [Auth] Erreur vérification token:', err)
        })

        this.isInitialized = true
        console.log('✅ [Auth] Initialisé - Authentifié:', this.isAuthenticated)
        return this.isAuthenticated
      } catch (error) {
        console.error('❌ [Auth] Erreur initAuth:', error)
        this.isInitialized = true
        this.isAuthenticated = false
        return false
      }
    },

    /**
     * Charger les données utilisateur depuis l'API
     */
    async loadUser(): Promise<AuthResult> {
      if (!this.token) {
        return { success: false, message: 'Pas de token' }
      }

      try {
        console.log('👤 [Auth] Chargement user...')
        const response = await api.get<User>('/auth/me')

        if (response.success && response.data) {
          this.user = this.cloneUser(response.data)
          this.isAuthenticated = true
          setStoredUser(this.user!)
          console.log('✅ [Auth] User chargé:', this.user?.name)
          return { success: true, data: this.user }
        }

        // ✅ Si 401, ne pas déconnecter immédiatement
        // Garder les données locales
        if (response.message === 'Session invalide') {
          console.warn('⚠️ [Auth] Session API invalide, données locales conservées')
          return { success: false, message: response.message }
        }

        return { success: false, message: response.message || 'Erreur chargement user' }
      } catch (error: any) {
        console.error('❌ [Auth] Erreur loadUser:', error.message)
        return { success: false, message: error.message }
      }
    },

    /**
     * Connexion
     */
    async login(credentials: LoginCredentials): Promise<AuthResult> {
      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        console.log('🔐 [Auth] Tentative de connexion...')
        const response = await api.post<{ user: User; token: string }>('/auth/login', credentials)

        if (response.success && response.data) {
          const { user, token } = response.data

          // ✅ Sauvegarder ET mettre en cache
          await setTokenWithExpiry(token, 24 * 7)
          setStoredUser(user)
          updateTokenCache(token)

          this.token = token
          this.user = this.cloneUser(user)
          this.isAuthenticated = true
          this.isInitialized = true

          console.log('✅ [Auth] Connecté:', user.name)
          return { success: true, data: { user, token } }
        }

        throw new Error(response.message || 'Erreur de connexion')
      } catch (error: any) {
        console.error('❌ [Auth] Erreur login:', error.message)
        this.error = error.message

        if (error.response?.data?.errors) {
          this.validationErrors = error.response.data.errors
        }

        return { success: false, message: error.message, errors: this.validationErrors }
      } finally {
        this.loading = false
      }
    },

    /**
     * Inscription
     */
    async register(data: RegisterData): Promise<AuthResult> {
      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        console.log('📝 [Auth] Inscription...')
        const response = await api.post<{ user: User; token: string }>('/auth/register', data)

        if (response.success && response.data) {
          const { user, token } = response.data

          await setTokenWithExpiry(token, 24 * 7)
          setStoredUser(user)
          updateTokenCache(token)

          this.token = token
          this.user = this.cloneUser(user)
          this.isAuthenticated = true
          this.isInitialized = true

          console.log('✅ [Auth] Inscrit:', user.name)
          return { success: true, data: { user, token } }
        }

        throw new Error(response.message || "Erreur d'inscription")
      } catch (error: any) {
        console.error('❌ [Auth] Erreur register:', error.message)
        this.error = error.message

        if (error.response?.data?.errors) {
          this.validationErrors = error.response.data.errors
        }

        return { success: false, message: error.message, errors: this.validationErrors }
      } finally {
        this.loading = false
      }
    },

    /**
     * Déconnexion
     */
    async logout(): Promise<void> {
      console.log('👋 [Auth] Déconnexion...')

      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.warn('⚠️ [Auth] Erreur logout API (ignorée):', error)
      } finally {
        this.clearAuthData()
      }
    },

    /**
     * Nettoyer les données d'auth
     */
    clearAuthData(): void {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      this.validationErrors = {}

      // ✅ Nettoyer storage ET cache
      secureStorage.removeItem('auth_token')
      clearUserStorage()
      clearTokenCache()

      console.log('🧹 [Auth] Données nettoyées')
    },

    /**
     * Définir les données d'auth (utilisé par d'autres stores)
     */
    async setAuthData(user: User, token: string): Promise<void> {
      await setTokenWithExpiry(token, 24 * 7)
      setStoredUser(user)
      updateTokenCache(token)

      this.user = this.cloneUser(user)
      this.token = token
      this.isAuthenticated = true
      this.isInitialized = true
    },

    /**
     * Rafraîchir les données utilisateur
     */
    async refreshUser(): Promise<void> {
      if (this.isAuthenticated) {
        await this.loadUser()
      }
    },

    /**
     * Cloner l'utilisateur pour éviter les problèmes de réactivité
     */
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

    /**
     * Valider le token
     */
    async validateToken(): Promise<boolean> {
      const token = await getTokenIfValid()
      if (!token) return false

      try {
        const result = await this.loadUser()
        return result.success
      } catch {
        return false
      }
    },

    /**
     * Test de connexion API
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
      try {
        const response = await api.get('/health')
        return { success: true, message: 'API accessible' }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },

    /**
     * Reset du store
     */
    $reset(): void {
      this.clearAuthData()
      this.isInitialized = false
    },
  },
})

export default useAuthStore
