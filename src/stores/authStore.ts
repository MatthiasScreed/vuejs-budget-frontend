// src/stores/authStore.ts - VERSION CORRIGÉE COMPLÈTE
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types/entities/auth'

// ==========================================
// TYPES
// ==========================================

interface AuthState {
  user: User | null
  token: string | null
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

// ==========================================
// STORE
// ==========================================

export const useAuthStore = defineStore('auth', {
  // ==========================================
  // STATE - Initialisé depuis localStorage
  // ==========================================
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
    loading: false,
    error: null,
    validationErrors: {},
  }),

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    isLoggedIn: (state): boolean => state.isAuthenticated && state.user !== null,
    userName: (state): string => state.user?.name || '',
    userEmail: (state): string => state.user?.email || '',
    userCurrency: (state): string => state.user?.currency || 'EUR',
    userLevel: (state): number => state.user?.level?.level || 1,
    userXP: (state): number => state.user?.level?.total_xp || 0,
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    /**
     * 🔐 INITIALISER L'AUTH - VERSION SÉCURISÉE
     * ⚠️ Ne fait PAS d'appel API bloquant !
     */
    async initAuth(): Promise<boolean> {
      console.log('🔐 initAuth() - Début')

      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')

      // 1. Pas de données locales → pas d'auth
      if (!token || !userStr) {
        console.log('🔐 initAuth() - Pas de données locales')
        this.clearAuthData()
        return false
      }

      // 2. Restaurer depuis localStorage SANS appel API
      try {
        this.token = token
        this.user = JSON.parse(userStr)
        this.isAuthenticated = true

        console.log('✅ initAuth() - Auth restaurée:', this.user?.email)

        // 3. Rafraîchir en arrière-plan (non-bloquant)
        this.refreshUserInBackground()

        return true
      } catch (error) {
        console.error('❌ initAuth() - Erreur parsing:', error)
        this.clearAuthData()
        return false
      }
    },

    /**
     * 🔄 Rafraîchir l'utilisateur en arrière-plan
     * Ne bloque pas, ne déclenche pas de logout sur erreur
     */
    async refreshUserInBackground(): Promise<void> {
      // Délai pour laisser l'app se rendre
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
        // ⚠️ NE PAS déclencher de logout ici !
        console.warn('⚠️ Rafraîchissement échoué (non critique):', error.message)
      }
    },

    /**
     * 👤 Charger l'utilisateur depuis l'API
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
        // ⚠️ NE PAS appeler logout() ici !
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
     * 🚪 Déconnexion
     */
    async logout(): Promise<void> {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.warn('⚠️ Logout serveur échoué (pas grave)')
      } finally {
        this.clearAuthData()
      }
    },

    /**
     * 💾 Sauvegarder les données d'auth
     */
    setAuthData(user: User, token: string): void {
      this.user = JSON.parse(JSON.stringify(user))
      this.token = token
      this.isAuthenticated = true

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(this.user))

      console.log('✅ Auth data sauvegardée')
    },

    /**
     * 🧹 Nettoyer les données d'auth
     */
    clearAuthData(): void {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      this.validationErrors = {}

      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      console.log('🧹 Auth data nettoyée')
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
     * 🧪 Test de connexion API
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
