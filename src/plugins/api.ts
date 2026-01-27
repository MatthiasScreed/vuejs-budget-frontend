import type { App } from 'vue'
import { initializeApiCallbacks } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

// ==========================================
// PLUGIN VUE POUR INITIALISER L'API
// ==========================================

export function setupApiPlugin(app: App) {
  // Initialiser les callbacks une fois l'app montée
  app.config.globalProperties.$initApi = () => {
    const authStore = useAuthStore()
    const toast = useToast()

    // Initialiser les callbacks pour l'API
    initializeApiCallbacks(
      // Callback de déconnexion
      () => {
        authStore.logout()
        window.location.href = '/login'
      },
      // Callback de toast
      (message: string, type: 'error' | 'success' | 'warning') => {
        switch (type) {
          case 'error':
            toast.error(message)
            break
          case 'success':
            toast.success(message)
            break
          case 'warning':
            toast.warning(message)
            break
        }
      }
    )
  }
}

// ==========================================
// COMPOSABLE POUR INITIALISER L'API
// ==========================================

export function useApiSetup() {
  const authStore = useAuthStore()
  const toast = useToast()

  const initializeApi = () => {
    initializeApiCallbacks(
      // Callback de déconnexion
      () => {
        authStore.logout()
        // Navigation sera gérée par le router guard
      },
      // Callback de toast
      (message: string, type: 'error' | 'success' | 'warning') => {
        switch (type) {
          case 'error':
            toast.error(message)
            break
          case 'success':
            toast.success(message)
            break
          case 'warning':
            toast.warning(message)
            break
        }
      }
    )
  }

  return {
    initializeApi
  }
}
