// src/stores/authStore.ts - VERSION CORRIGÉE
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types/entities/auth'

// ==========================================
// ✅ HELPERS TOKEN SIMPLIFIÉS
// ==========================================

function saveToken(token: string, expiryHours: number = 168): void {
  const expiry = Date.now() + expiryHours * 60 * 60 * 1000
  const item = { token, expiry, createdAt: new Date().toISOString() }
  localStorage.setItem('auth_token', JSON.stringify(item))
  console.log('💾 Token sauvegardé, expire:', new Date(expiry).toISOString())
}

function getToken(): string | null {
  try {
    const itemStr = localStorage.getItem('auth_token')
    if (!itemStr) return null

    const item = JSON.parse(itemStr)

    if (item.expiry && Date.now() > item.expiry) {
      console.log('🔒 Token expiré')
      localStorage.removeItem('auth_token')
      return null
    }

    return item.token || null
  } catch {
    return null
  }
}

function clearToken(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
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
  },

  actions: {
    // ==========================================
    // ✅ INIT AUTH - VERSION ROBUSTE
    // ==========================================
    async initAuth(): Promise<boolean> {
      // Éviter double init
      if (this.isInitialized) {
        console.log('🔐 Auth déjà initialisée, skip')
        return this.isAuthenticated
      }

      console.group('🔐 === INIT AUTH ===')

      try {
        // 1. Vérifier le token local
        const token = getToken()
        console.log('Token local:', token ? '✅ Présent' : '❌ Absent')

        if (!token) {
          console.log('Pas de token, utilisateur non connecté')
          this.clearAuthData()
          return false
        }

        // 2. Charger le user depuis le cache
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            this.user = JSON.parse(userStr)
            this.isAuthenticated = true
            console.log('👤 User chargé depuis cache:', this.user?.email)
          } catch {
            console.warn('Cache user corrompu')
          }
        }

        // 3. Valider avec l'API (en background)
        console.log('🌐 Validation API...')
        const result = await this.loadUser()

        if (result.success) {
          console.log('✅ Session valide!')
          return true
        } else {
          console.log('❌ Session invalide:', result.message)
          // Token invalide côté serveur
          this.clearAuthData()
          return false
        }
      } catch (error: any) {
        console.error('❌ Erreur initAuth:', error.message)
        // En cas d'erreur réseau, garder la session locale
        if (this.user) {
          console.log('⚠️ Erreur réseau, session locale conservée')
          return true
        }
        this.clearAuthData()
        return false
      } finally {
        this.isInitialized = true
        console.groupEnd()
      }
    },

    // ==========================================
    // ✅ LOGIN - VERSION SIMPLIFIÉE
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
          console.error('Réponse invalide:', response.data)
          throw new Error('Réponse serveur invalide')
        }

        const { user, token } = response.data

        // Sauvegarder le token
        const rememberHours = credentials.remember ? 168 : 24 // 7 jours ou 24h
        saveToken(token, rememberHours)

        // Mettre à jour le store
        this.user = this.cloneUser(user)
        this.isAuthenticated = true
        this.isInitialized = true
        localStorage.setItem('user', JSON.stringify(this.user))

        console.log('🎉 Login réussi:', user.email)
        console.groupEnd()

        return { success: true, data: response.data }
      } catch (error: any) {
        console.error('❌ Erreur login:', error.message)
        console.groupEnd()

        this.error = error.message
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    // ==========================================
    // REGISTER
    // ==========================================
    async register(userData: RegisterData): Promise<AuthResult> {
      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        const response = await api.post('/auth/register', userData)

        if (response.success && response.data) {
          const { user, token } = response.data
          saveToken(token, 168)
          this.user = this.cloneUser(user)
          this.isAuthenticated = true
          this.isInitialized = true
          localStorage.setItem('user', JSON.stringify(this.user))
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

        if (response.success && response.data) {
          this.user = this.cloneUser(response.data)
          this.isAuthenticated = true
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true, data: this.user }
        }

        throw new Error(response.message || "Impossible de charger l'utilisateur")
      } catch (error: any) {
        console.warn('⚠️ loadUser failed:', error.message)
        return { success: false, message: error.message }
      }
    },

    // ==========================================
    // LOGOUT
    // ==========================================
    async logout(): Promise<void> {
      try {
        await api.post('/auth/logout')
      } catch {
        console.warn('⚠️ Logout serveur échoué')
      } finally {
        this.clearAuthData()
        console.log('🚪 Déconnecté')
      }
    },

    // ==========================================
    // TEST CONNECTION
    // ==========================================
    async testConnection(): Promise<AuthResult> {
      try {
        const response = await api.get('/health')
        return { success: true, data: response, message: 'API connectée' }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },

    // ==========================================
    // HELPERS
    // ==========================================
    setAuthData(user: User): void {
      this.user = this.cloneUser(user)
      this.isAuthenticated = true
      this.isInitialized = true
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    clearAuthData(): void {
      this.user = null
      this.isAuthenticated = false
      this.error = null
      this.validationErrors = {}
      clearToken()
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
