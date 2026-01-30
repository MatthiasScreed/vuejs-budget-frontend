// src/composables/useAuthGuard.ts
import { useAuthStore } from '@/stores/authStore'

/**
 * 🛡️ Helper pour vérifier l'authentification avant les appels API
 */
export function useAuthGuard() {
  const authStore = useAuthStore()

  /**
   * Vérifier si l'utilisateur est authentifié
   * Attend l'initialisation si nécessaire
   */
  async function ensureAuthenticated(): Promise<boolean> {
    // 1. Attendre l'initialisation si pas encore faite
    if (!authStore.isInitialized) {
      console.log('⏳ Attente initialisation auth...')

      let attempts = 0
      while (!authStore.isInitialized && attempts < 50) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }

      if (!authStore.isInitialized) {
        console.error('❌ Auth non initialisée après timeout')
        return false
      }
    }

    // 2. Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ Utilisateur non authentifié')
      return false
    }

    return true
  }

  /**
   * Wrapper pour protéger une fonction qui nécessite l'authentification
   */
  async function withAuth<T>(
    fn: () => Promise<T>,
    errorMessage: string = 'Authentification requise',
  ): Promise<T | null> {
    const isAuth = await ensureAuthenticated()

    if (!isAuth) {
      console.warn(`⚠️ ${errorMessage}`)
      return null
    }

    return fn()
  }

  return {
    ensureAuthenticated,
    withAuth,
    isAuthenticated: () => authStore.isAuthenticated,
    isInitialized: () => authStore.isInitialized,
  }
}
