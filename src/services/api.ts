// src/services/api.ts - VERSION CORRIGÉE
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// ==========================================
// 🛡️ FLAGS ANTI-BOUCLE DE LOGOUT
// ==========================================

let isHandling401 = false
let lastLogoutTime = 0
const LOGOUT_COOLDOWN = 3000 // 3 secondes entre les logouts

// ==========================================
// CALLBACKS
// ==========================================

type AuthCallback = () => void
type ToastCallback = (msg: string, type: 'error' | 'success' | 'warning') => void

let authCallback: AuthCallback | null = null
let toastCallback: ToastCallback | null = null

export function initializeApiCallbacks(onAuthError: AuthCallback, onToast: ToastCallback) {
  authCallback = onAuthError
  toastCallback = onToast
  console.log('✅ API callbacks initialisés')
}

// Alias pour compatibilité
export const initializeApiErrorHandler = initializeApiCallbacks

// ==========================================
// CLIENT AXIOS
// ==========================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// ==========================================
// INTERCEPTEUR REQUEST
// ==========================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    if (import.meta.env.DEV) {
      console.log('📤 API →', config.method?.toUpperCase(), config.url)
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
)

// ==========================================
// INTERCEPTEUR RESPONSE - CORRIGÉ
// ==========================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log('✅ API ←', response.status, response.config.url)
    }
    return response
  },
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    console.warn('⚠️ API Error:', { status, url })

    // ==========================================
    // 🛡️ GESTION 401 SÉCURISÉE
    // ==========================================
    if (status === 401) {
      // 1. Ignorer si c'est le logout lui-même
      if (url.includes('/auth/logout')) {
        console.log('🔓 401 sur logout - ignoré')
        return Promise.reject(error)
      }

      // 2. Ignorer si on traite déjà un 401
      if (isHandling401) {
        console.log('🔄 401 déjà en cours de traitement - ignoré')
        return Promise.reject(error)
      }

      // 3. Cooldown pour éviter les logouts multiples
      const now = Date.now()
      if (now - lastLogoutTime < LOGOUT_COOLDOWN) {
        console.log('⏳ Cooldown logout actif - ignoré')
        return Promise.reject(error)
      }

      // 4. Marquer le début du traitement
      isHandling401 = true
      lastLogoutTime = now

      console.log('🔒 401 - Session expirée, déconnexion...')

      // 5. Nettoyage local IMMÉDIAT
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      // 6. Toast (si disponible)
      if (toastCallback) {
        toastCallback('Session expirée', 'warning')
      }

      // 7. Callback de déconnexion avec délai
      setTimeout(() => {
        if (authCallback) {
          authCallback()
        } else {
          // Fallback direct
          window.location.href = '/login'
        }

        // Reset le flag après navigation
        setTimeout(() => {
          isHandling401 = false
        }, 1000)
      }, 100)

      return Promise.reject(error)
    }

    // ==========================================
    // AUTRES ERREURS (pas de logout)
    // ==========================================
    if (status === 403) {
      toastCallback?.('Accès refusé', 'error')
    } else if (status === 422) {
      // Erreur de validation - pas de toast global
      // Les composants gèrent ça individuellement
    } else if (status === 429) {
      toastCallback?.('Trop de requêtes', 'warning')
    } else if (status === 500) {
      toastCallback?.('Erreur serveur', 'error')
    } else if (!error.response) {
      // Erreur réseau - PAS de logout !
      console.warn('⚠️ Erreur réseau (pas de logout)')
      toastCallback?.('Problème de connexion', 'warning')
    }

    return Promise.reject(error)
  },
)

// ==========================================
// CLASSE API SERVICE
// ==========================================

class ApiService {
  private client: AxiosInstance = apiClient

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }
}

// ==========================================
// EXPORTS
// ==========================================

const api = new ApiService()

export default api
export { ApiService, apiClient }

// Reset manuel si nécessaire (pour debug)
export const resetLogoutState = () => {
  isHandling401 = false
  lastLogoutTime = 0
}
