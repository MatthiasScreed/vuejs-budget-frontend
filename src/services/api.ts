import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { getTokenIfValid } from '@/services/secureStorage'

// ==========================================
// CONFIGURATION API
// ==========================================

// ⚠️ IMPORTANT: VITE_API_BASE_URL doit pointer vers la racine (sans /api)
// Les routes ajoutent déjà le préfixe /api dans les appels
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://budget-api.test'

// Vérifier si /api est déjà dans l'URL
const baseURL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : API_BASE_URL
console.log('🔧 API Base URL:', baseURL)
console.log('🔧 Environment:', import.meta.env.MODE)

// ==========================================
// INSTANCE AXIOS
// ==========================================

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 60000, // 60 secondes
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// ==========================================
// INTERCEPTEURS
// ==========================================

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // ✅ Récupérer le token depuis secureStorage
    const token = await getTokenIfValid()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`)

    // Timestamp pour mesurer durée
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
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`,
    )

    return response
  },
  (error: AxiosError) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || 0)

    if (error.code === 'ECONNABORTED') {
      console.error(
        `⏱️ TIMEOUT ${error.config?.method?.toUpperCase()} ${error.config?.url} après ${duration}ms`,
      )
    } else {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status} (${duration}ms)`,
      )
    }

    // 401 = Non authentifié
    if (error.response?.status === 401) {
      console.log('🔒 Session expirée - Redirection login')

      // ✅ Nettoyer le storage sécurisé
      import('@/services/secureStorage').then(({ secureStorage }) => {
        secureStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      })

      // Redirection
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
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
  // GET
  async get<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  // POST
  async post<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  // PUT
  async put<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  // PATCH
  async patch<T = any>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  // DELETE
  async delete<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      return this.handleError(error)
    }
  },

  // ==========================================
  // HELPER ERROR HANDLING
  // ==========================================

  handleError(error: any): ApiResponse {
    // Timeout
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: "Délai d'attente dépassé. Vérifiez votre connexion.",
      }
    }

    // Network error
    if (!error.response) {
      return {
        success: false,
        message: 'Erreur réseau. Vérifiez votre connexion internet.',
      }
    }

    // Server error
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Erreur serveur',
      errors: error.response?.data?.errors,
    }
  },
}

export default api
