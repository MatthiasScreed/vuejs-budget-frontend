// src/services/api/axiosInstance.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

/**
 * Instance Axios configurée
 * École 42: Configuration centralisée
 */

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Intercepteur de requête
 * Ajoute le token d'authentification
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
)

/**
 * Intercepteur de réponse
 * Gère les erreurs globalement
 */
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status)
    return response
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', error.response?.status, error.message)

    // 401 Unauthorized → Déconnexion
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('⚠️ Accès refusé')
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      console.warn('⚠️ Ressource non trouvée')
    }

    // 422 Validation Error
    if (error.response?.status === 422) {
      console.warn('⚠️ Erreur de validation', error.response.data)
    }

    // 500 Server Error
    if (error.response?.status === 500) {
      console.error('⚠️ Erreur serveur')
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
