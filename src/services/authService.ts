// src/services/authService.ts - VERSION CORRIGÉE
// ✅ Utilise le singleton api (même client que tous les stores)
// ✅ Routes sans /api/ (baseURL le contient déjà)
import api from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { User, LoginCredentials, RegisterCredentials } from '@/stores/authStore'

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
  /**
   * Connexion utilisateur
   * ⚠️ NE PAS stocker le token ici, authStore s'en charge
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      if (response.success && response.data) {
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
      const response = await api.post<AuthResponse>('/auth/register', credentials)
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
      const response = await api.post('/auth/logout')

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
      return { success: true, message: 'Déconnexion locale forcée' }
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getUser(): Promise<ApiResponse<User>> {
    try {
      return await api.get<User>('/auth/user')
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
      const response = await api.post<RefreshResponse>('/auth/refresh')
      if (response.success && response.data) {
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
      return await api.put<User>('/auth/profile', profileData)
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
      return await api.put('/auth/password', data)
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
      return await api.post('/auth/reset-password', { email })
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
      return await api.post('/auth/reset-password-confirm', data)
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
      return await api.get('/health')
    } catch (error: any) {
      console.error('API ping error:', error)
      throw error
    }
  }

  /**
   * @deprecated Utiliser authStore.isAuthenticated
   */
  getToken(): string | null {
    console.warn('⚠️ authService.getToken() deprecated')
    return localStorage.getItem('auth_token')
  }

  /**
   * @deprecated Utiliser authStore.isAuthenticated
   */
  isAuthenticated(): boolean {
    console.warn('⚠️ authService.isAuthenticated() deprecated')
    return false
  }
}

export const authService = new AuthService()
