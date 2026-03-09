// src/stores/authStore.ts - VERSION COMPLÈTE AVEC isInitialized
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types/entities/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean // ✅ AJOUTÉ
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
    user: (() => {
      try {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
      } catch {
        return null
      }
    })(),
    token: localStorage.getItem('auth_token'),
    isAuthenticated: !!localStorage.getItem('auth_token'),
    isInitialized: false, // ✅ AJOUTÉ
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
     * 🔐 INITIALISER L'AUTH
     */
    async initAuth(): Promise<boolean> {
      console.log('🔐 initAuth() - Début')

      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')

      if (!token || !userStr) {
        console.log('🔐 initAuth() - Pas de données locales')
        this.clearAuthData()
        this.isInitialized = true // ✅ Marquer comme initialisé
        return false
      }

      try {
        this.token = token
        this.user = JSON.parse(userStr)
        this.isAuthenticated = true
        this.isInitialized = true // ✅ Marquer comme initialisé

        console.log('✅ initAuth() - Auth restaurée:', this.user?.email)

        // Rafraîchir en arrière-plan
        this.refreshUserInBackground()

        return true
      } catch (error) {
        console.error('❌ initAuth() - Erreur parsing:', error)
        this.clearAuthData()
        this.isInitialized = true // ✅ Marquer comme initialisé même en erreur
        return false
      }
    },

    /**
     * 🔄 Rafraîchir en arrière-plan
     */
    async refreshUserInBackground(): Promise<void> {
      await new Promise((r) => setTimeout(r, 500))

      try {
        console.log('🔄 Rafraîchissement user en arrière-plan...')
        const response = await api.get<User>('/auth/me')

        if (response.success && response.data) {
          this.user = JSON.parse(JSON.stringify(response.data))
          localStorage.setItem('user', JSON.stringify(this.user))
          console.log('✅ User rafraîchi:', this.user?.name)
        }
      } catch (error: any) {
        console.warn('⚠️ Rafraîchissement échoué (non critique):', error.message)
      }
    },

    /**
     * 👤 Charger l'utilisateur
     */
    async loadUser(): Promise<AuthResult> {
      if (!this.token) {
        return { success: false, message: 'Pas de token' }
      }

      this.loading = true

      try {
        const response = await api.get<User>('/auth/me')

        if (response.success && response.data) {
          this.user = JSON.parse(JSON.stringify(response.data))
          this.isAuthenticated = true
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true, data: this.user }
        }

        throw new Error(response.message || 'Erreur chargement')
      } catch (error: any) {
        console.warn('⚠️ loadUser échoué:', error.message)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 🔑 Connexion
     */
    async login(credentials: LoginCredentials): Promise<AuthResult> {
      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        const response = await api.post('/auth/login', credentials)

        if (response.success && response.data) {
          const { user, token } = response.data
          this.setAuthData(user, token)
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
     * 📝 Inscription
     */
    async register(userData: RegisterData): Promise<AuthResult> {
      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        const response = await api.post('/auth/register', userData)

        if (response.success && response.data) {
          const { user, token } = response.data
          this.setAuthData(user, token)
          return { success: true, data: response.data }
        }

        throw new Error(response.message || 'Erreur inscription')
      } catch (error: any) {
        // ✅ Extraire le vrai message + erreurs de validation
        const apiErrors = error.response?.data?.errors || {}
        const apiMessage = error.response?.data?.message || ''

        this.validationErrors = apiErrors
        this.error = apiMessage || error.message

        return {
          success: false,
          message: apiMessage || error.message,
          errors: apiErrors, // ← ON RETOURNE LES ERREURS PAR CHAMP
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 🚪 Déconnexion
     */
    async logout(): Promise<void> {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.warn('⚠️ Logout serveur échoué')
      } finally {
        this.clearAuthData()
      }
    },

    /**
     * 💾 Sauvegarder l'auth
     */
    setAuthData(user: User, token: string): void {
      this.user = JSON.parse(JSON.stringify(user))
      this.token = token
      this.isAuthenticated = true
      this.isInitialized = true // ✅

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    /**
     * 🧹 Nettoyer l'auth
     */
    clearAuthData(): void {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      // NE PAS reset isInitialized ici
      this.error = null
      this.validationErrors = {}

      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    },

    /**
     * 🔧 Mettre à jour le profil
     */
    async updateProfile(data: Partial<User>): Promise<AuthResult> {
      this.loading = true

      try {
        const response = await api.put('/auth/profile', data)

        if (response.success && response.data) {
          this.user = { ...this.user, ...response.data }
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true, data: this.user }
        }

        throw new Error(response.message || 'Erreur mise à jour')
      } catch (error: any) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 🧪 Test connexion API
     */
    async testConnection(): Promise<AuthResult> {
      try {
        const response = await api.get('/health')
        return { success: true, data: response }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },
  },
})
