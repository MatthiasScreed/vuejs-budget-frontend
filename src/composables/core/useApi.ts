// src/composables/core/useApi.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    total?: number
    per_page?: number
    current_page?: number
    last_page?: number
  }
}

interface ApiOptions extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandling?: boolean
}

export function useApi() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://budget-api.test/api'

  console.log('🔧 API Base URL:', API_BASE_URL)

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
  })

  // Intercepteur REQUEST
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token && !config.skipAuth) {
        config.headers.Authorization = `Bearer ${token}`
      }
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
      return config
    },
    (error) => {
      console.error('❌ Request error:', error)
      return Promise.reject(error)
    }
  )

  // Intercepteur RESPONSE
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
      return response
    },
    async (error) => {
      const status = error.response?.status
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status}`)

      if (status === 401) {
        console.log('🔒 Session expirée, redirection...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }

      if (status === 503) {
        console.log('🚧 Application en maintenance')
      }

      return Promise.reject(error)
    }
  )

  /**
   * ✅ GET - RETOURNE DIRECTEMENT LA RÉPONSE LARAVEL
   */
  async function get<T = any>(
    url: string,
    config?: ApiOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<any>(url, config)

      // ✅ Si la réponse a déjà un champ success, on la retourne telle quelle
      if (response.data && typeof response.data.success !== 'undefined') {
        return response.data
      }

      // Sinon on wrappe
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur réseau',
        errors: error.response?.data?.errors
      }
    }
  }

  /**
   * ✅ POST - RETOURNE DIRECTEMENT LA RÉPONSE LARAVEL
   */
  async function post<T = any>(
    url: string,
    data?: any,
    config?: ApiOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<any>(url, data, config)

      if (response.data && typeof response.data.success !== 'undefined') {
        return response.data
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur réseau',
        errors: error.response?.data?.errors
      }
    }
  }

  /**
   * ✅ PUT
   */
  async function put<T = any>(
    url: string,
    data?: any,
    config?: ApiOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<any>(url, data, config)

      if (response.data && typeof response.data.success !== 'undefined') {
        return response.data
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur réseau',
        errors: error.response?.data?.errors
      }
    }
  }

  /**
   * ✅ PATCH
   */
  async function patch<T = any>(
    url: string,
    data?: any,
    config?: ApiOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.patch<any>(url, data, config)

      if (response.data && typeof response.data.success !== 'undefined') {
        return response.data
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur réseau',
        errors: error.response?.data?.errors
      }
    }
  }

  /**
   * ✅ DELETE
   */
  async function del<T = any>(
    url: string,
    config?: ApiOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<any>(url, config)

      if (response.data && typeof response.data.success !== 'undefined') {
        return response.data
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur réseau',
        errors: error.response?.data?.errors
      }
    }
  }

  /**
   * Upload de fichiers
   */
  async function upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<any>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100
            onProgress(Math.round(progress))
          }
        }
      })

      if (response.data && typeof response.data.success !== 'undefined') {
        return response.data
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur upload',
        errors: error.response?.data?.errors
      }
    }
  }

  /**
   * Health check
   */
  async function healthCheck(): Promise<boolean> {
    try {
      const response = await get('/health', { skipAuth: true })
      return response.success
    } catch {
      return false
    }
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    healthCheck,
    axios: axiosInstance
  }
}
