// src/composables/useApiSetup.ts
import { onMounted } from 'vue'
import { initializeApiErrorHandler } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

/**
 * Composable pour configurer l'API et gérer les erreurs globalement
 */
export function useApiSetup() {
  const authStore = useAuthStore()
  const toast = useToast()
  const router = useRouter()

  /**
   * Initialiser les callbacks API
   */
  const initializeApi = () => {
    console.log('🔧 Initialisation des callbacks API...')

    try {
      initializeApiErrorHandler(
        // Callback de déconnexion forcée
        () => {
          console.warn('🚪 Déconnexion forcée - Token expiré')
          authStore.logout()

          // Navigation sécurisée vers login
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
        },

        // Callback de notifications toast
        (message: string, type: 'error' | 'success' | 'warning') => {
          const toastOptions = {
            timeout: type === 'error' ? 8000 : 5000,
            closeOnClick: true,
            pauseOnHover: true
          }

          switch (type) {
            case 'error':
              toast.error(message, toastOptions)
              console.error('🔴 API Error:', message)
              break
            case 'success':
              toast.success(message, toastOptions)
              console.log('✅ API Success:', message)
              break
            case 'warning':
              toast.warning(message, toastOptions)
              console.warn('⚠️ API Warning:', message)
              break
          }
        }
      )

      console.log('✅ Callbacks API initialisés avec succès')
    } catch (error) {
      console.error('❌ Erreur initialisation API:', error)
      toast.error('Erreur d\'initialisation de l\'API')
    }
  }

  /**
   * Test de connectivité API
   */
  const testApiConnection = async () => {
    try {
      console.log('🔍 Test de connectivité API...')
      const result = await authStore.testConnection()

      if (result.success) {
        toast.success('✅ Connexion API établie')
        console.log('🌐 API disponible:', result.data)
      } else {
        toast.error('❌ API indisponible')
        console.error('💥 Test API failed:', result.message)
      }

      return result.success
    } catch (error) {
      toast.error('Impossible de tester l\'API')
      console.error('🔥 API Test Exception:', error)
      return false
    }
  }

  /**
   * Auto-initialisation au montage du composant
   */
  onMounted(() => {
    initializeApi()
  })

  return {
    initializeApi,
    testApiConnection
  }
}
