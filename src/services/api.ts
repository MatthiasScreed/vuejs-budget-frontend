// src/services/api.ts - VERSION CORRIGÉE (Anti-logout cascade)
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { getTokenIfValid, secureStorage } from '@/services/secureStorage'

// ==========================================
// CONFIGURATION API
// ==========================================

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
  }

  if (import.meta.env.PROD) {
    return 'https://laravel-budget-api-saqbqlbw.on-forge.com/api'
  }

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
  withCredentials: false,
})

// ==========================================
// 🔑 CACHE TOKEN EN MÉMOIRE
// ==========================================

let cachedToken: string | null = null
let tokenPromise: Promise<string | null> | null = null

/**
 * ✅ Récupérer le token avec cache mémoire
 * Évite les appels async répétés à localStorage
 */
async function getCachedToken(): Promise<string | null> {
  // Si on a déjà une promesse en cours, l'attendre
  if (tokenPromise) {
    return tokenPromise
  }

  // Si on a un token en cache, le retourner
  if (cachedToken) {
    return cachedToken
  }

  // Sinon, récupérer depuis storage
  tokenPromise = getTokenIfValid().then((token) => {
    cachedToken = token
    tokenPromise = null
    return token
  })

  return tokenPromise
}

/**
 * ✅ Mettre à jour le cache token
 */
export function updateTokenCache(token: string | null): void {
  cachedToken = token
  console.log('🔑 Token cache mis à jour:', !!token)
}

/**
 * ✅ Invalider le cache (appelé au logout)
 */
export function clearTokenCache(): void {
  cachedToken = null
  tokenPromise = null
  console.log('🧹 Token cache vidé')
}

// ==========================================
// INTERCEPTEURS
// ==========================================

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // ✅ Utiliser le cache token
    const token = await getCachedToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('⚠️ [API] Pas de token pour la requête:', config.url)
    }

    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, token ? '🔑' : '🚫')
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
    const url = error.config?.url || 'unknown'

    if (error.code === 'ECONNABORTED') {
      console.error(`⏱️ TIMEOUT ${url} après ${duration}ms`)
    } else {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${url} - ${error.response?.status || 'NETWORK'} (${duration}ms)`,
      )
    }

    // ✅ CORRECTION: NE PAS nettoyer automatiquement sur 401
    // Laisser le composant/store gérer la déconnexion si nécessaire
    if (error.response?.status === 401) {
      console.log('🔑 401 reçu sur:', url)

      // ⚠️ IMPORTANT: Ne nettoyer QUE si c'est une route d'auth
      // Les autres routes peuvent avoir des 401 temporaires
      const isAuthRoute = url.includes('/auth/me') || url.includes('/auth/logout')

      if (isAuthRoute) {
        console.log('🔑 401 sur route auth - invalidation du cache')
        clearTokenCache()
      } else {
        console.log('⚠️ 401 sur route non-auth - conservation du token')
        // On ne supprime PAS le token, on laisse le store gérer
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

    // ✅ Pour les 401, retourner un message clair mais ne pas forcer logout
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Session invalide',
        errors: { auth: ['Token invalide ou expiré'] },
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
