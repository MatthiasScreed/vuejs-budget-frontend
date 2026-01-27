import { useApi } from '@/composables/core/useApi'
import type { User, LoginCredentials, RegisterCredentials, ApiResponse } from '@/stores/authStore'

interface AuthResponse {
  user: User
  token: string
  expires_in: number
}

interface RefreshResponse {
  token: string
  expires_in: number
}

/**
 * Service d'authentification
 * Gère login, register, refresh token et profile
 */
class AuthService {
  private api = useApi()

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.api.post<AuthResponse>('/api/auth/login', credentials)

      if (response.success && response.data) {
        // Stocker le token
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('token_expires', (Date.now() + response.data.expires_in * 1000).toString())

        console.log('User logged in:', response.data.user.name)
      }

      return response
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.api.post<AuthResponse>('/api/auth/register', credentials)

      if (response.success && response.data) {
        console.log('User registered:', response.data.user.name)
      }

      return response
    } catch (error: any) {
      console.error('Register error:', error)
      throw error
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/api/auth/logout')

      // Nettoyer le stockage local
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token_expires')
      localStorage.removeItem('user_data')
      localStorage.removeItem('gaming_data')

      console.log('User logged out')
      return response

    } catch (error: any) {
      // Forcer le logout local même en cas d'erreur API
      localStorage.clear()
      console.warn('Logout forced locally due to API error')

      return {
        success: true,
        message: 'Déconnexion locale forcée'
      }
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getUser(): Promise<ApiResponse<User>> {
    try {
      return await this.api.get<User>('/api/auth/user')
    } catch (error: any) {
      console.error('Get user error:', error)
      throw error
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<ApiResponse<RefreshResponse>> {
    try {
      const response = await this.api.post<RefreshResponse>('/api/auth/refresh')

      if (response.success && response.data) {
        // Mettre à jour le token
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('token_expires', (Date.now() + response.data.expires_in * 1000).toString())
        console.log('Token refreshed')
      }

      return response
    } catch (error: any) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await this.api.put<User>('/api/auth/profile', profileData)
    } catch (error: any) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(data: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<ApiResponse> {
    try {
      return await this.api.put('/api/auth/password', data)
    } catch (error: any) {
      console.error('Change password error:', error)
      throw error
    }
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(email: string): Promise<ApiResponse> {
    try {
      return await this.api.post('/api/auth/reset-password', { email })
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  /**
   * Confirmer la réinitialisation
   */
  async confirmReset(data: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<ApiResponse> {
    try {
      return await this.api.post('/api/auth/reset-password-confirm', data)
    } catch (error: any) {
      console.error('Confirm reset error:', error)
      throw error
    }
  }

  /**
   * Vérifier la santé de l'API
   */
  async ping(): Promise<ApiResponse> {
    try {
      return await this.api.get('/api/health')
    } catch (error: any) {
      console.error('API ping error:', error)
      throw error
    }
  }

  /**
   * Vérifier si le token est expiré
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires')
    if (!expiresAt) return true

    return Date.now() > parseInt(expiresAt)
  }

  /**
   * Obtenir le token actuel
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired()
  }
}

// Instance singleton
export const authService = new AuthService()
