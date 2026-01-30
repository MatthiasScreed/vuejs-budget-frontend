// src/services/api.ts - VERSION FINALE
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { getTokenIfValid, secureStorage } from '@/services/secureStorage'

// ==========================================
// CONFIGURATION API
// ==========================================

const getApiBaseUrl = (): string => {
  // 1. Priorité à la variable d'environnement
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
  }

  // 2. Fallback selon le mode
  if (import.meta.env.PROD) {
    // ✅ TON URL DE PRODUCTION FORGE (avec /api)
    return 'https://laravel-budget-api-saqbqlbw.on-forge.com/api'
  }

  // 3. Dev local (avec /api car Laravel utilise ce préfixe)
  return 'http://budget-api.test/api'
}

const API_BASE_URL = getApiBaseUrl()

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
})

// ==========================================
// INSTANCE AXIOS
// ==========================================

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // ✅ FIX: Désactivé pour éviter les problèmes CORS en production
  withCredentials: false,
})

// ==========================================
// INTERCEPTEURS
// ==========================================

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Récupérer le token depuis secureStorage
    const token = await getTokenIfValid()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log uniquement en dev
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    }

    config.metadata = { startTime: Date.now() }
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const duration = Date.now() - (response.config.metadata?.startTime || 0)

    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`,
      )
    }

    return response
  },
  (error: AxiosError) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || 0)

    if (error.code === 'ECONNABORTED') {
      console.error(`⏱️ TIMEOUT après ${duration}ms`)
    } else {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'NETWORK'} (${duration}ms)`,
      )
    }

    // ✅ 401 = Token invalide - NE PAS rediriger automatiquement ici
    // Laisser le code appelant (authStore) gérer la redirection
    if (error.response?.status === 401) {
      console.log('🔒 401 reçu - Token invalide ou expiré')
      // Nettoyer le storage
      secureStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }

    return Promise.reject(error)
  },
)

// ==========================================
// TYPES
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }
}

// ==========================================
// API HELPER
// ==========================================

export const api = {
  async get<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  async post<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  async put<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  async patch<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  async delete<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  // Utile pour debug
  getEnvironmentConfig() {
    return {
      mode: import.meta.env.MODE,
      apiBaseUrl: API_BASE_URL,
      isSecure: API_BASE_URL.startsWith('https'),
      isProd: import.meta.env.PROD,
    }
  },

  handleError(error: any): ApiResponse {
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: "Délai d'attente dépassé. Vérifiez votre connexion.",
      }
    }

    if (!error.response) {
      return {
        success: false,
        message: 'Erreur réseau. Vérifiez votre connexion internet.',
      }
    }

    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Erreur serveur',
      errors: error.response?.data?.errors,
    }
  },
}

export default api
