import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// ==========================================
// CONFIGURATION DE BASE
// ==========================================

const API_BASE_URL = '/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// ==========================================
// CRÉATION DE L'INSTANCE AXIOS
// ==========================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// ==========================================
// CALLBACKS POUR LES STORES (INJECTION)
// ==========================================

let authCallback: (() => void) | null = null
let toastCallback: ((message: string, type: 'error' | 'success' | 'warning') => void) | null = null

/**
 * Initialiser les callbacks pour éviter les imports directs de stores
 */
export function initializeApiCallbacks(
  onAuthError: () => void,
  onToast: (message: string, type: 'error' | 'success' | 'warning') => void
) {
  authCallback = onAuthError
  toastCallback = onToast
}

// ==========================================
// INTERCEPTEURS DE REQUÊTE
// ==========================================

apiClient.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification depuis localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // Ajouter des headers personnalisés
    config.headers['X-Client-Version'] = '1.0.0'
    config.headers['X-Timestamp'] = new Date().toISOString()

    // Log des requêtes en développement
    if (import.meta.env.DEV) {
      console.log('🔄 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL
      })
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// ==========================================
// INTERCEPTEURS DE RÉPONSE
// ==========================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log des réponses en développement
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url
      })
    }

    // Cloner la réponse pour éviter XrayWrapper issues
    if (response.data && typeof response.data === 'object') {
      try {
        response.data = JSON.parse(JSON.stringify(response.data))
      } catch (error) {
        console.warn('⚠️ Impossible de cloner la réponse:', error)
      }
    }

    return response
  },
  async (error) => {
    // Log des erreurs
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    })

    // Gestion des erreurs spécifiques
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Token expiré ou invalide
          console.log('🔑 Token invalide, déconnexion...')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')

          // Utiliser le callback au lieu d'importer directement le store
          if (authCallback) {
            authCallback()
          } else {
            window.location.href = '/login'
          }
          break

        case 403:
          toastCallback?.('Accès refusé', 'error')
          break

        case 404:
          toastCallback?.('Ressource non trouvée', 'error')
          break

        case 422:
          // Erreurs de validation
          if (data.errors) {
            const firstError = Object.values(data.errors)[0] as string[]
            toastCallback?.(firstError[0] || 'Erreur de validation', 'error')
          }
          break

        case 429:
          toastCallback?.('Trop de requêtes, veuillez patienter', 'error')
          break

        case 500:
          toastCallback?.('Erreur serveur, veuillez réessayer', 'error')
          break

        default:
          toastCallback?.(data.message || 'Une erreur est survenue', 'error')
      }
    } else if (error.request) {
      // Erreur réseau
      toastCallback?.('Erreur de connexion au serveur', 'error')
    } else {
      // Autre erreur
      toastCallback?.('Une erreur inattendue est survenue', 'error')
    }

    return Promise.reject(error)
  }
)

// ==========================================
// CLASSE API SERVICE
// ==========================================

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = apiClient
  }

  /**
   * Effectuer une requête GET
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Effectuer une requête POST
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Effectuer une requête PUT
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Effectuer une requête PATCH
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Effectuer une requête DELETE
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Upload de fichier
   */
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Télécharger un fichier
   */
  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      link.click()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Vérifier la santé de l'API
   */
  async health(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/health')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtenir les informations de l'API
   */
  async info(): Promise<any> {
    try {
      const response = await this.client.get('/docs')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Gérer les erreurs
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Erreur de réponse du serveur
      const { status, data } = error.response
      const message = data?.message || `Erreur ${status}`
      return new Error(message)
    } else if (error.request) {
      // Erreur réseau
      return new Error('Erreur de connexion au serveur')
    } else {
      // Autre erreur
      return new Error(error.message || 'Une erreur inattendue est survenue')
    }
  }

  /**
   * Annuler une requête
   */
  createCancelToken() {
    return axios.CancelToken.source()
  }

  /**
   * Vérifier si une erreur est due à une annulation
   */
  isCancel(error: any): boolean {
    return axios.isCancel(error)
  }
}

// ==========================================
// INSTANCE SINGLETON
// ==========================================

const api = new ApiService()

// ==========================================
// EXPORT
// ==========================================

export default api
export { ApiService, apiClient }
export type { ApiResponse }
