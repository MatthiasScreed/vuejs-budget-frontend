// src/stores/authStore.ts - VERSION SÉCURISÉE NATIVE
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import {
  secureStorage,
  setTokenWithExpiry,
  getTokenIfValid,
  rateLimiter,
  setupMultiTabLogout,
} from '@/services/secureStorage'
import type { User, LoginCredentials, RegisterData } from '@/types/entities/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
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

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // ✅ Cache utilisateur en localStorage normal (pas sensible)
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    isAuthenticated: false, // Sera vérifié au démarrage
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
  },

  actions: {
    /**
     * Test de connexion API
     */
    async testConnection(): Promise<AuthResult> {
      try {
        console.log('🔄 Test de connexion API...')
        const response = await api.get('/health')

        console.log('✅ API Health Check:', response)
        return {
          success: true,
          data: response,
          message: 'API connectée avec succès',
        }
      } catch (error: any) {
        console.warn('⚠️ API Health Check Failed:', error.message)
        return {
          success: false,
          message: error.message || 'Serveur API indisponible',
        }
      }
    },

    /**
     * Charger les données utilisateur
     */
    async loadUser(): Promise<AuthResult> {
      // ✅ Vérifier que le token est valide
      const token = await getTokenIfValid()
      if (!token) {
        return { success: false, message: 'Aucun token valide' }
      }

      this.loading = true
      this.error = null

      try {
        console.log('👤 Chargement des données utilisateur...')

        const response = await api.get<User>('/auth/me')

        if (response.success && response.data) {
          this.user = this.cloneUser(response.data)
          this.isAuthenticated = true

          // Cache utilisateur (pas sensible)
          localStorage.setItem('user', JSON.stringify(this.user))

          console.log('✅ Utilisateur chargé:', this.user?.name)
          return { success: true, data: this.user }
        }

        throw new Error(response.message || "Impossible de charger l'utilisateur")
      } catch (error: any) {
        console.warn('⚠️ Échec du chargement utilisateur:', error.message)
        this.error = error.message

        if (error.response?.status === 401) {
          await this.logout()
        }

        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * Connexion utilisateur avec rate limiting
     */
    async login(credentials: LoginCredentials): Promise<AuthResult> {
      // ✅ Rate limiting (max 5 tentatives / 15min)
      if (!rateLimiter.canAttempt('login', 5, 15)) {
        const waitTime = rateLimiter.getWaitTime('login', 15)
        return {
          success: false,
          message: `Trop de tentatives. Réessayez dans ${waitTime} minutes.`,
        }
      }

      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        const response = await api.post('/auth/login', credentials)

        if (response.success && response.data) {
          const { user, token } = response.data

          // ✅ Stocker le token de façon sécurisée avec expiration
          await setTokenWithExpiry(token, 24 * 7) // 7 jours

          // Cache utilisateur
          this.setAuthData(user)

          // ✅ Reset rate limiter après succès
          rateLimiter.reset('login')

          console.log('✅ Connexion réussie:', user.name)
          return { success: true, data: response.data }
        }

        throw new Error(response.message || 'Erreur de connexion')
      } catch (error: any) {
        this.error = error.message

        if (error.response?.data?.errors) {
          this.validationErrors = error.response.data.errors
        }

        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * Enregistrement utilisateur
     */
    async register(userData: RegisterData): Promise<AuthResult> {
      // ✅ Rate limiting inscription
      if (!rateLimiter.canAttempt('register', 3, 60)) {
        const waitTime = rateLimiter.getWaitTime('register', 60)
        return {
          success: false,
          message: `Trop de tentatives d'inscription. Réessayez dans ${waitTime} minutes.`,
        }
      }

      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        const response = await api.post('/auth/register', userData)

        if (response.success && response.data) {
          const { user, token } = response.data

          // ✅ Stocker token sécurisé
          await setTokenWithExpiry(token, 24 * 7)

          this.setAuthData(user)
          rateLimiter.reset('register')

          console.log('✅ Inscription réussie:', user.name)
          return { success: true, data: response.data }
        }

        throw new Error(response.message || "Erreur d'enregistrement")
      } catch (error: any) {
        this.error = error.message

        if (error.response?.data?.errors) {
          this.validationErrors = error.response.data.errors
        }

        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * Déconnexion
     */
    async logout(): Promise<void> {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.warn('⚠️ Logout serveur échoué:', error)
      } finally {
        this.clearAuthData()
        console.log('🚪 Déconnexion locale effectuée')
      }
    },

    /**
     * Initialiser l'authentification au démarrage
     */
    async initAuth(): Promise<boolean> {
      try {
        // ✅ Vérifier token chiffré
        const token = await getTokenIfValid()

        if (!token) {
          console.log('❌ Aucun token valide')
          this.clearAuthData()
          return false
        }

        // ✅ Vérifier cache utilisateur
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          console.log('❌ Aucun cache utilisateur')
          this.clearAuthData()
          return false
        }

        // Définir état de base
        this.user = JSON.parse(userStr)
        this.isAuthenticated = true

        // ✅ Vérifier token auprès de l'API
        const result = await this.loadUser()

        if (result.success) {
          console.log('✅ Session restaurée:', this.user?.name)

          // ✅ Setup logout multi-onglets
          setupMultiTabLogout(() => {
            this.clearAuthData()
            window.location.href = '/login'
          })

          return true
        } else {
          // Token invalide ou expiré
          console.log('❌ Token invalide')
          this.clearAuthData()
          return false
        }
      } catch (error) {
        console.warn('⚠️ Erreur initAuth:', error)
        this.clearAuthData()
        return false
      }
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
     * Mettre à jour le profil
     */
    async updateProfile(updates: Partial<User>): Promise<AuthResult> {
      if (!this.isAuthenticated) {
        return { success: false, message: 'Non authentifié' }
      }

      this.loading = true
      this.error = null

      try {
        const response = await api.put('/auth/profile', updates)

        if (response.success && response.data) {
          this.user = this.cloneUser(response.data)
          localStorage.setItem('user', JSON.stringify(this.user))

          console.log('✅ Profil mis à jour')
          return { success: true, data: this.user }
        }

        throw new Error(response.message || 'Erreur mise à jour profil')
      } catch (error: any) {
        this.error = error.message
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtenir le token actuel (pour usage interne)
     */
    async getCurrentToken(): Promise<string | null> {
      return await getTokenIfValid()
    },

    /**
     * Définir les données d'authentification
     */
    setAuthData(user: User): void {
      this.user = this.cloneUser(user)
      this.isAuthenticated = true
      this.error = null
      this.validationErrors = {}

      // Cache utilisateur (pas sensible)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    /**
     * Nettoyer les données d'authentification
     */
    clearAuthData(): void {
      this.user = null
      this.isAuthenticated = false
      this.error = null
      this.validationErrors = {}

      // ✅ Nettoyer localStorage ET secureStorage
      localStorage.removeItem('user')
      secureStorage.removeItem('auth_token')
    },

    /**
     * Cloner utilisateur pour éviter XrayWrapper
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
  },
})
