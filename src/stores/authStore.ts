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
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    isAuthenticated: false,
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
    async testConnection(): Promise<AuthResult> {
      try {
        console.log('🔄 Test de connexion API...')
        const response = await api.get('/health')
        console.log('✅ API Health Check:', response)
        return { success: true, data: response, message: 'API connectée avec succès' }
      } catch (error: any) {
        console.warn('⚠️ API Health Check Failed:', error.message)
        return { success: false, message: error.message || 'Serveur API indisponible' }
      }
    },

    async loadUser(): Promise<AuthResult> {
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
     * 🔐 CONNEXION AVEC DEBUG COMPLET
     */
    async login(credentials: LoginCredentials): Promise<AuthResult> {
      console.group('🔐 === PROCESSUS DE LOGIN ===')

      // Rate limiting
      if (!rateLimiter.canAttempt('login', 5, 15)) {
        const waitTime = rateLimiter.getWaitTime('login', 15)
        console.groupEnd()
        return {
          success: false,
          message: `Trop de tentatives. Réessayez dans ${waitTime} minutes.`,
        }
      }

      this.loading = true
      this.error = null
      this.validationErrors = {}

      try {
        // 1. Appel API
        console.log('📤 Envoi de la requête de login...')
        const response = await api.post('/auth/login', credentials)
        console.log('📥 Réponse reçue:', response)

        if (!response.success) {
          throw new Error(response.message || 'Erreur de connexion')
        }

        if (!response.data) {
          console.error('❌ Pas de données dans la réponse!', response)
          throw new Error('Réponse invalide du serveur')
        }

        const { user, token } = response.data

        if (!token) {
          console.error('❌ Pas de token dans la réponse!', response.data)
          throw new Error('Token manquant dans la réponse')
        }

        console.log('✅ Token extrait:', token.substring(0, 20) + '...')
        console.log('✅ User extrait:', user.email)

        // 2. Sauvegarder le token
        console.log('💾 Sauvegarde du token avec setTokenWithExpiry...')
        await setTokenWithExpiry(token, 24 * 7)
        console.log('✅ setTokenWithExpiry terminé')

        // 3. VÉRIFICATION IMMÉDIATE
        console.log('🔍 Vérification immédiate du token sauvegardé...')
        const savedToken = await getTokenIfValid()

        if (savedToken) {
          console.log('✅ Token RÉCUPÉRÉ avec succès:', savedToken.substring(0, 20) + '...')
          console.log('✅ Correspondance:', savedToken === token)
        } else {
          console.error('❌ ÉCHEC : getTokenIfValid() retourne NULL juste après sauvegarde!')
          console.error('🔍 Vérifions le localStorage...')
          console.log('auth_token existe?', localStorage.getItem('auth_token') !== null)
          console.log(
            'auth_token_expiry existe?',
            localStorage.getItem('auth_token_expiry') !== null,
          )
          console.log('auth_token value:', localStorage.getItem('auth_token'))
          console.log('auth_token_expiry value:', localStorage.getItem('auth_token_expiry'))
        }

        // 4. Mettre à jour le store
        console.log('📝 Mise à jour du store...')
        this.setAuthData(user)
        rateLimiter.reset('login')

        console.log('🎉 Login réussi!')
        console.groupEnd()

        return { success: true, data: response.data }
      } catch (error: any) {
        console.error('❌ Erreur de login:', error)
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

    async register(userData: RegisterData): Promise<AuthResult> {
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
     * 🔍 INIT AUTH AVEC DEBUG COMPLET
     */
    async initAuth(): Promise<boolean> {
      console.group('🔍 === INIT AUTH ===')

      try {
        // 1. Vérifier le token
        console.log('🔑 Vérification du token...')
        const token = await getTokenIfValid()
        console.log('Token récupéré:', token ? token.substring(0, 20) + '...' : 'NULL')

        if (!token) {
          console.log('❌ Aucun token valide trouvé')
          console.log('📋 Contenu localStorage:')
          console.log('- auth_token:', localStorage.getItem('auth_token') ? 'EXISTS' : 'NULL')
          console.log(
            '- auth_token_expiry:',
            localStorage.getItem('auth_token_expiry') ? 'EXISTS' : 'NULL',
          )
          console.log('- user:', localStorage.getItem('user') ? 'EXISTS' : 'NULL')
          this.clearAuthData()
          console.groupEnd()
          return false
        }

        // 2. Vérifier cache utilisateur
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          console.log('❌ Aucun cache utilisateur')
          this.clearAuthData()
          console.groupEnd()
          return false
        }

        // 3. Définir état de base
        this.user = JSON.parse(userStr)
        this.isAuthenticated = true
        console.log('✅ État restauré:', this.user?.name)

        // 4. Vérifier avec l'API
        console.log('🌐 Vérification API...')
        const result = await this.loadUser()

        if (result.success) {
          console.log('✅ Session valide!')
          setupMultiTabLogout(() => {
            this.clearAuthData()
            window.location.href = '/login'
          })
          console.groupEnd()
          return true
        } else {
          console.log('❌ Session invalide:', result.message)
          this.clearAuthData()
          console.groupEnd()
          return false
        }
      } catch (error) {
        console.error('❌ Erreur initAuth:', error)
        this.clearAuthData()
        console.groupEnd()
        return false
      }
    },

    async refreshUser(): Promise<void> {
      if (this.isAuthenticated) {
        await this.loadUser()
      }
    },

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

    async getCurrentToken(): Promise<string | null> {
      return await getTokenIfValid()
    },

    setAuthData(user: User): void {
      this.user = this.cloneUser(user)
      this.isAuthenticated = true
      this.error = null
      this.validationErrors = {}
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    clearAuthData(): void {
      this.user = null
      this.isAuthenticated = false
      this.error = null
      this.validationErrors = {}
      localStorage.removeItem('user')
      secureStorage.removeItem('auth_token')
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
