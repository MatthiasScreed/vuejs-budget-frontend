// src/services/api.ts - VERSION CORRIGÉE AVEC BONS EXPORTS
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ==========================================
// TYPES EXPORTÉS
// ==========================================

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
const LOGOUT_COOLDOWN = 3000

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

export const initializeApiErrorHandler = initializeApiCallbacks

// ==========================================
// CLIENT AXIOS
// ==========================================

export const apiClient: AxiosInstance = axios.create({
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
// INTERCEPTEUR RESPONSE
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

    // 🛡️ GESTION 401 SÉCURISÉE
    if (status === 401) {
      if (url.includes('/auth/logout')) {
        return Promise.reject(error)
      }

      if (isHandling401) {
        return Promise.reject(error)
      }

      const now = Date.now()
      if (now - lastLogoutTime < LOGOUT_COOLDOWN) {
        return Promise.reject(error)
      }

      isHandling401 = true
      lastLogoutTime = now

      console.log('🔒 401 - Session expirée')

      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      toastCallback?.('Session expirée', 'warning')

      setTimeout(() => {
        if (authCallback) {
          authCallback()
        } else {
          window.location.href = '/login'
        }
        setTimeout(() => {
          isHandling401 = false
        }, 1000)
      }, 100)

      return Promise.reject(error)
    }

    // Autres erreurs
    if (status === 403) toastCallback?.('Accès refusé', 'error')
    else if (status === 429) toastCallback?.('Trop de requêtes', 'warning')
    else if (status === 500) toastCallback?.('Erreur serveur', 'error')
    else if (!error.response) toastCallback?.('Problème de connexion', 'warning')

    return Promise.reject(error)
  },
)

// ==========================================
// CLASSE API SERVICE
// ==========================================

class ApiService {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  async health(): Promise<any> {
    const response = await apiClient.get('/health')
    return response.data
  }
}

// ==========================================
// ✅ EXPORTS - NAMED ET DEFAULT
// ==========================================

// Instance singleton
const apiInstance = new ApiService()

// Named export (pour: import { api } from './api')
export const api = apiInstance

// Default export (pour: import api from './api')
export default apiInstance

// Autres exports
export { ApiService }
export const resetLogoutState = () => {
  isHandling401 = false
  lastLogoutTime = 0
}
